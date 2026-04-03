"""Export SQLite data to JSON files for Devvit app and Astro site."""

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from . import db
from .config import VISA_CATEGORIES


def export_all(conn: sqlite3.Connection, data_dir: str | Path):
    """Export all JSON output files."""
    data_dir = Path(data_dir)
    data_dir.mkdir(parents=True, exist_ok=True)
    (data_dir / "history").mkdir(exist_ok=True)

    export_latest(conn, data_dir)
    export_countries(conn, data_dir)
    export_meta(conn, data_dir)
    export_history(conn, data_dir)


def export_latest(conn: sqlite3.Connection, data_dir: Path):
    """Export latest.json — current snapshot for all countries."""
    records = db.get_latest(conn)
    if not records:
        return

    ircc_updated = records[0]["ircc_last_updated"] if records else ""

    # Group by country code
    by_country: dict[str, dict] = {}
    for r in records:
        code = r["country_code"]
        if code not in by_country:
            by_country[code] = {"name": r["country_name"], "raw": {}}

        cat = r["visa_category"]
        by_country[code][cat] = r["processing_time_days"]
        by_country[code]["raw"][cat] = r["processing_time_raw"]

    output = {
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "ircc_last_updated": ircc_updated,
        "processing_times": by_country,
    }

    _write_json(data_dir / "latest.json", output)


def export_countries(conn: sqlite3.Connection, data_dir: Path):
    """Export countries.json — code-to-name mapping."""
    records = db.get_latest(conn)
    countries = {}
    for r in records:
        code = r["country_code"]
        if code not in countries:
            countries[code] = r["country_name"]

    _write_json(data_dir / "countries.json", countries)


def export_meta(conn: sqlite3.Connection, data_dir: Path):
    """Export meta.json — scrape metadata."""
    records = db.get_latest(conn)
    if not records:
        return

    ircc_updated = records[0]["ircc_last_updated"] if records else ""
    scrape_date = records[0]["scrape_date"] if records else ""

    meta = {
        "last_scrape": scrape_date,
        "last_export": datetime.now(timezone.utc).isoformat(),
        "ircc_last_updated": ircc_updated,
        "country_count": len(set(r["country_code"] for r in records)),
        "category_count": len(set(r["visa_category"] for r in records)),
    }

    _write_json(data_dir / "meta.json", meta)


def export_history(conn: sqlite3.Connection, data_dir: Path):
    """Export per-country history files to data/history/{CODE}.json."""
    history_dir = data_dir / "history"
    history_dir.mkdir(exist_ok=True)

    codes = db.get_all_country_codes(conn)
    for code in codes:
        rows = db.get_history(conn, code)

        # Group by date
        by_date: dict[str, dict] = {}
        for r in rows:
            d = r["scrape_date"]
            if d not in by_date:
                by_date[d] = {"date": d}
            # Use short key: "visitor-outside-canada" -> "visitor"
            key = _short_category(r["visa_category"])
            by_date[d][key] = r["processing_time_days"]

        history = list(by_date.values())
        _write_json(history_dir / f"{code}.json", history)


def _short_category(category: str) -> str:
    mapping = {
        "visitor-outside-canada": "visitor",
        "supervisa": "supervisa",
    }
    return mapping.get(category, category)


def _write_json(path: Path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
