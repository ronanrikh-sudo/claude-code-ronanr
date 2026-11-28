# Invoicing and sponsorship

> **Status: based on the user's real invoices** (Rival Gym, CC2026001–CC2026031, Jan–Jun 2026). Match this house format; don't redesign it.

The invoice is part of the pitch: it should look like it came from the same studio as the deck, and it must be correct. That means every commercial detail comes from the user — never invent prices, quantities, ABN, bank details or terms.

## Information to collect (ask in one message)
- Chosen colourway (e.g. Idea A or B.2) and the deck version it refers to
- Quantity per size per item (XS, S, M, L, XL, 2XL, 3XL) — tee, rashguard, shorts, etc.
- Unit price per item, and whether prices include GST
- Deposit / payment terms and production turnaround
- Client billing name, contact person, email and address (ABN if they have one)
- CAGECRAFT's ABN and payment details — these are the user's private details: ask each time or read them from a local, uncommitted file; never write them into this skill or a committed file

Context, not a price list: Legacy retail on the store is AUD 79.95 (rashguard) and 89.95 (2-in-1 shorts); wholesale/team pricing is the user's call.

## Two delivery options (offer both)
1. **CAGECRAFT-branded PDF invoice** styled like the deck — built with the same HTML → Playwright → PDF approach (`scripts/boards.mjs` shows the rendering code). Saved in the project's `out/invoice/` and sent with `SendUserFile`.
2. **Shopify draft order** that emails the client a pay link (custom line items per item/size → `draftOrderCreate`, then `draftOrderInvoiceSend`). This sends an email to an outside party and creates a record in the store, so get explicit confirmation of the line items, totals and recipient email before sending.

## House invoice format (as actually sent)
Single A4 page, titled **INVOICE** (not "tax invoice"; past invoices carry an ABN but **no GST line**, which suggests CAGECRAFT isn't GST-registered — confirm with the user before adding GST).
- **Header band:** dark full-width photo (a fighter in CAGECRAFT gear, kicking in the client's gym) with **INVOICE** in heavy white sans, the project line beneath (e.g. "Custom Rival Gym Tshirts"), then `Invoice No. : CC2026030`. Right side: CAGECRAFT oval emblem + **CAGECRAFT CO**, email, website, @handle, ABN.
- **Invoice numbers:** `CC` + year + 3-digit running number (CC2026001, CC2026010, CC2026011, CC2026025, CC2026030, CC2026031). Ask the user for the next number; never guess.
- **Dates:** Invoice Date and Invoice Due Date (usually the same day, or "ASAP").
- **Payable To:** the user's name, phone and ABN (read from the user or an existing invoice; never write them into this skill or a committed file). **Grand Total** shown large on the right.
- **Line items:** Items · Price · QTY · Total, thin grey rules, no boxes. One line per product; shipping and any service fee as their own lines (e.g. "DHL Express Shipping $130 × 1", "10% CAGECRAFT Markup").
- **Payment Detail:** account name, bank, BSB and account (from the user), with Grand Total repeated beside it.
- **Footer:** "Thank you for choosing us as your partner. We greatly appreciate your support and look forward to continuing to work together in the future." Signature, **Ronan Rikh**, Founder.
- Optional notes block above the footer for production updates (used on CC2026001).

## Pricing benchmarks (Rival Gym history)
| Invoice | Order | Charged | Our margin |
|---|---|---|---|
| Dec 2025 (email quote) | 50 tees at $20, shipping included | $1,000 | $150 (15%) |
| CC2026001 + CC2026011 | 51 rashguards + 51 MMA shorts at cost ($24.49 / $26.00) + $450 DHL + 10% of COGS | $3,226.95 ($31.64/pc) | $252.45 (7.8%) |
| CC2026030 | 70 tees at $20 + $130 DHL Express | $1,530 | n/a |
| CC2026031 | 19 zipper jackets at $39 + $250 shipping + $203 screen printing | $1,194 | n/a |
Lessons: "TBD" shipping/fee lines and a mid-order shipping change confused the client and eroded trust ("price changes always worry me"); fightwear at cost + 10% left almost nothing for months of work. For repeat orders, quote **fixed all-in unit prices** (shipping built in with a buffer) and take a client deposit that covers the supplier's deposit.

## In-kind sponsorship (no invoice)
Some clients — e.g. a fight promotion — offer exposure instead of payment. Then there's nothing to invoice; produce a **sponsorship / value-in-kind schedule** instead, styled like the deck:
- What CAGECRAFT supplies: items, quantities, sizes, retail value per item and total value-in-kind (AUD).
- What CAGECRAFT receives, as the client offered it: e.g. logo on fight posters, logo placement on the kit (list each placement — the mockups make this concrete), venue access, social media features and collaborations; include counts and dates where agreed.
- Term (which event(s) or season), artwork/logo approval rights for both sides, delivery date.
- Recommend the user confirms the exchange in writing with the client; this schedule is a summary, not legal advice.
