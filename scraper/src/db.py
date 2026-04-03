"""SQLite database operations for processing times history."""

import sqlite3
from datetime import date
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS processing_times (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scrape_date TEXT NOT NULL,
    visa_category TEXT NOT NULL,
    country_code TEXT NOT NULL,
    country_name TEXT NOT NULL,
    processing_time_raw TEXT,
    processing_time_days INTEGER,
    ircc_last_updated TEXT,
    UNIQUE(scrape_date, visa_category, country_code)
);

CREATE INDEX IF NOT EXISTS idx_country_category
    ON processing_times(country_code, visa_category);
CREATE INDEX IF NOT EXISTS idx_scrape_date
    ON processing_times(scrape_date);
"""


def get_connection(db_path: str | Path) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    return conn


def upsert_records(conn: sqlite3.Connection, records: list[dict], scrape_date: str | None = None):
    """Insert or replace processing time records for today's scrape."""
    if scrape_date is None:
        scrape_date = date.today().isoformat()

    conn.executemany(
        """
        INSERT OR REPLACE INTO processing_times
            (scrape_date, visa_category, country_code, country_name,
             processing_time_raw, processing_time_days, ircc_last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                scrape_date,
                r["visa_category"],
                r["country_code"],
                r["country_name"],
                r["processing_time_raw"],
                r["processing_time_days"],
                r["ircc_last_updated"],
            )
            for r in records
        ],
    )
    conn.commit()


def get_latest(conn: sqlite3.Connection, visa_category: str | None = None) -> list[dict]:
    """Get the most recent scrape's data."""
    row = conn.execute("SELECT MAX(scrape_date) FROM processing_times").fetchone()
    if not row or not row[0]:
        return []

    latest_date = row[0]
    query = "SELECT * FROM processing_times WHERE scrape_date = ?"
    params: list = [latest_date]

    if visa_category:
        query += " AND visa_category = ?"
        params.append(visa_category)

    return [dict(r) for r in conn.execute(query, params).fetchall()]


def get_history(
    conn: sqlite3.Connection, country_code: str, visa_category: str | None = None
) -> list[dict]:
    """Get historical data for a specific country."""
    query = """
        SELECT scrape_date, visa_category, processing_time_days, processing_time_raw
        FROM processing_times
        WHERE country_code = ?
    """
    params: list = [country_code]

    if visa_category:
        query += " AND visa_category = ?"
        params.append(visa_category)

    query += " ORDER BY scrape_date ASC"
    return [dict(r) for r in conn.execute(query, params).fetchall()]


def get_all_country_codes(conn: sqlite3.Connection) -> list[str]:
    """Get all unique country codes in the database."""
    rows = conn.execute(
        "SELECT DISTINCT country_code FROM processing_times ORDER BY country_code"
    ).fetchall()
    return [r[0] for r in rows]
