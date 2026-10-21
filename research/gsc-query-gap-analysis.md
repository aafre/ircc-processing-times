# GSC query gap analysis: canadavisatracker.com

Resolves #2 (map: #1). Researched 2026-10-21.

## Source and caveats

- **Source:** Google Search Console API (property `sc-domain:canadavisatracker.com`, search type WEB), pulled via the GSC MCP with dimensions `query,page` and `page` (row limit 25,000, so every row GSC would return), plus `date`.
- **Window:** I asked for 480 days. GSC only has data from **2026-04-05 to 2026-10-20**, about 6.5 months, because the property starts then.
- **Totals:** 176 pages have impressions. Summed page-level impressions come to about **5,900**, with about 60 clicks.
- **Most queries are hidden.** The query+page pull returned only **261 rows, about 700 impressions (~12%)**. GSC withholds the remaining ~88% as anonymised long tail. Some pages show a lot of impressions but almost no visible queries, for example Mauritius 175, Uganda 166, Guyana 159, Iran 154, Jordan 122 and Nepal 108, all at positions 7 to 12. Their demand is real, but we can't read the query text.
- **Suppressed baseline.** Every canonical and og:url pointed at the dead `ircc-times.com` until commit cc75ded8 on 2026-10-21. Treat positions as a floor. Re-pull about 4 to 6 weeks after the fix, around early December 2026, before committing to the low-volume items below.
- **Sample sizes are tiny.** Most queries have 1 to 10 impressions, so the rankings below show direction only, not reliable volumes.

## What exists today

`website/src/pages`: `/`, `/about/`, `/processing-times/` (index), and `/processing-times/[country]/` (about 200 pages, one per IRCC country, including `canada` = applying from inside Canada).

Every country page uses a visitor-visa-only title, `Canada Visitor Visa Processing Time from {Country} — {days} ({Month Year})` (`[country].astro:33`). Study permit and super visa appear only in the meta description and FAQ schema. No page targets study, work or super visa by itself.

## Clusters (visible queries only, ~700 impressions)

### By visa type

| Visa type | Approx. impressions | Typical position | Notes |
|---|---|---|---|
| Visitor / TRV / "tourist" / "visit" | ~520 | 5 to 12 for small countries; 50 to 90 for India, US, UK, Pakistan, Philippines | Nearly all demand. We already target it. |
| **Study permit** | **~52** | **5 to 15** (Nigeria), 8 to 30 (Iran, China, Mexico), 70 (India) | Ranks on page 1 **with no study-targeted title**. Nigeria alone has 46 impressions, e.g. "ircc study permit processing time nigeria april 2026" (21 impressions, position 5.1). |
| Super visa | 2 | ~80 (India) | Almost absent because there's no page. Autocomplete shows real demand (see below). |
| Work permit | 2 | 42 to 57 (India, Philippines) | Same pattern as super visa. |
| Other (business, transit, biometrics) | 3 | 59 to 93 | India only. |
| **Wrong intent: outbound visas *from* Canada** | **~35** | 46 to 87 | "uk visitor visa from canada", "us visa waiting time canada", "australia visa from canada" and similar. These land on the UK, US and Australia pages, which can't satisfy them. |
| Brand / tool ("ircc time tracker", "ircc tracker reddit", "visa tracker canada") | ~13 | 8 to 47 | Rank on `/about/` (11) and `/` (40 to 56). |

### By country (visible query impressions; page-level impressions and position in brackets)

| Country | Visible query impressions | Page impressions / avg position | Read |
|---|---|---|---|
| India | ~170 | 360 / **52.1** | Largest visible demand and the worst rank. "canada visa processing time india" alone has 38 impressions at 64.8. A competitive head market. |
| Nigeria | ~75 (46 of them study) | 447 / 8.8 | Most page impressions on the site, and **0 clicks**. Visitor plus study demand at positions 5 to 10. |
| Bangladesh | ~45 | 224 / 19.1 | The "2026" variants rank at 5 to 12. Close to page 1. |
| UK / US / Australia | ~55 | 90 / 43; 103 / 55; 41 / 17 | Mostly outbound-from-Canada intent, i.e. a mismatch. |
| Gulf residents (Oman, Qatar, Saudi Arabia, Kuwait, UAE) | ~45 | Oman 36 / 6.7; Qatar 27 / 27; Saudi Arabia 86 / 10 | People applying from their country of residence. Pages already rank. |
| Pakistan, Philippines, Sri Lanka, Singapore | ~10 to 15 each | 61 / 46; 54 / 57; 44 / 17; 48 / 15 | Large markets that rank poorly. Includes the misspelt "processing time" variants. |
| Lebanon, Jamaica, Ghana, Kenya, Iran | 5 to 10 each | positions 7 to 14 | Already working. |
| Generic, no country ("canada visitor visa processing time", "...timeline") | ~25 | `/processing-times/canada/` 14 / **74.8**; `/processing-times/` 136 / 34; `/` 293 / 15 | Generic head terms are being matched to the **"Canada" country page** (applying from inside Canada) instead of a hub. |

### By intent

