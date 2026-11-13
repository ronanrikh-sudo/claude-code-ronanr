# Launch Order and Account Structure

## Before any campaign (Shopify store)

1. Create Google Ads (ads.google.com) and Merchant Center (merchants.google.com) under the same Google account as Shopify if possible.
2. In Shopify, add the **Google & YouTube** sales channel, connect the Google account, link Merchant Center. Products sync automatically. A plain Shopify sync is enough to start; no complex feed tool needed.
3. Set up conversion tracking through the app with **enhanced conversions** and auto-tagging on. Do **not** use GA4-imported events as the primary conversion (10–15%+ attribution gap).
4. Skip the "Smart"/default Performance Max campaign the setup wizard pushes.
5. Merchant Center product review can take several days: start this first.

## Funnel order (Max Crakanthorp, apparel)

Rough market split: ~5% bottom of funnel (ready to buy), ~25% middle (interested, don't know you), ~70%+ top (unaware).

### Step 1: Bottom of funnel (launch with these)
- **Brand search campaign.** Target only the brand name and close variants. Not paying here hands your brand results to competitors and throws away high-quality conversion data.
- **Bestseller Shopping campaign.** Only top sellers: 5–10 products for a big catalog, 2–3 for a tiny one. Keep brand traffic **included** at first to collect all data and sales.
- Starting bids: Maximize Clicks for simplicity (manual CPC if experienced; cheaper). New accounts can't use smart bidding until they have conversions.
- After **5–10 sales**, test a **feed-only PMax** against the Shopping campaign; keep whichever performs better (often feed-only PMax).

### Step 2: Middle of funnel
- **Non-brand Shopping + non-brand PMax**, starting with bestsellers. Exclude brand with both brand exclusions and negative keywords. This forces prospecting and is where ~75% of budget goes at scale. Most accounts never get past the "branded trap".
- **Mid-funnel search** (e.g. "hoodies"): test only. Rarely converts for apparel unless the product is niche or clearly superior.
- Convert the older brand-included campaigns into **brand-only Shopping/PMax** (scripts exist to exclude non-brand queries).

### Step 3: Top of funnel (few apparel brands are profitable here)
- **Demand Gen** (YouTube / Shorts video ads) to reach people who don't know you.
- **Problem-based search** for niche products (e.g. "pregnant running pain" for a maternity sports bra), sent to an advertorial/education page.
- Can lose money quickly: test carefully.

## Structure rules (Blue Sense Digital)

- **Consolidation beats segmentation.** Campaigns learn in isolation; 3 campaigns with 50/20/10 conversions perform worse than one with 80. Low-volume campaigns usually have the worst ROAS.
- The default goal is **one campaign**; every additional campaign needs justification. Valid reasons:
  1. Brand vs non-brand (always split).
  2. Geography: different countries in different campaigns.
  3. Different margin / efficiency goals (a 70%-margin line can't share a target ROAS with a 35%-margin line; Google optimises to revenue, not margin).
  4. Genuinely different product categories / audiences (e.g. office chairs vs plants).
  - Commercial exceptions: clearance stock that needs some spend, new-arrivals push.
- **Portfolio bid strategies** let segmented campaigns share learning and add max/min CPC caps.
- Naming convention: `AGENCY/BRAND | REGION | TYPE | AUDIENCE | GOAL`, e.g. `CC | AU | Shopping | Brand`.

## Rapid-fire mistakes to check in any account

1. GA4 events as primary conversions.
2. PMax with one asset group (or several asset groups that all contain every product).
3. Broad match with Maximize Clicks (broad needs smart bidding).
4. Display network enabled on search campaigns.
5. No negative keywords (and no brand negatives on cold campaigns).
6. Auto-apply recommendations left on.

## 90-day rollout for an existing account (Blue Sense)

1. Fix tracking: no GA4 primary, enhanced conversions, auto-tagging.
2. Structure map: aim for one campaign, justify each extra; split brand/non-brand; consistent naming.
3. PMax check: asset groups split by product type with matching listing groups, brand exclusions on, target ROAS not absurdly high.
4. Bidding: right strategy for the stage (see bidding-and-budgets.md).
5. Wasted spend: kill tiny pointless campaigns, negative unprofitable search terms, turn off display in search.
6. Ad assets: sitelinks, callouts, current promos (more real estate).
7. Feed: titles and images (roll changes out gradually, not all at once).
