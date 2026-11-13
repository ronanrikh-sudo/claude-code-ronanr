# CAGECRAFT Google Ads Launch Plan

CAGECRAFT is an Australian fightwear / apparel brand on Shopify (cagecraftco.com, AUD). Meta is the main paid channel; customers are mainly in Australia and New Zealand.

> **This file lives in a public repo. Keep confidential numbers out of it.** Fetch costs, margins and offer details live from Notion instead:
> - Margins and max discounts: Notion page **"Margins - Final"** (CAGECRAFT® / Q4 / BFCM 26)
> - Sale offer, phases and gift ladder: **"Offer - Final"** (same folder)
> - Sale timeline, risks and stock status: **"BFCM 26"** (CAGECRAFT® / Q4)
> - Sales, bestsellers and stock: query Shopify live (`run-analytics-query`, `search_products`)

## Working out break-even ROAS
1. Get landed cost and RRP per line from "Margins - Final"; get sale prices from "Offer - Final".
2. Contribution margin = (price − landed cost − payment fees − shipping subsidy − gift cost) ÷ price.
3. Break-even ROAS = 1 ÷ contribution margin. Full price and sale price give different answers; compute both.
4. Recommend a target ROAS comfortably above break-even.

## Budget guidance given (Nov 2026)
- The user asked about $100/day. Recommendation: **start at about $40/day** ($10 brand search + $30 bestseller Shopping); a new account with no conversion data is unlikely to be profitable at $100/day in month one.
- Scale about 20% a week once ROAS is clearly above break-even; up to ~$60–70/day during the sale if it converts.
- Google won't be fully trained by the Black Friday sale; treat Google as a December-onwards channel and keep Meta as the main sale channel.

## Setup steps (owner must do the sign-in, billing and verification)
1. Shopify → Sales channels → **Google & YouTube** → connect Google account → create Merchant Center, verify and claim cagecraftco.com, set AU shipping and returns, sync products.
2. Create the Google Ads account from the app; add billing; skip the default Smart/PMax campaign.
3. Conversion tracking via the app with enhanced conversions; no GA4 import as primary.
4. **Target Australia only at launch** (feed is AUD). Add NZ later with NZD prices via Shopify Markets.

## Campaign 1: `CC | AU | Search | Brand` (~$10/day)
- Networks: no Search Partners, no Display. Location: Australia, "Presence: people in or regularly in".
- Bidding: Maximize Clicks with about a $1.50 max CPC; move to Maximize conversions after ~15 sales.
- Keywords: phrase `"cagecraft"`, `"cage craft"`, `"cagecraft fightwear"`, `"cagecraft hoodie"`, `"cagecraft jersey"`; exact `[cagecraft]`, `[cagecraft co]`.
- Headlines (30 chars max): CAGECRAFT Official Store · Fightwear Built For Fighters · Shop Walkout Hoodies · Fight Jersey 2.0 Out Now · Australian Fightwear Brand · 350gsm Heavyweight Hoodies · Made For The Underdogs · Train Hard. Look Sharp. · Rashguards, Shorts & Jerseys
- Descriptions (90 chars max):
  - Premium fightwear for MMA, BJJ & Muay Thai. Rashguards, shorts, jerseys & hoodies.
  - Heavyweight Walkout Hoodies & breathable Fight Jerseys. Built to train in.
  - Australian fightwear brand for driven underdogs and hungry fighters.
  - Shop the official CAGECRAFT store. Join the crew and gear up for your next session.
- Sitelinks: Walkout Hoodies, Fight Jerseys, Oversized Tees, Black Friday Sale.
- Sale messaging via a **Promotion asset** scheduled to the public-sale dates in "Offer - Final", so ads don't need editing on launch day.

## Campaign 2: `CC | AU | Shopping | Bestsellers` (~$30/day)
- Products: the **Walkout Hoodies** (all colours) and **Fight Jersey 2.0** (all colours), the top sellers as of Nov 2026. Re-check bestsellers and stock in Shopify before building. Exclude everything else.
- Keep brand traffic included at first.
- Bidding: Maximize Clicks with about a $1.20 max CPC → Maximize conversion value after ~15–30 sales.
- **No ads for fightwear that isn't in the warehouse** (customs-delay risk in "BFCM 26"). Out-of-stock products should not be advertised.
- Negative keywords: jobs, careers, hiring, salary, free, pattern, sewing, template, mockup, png, costume, kids, toddler, baby, ebay, amazon, second hand, used.
- Title rewrites via Merchant Center attribute rules, keywords first and brand last, e.g.:
  - `Heavyweight Oversized Hoodie 350gsm – Walkout Diamond – CAGECRAFT`
  - `MMA Fight Jersey – Breathable Gym Training Jersey – Cotton Candy – CAGECRAFT`
  Revise from the search terms report after 4–6 weeks.

## Sale and next steps
- Submit a Merchant Center **Promotion** for the hoodie and jersey sale discounts several days before the public sale (needs approval).
- Respect the ACCC note in "Offer - Final": don't show compare-at prices on items whose full price was recently raised.
- Weekly: search terms review and negatives.
- After ~30 Shopping conversions: add **non-brand Shopping** with brand excluded, then test feed-only PMax; consider fightwear asset groups once that stock is reliably in.
