"""Configuration constants for the IRCC scraper."""

IRCC_PROCESSING_TIMES_URL = (
    "https://www.canada.ca/content/dam/ircc/documents/json/data-ptime-en.json"
)
IRCC_COUNTRY_NAMES_URL = (
    "https://www.canada.ca/content/dam/ircc/documents/json/data-country-name-en.json"
)
IRCC_PAGE_URL = (
    "https://www.canada.ca/en/immigration-refugees-citizenship/"
    "services/application/check-processing-times.html"
)

# Browser-like headers to avoid 403
REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": IRCC_PAGE_URL,
}

# Visa categories we care about
VISA_CATEGORIES = [
    "visitor-outside-canada",
    "supervisa",
]

# Database path (relative to scraper/)
DB_PATH = "processing_times.db"

# Output directory (relative to scraper/)
DATA_DIR = "data"
