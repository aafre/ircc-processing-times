# How AI engines answer Canada processing-time queries (GEO research)

Ticket: aafre/ircc-processing-times#4 · Researched 2026-10-21 · Map: #1

**Question:** How do ChatGPT, Perplexity and Google AI Overviews answer "Canada visitor visa processing time from <country>" / "super visa processing time India"? What do they cite, and what makes a data page citable? Output: GEO requirements for our page templates.

**Method / limits:** ChatGPT, Perplexity and AI Overviews could not be queried directly. As a proxy, I ran web searches for the target queries and noted which sources the search-grounded answers cited, then read the vendors' own crawler and AI-feature docs. I also audited the live site with `curl` on 2026-10-21. Third-party citation studies are labelled as such. Their numbers come from vendor dashboards, not from the engines.

---

## 1. What the engines cite today (proxy SERP evidence)

| Query | Sources the grounded answer cited | Observations |
|---|---|---|
| Canada visitor visa processing time from India | cicnews.com (2023 article!), businesstoday.in, business-standard.com (several dated monthly update stories), icicilombard.com, careinsurance.com | The answer had to reconcile figures from 31 to 117 days pulled from articles of different dates. It said outright that "some of these sites show misleading page dates" and fell back to "check IRCC". |
| super visa processing time India 2026 | cicnews.com (Mar 2026), libertyimmigration.ca (Jun/Jul 2026 monthly posts), immigration2canada.com | Figures conflicted (50 / 110 / 202 / 208 days). The answer noted that "sources conflict" and pointed to IRCC as authoritative. |
| Canada visitor visa processing time by country tracker | immigration.ca, moving2canada.com, gofarglobal.com, business-standard.com, libertyimmigration.ca | Country trackers do get cited. The answer ranked them by their **visible "last updated" date**. |

**Takeaways**

1. **IRCC itself is hard to cite.** The canada.ca processing-times page has no country numbers in its static HTML. The figures come from an interactive JS tool, and the static text even shows "Last update: Error loading date" ([canada.ca tool page](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html)). So engines lean on secondary pages that print the numbers in text: news outlets, consultancies and insurers. **That gap is what we can fill.** We publish the IRCC number in static HTML with a date, for every country, daily.
2. **Staleness and conflicting numbers are the main failure in today's answers.** Engines visibly look for the most recent dated figure. A page that states *"As of <IRCC update date>, … is N days"* in prose and carries a machine-readable date has a clear edge over monthly news posts.
3. Current winners are **dated news stories** (business-standard: one story per IRCC update) and **RCIC/consultancy trackers** (gofarglobal: answer-first H1 "18-113 Days", update stamp, methodology statement, FAQ, RCIC licence shown). Gofarglobal's figures contradict each other within the same page (for example Mexico shows 16 days in one place and 19 in another). Consistent numbers on a page are a cheap way to beat it.
4. **Reddit** threads ranked in none of these top results, but Reddit is the #1 or #2 cited domain overall across AI engines (see §6).

## 2. Platform rules (primary sources)

