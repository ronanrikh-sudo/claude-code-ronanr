# CAGECRAFT: PowerPlay Meta ad (9:16 Reels / Stories, 22.3 s)

Paid cut of `../powerplay-story`: a 3-second hook, the offer, a CTA. Same Cube Noir look, voice, music and
real live-site captures. Text and key UI stay between Meta's top 14 % and bottom 35 % (Reels UI).

| Time (s) | On screen | Voice-over |
|---|---|---|
| 0.0–3.3 **hook** | Whip into the real cart, "$3.41 left for Free Training Tee" lit; CAGECRAFT wordmark from frame 2; $3.41 AWAY / FROM A / FREE T-SHIRT? | Three dollars forty-one away from a free t-shirt? |
| 3.3–4.9 | The drawer's real "Complete your fit" upsell, ringed and struck through | Don't add another item. |
| 4.9–8.7 | The PowerPlay button glows; tap; "Boosting your cart…"; PowerPlayed; spotlight on the $3.42 boost line | One tap PowerPlays your cart, and tops up the difference. |
| 8.7–9.7 | Spotlight on the free Essentials Training Tee 2.0 line; the camera dives into its thumbnail | Free tee, |
| 9.6–11.9 **earned** | Shockwave + cube shards; the ghost-mannequin tee scans in and swings in 3D; FREE TEE UNLOCKED.; EARNED IT. stamp | unlocked. You earned it. |
| 11.9–17.4 **offer** | Bolt wipe; BLACK FRIDAY / UP TO 40% OFF over 11 best sellers (Fight Jersey Diamond front and centre); + A FREE GIFT EVERY $50 | Black Friday is up to forty percent off, plus a free gift with every fifty dollars. |
| 17.4–22.3 **CTA** | Bolt wipe; ENDS SUNDAY; SHOP NOW pressed on "Shop"; wordmark + URL; final hit | Ends Sunday. Shop now at CAGECRAFT. |

Demo: real captures of the live flow on theme "BF LIVE + PowerPlay (gift fix)" (`scripts/capture-tee.cjs`):
Fight Jersey Diamond + Walkout Hoodie Diamond + Monarch LS Rashguard + Boxer Oversized Tee Diamond = $246.59,
+$3.42 boost -> $250.01, gift app adds the Essentials Training Tee 2.0 (Free Gift). Gift options picked as a shopper would.

Ghost-mannequin tee (`public/img/ghost-essentials-2.png`): Nano Banana 2.1 (Higgsfield) from the four real product
photos, packshot-skill prompt. Chest print checked against the real close-up (faithful); the generated inner neck
label was garbled, so the real label from the front flat lay was composited in its place. Best sellers in the offer:
last 30 days of Shopify sales, real product photos keyed off their backgrounds (`../cagecraft-sale/scripts/cutout.py`).

Voice: ElevenLabs "Amelia - Young Australian Female" (`eleven_v4`), take 2 of 2 (flow `FGXQU9M9Qg3FYfezJkb6`). Previous take kept in `assets/vo/v1/`.
Music: the sale ad's track, cut on bar lines (pickup into the drop at 0.48 s, final hit 0.25 s after the CTA).
Build: same pipeline as `../powerplay-story` (`npm run voice`, `node scripts/stills.mjs`, `npm run render`).
