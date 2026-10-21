# Affiliate programs for canadavisatracker.com

Research for issue #3 (map #1). Researched 2026-10-21. Commission figures move often, and third-party directories disagree with each other. Where a program's own page gives no number, this note says so instead of quoting a directory. **Confirm every rate inside the network dashboard before you build CTAs around it.**

## TL;DR

1. **Fix the site before you reapply.** The site has no privacy policy, no contact page and no affiliate disclosure. A reviewer can't reach the owner and can't see how the brand would be promoted. These are the most common reasons a small site gets declined, and they are cheap to fix (see section 3).
2. **The current `AffiliateCTA.astro` breaks Wise's terms.** It links to `wise.com/invite/`, Wise's *personal* referral program, which bans commercial use, websites and public posting (Wise Referral Terms, clauses 2.3, 2.4 and 3.1(j)). Remove it or replace it with a Partnerize affiliate link. World Nomads is a weak fit for this audience (see 2.1).
3. **Easiest approvals:** SafetyWing (instant sign-up), HelloSafe Atlas (no minimum volume, 24h review), Travelpayouts (one account covers flights, eSIM and EKTA insurance; many programs auto-approve). Then Wise (Partnerize) and Remitly (Impact).
4. **Super visa insurance is the highest-value product, but no carrier publishes an open affiliate program for it.** IRCC requires a Canadian insurer or a minister-approved foreign insurer. Most global affiliate insurers (SafetyWing, World Nomads, EKTA) can't satisfy that. The realistic routes are HelloSafe Atlas (its FAQ lists "visitor and super-visa cover" deep links, but its own super visa guide says it sells no super visa policy, so confirm first), or direct referral deals with Canadian brokers once there is traffic to show.

## 1. Site context

- Astro site, ~30 Google clicks per month and ~2-3k impressions (rising), no analytics.
- Audience: applicants from India, Nigeria, the Philippines, Latin America and Africa, plus Canada-based sponsors (super visa).
- Pages: `/`, `/about`, `/processing-times/`, `/processing-times/[country]`. **No `/privacy`, `/contact`, `/disclosure` or `/terms`.** Grepping `website/src` finds no privacy, contact or mailto references.
- A previous CJ application exists (`cj_*.txt` snapshots in the repo root, April 2026). It stalled on the CJ promotional-property form ("A primary promotional model must be selected").

## 2. Programs

### 2.1 Visitor / travel insurance

