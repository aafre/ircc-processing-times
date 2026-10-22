# Market and licence for selling IRCC processing-time history

Research for [#13](https://github.com/aafre/ircc-processing-times/issues/13), parent map [#1](https://github.com/aafre/ircc-processing-times/issues/1). Researched 2026-10-22.

## Verdict

- **Licence: not cleared for commercial resale.** The IRCC processing-times JSON is not published under the Open Government Licence – Canada. It falls under the general canada.ca Terms and conditions, which forbid commercial redistribution without prior written permission from IRCC.
- **Market: weak.** Free history already exists: GovWait publishes a CC BY 4.0 history CSV and an API, the Wayback Machine holds snapshots back to 2018, and our own repo is public. Paying buyers would be a handful of RCICs, journalists or researchers, and most of them can get the data for free.
- **Price range, if sold:** roughly **$10–$50 for a one-off CSV** (the going rate for small niche datasets on Gumroad). Pay-per-call scraper APIs for similar government data cost cents per thousand results. Realistic revenue is tens of dollars, not hundreds.
- **Recommendation:** don't sell it. Publish the history free with attribution, as the Dataset block and CSV download already planned in [#8](https://github.com/aafre/ircc-processing-times/issues/8). Use it for SEO, AI citations and links. Only ask IRCC for written permission if a buyer turns up.

## 1. Licence

### Which terms cover the JSON

- The scraper reads `https://www.canada.ca/content/dam/ircc/documents/json/data-ptime-en.json` and `data-country-name-en.json` (`scraper/src/config.py`). The response carries no licence header or field. It is a bare JSON object (fetched 2026-10-22).
- The public tool page, [Check processing times](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html), has no licence, open-data or reuse statement. The only related link is the footer's **Terms and conditions**.
- [canada.ca Terms and conditions](https://www.canada.ca/en/transparency/terms.html), "Ownership and usage of content":
  - Non-commercial: "you may reproduce the materials in whole or in part for non-commercial purposes", provided you take due care over accuracy, credit the source and link to the original.
  - Commercial: "you may not reproduce materials on this site, in whole or in part, for the purposes of commercial redistribution" without prior written permission from the copyright administrator (the responsible institution, here IRCC).
  - The page does not mention the Open Government Licence.

### Is it an open dataset?

No. I searched the open.canada.ca CKAN API (`package_search`, organisation `cic`, queries "processing times", "ptime" and others, plus `resource_search url:data-ptime`). Nothing points to the `content/dam/ircc/documents/json/` files.
- What IRCC does publish under OGL ([licence id `ca-ogl-lgo`](https://open.canada.ca/en/open-government-licence-canada)) is **volume** data, not processing times:
  - [Operational Processing – Monthly IRCC Updates](https://open.canada.ca/data/en/dataset/9b34e712-513f-44e9-babf-9df4f7256550): monthly counts of applications received, finalized and approved by source country (xlsx, modified 2026-10-20).
  - [[ARCHIVED] Temporary Resident Application Processing – Quarterly IRCC Updates](https://open.canada.ca/data/en/dataset/63858380-265e-4948-8e96-ca50fceca2d7): also counts, archived in 2024.

### What OGL would have allowed (for contrast)

[OGL – Canada 2.0](https://open.canada.ca/en/open-government-licence-canada) grants a "worldwide, royalty-free, perpetual, non-exclusive licence to use the Information, including for commercial purposes". The conditions are attribution ("Contains information licensed under the Open Government Licence – Canada"), no use of official symbols and no suggestion of official status. That licence doesn't apply to this JSON.

### Nuance (not legal advice)

- What we store are factual values: a day count per country per visa type. Facts are generally not protected by copyright, and our daily snapshot history is our own compilation. That gives a reasonable argument that selling *derived* history isn't "reproduction of materials". But the canada.ca terms are the only stated terms, and they say no to commercial redistribution.
- GovWait, the closest competitor, reads it the same way. Its IRCC [source note](https://govwait.com/api/v1/dataset.json) says: "Canada.ca general reproduction terms apply unless the originating resource expressly uses the Open Government Licence – Canada; review the current source terms before commercial redistribution."
- The clean path is to email IRCC for written permission. Free redistribution with attribution plus a link fits the non-commercial clause with no ambiguity.

## 2. Market

### Existing free sources of the same history

| Source | What | Since | Cost / licence |
|---|---|---|---|
| [GovWait](https://govwait.com/data/) ([repo](https://github.com/artwisdom/govwait)) | Weekly IRCC (`data-ptime`, non-country, forward-looking, passport) plus UK, NZ and Norway. `history.csv` has 8,660 observations, `forward-looking.csv` 7,285 rows, a JSON API, OpenAPI and an MCP server | 2026-08-21 | Free; GovWait's own structure is CC BY 4.0, government values not relicensed |
| [Wayback Machine CDX for data-ptime-en.json](http://web.archive.org/cdx/search/cdx?url=canada.ca/content/dam/ircc/documents/json/data-ptime-en.json) | 70 captures (44 with HTTP 200): 2018 1, 2021 1, 2022 52, 2023 2, 2024 1, 2025 1, 2026 12 | 2018 | Free, but sparse and irregular |
| [aafre/ircc-processing-times](https://github.com/aafre/ircc-processing-times) (ours) | `scraper/data/history`: 212 country files, 8.6 MB | 2026-04 | **Public repo already**, no licence file |
| [nilay1808/canada-visa-tracker](https://github.com/nilay1808/canada-visa-tracker) | Tracker with history | 2023-11 to 2024-07 (inactive) | AGPL-3.0 |
| [YOWCT/ircc-processing-times-data](https://github.com/YOWCT/ircc-processing-times-data) | Raw history | 2018 (dead) | Free |
| CIC News, Moving2Canada, immigration.ca | Monthly articles comparing processing times over time (e.g. [CIC News, May 2025](https://www.cicnews.com/2025/05/how-have-irccs-processing-times-changed-over-the-past-year-0555741.html)) | ongoing | Free, prose only |

I found no Kaggle dataset (web search; no direct API check). I found no Datarade listing: a [search for "immigration"](https://datarade.ai/search/products?keywords=immigration) returns only an unrelated $30k synthetic-passport image set. [Visagrader](https://visagrader.com/) covers US data only.

### Who would buy

- **RCICs and law firms:** they want current times for clients, which the free IRCC tool gives them. Trend history is a nice-to-have. They're more likely to pay for a client-facing widget or alerts than for a CSV.
- **Journalists and researchers:** they want history, but they expect it free or citable, and they already have GovWait and Wayback. A free download that asks for a citation earns us a backlink, which is worth more than a sale.
- **Edtech and study-abroad agents:** the only plausible B2B angle is an API or feed of study-permit times per country. But GovWait already offers a free JSON API.

Conclusion: no evidence of unmet paid demand. Our edge (daily snapshots against GovWait's weekly ones, plus 4.5 extra months back to April) is too small to charge for.

## 3. Price points for small niche datasets

- Gumroad: one-off niche CSV snapshots (e.g. [EastBright "top-selling products" CSVs](https://eastbrightmarketing.gumroad.com/l/Gum-Film), 1,000 to 2,400 rows) sell for **$9.99**, with a multi-file bundle at **$14.99** (prices from search-result snippets; the product page didn't show them when fetched).
- Apify: pay-per-result scrapers of comparable government wait-time data (e.g. [US visa wait times](https://apify.com/martc03/visa-wait-times)) list "from **$0.01 / 1,000 results**".
- Datarade: enterprise datasets start in the thousands (e.g. $30k). That isn't comparable to a 9 MB tracker history.
- So the realistic range is **$10–$50 one-off**, or a small "commercial licence" tier at **~$50–$200/yr** for an API. Both sit under a legal cloud (section 1) and compete with free sources (section 2).

## Recommendation

1. Don't sell the data. Publish the CSV free on the Hub ([#8](https://github.com/aafre/ircc-processing-times/issues/8)) with "Source: IRCC, canada.ca. Compiled by Canada Visa Tracker" plus a link. This fits the non-commercial clause.
2. Add a LICENSE/data notice to the repo, since it's public with no licence. Use CC BY 4.0 for our own compilation and metadata, and say IRCC values aren't relicensed, matching GovWait.
3. Look at selling again only when a named buyer asks. At that point, get IRCC's written permission first (contact the copyright administrator, as the canada.ca terms say).
