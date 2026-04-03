# IRCC Processing Times Tracker

Open-source dataset of Canada visa processing times, scraped daily from [IRCC](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html) and served as structured JSON.

**Built for [r/CanadaVisitorVisa](https://www.reddit.com/r/CanadaVisitorVisa/)** — a community helping people navigate the Canadian visitor visa process.

## What's in the data

| Metric | Value |
|---|---|
| Countries | 212 |
| Visa categories | 7 (visitor, super visa, study, work, child dependent, child adopted, refugees) |
| Update frequency | Daily at 10 AM ET |
| Source | Immigration, Refugees and Citizenship Canada (IRCC) |
| Format | JSON |

## Quick access

**Latest processing times (all countries):**
```
https://raw.githubusercontent.com/aafre/ircc-processing-times/main/scraper/data/latest.json
```

**Country name mapping:**
```
https://raw.githubusercontent.com/aafre/ircc-processing-times/main/scraper/data/countries.json
``` 

**Historical data for a specific country** (e.g. India):
```
https://raw.githubusercontent.com/aafre/ircc-processing-times/main/scraper/data/history/IN.json
```

## Sample output

From `scraper/data/latest.json`:

```json
{
  "last_updated": "2026-04-03T14:37:56Z",
  "ircc_last_updated": "March 31, 2026",
  "processing_times": {
    "IN": {
      "name": "India",
      "visitor-outside-canada": 28,
      "supervisa": 191,
      "study": 21,
      "work": 49,
      "raw": {
        "visitor-outside-canada": "28 days",
        "supervisa": "191 days",
        "study": "3 weeks",
        "work": "7 weeks"
      }
    }
  }
}
```

Values are normalized to days. Original IRCC text is preserved in `raw`.

## How it works

A Python scraper runs daily via GitHub Actions:

1. Loads the IRCC processing times page using Playwright
2. Fetches the official `data-ptime-en.json` endpoint from within the browser context
3. Parses and normalizes time strings (`"3 weeks"` → `21` days)
4. Stores to SQLite (historical record) and exports JSON files
5. Commits updated data back to this repo

## Running locally

```bash
cd scraper
uv venv .venv && source .venv/Scripts/activate  # or .venv/bin/activate on Linux/Mac
uv pip install httpx playwright
playwright install chromium

python -m src.scrape           # full run
python -m src.scrape --dry-run # fetch + parse only, no storage
python -m pytest tests/ -v     # run tests
```

## Project structure

```
scraper/           Python scraper + GitHub Actions workflow
  src/             Source code (fetchers, parser, db, exporter)
  data/            JSON output (latest.json, countries.json, history/)
  tests/           Unit tests

devvit-app/        Reddit Devvit app for r/CanadaVisitorVisa
  src/main.tsx     Dashboard custom post + timeline submission form

.github/workflows/ Daily scraping automation
```

## Data source & attribution

All processing time data is sourced from **Immigration, Refugees and Citizenship Canada (IRCC)** via their official [Check processing times](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html) page. This project is not affiliated with or endorsed by IRCC or the Government of Canada.

## License

MIT