| Program | Network | Commission | Approval bar | Fit / geo notes |
|---|---|---|---|---|
| **SafetyWing (Nomad Insurance)** | Direct ("Ambassador") | ~10% of premium; renewals commission too ([SafetyWing](https://safetywing.com/ambassador)) | Instant sign-up, no review described ([SafetyWing](https://safetywing.com/ambassador)) | Easiest yes. **Not super-visa compliant** (not a Canadian insurer). Fits short visitor trips and students. Check the per-country eligibility of buyers. |
| **HelloSafe Atlas** | Direct | "Up to 50%" on the Canada program page; "up to 20%" on the affiliate page; 90-day cookie ([Atlas CA](https://atlas.hellosafe.com/en-ca/travel-insurance-affiliate-program/), [Atlas affiliate](https://atlas.hellosafe.com/affiliate/)) | Free, no minimum volume, reviewed within 24h, no licence needed | Compares Canadian insurers (Manulife, Allianz, TuGo, GMS, 21st Century…). The FAQ lists "visitor and super-visa cover" deep links ([FAQ](https://atlas.hellosafe.com/en-ca/faq/)), **but** HelloSafe's super visa guide (Sept 2026) says it doesn't currently offer super visa policies ([guide](https://hellosafe.com/travel-insurance/super-visa-insurance)). Ask the partner team before you build super visa CTAs. |
| **EKTA** | Travelpayouts | 20% of policy, 30-day cookie; paid once the policy starts ([TP offer](https://travelpayouts.com/en/offers/ekta-affiliate-program)) | Travelpayouts per-program review, usually ≤3 business days | Global insurer. Content sites are an allowed traffic source. Not super-visa compliant. |
| **VisitorsCoverage** | Direct / CJ / Travelpayouts (listings vary) | Tiered referral fee by premium: about $1 for under $50, up to $100 for $2,000+ ([Travelpayouts](https://www.travelpayouts.com/blog/the-visitorscoverage-affiliate-program/)). Directories conflict, and one shows the program "Deactivated". | Unclear (the official page returned 403 to the fetcher) | Mostly US-inbound visitor plans. Check program status and whether any Canada or super visa product exists before you apply. |
| **IMG (Patriot etc.)** | Impact | Not published ("competitive", no minimum payout) ([IMG](https://www.imglobal.com/affiliate-program)) | Impact application. You may not give coverage advice. | Visitor/immigrant plans, but US-centric. Low priority. |
| **World Nomads** | CJ | Flat pay-per-quote (not % of sale); the payment threshold was removed ([WN payments](https://www.worldnomads.com/our-partner-program-payments)) | CJ application. Content mentioning WN must be pre-approved by `wnpartners@worldnomads.com`. A mandatory WN disclaimer applies. No deep links and no quote widgets ([WN FAQ](https://www.worldnomads.com/partnerships/affiliates/faqs)) | Adventure-travel brand, heavy compliance overhead, not super-visa compliant. **Drop it** from `AffiliateCTA.astro`. |
| **Allianz Global Assistance (Canada)** | CJ / Awin (per a HelloSafe comparison; unverified) | Reported "up to 12%" (unverified) | Network + advertiser review | Its Visitors to Canada plan has a $100k option that can meet super visa requirements. Apply once the site has traffic and policy pages. |
| **TuGo, Travel Guard CA, Manulife CoverMe, GMS** | Direct, no public program terms found | — | Direct outreach | These are the actual super visa carriers. Approach them later with traffic numbers. |

**Super visa insurance rules** (from [IRCC eligibility](https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/parent-grandparent-super-visa/eligibility.html)):

- The policy must be valid for at least 1 year from entry.
- It must come from a Canadian insurance company, or from a company outside Canada that the minister has approved.
- Proof is required with the application.
- Insurers advertise at least $100,000 of coverage, per the forms page.

So a super visa CTA must send people to a Canadian insurer or broker, never to SafetyWing, EKTA or World Nomads.

### 2.2 Money transfer

| Program | Network | Commission | Approval bar | Notes |
|---|---|---|---|---|
| **Wise Affiliate** | Partnerize | CPA from £10 per personal and £50 per business customer, after their first cross-currency transaction; 1-year cookie; reviewed at volume milestones ([Wise guide](https://wise.com/gb/blog/affiliate-onboarding-guide)) | Application; contact `partnerwise@wise.com`. Coupon/voucher and sub-network sites are excluded. No brand bidding. | Good fit: tuition, proof of funds, family sending money. Partnerize minimum withdrawal is $30. **Do not use `wise.com/invite`** ([Referral Terms](https://wise.com/gb/legal/referral-terms): personal use only, no websites, no public forums, no affiliate networks). |
| **Remitly Partner Program** | Impact | Rate not published; 30-day window ([Remitly](https://www.remitly.com/us/en/landing/partner-program)) | **The partner must be based in an eligible country** (US, UK, Canada, Australia, most of Europe). Remitly selects "high-quality content and a relevant, engaged audience" and does not explain rejections. No website required. | Strong corridor fit: Canada→India, Philippines, Nigeria, Mexico. Directory rates of $1.60-$20 per first transfer conflict, so check in Impact. Check that the owner's country is eligible. |

### 2.3 Flights, eSIM, travel bundle

| Program | Network | Commission | Approval bar |
|---|---|---|---|
| **Travelpayouts** (Aviasales, Kiwi.com, WayAway, EKTA, Airalo and many others) | Its own network | Varies per brand | Free account. Some programs need no pre-moderation; most are reviewed in ≤3 business days. Per-program traffic rules apply ([TP brand-decline post](https://www.travelpayouts.com/brands/blog/10-reasons-why-a-brands-application-to-register-on-travelpayouts-can-be-declined/)). Payout from $50 by PayPal (other methods differ). |
| **Airalo (eSIM)** | Impact (also listed on Travelpayouts) | 10% per sale (base, can change); 30-day window; coupons don't track ([Airalo FAQ](https://cdn.airalo.com/blog/airalo-affiliate-program-faqs)) | Bloggers and travel/tech sites. Disclosure required. No trademark bidding. |

Flights pay little per booking. They matter mainly because one Travelpayouts approval unlocks several brands without a CJ/Impact-style gate.

### 2.4 Language tests (IELTS / CELPIP)

| Program | Network | Commission | Notes |
|---|---|---|---|
| **E2 Language** (IELTS, PTE, OET, CELPIP) | Direct (contact form) | "Commission on every sale, no cap"; rate not published ([E2](https://www.e2language.com/affiliate-partnerships)) | Partners include Moving2Canada (a similar niche). Promo code, landing page and a backlink. **Best fit for study and work permit pages.** |
| **Magoosh** (IELTS, not CELPIP) | FlexOffers | 8% of sales, 30-day cookie ([FlexOffers](https://www.flexoffers.com/affiliate-programs/magoosh-affiliate-program/)) | Secondary. |
| **CELPIP Network (Paragon)** | Direct | 15/20/25% by tier ([guidebook PDF](https://www.celpip.ca/wp-content/uploads/2020/03/Guidebook-Agents-and-Prep-Providers-min.pdf)) | For prep providers and agents: needs accreditation (RCIC, Languages Canada). **Not eligible.** |

### 2.5 Other candidates (not researched in depth)

- **PolicyAdvisor** (Fintel Connect): Canadian insurance CPA, life/disability, rate on request ([Fintel](https://www.fintelconnect.com/brands/directory/policyadvisor-affiliate-program/)). It sells visitor/super visa insurance on its site, so ask whether the affiliate CPA covers it.
- **Rates.ca / Kanetix** (FlexOffers): about $9.60 per lead (directory figure, unverified).

## 3. Why small info sites get rejected, and the fixes

What reviewers check, from primary or network sources:

- **Awin:** advertisers decline when they can't access the site, don't think the site or method fits the brand, or find the account description inadequate. Network rejections usually come from missing, unclear or unverifiable info. Appeal via compliance@awin.com. Acceptance is at Awin's sole discretion ([Awin FAQ](https://wiki.awin.com/index.php/FAQ_Publisher_Admin), [Awin publisher terms](https://awin.com/docs.awin.com/Legal/Publisher+Terms/2020/UK_EN_Awin+AG+Publisher+terms.pdf)).
- **FlexOffers:** unverified site ownership, unfinished or inactive sites, low-quality content, and unauthorised use of advertiser branding ([FlexOffers](https://supportbeta.flexoffers.com/knowledge/why-was-my-publisher-application-declined)).
- **Admitad:** the subject or region of your ad space doesn't match the program's. Reapply after 7 days ([Admitad](https://admitad.useresponse.com/knowledge-base/article/why-did-the-advertiser-reject-my-ad-space_1)).
- **Remitly:** wants a relevant, engaged audience and doesn't explain rejections. **Publisher country eligibility** is a hard gate ([Remitly](https://www.remitly.com/us/en/landing/partner-program)).
- **CJ:** a property profile must describe a primary promotional model. The 2026 attempt stalled exactly there.

### Concrete fix list (in order)

1. **`/privacy`**: cookies, affiliate tracking, and the third-party links a future analytics setup would add.
2. **`/contact`**: a real email on the domain (e.g. `hello@canadavisatracker.com` via Cloudflare Email Routing), plus a link to r/CanadaVisitorVisa.
3. **`/affiliate-disclosure`**, plus an inline disclosure next to every CTA. The FTC says "affiliate link" alone may not be understood and a "buy now" button isn't disclosure; "paid link" or "I get commissions for purchases made through links" is adequate, and closer is better ([FTC Endorsement Guides FAQ](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking)). Canada: the Competition Bureau requires disclosure of any "material connection", including commissions ([Ad Standards guidelines 2025](https://adstandards.ca/wp-content/uploads/Ad-Standards-Influencer-Marketing-Disclosure-Guidelines-2025-10-08.pdf)). Add a footer link sitewide.
4. **Make the promotion model visible.** Before applying, publish at least one page where the product naturally belongs, e.g. a "Super visa insurance requirements" guide linking the IRCC rules, and a "Sending money for proof of funds / tuition" guide. Reviewers decline when they "can't figure out how you plan to promote them".
5. **Install analytics** (Cloudflare Web Analytics is free and needs no cookie banner). Networks and Remitly ask for audience numbers, and "no data" reads as no audience. Use GSC impressions and the subreddit's member count as extra proof of reach.
6. **Fill in network profiles completely.** Give a description, the primary promotional model ("Content / Niche website"), audience countries, and the monthly-visitor figure. Mention r/CanadaVisitorVisa as a second property.
7. **No "coming soon" or empty pages, and no unauthorised brand logos/claims** (e.g. the "Trusted by 16M+" Wise copy) before approval.
8. **Reapply, don't re-spam.** Ask the network or advertiser for the reason (Awin compliance, CJ advertiser contact) and reapply after the fixes. Admitad allows 7 days; others vary.

## 4. Recommended application order

1. **Fix the site** (section 3, items 1-5) and remove the `wise.com/invite` link. About half a day.
2. **SafetyWing**: instant. Wire it into visitor-visa and student pages with a "not valid for super visa" note.
3. **HelloSafe Atlas**: 24h. Ask whether its Canadian catalogue can serve super visa buyers. If it can, this becomes the super visa CTA.
4. **Travelpayouts**: one account, then join EKTA, Airalo and a flights brand. Mostly auto or fast approvals.
5. **E2 Language**: email via the contact form, pitching the study/work-permit audience (Moving2Canada precedent).
6. **Wise (Partnerize)**: apply once the disclosure and the money-transfer guide are live.
7. **Remitly (Impact)**: only if the owner is in an eligible country. The same Impact account can then apply to Airalo and IMG.
8. **Later, with traffic numbers** (roughly 1k+ monthly visits and super visa page impressions): direct outreach to Canadian super visa brokers/carriers (GMS, TuGo, Manulife CoverMe, PolicyAdvisor), and re-apply to CJ/Awin brands (Allianz).

## 5. Open questions

- Owner's country of residence. This gates Remitly and possibly other Impact brands.
- HelloSafe super visa coverage: its pages contradict each other, so ask the partner team.
- VisitorsCoverage: is the program active, and does it have any Canada product?
- Real commission rates for Remitly, IMG and E2. Visible only after approval.