| Engine | Crawler that matters for *citation* | What the vendor says |
|---|---|---|
| ChatGPT search | **OAI-SearchBot** (not GPTBot) | "Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers." GPTBot is the *training* crawler only. ChatGPT-User fetches on user request and "robots.txt rules may not apply". OpenAI recommends allowing OAI-SearchBot plus its IP ranges (openai.com/searchbot.json). Changes take about 24 hours. ([OpenAI bots doc](https://developers.openai.com/api/docs/bots)) |
| Perplexity | **PerplexityBot** | It is "designed to surface and link websites in search results" and is "not used to crawl content for AI foundation models". Perplexity-User generally ignores robots.txt. IP list at perplexity.com/perplexitybot.json. Changes take up to 24 hours. ([Perplexity bots doc](https://docs.perplexity.ai/guides/bots)) |
| Google AI Overviews / AI Mode | **Googlebot** (ordinary Search indexing) | "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary." A page must be "indexed and eligible to be shown in Google Search with a snippet." "You don't need to create new machine readable files, AI text files, or markup." "There's also no special schema.org structured data that you need to add." Keep structured data matching the visible text. ([Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)) |
| Google-Extended | n/a (robots.txt token only) | It "does not impact a site's inclusion in Google Search nor is it used as a ranking signal". It controls Gemini training and grounding in Gemini Apps and Vertex AI only. Blocking it does not remove us from AI Overviews. ([Google common crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)) |
| Bing Copilot | Bingbot | Copilot answers draw on the Bing index. Submit the sitemap in Bing Webmaster Tools and use IndexNow (see the `seo-bing` skill). |

**Freshness evidence** (Ahrefs, 17M AI-cited URLs, 28 Jul 2025): AI assistants cite content 25.7% fresher than organic SERPs. ChatGPT shows the strongest freshness bias (citations 458 days newer than organic), Perplexity's are 250 days newer, and AI Overviews are the exception (≈16 days *older*) ([Ahrefs](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content)). Seer Interactive (2026) found the freshness effect is mostly driven by **updates to existing pages**, not new publishing ([Seer](https://www.seerinteractive.com/insights/study-content-recencys-impact-on-ai-visibility-in-2026)). Both fit our model: the same URLs, updated daily.

**Content features:** the GEO paper (Aggarwal et al., KDD 2024) reports visibility gains of up to 40% in generative engine responses. Per its results tables, adding statistics, quotations and source citations were among the strongest methods ([arXiv 2311.09735](https://arxiv.org/abs/2311.09735)). Our pages are made of statistics. They need sentences that carry those statistics and cite the source.

## 3. Cloudflare AI-bot blocking: does it apply to us, and how to verify

- Cloudflare's **legacy "Block AI bots"** setting blocks verified bots classified as AI training crawlers, plus look-alike unverified bots. It excludes mixed-purpose bots. Per Cloudflare's changelog and press coverage, it became **"Block on all pages" by default for domains created on/after 1 Jul 2025**.
- Since 1 Jul 2026 the setting is replaced by **per-behaviour AI bot policies (Search / Agent / Training)**, each set to Block / Block on pages with ads / Allow. The legacy toggle is deprecated on **15 Sep 2026**. **New domains from 15 Sep 2026 default to blocking Training + Agent on pages that display ads, with Search allowed.** Mixed-purpose crawlers that combine Search and Training are blocked under any Training-block configuration. ([Cloudflare block-ai-bots doc](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/), [Cloudflare bots changelog](https://developers.cloudflare.com/bots/changelog/))
- The block is enforced at the **WAF on Cloudflare's verified-bot classification, not by robots.txt**. A robots.txt `Allow` does not override it.
- **Why this matters for monetisation:** once display ads go live (#1 destination), "Block on pages with ads" policies would start applying to our country pages.
- **Managed robots.txt** (if enabled) is *prepended* to ours (changelog 2025-07-02).

**Our live state (2026-10-21):** `GET /processing-times/india/` returned 200 for spoofed GPTBot / OAI-SearchBot / PerplexityBot / ClaudeBot user agents. **This proves nothing.** Spoofed UAs come from non-verified IPs, so the verified-bot rule never matches them. `/robots.txt` returned the homepage HTML (see §5), so Cloudflare-managed robots.txt is **not** enabled.

**How to verify for real:**
1. **Dashboard:** canadavisatracker.com → Security → Settings → *Configure AI bot policies* (or legacy *Block AI bots*). Requirement: **Search = Allow; Agent = Allow; Training = owner's choice.** Training access does not affect citation (GPTBot and Google-Extended are training-only). Do *not* pick "Block on pages with ads" for Search.
2. **AI Crawl Control** (Cloudflare dashboard → AI Crawl Control): check per-crawler request counts and whether any are "blocked". Seeing OAI-SearchBot, PerplexityBot and Bingbot with allowed 200s is the real proof.
3. Security → Events, filtered by the bot-category field, should show no blocks for Search-category crawlers.
4. Later: Bing Webmaster / GSC URL Inspection both fetch from verified IPs. A successful live test confirms Googlebot and Bingbot get through.

## 4. llms.txt: real value

- Google: "no AI system currently uses llms.txt" (John Mueller, 17 Jun 2025, [SER](https://seroundtable.com/google-ai-llms-txt-39607.html)). Google's AI-features doc says no "AI text files" are needed (§2).
- Third-party log studies (Otterly, Ahrefs, SE Ranking, as reported secondarily) show AI crawlers almost never request it, and no link to citation was found.
- **Verdict:** low value, near-zero cost. Optional: one static `public/llms.txt` that lists the site purpose, the IRCC data source, the update cadence and links to `/processing-times/`, `/about/` and the sitemap. Do it only after the P0 items. Do not generate per-page Markdown twins.
- **Caveat right now:** `/llms.txt` currently returns **200 + homepage HTML** (soft 404), which is worse than a clean 404.

## 5. Audit of our pages (live, 2026-10-21)

| # | Finding | Severity |
|---|---|---|
| A1 | **The cc75ded8 fix is not live yet.** Live `/processing-times/india/` still has `<link rel="canonical" href="https://ircc-times.com/processing-times/india/">` and `og:url` on the dead domain. The live homepage is the same. The sitemap does use canadavisatracker.com. Check the Cloudflare Pages build/deploy of cc75ded8. | P0 |
| A2 | **Sitewide soft 404:** any unknown path (`/robots.txt`, `/llms.txt`, `/this-does-not-exist-xyz`) returns **200 + homepage HTML**. As a result, robots.txt is not being served at all yet: crawlers parse HTML as robots.txt, which in practice means "allow all", but it is broken. Add `src/pages/404.astro` so Cloudflare Pages returns real 404s, and confirm `public/robots.txt` deploys. | P0 |
| A3 | **No citable prose.** The visible page is the H1 "India" plus numbers in cards and a table ("Visitor Visa 29 days … Super Visa 11 weeks 77 days"). The only full answer sentence ("As of October 14, 2026, the processing time … is 29 days") exists **only inside FAQPage JSON-LD**, which doesn't match the visible text. That conflicts with Google's guidance. | P0 |
| A4 | **H1 is just the country name.** The `<title>` is good ("Canada Visitor Visa Processing Time from India — 29 Days (October 2026)") but the H1 doesn't restate the query or the answer. | P1 |
| A5 | **Unit inconsistency:** the cards say "Super Visa 77 days / Study 49 days" while the table says "11 weeks / 7 weeks". Engines that compare sources penalise numbers that look like they conflict. | P1 |
| A6 | **History is invisible to crawlers:** the uPlot chart is drawn on a canvas, so the trend/history data isn't in the HTML text. | P1 |
| A7 | **Freshness stamp is not machine-readable:** `LastUpdated` renders "Latest official IRCC data (October 14, 2026) · Updated daily" as plain text. There is no `<time datetime>` and no `dateModified` in JSON-LD. Also "Updated daily" is about *our scrape*, while the 14 Oct date is *IRCC's*. Keep both, but label them clearly. | P1 |
| A8 | **Entity inconsistency:** the domain is canadavisatracker.com, the nav logo says "IRCC Times", `og:site_name` says "IRCC Processing Times", and the commit history says "ircc-times". There is no Organization/WebSite JSON-LD, and no `sameAs` to r/CanadaVisitorVisa or GitHub. | P1 |
| A9 | **No visible source link or method on the country page.** The footer says "Data sourced from IRCC". There is no link to the canada.ca tool, and nothing explaining what "processing time" means (the clock starts on a complete application, 80% of applications, excludes biometrics). | P1 |
| A10 | FAQPage schema is fine to keep (no penalty), but Google limits FAQ rich results to authoritative government/health sites since Aug 2023, so there's no SERP feature to gain. Its value now is as a parsed Q&A only if the same Q&A is **visible**. | P2 |

## 6. Entity / brand signals (incl. Reddit)

- Reddit is the most-cited domain in AI search in most 2025–26 studies: Peec (Mar 2026, 30M sources) has it #1 across ChatGPT, AI Mode, Gemini, Perplexity and AI Overviews. Semrush (230K prompts) has it #1 on Perplexity, #2 on ChatGPT search and #3 on AI Mode, with large swings over time ([Peec](https://docs.peec.ai/research/most-cited-domains-in-ai-search), [Semrush](https://www.semrush.com/blog/reddit-ai-search-visibility-study/)). These are vendor studies; treat the rankings as directional.
- So the owner's r/CanadaVisitorVisa is a **GEO channel in its own right**. Threads that state the current number *and* link the tracker page give the engines a co-citation path (Reddit cited → our URL linked inside it).
- The brand needs **one name**, used the same way on the site, the subreddit sidebar/wiki and GitHub, so engines resolve it as one entity.

## 7. GEO requirements for page templates

**P0: access and indexability (do first; nothing else matters until done)**
1. Confirm cc75ded8 is deployed: live canonical/og:url = `https://canadavisatracker.com/...`.
2. Add `src/pages/404.astro` so unknown paths return a real 404. Verify `curl -I /robots.txt` → `text/plain` with our content.
3. robots.txt: keep `User-agent: * / Allow: /` plus the Sitemap line. No need for per-bot `Allow` groups (a bot without its own group inherits `*`). Only add explicit groups if we decide to **block training**, e.g. `User-agent: GPTBot` / `Google-Extended` / `CCBot` → `Disallow: /`. Never block OAI-SearchBot, PerplexityBot, Googlebot or Bingbot.
4. Cloudflare: AI bot policy Search = Allow, Agent = Allow, and *not* "Block on pages with ads" for Search (matters once ads launch). Verify in AI Crawl Control as in §3.
5. Submit the sitemap in Bing Webmaster Tools and enable IndexNow on the daily data push (Copilot and other Bing-grounded answers).

**P0: citable answer block (country template, above the fold)**
6. H1 restates the query: `Canada visitor visa processing time from {Country}`.
7. Directly under the H1, render **one self-contained answer sentence** in a `<p>`, built from the same data as the JSON-LD:
   > As of **{IRCC update date}**, IRCC's processing time for a Canada visitor visa (TRV) applied for from **{Country}** is **{N} days**. That is {up/down N days} since {previous change date}. Super visa: {N} days · Study permit: {N} days · Work permit: {N} days.
   The sentence must stand alone (country, visa type and date all named) so a passage extracted on its own still answers the query.
8. Keep one HTML `<table>` with `<caption>` ("{Country}: IRCC processing times as of {date}"), `<th scope>` headers, and **one unit (days)**, optionally followed by "(≈11 weeks)". Make the cards and the table use the same values and unit.

**P1: freshness and trust**
9. Freshness stamp: `<time datetime="YYYY-MM-DD">` for IRCC's update date, labelled "IRCC data as of …", plus a separate "Checked by our tracker on …" for the scrape date. Put `dateModified` (= IRCC update date) in JSON-LD. Update the title and description only when the number changes, which already happens since they're derived from the data.
10. Visible source and method line on every country page: link to the canada.ca processing-times tool, plus one sentence saying what the number means ("time to process 80% of applications; clock starts when IRCC receives a complete application; excludes biometrics"), linking to `/about/` (methodology).
11. Render the change history as **text**: a short "Recent changes" list or `<table>` of the last 5–10 IRCC updates (date → days). Keep the chart as an enhancement. This gives both the trend and the dated, citable facts.
12. Visible FAQ (3–5 Q&As) mirroring the FAQPage JSON-LD word for word, including super visa and "why does it differ from IRCC's service standard". If the questions aren't visible, drop them from the schema.
13. Structured data, kept minimal and matching visible text: `WebPage` with `dateModified`, `BreadcrumbList`, and the existing FAQPage once its answers are visible. Add `Organization` + `WebSite` (name, url, logo, `sameAs`: reddit.com/r/CanadaVisitorVisa, GitHub repo) once in `Base.astro`. A `Dataset` (with `temporalCoverage`, `isBasedOn` canada.ca, `license`) on `/processing-times/` is optional, for Google Dataset Search. Google is explicit that no schema is *required* for AI features, so don't over-invest.

**P1: entity / brand**
14. Pick one brand name and use it in the nav logo, `og:site_name`, the Organization schema, the About page, the subreddit sidebar/wiki and the GitHub description. "Canada Visa Tracker" matches the domain.
15. Reddit: a sidebar/wiki link to the tracker, plus a recurring "IRCC processing times update ({date})" post that quotes the headline numbers in text and links the country pages. Keep these within subreddit rules and transparent about ownership. (The detailed plan belongs to the "Subreddit ↔ site linking" item on map #1.)

**P2: optional**
16. A static `public/llms.txt` (purpose, data source, cadence, key URLs). It costs about 5 minutes, but expect roughly zero impact (§4).
17. Dedicated query-shaped pages for high-intent combos where search shows separate demand, e.g. `/super-visa/india/`. Defer to the programmatic-pages ticket.

**What not to do:** don't block OAI-SearchBot or PerplexityBot thinking they're training bots. Don't add schema that isn't visible. Don't publish Markdown twins or "AI-only" pages. Don't let the cards and table show different units.

## Sources

- OpenAI crawlers: https://developers.openai.com/api/docs/bots
- Perplexity crawlers: https://docs.perplexity.ai/guides/bots
- Google AI features and your website: https://developers.google.com/search/docs/appearance/ai-features
- Google common crawlers (Google-Extended): https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
- Cloudflare AI bot blocking: https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/ · changelog: https://developers.cloudflare.com/bots/changelog/
- IRCC processing-times tool: https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html
- Ahrefs freshness study: https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content
- Seer recency study: https://www.seerinteractive.com/insights/study-content-recencys-impact-on-ai-visibility-in-2026
- GEO paper: https://arxiv.org/abs/2311.09735
- Mueller on llms.txt: https://seroundtable.com/google-ai-llms-txt-39607.html
- Reddit citation share: https://docs.peec.ai/research/most-cited-domains-in-ai-search · https://www.semrush.com/blog/reddit-ai-search-visibility-study/
- Competitor examples: https://www.gofarglobal.com/immigration/processing-times/visitor-visa · https://www.business-standard.com/immigration/ · https://libertyimmigration.ca/ · https://www.cicnews.com/2026/03/ircc-processing-times-march-2026-0372750.html
