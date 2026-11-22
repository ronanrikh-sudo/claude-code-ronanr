# Invoicing and sponsorship

> **Status: provisional.** As of the Rival Gym job no invoice had been issued — the client was finalising sizes with their team. The layout below is the agreed direction, not a signed-off template. Once the first real invoice is approved, update this file with the final version.

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

## Proposed invoice layout (A4 portrait, matches the deck)
- Header: CAGECRAFT wordmark left; "TAX INVOICE" right in Inter Display 900, uppercase; invoice number (e.g. `CC-2026-001`), issue date, due date.
- From: CAGECRAFT Fightwear Co., ABN, contact. Bill to: client business, contact, address, ABN if any.
- Project line: "Rival Gym × CAGECRAFT — Custom Fight Kit, Idea A (deck v<n>)" with a small thumbnail strip of the approved front/back mockups.
- Line items table: item · colourway · size breakdown (e.g. `S×4 · M×8 · L×6`) · qty · unit price (ex GST) · line total. Kicker-style uppercase column headers, thin rules, no heavy boxes.
- Totals: subtotal (ex GST), GST 10 %, **total AUD**; deposit due now and balance due before dispatch, if the user uses deposits.
- Payment details: bank / BSB / account or payment link; reference = invoice number.
- Terms (short): production starts on deposit + written design sign-off; turnaround; sizes final once production starts; artwork approval refers to the deck version.
- Footer: "CLIENT × CAGECRAFT" like the deck.
- Currency AUD; GST 10 % (Australia).

## In-kind sponsorship (no invoice)
Some clients — e.g. a fight promotion — offer exposure instead of payment. Then there's nothing to invoice; produce a **sponsorship / value-in-kind schedule** instead, styled like the deck:
- What CAGECRAFT supplies: items, quantities, sizes, retail value per item and total value-in-kind (AUD).
- What CAGECRAFT receives, as the client offered it: e.g. logo on fight posters, logo placement on the kit (list each placement — the mockups make this concrete), venue access, social media features and collaborations; include counts and dates where agreed.
- Term (which event(s) or season), artwork/logo approval rights for both sides, delivery date.
- Recommend the user confirms the exchange in writing with the client; this schedule is a summary, not legal advice.
