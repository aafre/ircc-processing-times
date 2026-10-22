# Market and licence for selling IRCC processing-time history

Research for issue #13 (map #1). It feeds the decision in #14, "Sell historic data and make the repo private?". Researched 2026-10-22. This note gathers facts and decides nothing. It is not legal advice.

## TL;DR

1. **The source JSON falls under the canada.ca Terms and conditions, not the Open Government Licence.** Those terms allow non-commercial reproduction. They forbid "commercial redistribution without prior written permission". The processing-times JSON is not published on open.canada.ca, and the processing-times page links only to the general Terms and conditions.
2. **Grey zone:** we would sell our own day-by-day record of the numbers, not IRCC's file. Canadian copyright protects original compilations, not bare facts. Whether a time series of a government figure counts as "materials on this site" is a legal question. The low-risk route is a written request to IRCC's copyright contact.
3. **A free competitor already exists.** GovWait (govwait.com, launched 2026-08) publishes IRCC processing-time history as free CSV, JSON API and MCP, under CC BY 4.0, from 2026-08-19 on. Our edge is about 4.5 extra months (from 2026-04-03) and per-country files. The Wayback Machine also holds sparse IRCC JSON snapshots back to 2018.
4. **The asset is smaller than "daily" suggests.** IRCC updates the JSON weekly, so 198 daily rows per country hold only about 28 distinct values.
5. **The repo is PUBLIC. The full history (212 files, 8.6 MB) and a 47 MB `processing_times.db` are committed.** Making it private now stops future access. It does not take back past clones, and git history keeps every snapshot.

## 1. Licence

### 1.1 What the scraper fetches

From `scraper/src/config.py`:

- `https://www.canada.ca/content/dam/ircc/documents/json/data-ptime-en.json` (processing times)
- `https://www.canada.ca/content/dam/ircc/documents/json/data-country-name-en.json` (country names)
- The page that consumes them: `.../services/application/check-processing-times.html`

### 1.2 Which terms apply

