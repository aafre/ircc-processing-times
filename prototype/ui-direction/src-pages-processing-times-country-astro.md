---
version: 1
slug: "src-pages-processing-times-country-astro"
primary_target: "src/pages/processing-times/[country].astro"
related_targets: ["src/pages/index.astro","src/pages/processing-times/index.astro"]
---

# Country page (and sibling templates)

Mode: Operate (lookup). Mobile-first, 390px primary. Applies to home, hub, country, country × visa-type, ranking and monthly report pages.

Audience/job: anxious applicant (or family in Canada) checking "how long will mine take?" for their country; plain-English, second-language readers.

Proof/content: IRCC's published day count per country and type, dated; daily history since Apr 2026; peer countries. Never a range or a prediction IRCC didn't publish.

Constraints: system light/dark (both designed); WCAG 2.2 AA; LCP < 1s and CLS ~0 kept; ads and affiliate slots designed into every template (reserved height, labelled "Sponsored"), never between the number and its explanation.

## Direction contract

THESIS: A processing time is a forecast: today's number, its outlook, its recent history, read in seconds. Refuses the dark stat-dashboard (hero metric + cards + glow).

OWN-WORLD: Newspaper weather page. Pale sky ground (#eaf2f8) with deep navy ink (#0e2a3f), white panels, a single trend blue (#3b82b6), sun-amber (#f2b84b) only for the outlook dot. Dark: night-sky navy ground, same roles. Archivo, condensed widths for numerals and headings, normal width for reading; tabular figures throughout.

STORY: Visitor sees their country and type, the day count as today's "high", an outlook word (steady / rising / falling, from the last 4 weekly changes), "apply today → decision around <date>", then other types as forecast chips, then the 6-month trend drawn like a temperature graph with low/high.

FIRST VIEWPORT: Top bar (brand + country search pill). Country · type line, H1, giant condensed day count left with outlook + "IRCC estimate, updated <date>" right; one answer sentence; type chips (current one filled navy); trend panel; a labelled sponsored row below the trend.

FORM: Forecast (IMPECCABLE'S PICK, #1 of the grounded list; assigned was #3 Day Leaf). seed:8f489a757e5606c2

SIGNATURE: the trend chart as a forecast graph — weekly steps, low/high labels, today's dot; the outlook word derived from it.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
