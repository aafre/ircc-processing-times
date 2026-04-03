# Phase 3: Astro Companion Website — Handoff

## Context

The IRCC Processing Time Tracker has two working components:
1. **Scraper** — Python + Playwright, runs daily via GitHub Actions, outputs JSON to `scraper/data/`
2. **Devvit App** — Reddit Blocks UI, deployed to r/processing_time_dev, pending domain approval

This document is the handoff for building the **Astro companion website** (Phase 3).

## What to Build

An Astro static site that generates programmatic SEO pages for 50+ countries, displaying IRCC visa processing times with historical charts.

### Data Source

JSON files in the public GitHub repo `aafre/ircc-processing-times`:

```
https://raw.githubusercontent.com/aafre/ircc-processing-times/main/scraper/data/latest.json
https://raw.githubusercontent.com/aafre/ircc-processing-times/main/scraper/data/countries.json
https://raw.githubusercontent.com/aafre/ircc-processing-times/main/scraper/data/history/{CODE}.json
```

**latest.json structure:**
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
      "raw": { "visitor-outside-canada": "28 days", "supervisa": "191 days", ... }
    }
  }
}
```

**history/IN.json structure:**
```json
[
  { "date": "2026-04-03", "visitor": 28, "supervisa": 191, "study": 21, "work": 49 }
]
```

### Pages to Generate

- `/` — Homepage: hero, top countries table, what is this
- `/processing-times/` — All countries grid with search/filter
- `/processing-times/[country]/` — Per-country page (e.g. `/processing-times/india/`)
- `/about/` — About page

Each country page includes:
- Current processing time (big number) with IRCC last-updated date
- Historical trend chart (from history/{CODE}.json)
- Visa type tabs (visitor, super visa, study, work)
- SEO meta tags, JSON-LD FAQPage schema
- Link to r/CanadaVisitorVisa

### Design System: "Northern Data"

**Approved by user.** Observatory-dashboard aesthetic. Dark-default.

**Typography** (Google Fonts):
- **Source Serif 4** (variable) — headlines, large callout numbers
- **IBM Plex Mono** — processing time numbers, table data, dates, badges
- **IBM Plex Sans** — body text, navigation, UI elements

```
https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&display=swap
```

**Color Palette:**
| Variable | Hex | Role |
|---|---|---|
| `--bg-deep` | `#0B1120` | Page background |
| `--bg-surface` | `#111827` | Card backgrounds |
| `--bg-elevated` | `#1A2332` | Hover, modals |
| `--text-primary` | `#E8ECF1` | Main text |
| `--text-secondary` | `#94A3B8` | Secondary |
| `--accent-primary` | `#E4A853` | "Observatory Amber" — links, CTAs |
| `--accent-secondary` | `#3ECFB4` | "Aurora Teal" — charts |
| `--status-approved` | `#34D399` | Green (fast) |
| `--status-refused` | `#F87171` | Red (slow) |
| `--status-pending` | `#FBBF24` | Amber |

**Backgrounds:** Dot-grid pattern, radial vignette, faint aurora gradients in hero.

**Motion (CSS-only):** Staggered fade-in-up on page load, card hover lift, sparkline draw animation.

**Charts:** uPlot (~35KB) loaded via `client:visible`. Teal primary line, amber comparison.

**Country Flags:** `flag-icons` CSS library (NOT emoji — Windows renders emoji flags as two-letter codes).

### User Preferences (CRITICAL)

- **NO generic AI-generated aesthetics** — user explicitly flagged "AI slop" multiple times
- **NO Inter, Roboto, Open Sans** — use the specified fonts only
- **NO purple gradients on white** — commit to the dark observatory theme
- **Use extreme font weights** (200 vs 800, not 400 vs 600)
- **Size jumps of 3x+** — not subtle differences
- Use the `frontend-design` skill when building components
- Make unexpected, creative design choices within the approved system

### SEO Strategy

Each country page targets: `"canada visitor visa processing time from {country} 2026"`

- Title: `"Canada Visitor Visa Processing Time from India — 28 Days (April 2026)"`
- JSON-LD `FAQPage` schema with common questions
- `@astrojs/sitemap` for auto-generated sitemap
- Internal linking between same-region countries

### File Structure

```
website/
  astro.config.mjs
  package.json
  src/
    pages/
      index.astro
      processing-times/
        index.astro
        [country].astro          # getStaticPaths() from latest.json
      about.astro
    components/
      CountryCard.astro
      BigNumber.astro
      TrendBadge.astro
      Sparkline.astro
      HistoryChart.astro         # uPlot, client:visible
      DataTable.astro
      SearchBar.astro
      LastUpdated.astro
      SEOHead.astro
    layouts/
      Base.astro
      Country.astro
    styles/
      global.css
    utils/
      countries.ts
      formatting.ts
  public/
    robots.txt
```

### Deployment

- **Vercel** or **Netlify** (free tier)
- Deploy hook triggered by data commits from the scraper GitHub Action
- Build time: <30s for ~200 static pages

### Email Alerts (Stretch)

- Form on each country page: "Get notified when times change for {country}"
- API route forwards to Beehiiv with country tag

## Existing Code to Reference

- `scraper/data/latest.json` — current data (212 countries)
- `scraper/data/countries.json` — code-to-name mapping
- `scraper/data/history/IN.json` — per-country history
- `scraper/src/parser.py` — time normalization logic (for reference)
- Astro docs: https://docs.astro.build/en/getting-started/

## Repo

```
git clone https://github.com/aafre/ircc-processing-times.git
cd ircc-processing-times
```

Build the Astro site in `website/` directory alongside `scraper/` and `devvit-app/`.
