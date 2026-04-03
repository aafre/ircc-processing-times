"""Tests for the IRCC processing time parser."""

import pytest

from src.parser import normalize_time, parse_processing_times


class TestNormalizeTime:
    def test_days(self):
        assert normalize_time("30 days") == 30

    def test_single_day(self):
        assert normalize_time("1 day") == 1

    def test_weeks(self):
        assert normalize_time("8 weeks") == 56

    def test_single_week(self):
        assert normalize_time("1 week") == 7

    def test_months(self):
        assert normalize_time("4 months") == 120

    def test_single_month(self):
        assert normalize_time("1 month") == 30

    def test_bare_number(self):
        assert normalize_time("52") == 52

    def test_na(self):
        assert normalize_time("N/A") is None

    def test_not_available(self):
        assert normalize_time("not available") is None

    def test_dash(self):
        assert normalize_time("-") is None

    def test_empty(self):
        assert normalize_time("") is None

    def test_none_input(self):
        assert normalize_time(None) is None

    def test_whitespace(self):
        assert normalize_time("  30 days  ") == 30

    def test_case_insensitive(self):
        assert normalize_time("30 Days") == 30
        assert normalize_time("8 WEEKS") == 56


class TestParseProcessingTimes:
    def test_basic_parse(self):
        times_data = {
            "visitor-outside-canada": {
                "IN": "52 days",
                "US": "16 days",
                "lastupdated": "March 31, 2026",
            },
            "supervisa": {
                "IN": "120 days",
            },
            "lastupdated": "March 31, 2026",
        }
        country_names = {
            "country-name": {
                "IN": "India",
                "US": "United States of America",
            }
        }

        records = parse_processing_times(times_data, country_names)

        assert len(records) == 3

        india_visitor = [
            r for r in records
            if r["country_code"] == "IN" and r["visa_category"] == "visitor-outside-canada"
        ][0]
        assert india_visitor["processing_time_days"] == 52
        assert india_visitor["processing_time_raw"] == "52 days"
        assert india_visitor["country_name"] == "India"
        assert india_visitor["ircc_last_updated"] == "March 31, 2026"

    def test_unknown_country_uses_code(self):
        times_data = {
            "visitor-outside-canada": {"XX": "10 days"},
            "lastupdated": "",
        }
        country_names = {"country-name": {}}

        records = parse_processing_times(times_data, country_names)
        assert records[0]["country_name"] == "XX"

    def test_skips_non_dict_values(self):
        times_data = {
            "visitor-outside-canada": {"IN": "30 days"},
            "lastupdated": "March 31, 2026",
            "some_string_field": "not a dict",
        }
        records = parse_processing_times(times_data, {"country-name": {"IN": "India"}})
        assert len(records) == 1
