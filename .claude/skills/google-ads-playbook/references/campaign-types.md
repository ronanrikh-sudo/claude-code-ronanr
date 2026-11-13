# Campaign Types: Shopping, PMax, Search

## Why Shopping beats Search for e-commerce

A search ad gives a headline and a description nobody reads. A Shopping ad shows image, price, title, reviews and promos next to ~5 competitors, so the click is pre-qualified. Put 80–90% of e-commerce spend in Shopping until the Shopping network is saturated; then use search for extra volume.

Exception: **B2B / bulk buyers** (e.g. salon suppliers, café wholesale) click search ads over Shopping listings, so search can win there.

## Performance Max (PMax)

### The five 2023–2026 shifts (Blue Sense)
1. PMax hit its ceiling: early auction discounts are gone, visibility is poor, and scaled PMax often doesn't move back-end revenue.
2. **Standard Shopping is back** for cold acquisition at scale.
3. Match types loosened: exact = same meaning; phrase broader. SKAGs are dead.
4. AI Max and Demand Gen introduced.
5. DSAs being deprecated.

### PMax pros and limits
- Great for smaller accounts (under ~$15–20k/month): gets the account moving.
- Over-attributes: 50%+ of PMax conversions are warm/repeat customers it didn't acquire. Scaling PMax keeps in-platform ROAS high while back-end revenue stalls.
- Reframe the question as "what % of spend should be PMax vs standard Shopping?" For mid/upper-market retailers: often only 20–40% PMax.

### Setting PMax up properly (priority order)
1. **GMC feed quality** (titles, descriptions, images); Shopping is where most PMax spend should land.
2. **Brand exclusions**: campaign settings → brand exclusions → add brand list, **and** add brand negative keywords (now supported). Use both as fail-safes.
3. **Asset groups + listing groups**: one asset group per product type (e.g. hoodies, jerseys, rashguards, shorts), each with a **customised listing group** containing only those products. Minimum ~15 products per group if SKU count allows; never one product per group. Typically 3–20 asset groups. Reasons: creative relevance, cleaner audience signals, search themes, performance visibility.
4. Bidding strategy.
5. Audience signals and search themes: **signals, not targeting**. They matter for new launches, new categories and new asset groups; after ~30 days of conversions they barely matter. Use converting search terms as search themes; don't make them up.

### Feed-only PMax
Delete all asset groups so only the listing group (feed) remains. PMax can then only serve Shopping + dynamic product remarketing (like old Smart Shopping).
- Turn **off URL expansion** and **automatically created assets**, or it rebuilds assets itself.
- Use when you want spend forced into Shopping, or when PMax goes rogue (e.g. a client whose PMax moved 10% to YouTube and 10% to Gmail; Gmail "clicks" are just email opens, not site visits).

### PMax bidding traps
- Launch on **Maximize conversion value**, then move to **target ROAS** for stability (same average performance, less volatility).
- **Target ROAS trap:** raising tROAS to squeeze efficiency shrinks the audience to warm users; ROAS looks better while new-customer acquisition falls. A lower ROAS at the same spend may be the healthier position.

### Feeder strategy
- A **cold campaign** (usually standard Shopping) on a very low target ROAS (e.g. 50%) or expansive bidding reaches low-intent users almost nobody bids on, so clicks are cheap.
- A **high-tROAS PMax** (e.g. 600%) converts the warmed-up users on the second or third touch.
- Standard Shopping does the cold acquisition; PMax takes the credit. Judge them together.

## Standard Shopping structures that work
1. **Top sellers vs the rest:** 80% of spend on the top 20% of products, a test campaign for the rest. For large non-fashion catalogs only.
2. **Feeder:** standard Shopping (cold) → high-tROAS PMax.
3. **Labelizer (over-index / index / near-index / under-index / no-index):** auto-tiers products on rolling 30-day performance via script and custom labels. Only worth it with thousands of SKUs.

## Search campaigns
- **Single-theme ad groups (STAGs), not single-keyword ad groups (SKAGs).** 10–20 themed keywords per ad group, e.g. general / emergency / affordable plumbing.
- Responsive search ads have about 2,700 headline/description combinations; they need volume (a quarter million impressions) to learn, so minimise segmentation.
- **Negative keywords:** review weekly (daily on big budgets) for the first 30 days, then weekly or fortnightly. Too much tinkering resets learning. Keep an **account-level universal negative list** (jobs, careers, hiring, salary, intern, etc.).
- **Exclude brand** from non-brand search; turn off the Display network.
- **Landing-page split tests are the biggest search lever:** duplicate the ad, send each copy to a different landing page, keep the winner after 30–60 days, repeat. Higher conversion rate and AOV mean you can outbid competitors.
- **Smart bidding exploration** (search only) lets target ROAS explore 10–30% outside its target.

## CPCs are a vanity metric
Across large datasets there is little relationship between CPC and ROAS in the normal range. The auction is won by whoever can afford to pay most, which comes down to **conversion rate × AOV**. Improve the site, not just the bids.

## Demand Gen / YouTube
Needs time and data to warm up (it may run very slowly for the first ~4 days in a new account). Shorts are more action-oriented. Value and education content suits pre-sale months; offer-heavy Shorts suit sale weeks.