| Intent | Share of visible impressions | Notes |
|---|---|---|
| Processing time (incl. "how long", "timeline", "wait time") | ~90% | Strong **year/month modifier** pattern: "2026", "april 2026", "june 2026". Titles already include `{Month Year}`, which works; keep it. |
| How-to / process | ~2% | "biometric start date", "how long does it take for approval". Autocomplete adds "after biometrics" heavily (see below). |
| Comparison / ratio | <1% | "canada visit visa ratio from bangladesh (2026)". Approval-rate intent; we have no data for it. |
| Outbound / wrong-site | ~5% | See above. |
| Brand / tool | ~2% | |

## Ranked page opportunities

Ranking weighs visible demand, page-level impressions, and how close the current position is to page 1. Impressions cover 6.5 months on the suppressed baseline.

| # | Opportunity | Evidence (impressions, position) | Current best page | Action type |
|---|---|---|---|---|
| 1 | **Study permit processing time by country** (Nigeria first, then Iran, China, Mexico, India, Ghana, Pakistan) | ~52 visible impressions at positions 5 to 15 with no targeting at all. Nigeria page: 447 impressions, 0 clicks. Autocomplete: "study permit processing time for nigeria / in ghana / india / from pakistan / inside canada" | `/processing-times/nigeria/` (visitor title) | New page type, e.g. `/study-permit/[country]/`, or a per-country visa-type section with its own title |
| 2 | **Fix generic head-term targeting** ("canada visitor visa processing time", "timeline") | `/canada/` 14 impressions at 75; `/processing-times/` 136 at 34; `/` 293 at 15 | Wrong page (`/processing-times/canada/`) | Retitle `/` or `/processing-times/` to own the generic visitor-visa head term. Retitle `/canada/` to "...from inside Canada" so it stops competing. |
| 3 | **India visitor page** | 360 impressions at 52.1; ~170 visible impressions across 40+ variants ("visa processing time india", "tourist visa from india", "trv") | `/processing-times/india/` | Strengthen the existing page (content depth, "after biometrics", history chart, FAQ). Highest volume, hardest market. |
| 4 | **Super visa processing time** (hub plus India, Pakistan) | GSC 2 impressions at ~80. Autocomplete: "from india", "after biometrics from india", "from pakistan", "for indians", "2026" | `/processing-times/india/` (FAQ only) | New page(s). Demand is invisible in GSC only because no page exists. |
| 5 | **Work permit processing time** (hub plus India, Pakistan, USA, Nigeria) | GSC 2 impressions at 42 to 57. Autocomplete: "from india / pakistan / usa / nigeria", "inside canada", "after medical" | India or Philippines page (incidental) | New page(s), same template as #1 |
| 6 | **Bangladesh visitor page** | 224 impressions at 19. The "2026" queries rank at 5 to 12 | `/processing-times/bangladesh/` | On-page push. Add Bengali-term coverage ("কানাডা ভিজিট ভিসা প্রসেসিং টাইম" appeared). |
| 7 | **"After biometrics" timeline** (how-to / guide) | Appears in autocomplete for every visa type; GSC "biometric start date in india" at 74 | none | Guide page, linked to the #1 per-map guide decision |
| 8 | **Large markets ranking 40 to 60** (Pakistan, Philippines, US, Malaysia, Indonesia) | Pakistan 61 / 46, Philippines 54 / 57, US 103 / 55 | Existing country pages | Reassess after the canonical fix before investing |
| 9 | **Brand / "ircc tracker reddit"** | ~13 impressions, `/about/` at 11 | `/about/` | Cheap: mention r/CanadaVisitorVisa and "tracker" on the home page and About page (ties into the subreddit-linking ticket) |

Not opportunities: outbound "UK/US/Australia visa from Canada" queries (~35 impressions). Different product, so don't chase them. At most add a one-line disambiguation on those pages.

## Mis-targeted existing pages

1. **All country pages: visitor-only `<title>`**, even though study and super visa data is on the page. Nigeria and Iran rank for study permit queries without targeting them, which leaves CTR on the table (Nigeria: 447 impressions, 0 clicks).
2. **`/processing-times/canada/`** ranks (badly, ~75) for generic "canada visitor visa processing time / timeline" queries. Its title reads as "Visitor Visa Processing Time from Canada", which collides with the head term. It should be "Applying from inside Canada".
3. **`/processing-times/` and `/`** should own the generic head terms but sit at 34 and 15 with ~430 impressions between them. The titles say "Canada Visa Processing Times ... IRCC Tracker" without "visitor visa".
4. **`/processing-times/united-kingdom/`, `/united-states-of-america/`, `/australia/`** pull outbound-intent queries ("uk visa from canada"), because "from {Country}" is ambiguous to Google. This is low priority, but it drags their average position down.

## Free demand signals

- **Google autocomplete** (`suggestqueries.google.com/complete/search?client=firefox&q=...`, free, no key) confirmed demand for super visa, study and work permits that GSC can't show. It also showed "after biometrics", "and fees" and "inside canada" as recurring modifiers. One `curl` per seed was enough. A small script that loops seeds × top countries would give a free demand matrix for #1, #4 and #5.
- **Also cheap:** "People also ask" and related searches on a manual SERP check, and r/CanadaVisitorVisa post titles (already collected by `collect_subreddit.py`).

## Re-check

Re-pull `query,page` around 2026-12-01 to see the post-canonical-fix positions, especially for India, the hub and `/canada/`, before building items #3 and #8.
