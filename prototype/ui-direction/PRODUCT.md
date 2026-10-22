# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: an applicant, or their family member in Canada, who has applied for (or is about to apply for) a Canadian visitor visa, super visa, study permit or work permit, and wants to know "how long will mine take?". Usually on a phone, often anxious, often applying from India, Nigeria, the Philippines and similar countries, frequently reading English as a second language.

## Product Purpose
Canada Visa Tracker publishes IRCC's official processing times for 200+ countries and four application types, refreshed daily, with the history IRCC itself does not keep. Success: a visitor gets a trustworthy, dated answer for their country in seconds, understands what it means, and comes back to watch it change.

## Positioning
In priority order:
1. **Daily history** — a dated daily record since Aug 2026 with trends; IRCC only shows today's number and other sites copy stale snapshots.
2. **Fast, plain answer** — one dated sentence per country, no JS wall, no consultancy upsell.
3. **Community-backed** — open source and tied to r/CanadaVisitorVisa, where real applicant timelines live.

## Operating Context
- Data comes from the IRCC scraper (`../scraper/data`), stored daily in a public repo.
- Static Astro site on Cloudflare; traffic arrives mostly from Google search to country pages, plus AI engines and Reddit.
- Owner runs r/CanadaVisitorVisa.

## Capabilities and Constraints
- Content is AI-drafted and owner-reviewed. No legal or immigration advice.
- Monetisation: affiliates now; display ads once traffic passes the threshold set in the growth map. Ad and affiliate slots must not hurt Core Web Vitals.
- Country × visa-type pages (`/processing-times/{country}/{type}/`) and monthly report pages are planned.

## Brand Commitments
- Single name: **Canada Visa Tracker**.
- Voice: calm and factual; reassuring, never alarmist; transparent that the data is IRCC's; never advice.
- Must not resemble canada.ca or imply government affiliation.

## Evidence on Hand
- Daily IRCC processing-time history since Aug 2026 (public repo).
- No testimonials, user counts or press exist — do not fabricate them.

## Product Principles
1. The answer first: the visitor's country and number before anything else.
2. Every number is dated and sourced.
3. Context over alarm: a long wait is explained, not dramatised.
4. History is the asset no one else has.

## Accessibility & Inclusion
WCAG 2.2 AA is a hard floor: contrast, visible focus, reduced motion, no meaning by colour alone. Plain English for second-language readers.
