"""Tier 2: Fetch IRCC data via Playwright browser-context fetch.

The IRCC JSON endpoints block direct HTTP requests but serve data to
browser contexts that have first loaded the main page. We navigate to
the IRCC page, then use page.evaluate() to fetch the JSON endpoints
from within the browser's same-origin context.
"""

import logging

logger = logging.getLogger(__name__)


def fetch_processing_times() -> tuple[dict, dict] | None:
    """Fetch processing times by loading the IRCC page then fetching JSON in-browser.

    Returns:
        Tuple of (times_data, country_names) dicts, or None if scraping fails.
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        logger.error(
            "Playwright not installed. Install with: pip install playwright && playwright install chromium"
        )
        return None

    from ..config import IRCC_PAGE_URL

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            logger.info("Navigating to IRCC page to establish browser context...")
            page.goto(IRCC_PAGE_URL, wait_until="networkidle", timeout=60000)

            # Fetch JSON endpoints from within the browser context
            logger.info("Fetching processing times JSON from browser context...")
            times_data = page.evaluate("""async () => {
                const resp = await fetch('/content/dam/ircc/documents/json/data-ptime-en.json');
                if (!resp.ok) return null;
                return await resp.json();
            }""")

            logger.info("Fetching country names JSON from browser context...")
            country_names = page.evaluate("""async () => {
                const resp = await fetch('/content/dam/ircc/documents/json/data-country-name-en.json');
                if (!resp.ok) return null;
                return await resp.json();
            }""")

            browser.close()

        if times_data and country_names:
            logger.info("Successfully fetched both datasets via browser context")
            return times_data, country_names

        if times_data:
            logger.warning("Got processing times but not country names, using codes as names")
            return times_data, {"country-name": {}}

        logger.error("Browser-context fetch returned no data")
        return None

    except Exception as e:
        logger.error("Playwright fetch error: %s", e)
        return None
