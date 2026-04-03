"""Main entry point for the IRCC processing times scraper."""

import argparse
import logging
import sys
from datetime import date
from pathlib import Path

from . import db
from .config import DB_PATH, DATA_DIR
from .exporter import export_all
from .parser import parse_processing_times

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def fetch_data() -> tuple[dict, dict] | None:
    """Try fetchers in tier order until one succeeds."""

    # Tier 1: Direct HTTP
    logger.info("Trying Tier 1: HTTP fetch with browser headers...")
    from .fetchers import http_fetcher

    result = http_fetcher.fetch_processing_times()
    if result:
        logger.info("Tier 1 succeeded")
        return result

    # Tier 2: Playwright
    logger.info("Tier 1 failed, trying Tier 2: Playwright network interception...")
    from .fetchers import playwright_fetcher

    result = playwright_fetcher.fetch_processing_times()
    if result:
        logger.info("Tier 2 succeeded")
        return result

    logger.error("All fetch tiers failed")
    return None


def run(dry_run: bool = False):
    """Run the full scrape pipeline."""
    # Resolve paths relative to the scraper/ directory
    scraper_dir = Path(__file__).resolve().parent.parent
    db_path = scraper_dir / DB_PATH
    data_dir = scraper_dir / DATA_DIR

    # Fetch
    result = fetch_data()
    if not result:
        logger.error("No data fetched. Exiting.")
        sys.exit(1)

    times_data, country_names = result

    # Parse
    records = parse_processing_times(times_data, country_names)
    logger.info("Parsed %d records", len(records))

    if not records:
        logger.error("No records parsed. Exiting.")
        sys.exit(1)

    if dry_run:
        for r in records[:10]:
            logger.info(
                "  %s | %s | %s | %s days",
                r["country_code"],
                r["visa_category"],
                r["processing_time_raw"],
                r["processing_time_days"],
            )
        logger.info("Dry run complete. %d total records.", len(records))
        return

    # Store
    conn = db.get_connection(db_path)
    today = date.today().isoformat()
    db.upsert_records(conn, records, scrape_date=today)
    logger.info("Stored %d records for %s", len(records), today)

    # Export
    export_all(conn, data_dir)
    logger.info("Exported JSON to %s", data_dir)

    conn.close()
    logger.info("Done.")


def main():
    parser = argparse.ArgumentParser(description="Scrape IRCC processing times")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Fetch and parse but don't store or export",
    )
    args = parser.parse_args()
    run(dry_run=args.dry_run)


if __name__ == "__main__":
    main()