- **The JSON is not an Open Government dataset.** Searching the open.canada.ca CKAN API (`package_search`, `resource_search` on `data-ptime`) finds no dataset for the processing-times JSON. IRCC's OGL datasets on open.canada.ca are different products, for example "Operational Processing – Monthly IRCC Updates" (monthly intake and finalized *counts*, `ca-ogl-lgo`). Those are volume counts. They contain no processing *times*. ([open.canada.ca API](https://open.canada.ca/data/api/action/package_show?id=9b34e712-513f-44e9-babf-9df4f7256550))
- **The OGL – Canada 2.0 covers only "information ... offered for use under the terms of this licence".** Where it applies, it allows commercial use with attribution. ([OGL-Canada 2.0](https://open.canada.ca/en/open-government-licence-canada))
- **The processing-times page names no licence.** Its footer links to the general canada.ca "Terms and conditions". ([check-processing-times](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html))
- **The canada.ca Terms and conditions** ([terms](https://www.canada.ca/en/transparency/terms.html)) say:
  - Non-commercial reproduction is allowed "unless otherwise specified". You must take due diligence on accuracy, give the title and author, and state that it is a copy of the version at the source URL.
  - Commercial: "you may not reproduce materials on this site, in whole or in part, for the purposes of commercial redistribution without prior written permission from the copyright administrator". The page points to the responsible institution's contacts.
  - Official symbols (the Canada wordmark, the Arms) may not be reproduced for any purpose without authorization.
- **GovWait reads it the same way.** Its data-licence page says: "Canada.ca general reproduction terms apply unless the originating resource expressly uses the Open Government Licence". It also advises legal review before resale. ([GovWait data licence](https://govwait.com/data-license/))

### 1.3 The derived-data question (unresolved)

- What we would sell is our own record of the number IRCC published each day, as per-country files, not a copy of IRCC's JSON. Canada's *Copyright Act* protects "compilations" only where they show original selection or arrangement. Under *CCH Canadian v. Law Society of Upper Canada*, 2004 SCC 13, that means skill and judgment. Facts as such aren't protected. Whether IRCC's numbers, collected over time, are "materials on this site" under the terms remains open, and only a lawyer or IRCC can settle it.
- **Ways to remove the doubt:** (a) ask IRCC's copyright administrator for written permission; (b) sell analysis, charts, alerts or a convenience service rather than "the data" itself; (c) give the data away (non-commercial reproduction is allowed with attribution).
- **The non-commercial terms bind us today anyway.** Publishing the history publicly needs the accuracy diligence, the title and author, and a "copy of the version at [URL]" notice.

## 2. Our asset

| Fact | Value |
|---|---|
| Coverage | 2026-04-03 → 2026-10-21 (198 rows/country, 4 missing days) |
| Files | 212 country JSON files in `scraper/data/history`, 8.6 MB; plus `latest.json`, `countries.json`, `meta.json` |
| Fields per row | `visitor`, `supervisa`, `study`, `work`, `child_dependent`, `child_adopted`, `refugees_gov` (days) |
| Distinct values | IRCC updates weekly (`meta.json` `ircc_last_updated`). India had 28 distinct change dates in 198 rows. In practice this is a **weekly series of about 28 points per country/category**. |
| Repo | `aafre/ircc-processing-times` is **PUBLIC**, with no licence file, 0 stars and 0 forks (via `gh api`). The history files and `scraper/processing_times.db` (47 MB) are tracked in git. |

Making the repo private hides it from now on. It does not remove existing clones or third-party caches. Anyone with a copy also has the full git history.

## 3. Who already offers this history

| Source | What | Price/licence | Coverage |
|---|---|---|---|
| **GovWait** ([site](https://govwait.com/data/), [repo](https://github.com/artwisdom/govwait)) | IRCC (plus UK, NZ, Norway) processing times: latest + append-only `history.csv`, JSON API, OpenAPI, MCP server, RSS change reports | **Free, CC BY 4.0** (its own material) | First published 2026-08-21; history from 2026-08-19; 8,660 observations across 4 countries as of 2026-10-06. Stores only changes, not daily rows. |
| **Wayback Machine** ([CDX](https://web.archive.org/cdx/search/cdx?url=canada.ca/content/dam/ircc/documents/json/data-ptime-en.json&collapse=digest)) | Raw `data-ptime-en.json` captures | Free | 41 distinct versions since 2018 (1 in 2018, 1 in 2021, 27 in 2022, 2 in 2023, 1 in 2024, 1 in 2025, 8 in 2026). Sparse except in 2022. |
| **nilay1808/canada-visa-tracker** ([repo](https://github.com/nilay1808/canada-visa-tracker)) | Cron job storing the same JSON in Postgres, with "historical data" on its site | AGPL-3.0 code; data not published as a download | Last pushed 2024-07; appears inactive. |
| **Other GitHub scrapers** | `YOWCT/ircc-processing-times-data` (2018), `olavomello`, `ryancampbell/ask-canada`, `Battam1111/omniseek`, etc. call the same JSON | Free/open | Mostly stale or current-value only. |
| **News sites** (CIC News, Moving2Canada) | Periodic "how times changed" articles that compare snapshots | Free (editorial) | Ad hoc points, not datasets. |
| **Kaggle** | No IRCC processing-time dataset found (API search returned empty) | n/a | n/a |

Takeaway: a free, better-documented, multi-country history already exists from 2026-08. Anything we sell competes with "free". Our differentiators: April–August 2026 history that GovWait lacks, per-country daily granularity, and the canadavisatracker.com audience.

## 4. Possible buyers (unvalidated)

- **RCICs and immigration lawyers:** about 12k RCICs in good standing (CICC 2025 annual report, as summarised by [Moving2Canada](https://moving2canada.com/news-and-features/features/immigration/licensed-immigration-consultants-canada-data-2025/)). They use current times with clients. Demand for history is unproven; trend charts for marketing are the likely use.
- **Study-abroad agents and edtech:** care about study-permit times by country. Same caveat.
- **Journalists:** CIC News and others already write "how times changed" pieces from their own snapshots, so they would want free, citable data rather than pay.
- **Researchers:** usually expect free or CC data and would cite GovWait or Wayback.

We found no evidence anyone pays for IRCC processing-time history today.

## 5. Price points and channels

- **Gumroad:** 10% + $0.50 per direct sale, 30% on Discover marketplace sales ([Gumroad pricing](https://gumroad.com/pricing)). Niche scraped CSVs sell for about $10 each (e.g. EastBrightMarketing's $9.99 "top-selling Gumroad products" datasets, [example](https://eastbrightmarketing.gumroad.com/l/Gum-Film)).
- **Datarade:** free for buyers, with providers paying for listings and deals priced by quote. We found no official fee page, and the only figure (a "30% commission") comes from a competitor's write-up ([ZoomInfo](https://pipeline.zoominfo.com/sales/datarade-pricing)). We found no Datarade listing for visa processing-time data.
- **Comparable free immigration datasets** (EUI Global Visa Cost on Zenodo, wheretoemigrate.io CC BY 4.0, data.gov.ie visa decisions) set the expectation that this kind of data is free.
- A realistic one-off price for a small, weekly-resolution, 6-month national dataset sits in the low tens of dollars. This is an inference from the comparables above, not a measured market.

## 6. Open questions for #14

1. Ask IRCC for written permission before any sale, or skip the sale?
2. Sell the data, or sell a service on top of it (alerts, API, charts), which sidesteps the licence question?
3. Does making the repo private achieve anything, given that GovWait already publishes free history and the data is already in public git history?
4. Add a licence file and the required canada.ca attribution text to the repo or site either way?

## Sources

- canada.ca Terms and conditions: https://www.canada.ca/en/transparency/terms.html
- Open Government Licence – Canada 2.0: https://open.canada.ca/en/open-government-licence-canada
- IRCC check processing times page: https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html
- open.canada.ca CKAN API (IRCC datasets): https://open.canada.ca/data/api/action/package_search?q=processing%20times%20IRCC
- GovWait dataset and licence: https://govwait.com/data/, https://govwait.com/data-license/, https://govwait.com/api/v1/dataset.json
- Wayback CDX for data-ptime-en.json: https://web.archive.org/cdx/search/cdx?url=canada.ca/content/dam/ircc/documents/json/data-ptime-en.json
- Gumroad pricing: https://gumroad.com/pricing
- CCH Canadian Ltd. v. Law Society of Upper Canada, 2004 SCC 13: https://scc-csc.lexum.com/scc-csc/scc-csc/en/item/2125/index.do
- Repo facts: `gh repo view aafre/ircc-processing-times`, `git ls-files`, `scraper/data/meta.json`
