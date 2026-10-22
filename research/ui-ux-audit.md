# UI/UX audit of canadavisatracker.com (2026-10-22)

Resolves the **UI/UX audit of current site** ticket (#11) on the map **Grow canadavisatracker.com traffic & monetise** (#1). This is findings only, with no decisions. Direction belongs to **UI/UX overhaul direction** (#12).

**Method.** I audited the live site at 390px (phone, @2x) and 1440px (desktop), with light and dark colour schemes, on four templates: home, `/processing-times/` hub, `/processing-times/india/` country, and 404. Four passes:
- **Impeccable critique A:** an isolated design review with Nielsen scores.
- **Impeccable critique B:** an isolated detector run plus Playwright measurements (contrast, targets, requests, LCP/CLS).
- **Impeccable audit:** scores across five technical dimensions.
- **Apple-design HIG lens:** hierarchy, type, accessibility, dark mode, charts.

Screenshots are in [`ui-ux-audit/`](ui-ux-audit/). Light and dark captures are byte-identical, so only one set is kept.

## Scores

| Lens | Score |
|---|---|
| Nielsen heuristics (critique A) | **21/40**: Acceptable, significant work needed |
| Technical audit (critique B) | **11/20**: Acceptable. A11y 2 · Perf 3 · Theming 2 · Responsive 3 · Integrity 1 |
| Apple HIG (apple-design) | **Needs work**: no Critical in the HIG sense, several High |
| Impeccable detector, source scan | 0 findings (false negative: the problems only show at runtime) |
| Impeccable detector, live URLs | 16 findings: 1 real P0 (script-error), 1 real heading skip; the rest are taste or false positives |

## Ranked findings (by impact on visitors and on CTR/engagement)

### P0: broken in production
1. **The history chart never renders on any of the 212 country pages.** `HistoryChart.astro:36` does `await import('uplot/dist/uPlot.min.css')`. The built `/_astro/uPlot.Saz_VHki.css` returns a 404 HTML page, the import throws, and `initChart()` aborts. Every country page shows an empty 300px "Processing Time Trend" box, as in [india-chart.png](ui-ux-audit/india-chart.png). All three reviews independently called this the page's emotional low point: it looks broken right under the number it is meant to support. *This is a bug, not a design decision. It can be fixed now, ahead of the spec.*

### P1: major
2. **Finding your own country is slow on phones.** Home has no country input; its CTA "View All Countries" leads to the hub.
   - The hub on phone is **about 42,000 CSS px tall**: 212 identical cards at about 210px each, sorted fastest-first, so India, Nigeria and the Philippines are buried. There is no A–Z order, sort, grouping or result count, and no "no results" state for search.
   - The home table on phone clips the Study and Work columns with no scroll cue ([home-phone.jpg](ui-ux-audit/home-phone.jpg), [hub-phone-top.jpg](ui-ux-audit/hub-phone-top.jpg)).
3. **The country page repeats itself and confuses the main answer.**
   - The visitor figure appears 3× (hero, card, table).
   - Units conflict: Study shows **56 days** on its card and **8 weeks** in the table. Home mixes weeks and days in one column.
   - The "IRCC RAW" column is jargon.
   - Nothing says what the number measures (submission to decision? biometrics excluded?), and there is no link to the official IRCC page ([country-desktop.jpg](ui-ux-audit/country-desktop.jpg)).
4. **Visible data and copy errors.**
   - The hero says "170 countries" while the stat strip below says "212".
   - "1 days" (Palestine, which is also the top hub card).
   - West Bank has no flag.
   - The "SV: 60d" badge.
   - `getSpeedLabel` calls 61–90 days "Slow" while `getSpeedClass` colours it amber "moderate" (`utils/formatting.ts`).
   - The 30/90-day colour thresholds are never explained, and there is no legend.
5. **Accessibility gaps.** WCAG 2.2 AA is not met.
   - `--text-muted #64748B` measures **3.30–3.96:1**. It is used for labels, "days" units, breadcrumbs, the footer disclaimer, trend and SV badges, and the raw column (needs 4.5:1).
   - No `:focus-visible` styles anywhere, and the search input sets `outline:none`.
   - No `prefers-reduced-motion`: 212 hub cards fade in, sparklines draw, and smooth scroll is on.
   - The chart is canvas-only with no text alternative.
   - The country page jumps h1 → h3.
   - Speed is shown by colour alone, using the red/green pair, in the home and hub tables.
   - Search has no label; the breadcrumb `nav` is unlabelled; there is no skip link.

### P2: should fix
6. **No light appearance.** The site is dark-only: there is no `prefers-color-scheme` and no `color-scheme`, so native controls render light. The audience reads on phones, often outdoors.
7. **Monospace for reading text.** IBM Plex Mono at 0.7–0.75rem carries the meta line, breadcrumb, labels, table cells and footer. On phone the date breaks mid-phrase ("(October / 21, 2026)"), the status dot is orphaned on its own line, and the Reddit CTA button wraps to 3 lines.
8. **Touch targets under 44px on phone:** 22 on home, 13 on the country page. These are the nav (22px tall), footer (20px), breadcrumb (15px), table country links (23px), peer cards (41px) and inline CTAs (18–20px). The r/CanadaVisitorVisa nav link is hidden below 640px.
9. **Weight.**
   - Google Fonts are loaded through a CSS `@import`: 15 weights requested, 7–9 used, 214 KB of fonts in total, including a 122 KB variable serif.
   - The full `flag-icons` CSS adds 87 KB to every page.
   - The hub makes **221 requests / 757 KB**, of which 434 KB is flag SVGs.
   - LCP is still under 1s and CLS about 0. Performance is not a crisis, but the hub is heavy on 3G.
10. **The 404 page is a dead end:** one link, no search, no popular countries, and mostly empty space.

### P3: polish
11. **Three brand names:** "IRCC Times" in the nav (with "IRCC" borrowing the government body's name), "IRCC Processing Times" in `og:site_name`, and the domain canadavisatracker. The P0 fix in **Fixes to existing pages** already settled "Canada Visa Tracker", but it isn't live yet.
12. **Dead space:** sections use 8rem padding (`--space-2xl`), leaving gaps of 200px+ and a band of about 300px above every footer.
13. **Theming drift:** about 20 literal colours bypass the tokens (`HistoryChart.astro:47-67`, `TrendBadge.astro:41`, `Base.astro:61`, hovers and glows), plus many inline `style=` attributes. A light theme would miss them.
14. **Dead or unfinished code:** `CountryCard.astro` and `Sparkline.astro` are unused. `AffiliateCTA.astro` isn't wired in, uses emoji icons, and makes an unsourced "Trusted by 16M+" claim.

## Design specificity (craft)
All three reviews agree that **the look is a stock dark dashboard**: a navy `#0B1120`, amber and teal accents, a dot-grid and "aurora" background, a serif display face with mono labels, and a hero with a "212 / 4 / Daily" stat strip. A crypto tracker could reuse it unchanged. Nothing in it says Canada or speaks to an anxious applicant. The one owned moment is **the big coloured serif day count on the country page**. It is the clear candidate for a signature element, with everything else quieter around it.

## What works (keep)
- The country-page big number: it answers the question in about a second, above the fold on phone.
- Freshness and source cues on every page (`LastUpdated`, the "Not affiliated with the Government of Canada" disclaimer).
- The "Also in South Asia" peer list: scannable, useful for comparison, and real internal links.
- Breadcrumbs; no horizontal page overflow at 390px; proper 404 status; LCP under 1s, CLS about 0, and roughly 10 KB of JS on non-chart pages.
- Most text passes contrast comfortably: primary text 15.9:1, secondary 7.3:1, accent links 9.0:1, status colours 6.4–10.6:1.

## Questions for the overhaul ticket (not decided here)
- Should the home page *be* the lookup ("Where are you applying from?"), with the table second?
- Does a visitor-visa searcher need every other visa type shown twice on their page?
- What makes a red 106-day number feel manageable rather than alarming: context, history, or "what to do while waiting"?
- Should the hub sort fastest-first at all?
- The trend history is the asset nobody else has before Aug 2026, yet it is the least reliable element on the page. Should it become the signature?
- Light-first, dark-first, or follow the system setting?
- Where do affiliate and ad slots go so they don't sit between the number and its explanation?

## Sources
- Impeccable `critique.md` / `audit.md` (v4.3.1); apple-design references `dark-mode.md › Best practices`, `color.md`, `accessibility.md` (contrast, control size), `typography.md`, `layout.md › Visual hierarchy`, `charting-data.md`, `charts.md › Descriptive content`, `loading.md`, `branding.md`.
- Measurements: Playwright 1.56.1 Chromium against https://canadavisatracker.com on 2026-10-22.
