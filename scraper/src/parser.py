"""Parse IRCC processing time strings into structured data."""

import re


def normalize_time(raw: str) -> int | None:
    """Convert IRCC time string to integer days.

    Examples:
        "30 days" -> 30
        "8 weeks" -> 56
        "4 months" -> 120
        "1 week" -> 7
        "N/A" -> None
        "" -> None
    """
    if not raw or not isinstance(raw, str):
        return None

    raw = raw.strip().lower()

    if raw in ("n/a", "not available", "-", ""):
        return None

    match = re.match(r"(\d+)\s*(days?|weeks?|months?)", raw)
    if not match:
        # Try bare number (some legacy formats use just digits = days)
        bare = re.match(r"^(\d+)$", raw)
        if bare:
            return int(bare.group(1))
        return None

    value = int(match.group(1))
    unit = match.group(2)

    if unit.startswith("day"):
        return value
    elif unit.startswith("week"):
        return value * 7
    elif unit.startswith("month"):
        return value * 30

    return None


def parse_processing_times(
    times_data: dict, country_names: dict
) -> list[dict]:
    """Parse raw IRCC JSON into a flat list of records.

    Args:
        times_data: Raw JSON from data-ptime-en.json
        country_names: Raw JSON from data-country-name-en.json

    Returns:
        List of dicts with keys: visa_category, country_code, country_name,
        processing_time_raw, processing_time_days, ircc_last_updated
    """
    # Country names are nested under "country-name" key
    names = country_names.get("country-name", country_names)

    records = []

    for category, countries in times_data.items():
        # Skip metadata keys
        if category in ("lastupdated",) or not isinstance(countries, dict):
            continue

        # lastupdated can be at category level or top level
        ircc_updated = (
            countries.get("lastupdated", "")
            or times_data.get("lastupdated", "")
        )

        for code, raw_time in countries.items():
            if code == "lastupdated" or not isinstance(raw_time, str):
                continue

            days = normalize_time(raw_time)
            country_name = names.get(code, code)

            records.append(
                {
                    "visa_category": category,
                    "country_code": code,
                    "country_name": country_name,
                    "processing_time_raw": raw_time,
                    "processing_time_days": days,
                    "ircc_last_updated": ircc_updated,
                }
            )

    return records
