"""Tier 1: Fetch IRCC data via direct HTTP with browser-like headers."""

import logging

import httpx

from ..config import (
    IRCC_COUNTRY_NAMES_URL,
    IRCC_PROCESSING_TIMES_URL,
    REQUEST_HEADERS,
)

logger = logging.getLogger(__name__)


def fetch_processing_times() -> tuple[dict, dict] | None:
    """Fetch processing times and country names JSON via HTTP.

    Returns:
        Tuple of (times_data, country_names) dicts, or None if request fails.
    """
    try:
        with httpx.Client(headers=REQUEST_HEADERS, timeout=30, follow_redirects=True) as client:
            times_resp = client.get(IRCC_PROCESSING_TIMES_URL)
            if times_resp.status_code != 200:
                logger.warning(
                    "HTTP fetch failed for processing times: %d", times_resp.status_code
                )
                return None

            names_resp = client.get(IRCC_COUNTRY_NAMES_URL)
            if names_resp.status_code != 200:
                logger.warning(
                    "HTTP fetch failed for country names: %d", names_resp.status_code
                )
                return None

            return times_resp.json(), names_resp.json()

    except httpx.HTTPError as e:
        logger.warning("HTTP fetch error: %s", e)
        return None
