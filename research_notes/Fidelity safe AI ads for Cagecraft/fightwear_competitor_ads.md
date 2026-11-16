# Winning paid-social ads of fightwear / MMA / BJJ apparel brands (as of 16 Nov 2026) — catalogue for CAGECRAFT recreation

**How to read this file.** Every ad below is a real ad I retrieved from the Meta Ad Library on 16 Nov 2026. "Source" is always the ad's own snapshot URL (`https://www.facebook.com/ads/library/?id=<Library ID>`). "Days" = days from start date to 16 Nov 2026. "coll" = Meta's own "N ads use this creative and text" count shown on the listing; "n" = how many ads with the same headline + body I counted in the slice of that advertiser's ads I could see. "AI label" = the Ad Library data field `contains_digital_created_media` (it was `false` on every ad here, so all AI calls below are my own visual judgement). All screenshots / frame sheets are in the scratchpad folder and the complete path is given beside each ad.

**Method and limits (applies to every section).**
- Meta Ads MCP tool (`ads_library_search`): 15 calls. It returns only ID, page, link title, creation/start time and snapshot URL (no body text, no media, no variant count), newest-first, max 50, no pagination, and multi-word keyword search is very noisy. For big accounts it therefore only surfaces the newest ads.
- Ad Library website in headless Chromium (no login): single snapshot pages loaded fine and expose full structured data (body, headline, CTA, media URLs, start date, platforms, AI-label flag). Listing pages gave only the first 30 results; further pagination returned "Rate limit exceeded". I did not try to get around that, and a slower retry batch was blocked by this session's permission system. Result: brand coverage is partial (see Gaps in the first section).
- Media: images and videos were downloaded from the creative URLs in the snapshot data; videos were sampled into 10-frame sheets with ffmpeg. I could not listen to audio: voice-over content is inferred from burned-in captions, and "music" vs "speech" is inferred from visuals and loudness only.
- Proxies used for "winner": (1) longevity while still active, (2) Meta's "N ads use this creative and text" count plus same-copy duplicates in the sample, (3) third-party tracker data where public (AdManage for Anaconda). I found no public teardown with performance numbers for any of these brands, and did not verify organic engagement of the same creatives.
- Timing caveat: this is Black Friday fortnight. Engage, Venum, Just Jits and MMA Fight Store have swapped most delivery to sale ads launched 8–15 Nov, so longevity under-rates them right now.

---

## 1. Who are CAGECRAFT's direct competitors running Meta ads right now?

### Takeaway
Engage is by far the heaviest advertiser in Australia (~270 active ads, almost all Black Friday creative launched 8–16 Nov 2026, nothing older than 40 days). The long-running "evergreen" ads in the AU feed belong to small DTC graphic-rashguard brands (Battlegend, Shadow Rolls, BattleFitGear), FUJI Sports, Anaconda Fightwear, Raven Fight Wear (AU) and Bangtao Fightstore.

### Cited Findings
- Engage — page "Engage", ID 514965128669119, 254,339 likes; Ad Library showed "~270 results" active in AU; MCP estimated 238 active reaching the US. Oldest active ads I could see started 2026-10-07 (catalogue ads). — [Engage ad](https://www.facebook.com/ads/library/?id=1844405333608089)
- Venum — page ID 149304504159, 1,441,470 likes; active catalogue (DPA) ads "Black Friday starts now for UFC Zenith. Early access is open with up to 50% off." started 2026-11-10; also "UFC Trinity Authentic Fight Night" catalogue ads created 2026-11-10. — [Venum ad](https://www.facebook.com/ads/library/?id=3715392485265832)
- FUJI Sports — page ID 161562020541731, 58,891 likes; 21 ads in the US slice, oldest still active since 2025-05-30 (534 days). — [FUJI ad](https://www.facebook.com/ads/library/?id=1435982267851469)
- Battlegend — page ID 152908697907709, 3,743 likes; character-licensed-look rash guards (Hello Kitty, Deadpool, Pompompurin); 12 ads in AU keyword slices, oldest active since 2025-10-30 (381 days). — [Battlegend ad](https://www.facebook.com/ads/library/?id=847939574468902)
- Shadow Rolls — page ID 658462410689304, 3,845 likes; band-graphic rash guards (Cannibal Corpse, Pantera, Slipknot); oldest active since 2025-11-11 (369 days). — [Shadow Rolls ad](https://www.facebook.com/ads/library/?id=1228465485758821)
- Anaconda Fightwear — page ID 114966660419611, 34,019 likes; braces rather than apparel, but the same audience; active ads since 2025-11-05 (375 days). — [Anaconda ad](https://www.facebook.com/ads/library/?id=856465363390551)
- A third-party tracker reports Anaconda at 82 Meta ads since Sep 2025, 42 live, "80 run as partnership ads with creators", 96% video, longest listed run 408 days. — [AdManage](https://admanage.ai/ad-library/anaconda-fightwear)
- Raven Fight Wear (Australian) — page ID 326863154108268, 119,550 likes; only 4 active ads in total (MCP estimate 4), all started 17–29 Jun 2026 (139–151 days). — [Raven ad](https://www.facebook.com/ads/library/?id=1013010124545097)
- XMartial — page ID 117814314743132, 3,884 likes; 17 ads in the US slice, one ad per design drop, oldest active 2026-09-10 (66 days). — [XMartial ad](https://www.facebook.com/ads/library/?id=1723269489422350)
- Tatami Fightwear — page "Tatami Fightwear JiuJitsu Lifestyle", ID 450916851708873, 49,719 likes; MCP estimate 36 active (GB/AU/US), the ones returned all started 2026-10-15. — [Tatami ad](https://www.facebook.com/ads/library/?id=1468370195140442)
- Bangtao Fightstore — page ID 130684446799408, 2,813 likes; carousel active since 2026-06-17 (151 days) and a catalogue ad since 2026-07-11. — [Bangtao ad](https://www.facebook.com/ads/library/?id=2214184776069680)
- BattleFitGear — page ID 111244238708483, 3,492 likes; static active since 2026-07-16 (122 days). — [BattleFitGear ad](https://www.facebook.com/ads/library/?id=2189101771937432)
- Just Jits (AU multi-brand retailer that stocks Engage) — page ID 1169536709735690, 9,186 likes; Engage-branded static active since 2026-09-03; Buy-2-Get-1 video launched 2026-11-14. — [Just Jits ad](https://www.facebook.com/ads/library/?id=1553973829602326)
- Other AU/UK retailers seen active: MMA Fight Store (ID 118242064928660; "Up to 70% OFF Your Favourite Fight Gear 🥊", started 2026-11-13), MaxMyer (ID 307575592982349; catalogue ad), Made4Fighters (ID 107284111941; "FMT1 by Fumetsu | Built to Train. Made to Perform.", started 2026-11-13). — [MMA Fight Store ad](https://www.facebook.com/ads/library/?id=2342504523198242); [Made4Fighters ad](https://www.facebook.com/ads/library/?id=1473984598041910)
- AdManage lists Made4Fighters at 252 ads since Nov 2024 with 4 live, 98% image. — [AdManage](https://admanage.ai/ad-library/made4fighters)
- UFC (page ID 46299886275) runs catalogue ads "Shop official UFC merchandise & apparel!" active since 2026-05-25 (174 days, 4 copies in sample). — [UFC ad](https://www.facebook.com/ads/library/?id=1716044169553793)
- Smaller advertisers seen in the same AU/US keyword slices: No Mercy (ID 590835097438823, catalogue-style ad, 128 days), Progress Jiu Jitsu (ID 498560950211233, cart-reminder catalogue ad "Still thinking it over? Your kit is waiting…", 30 days), True Illusion Brand (catalogue ad, 84 days), ELITE Athletics (ID 221956094326548, "Siam Tiger Set | $69"), Alchemical Fightwear (ID 110055338717342, seen in the AU "rashguard" advertiser list). — [No Mercy ad](https://www.facebook.com/ads/library/?id=1827018085376887); [Progress ad](https://www.facebook.com/ads/library/?id=1046496161770246)
- CAGECRAFT's own page (ID 639726185901204) showed 18 ads across the AU keyword slices, oldest 52 days; headlines include "Fight Jersey 2.0 — $79.95", "Claim Your Free Kit Bag", "Diamond or Cotton Candy?", "The Walkout Hoodie | 3 Colourways", "Buy Anything, Get A Free Gift", "Heavyweight. Premium. Built to Last." — [Cagecraft ad](https://www.facebook.com/ads/library/?id=2306553086866799)

### Inferences
- In the AU exact-phrase searches for "fight jersey" and "walkout", the only fightwear advertiser I saw using those product terms was Cagecraft itself; competitors sell "rash guards", "fight shorts", "no gi" and "track sets". The fight-jersey/walkout-hoodie positioning looks uncontested in AU paid social, but those two searches were partly rate-limited, so this is a weak signal.
- Sanabul is probably not running Meta ads in the US: an exact search for "Sanabul" returned 3 ads, all from gyms.

### Gaps
- Not verified because page listings were rate-limited: Hayabusa (only a page called "Hayabusa Shop", ID 1106187449237997, of unknown authenticity surfaced), Gold BJJ, Kingz (page ID 135759563208346 found, ads not viewed), RVCA (page ID 26147019372 found, ads not viewed), Scramble, Hyperfly, Manto, Phalanx, Elite Sports, Vali, Ground Game, Roots of Fight, Full Violence, Bad Boy, Tapout, Fumetsu's own page. A third-party page for Gold BJJ had no usable ad detail ([adlibrary.com](https://adlibrary.com/brands/gold-bjj-facebook-ads)).
- TikTok Creative Center, Foreplay/Atria/Motion swipe files and brand TikTok/Instagram organic posts were not checked.

---

## 2. For each brand, which ads have been active longest and which concepts are duplicated most?

### Takeaway
Longest-running active creatives: FUJI's 15-second "product ticker" video and collage static (534 days), Battlegend's Hello Kitty UGC set (359–381 days), Anaconda's coach testimonial videos (347–375 days) and Shadow Rolls' white-background mockup statics (369 days). The most duplicated concept is Engage's typographic Black Friday "NOW LIVE" poster (32 of the 53 Engage ads I could see).

### Cited Findings
| Brand | Longest-running active creative (start, days) | Most duplicated concept |
|---|---|---|
| Engage | Catalogue ads, 2026-10-07, 40 d — [link](https://www.facebook.com/ads/library/?id=1844405333608089) | "BLACK FRIDAY SALE NOW LIVE 🔥" typographic static: n32 of 53 seen, coll 3 — [link](https://www.facebook.com/ads/library/?id=1506752394850728); BF videos n6 and n3 |
| FUJI Sports | "Top Jiu Jitsu Gear" video + collage static, 2025-05-30, 534 d — [link](https://www.facebook.com/ads/library/?id=1435982267851469) | Each of 3 concepts shows coll 3; catalogue ads in 3 copy variants × 4 (465 d) |
| Battlegend | Hello Kitty image+video ad, 2025-10-30, 381 d — [link](https://www.facebook.com/ads/library/?id=847939574468902) | Hello Kitty rash guard UGC: at least 8 separate Hello Kitty ads 116–381 d old |
| Anaconda | Showroom + coach video, 2025-11-05, 375 d — [link](https://www.facebook.com/ads/library/?id=856465363390551) | Coach testimonial cut "Helps Prevent Shoulder Injuries": coll 5, n5 — [link](https://www.facebook.com/ads/library/?id=1256238793205290) |
| Shadow Rolls | Cannibal Corpse static, 2025-11-11, 369 d — [link](https://www.facebook.com/ads/library/?id=1228465485758821) | Same white-background template for every design; coll 3 on three designs |
| Raven | Catalogue ad 2026-06-17 (151 d); two motion-graphic ads 2026-06-29 (139 d) — [link](https://www.facebook.com/ads/library/?id=1350616436570906) | The whole account is 4 ads; each motion graphic runs as 9:16 + 1:1 |
| Bangtao | Carousel, 2026-06-17, 151 d — [link](https://www.facebook.com/ads/library/?id=2214184776069680) | none seen |
| BattleFitGear | "Rest Round" static, 2026-07-16, 122 d, coll 2 — [link](https://www.facebook.com/ads/library/?id=2189101771937432) | none seen |
| Just Jits | Engage lifestyle static, 2026-09-03, 73 d — [link](https://www.facebook.com/ads/library/?id=1553973829602326) | Buy 2 Get 1 text: "4 ads use this creative and text" on library ID 2888778881494445 |
| XMartial | Phantom 4-image post + Classic video, 2026-09-10, 66 d — [link](https://www.facebook.com/ads/library/?id=1723269489422350) | Format (4 square flat-lays per design drop) repeated in 13 of 17 ads seen |
| Tatami | No-gi ads, 2026-10-15, 32 d — [link](https://www.facebook.com/ads/library/?id=1468370195140442) | "Tatami Fightwear No Gi | Premium Training & Competition Gear" headline on 3 of 6 returned |
| Venum | Only BF catalogue ads seen (5–6 d) — [link](https://www.facebook.com/ads/library/?id=3715392485265832) | Same UFC Zenith catalogue ad ≥6 copies in MCP results |

### Inferences
- Engage appears to rebuild its account around each sale: with ~270 ads and none older than 40 days, longevity cannot identify its winners; duplication volume is the only usable proxy.
- Small brands that keep one ad per SKU alive for a year (Battlegend, Shadow Rolls) are probably letting Meta's delivery pick winners, so "still active after 350+ days" there means "never switched off and still spending something", not proof of scale.

### Gaps
- Engage's pre-Black-Friday evergreen ads (inactive since early Nov) were not retrieved, so I cannot say which Engage hoodie/short/jersey creatives ran longest before the sale.
- Venum, Tatami and XMartial long-runners beyond the first 30 listing results are unknown.

---

## 3. What do the long-running / most-duplicated ads look like exactly? (Catalogue of 30 ads: 16 static/carousel/catalogue, 14 video)

### Takeaway
The statics that last are plain: packshot-style front+back garment renders on white, flat-lays on a textured floor, or photo collages with one short headline and no price. The videos that last are either a 15-second branded motion template (FUJI, Raven) or raw creator footage with a one-line caption sticker (Battlegend, Anaconda).

### Cited Findings — STATIC / CAROUSEL / CATALOGUE

**S1. Engage — "BLACK FRIDAY NOW LIVE" typographic poster** — [source](https://www.facebook.com/ads/library/?id=1506752394850728)
- Page Engage (514965128669119). Library ID 1506752394850728. Start 2026-11-08 (8 d). Active. coll 3; n32 of 53 Engage ads seen.
- Format: flexible-format ad with two image crops, 1080×1920 (9:16) and 1080×1440 (3:4). Platforms FB, IG, Audience Network, WhatsApp, Threads.
- Primary text: "ENGAGE BLACK FRIDAY IS LIVE ⚡️\nUp to 80% off sitewide + buy 2, get 1 free on fightwear. Shop now 🛒". Headline: "BLACK FRIDAY SALE NOW LIVE 🔥". CTA: Shop now → engageind.com.
- Visual: pure black background, everything in one neon green, monospace type. Thin green rectangular frame inset ~7% from the edges with crosshair ticks at the midpoints; ruler numbers "100 / 75 / 50 / 25 / 0 / 25 / 50 / 75 / 100" down both outer edges. Top row "ENG" (left) and "AGE" (right), "BF>CM.2026" centred beneath, Engage reticle logo, "BLACK" bold + "FRIDAY" italic, "UPTO 80% OFF", two short dashes, then "NOW / LIVE" filling the middle 40% in heavy mono caps, two dashes, "ENGAGE®" wordmark at the bottom. No product, no price.
- Hook: giant "NOW LIVE". Angle: sale / urgency.
- Winner evidence: duplication (proxy 2) — the single most repeated creative on the most active AU fightwear account.
- Screenshot: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/engage_1506752394850728/card1_view.jpg

**S2. Engage — "Black Friday Exclusive Release" flat-lay** — [source](https://www.facebook.com/ads/library/?id=1723593892682842)
- Library ID 1723593892682842. Start 2026-11-15 (1 d). Active. coll 1; the MCP tool returned 9+ separate ads with this headline starting 15–16 Nov.
- Format: flexible-format, 4 crops of one photo (3:4 ×3, 9:16 ×1).
- Primary text: "Black Friday drop. Limited release. 🔥\n\nNew Motion Fightwear has landed with standout detailing made for hard sessions.\n\nShop before it's gone. 🛒". Headline: "Black Friday Exclusive Release". CTA: Shop now.
- Visual: overhead flat-lay of two black rash guards (neon-green piping, halftone green "ENGAGE" graphics) and black shorts with green wordmark, overlapping diagonally on cracked grey concrete lit with green light spill at the corners. No text overlay, no price.
- Hook: the kit itself. Angle: drop / scarcity.
- Winner evidence: weak (new); duplication across ad sets only.
- Screenshot: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/engage_1723593892682842/cards_sheet.jpg

**S3. Engage — "Your Everyday Engage Set" flat-lay** — [source](https://www.facebook.com/ads/library/?id=39753172237663497)
- Library ID 39753172237663497. Start 2026-11-03 (13 d). Listed active; last delivery date in data 2026-11-08. coll 2.
- Format: flexible-format, 4 crops (3:4 and 9:16).
- Primary text: "Easy layers. Everyday comfort. 👊\n\nMatching jackets and track pants make the XP range an easy choice before training or on rest days.\n\nShop online now. 🛒". Headline: "Your Everyday Engage Set". CTA: Shop now → /collections/xp-track-sets.
- Visual: overhead flat-lay of two hooded track jackets overlapping — forest green shown from the back with a large cream reticle logo, navy shown from the front with a small chest logo and "ENGAGE" on the hood — on pale polished concrete. No text overlay.
- Angle: product-feature / everyday wear.
- Winner evidence: weak (13 d, coll 2).
- Screenshot: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/engage_39753172237663497/cards_sheet.jpg

**S4. Engage — "XP Track Jacket in Forest Green" lifestyle photo** — [source](https://www.facebook.com/ads/library/?id=1518688559593267)
- Library ID 1518688559593267. Start 2026-11-03 (13 d). Active. n2.
- Format: single image 1080×1440 (3:4).
- Primary text: "Built to stand out. 🌲\n\nThe XP Track Jacket brings bold Engage branding to an easy everyday layer.\n\nShop online now. 🛒". Headline: "XP Track Jacket in Forest Green". CTA: Shop now.
- Visual: tattooed man in a black cap and full forest-green track set sitting sideways on a tan leather chair, one foot up, in a casino with out-of-focus slot-machine lights. No text overlay.
- Angle: lifestyle / streetwear.
- Winner evidence: weak.
- Screenshot (bottom-right tile): /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/montage_statics_A.jpg

**S5. Engage — catalogue ad** — [source](https://www.facebook.com/ads/library/?id=1844405333608089)
- Library ID 1844405333608089. Start 2026-10-07 (40 d). Active. Two copy variants × 4 ads each.
- Format: catalogue carousel, 1:1 cards.
- Primary text A: "Unleash Your Inner Fighter 🔥\nBorn in the cage, built for the fearless, Engage is made for those who never quit. Gear up, push limits, and shop the latest online now. 🔒". Primary text B begins "Engage the fighter within. 🔥\n\nBuilt for those who never quit, Engage gear is designed to help you push limits…" (rest not captured). Headline: product name (e.g. "Engage Core Training Shorts"). CTA: Shop now.
- Visual: white-background packshots of black training shorts, one product per card.
- Winner evidence: the only Engage ads that survived the Black Friday reset.
- Screenshot (two right-hand tiles): /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/montage_statics_B.jpg

**S6. FUJI Sports — "TOP JIU JITSU GEAR" 4-photo collage** — [source](https://www.facebook.com/ads/library/?id=1068325335158879)
- Page FUJI Sports (161562020541731). Library ID 1068325335158879. Start 2025-05-30 (534 d). Active. coll 3.
- Format: flexible-format, 9:16 (1152×2048) and 4:5 (1638×2048).
- Card text: headline "Train with Top Gear"; body "Top athletes trust this Jiu Jitsu gear for its durability, comfort and competition-ready design. Train like a champion."; description "Champion-Approved". CTA: Shop now.
- Visual: 2×2 photo grid — back view of a man wearing a black backpack on white; hand with white finger tape on a mat; two athletes drilling a guard pass; boy from behind in a white koi-print rash guard. A black text block sits across the centre: "TOP JIU JITSU GEAR" in white bold caps, "Battle-Tested by the Best" in red.
- Angle: range / authority.
- Winner evidence: 534 days active (proxy 1), coll 3.
- Screenshot (third and fourth tiles): /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/montage_statics_B.jpg

**S7. Shadow Rolls — "Cannibal Corpse Rash Guard"** — [source](https://www.facebook.com/ads/library/?id=1228465485758821)
- Page Shadow Rolls (658462410689304). Library ID 1228465485758821. Start 2025-11-11 (369 d). Active. coll 3.
- Format: single image 1200×1200 (1:1).
- Primary text: "Designed for fighters, made for believers. Shadowrolls Rash Guard – where performance meets meaning. 🔥 Durable, flexible, and made to stand out on and off the mat." Headline: "Cannibal Corpse Rash Guard". Description: a keyword list ("cannibal corpse rash guard, bjj rash guard, mma rash guard…"). CTA: Shop now.
- Visual: pure white background; two 3D garment renders of a red short-sleeve rash guard, front (lower left, large) and back (upper right, overlapping). No text, logo or price outside the garment.
- Angle: design-led product.
- Winner evidence: 369 days active, coll 3.
- Screenshot (top-left tile): /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/montage_statics_A.jpg

**S8. Shadow Rolls — "Pantera Vulgar Display Of Control Fightwear"** — [source](https://www.facebook.com/ads/library/?id=832865203147723)
- Library ID 832865203147723. Start 2026-03-04 (257 d). Active. coll 2. 1080×1080.
- Primary text: "Pantera Vulgar Display Of Control Fightwear is built for fighters who train with purpose — engineered for performance, durability, and total control." Headline as title. CTA: Shop now.
- Visual: white background, range sheet of one print across six renders: short-sleeve front/back, long-sleeve front/back, fight shorts, singlet front/back.
- Angle: full matching set.
- Winner evidence: 257 days, coll 2.
- Screenshot (top-middle tile): /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/montage_statics_A.jpg

**S9. Shadow Rolls — "Slipknot Skull Rash Guard"** — [source](https://www.facebook.com/ads/library/?id=983172814485644)
- Library ID 983172814485644. Start 2026-06-15 (154 d). Active. coll 3. 1200×1200. Same primary text as S7. Same front+back-on-white layout (black garment).
- Screenshot (top-right tile): /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/montage_statics_A.jpg

**S10. BattleFitGear — "Rest Round Rash Guard 😴"** — [source](https://www.facebook.com/ads/library/?id=2189101771937432)
- Page BattleFitGear (111244238708483). Library ID 2189101771937432. Start 2026-07-16 (123 d). Active. coll 2.
- Format: single image 2048×2048 (1:1).
- Primary text: "Rest Round Short Sleeve Rash Guard 😴". Headline: "Rest Round Rash Guard 😴". CTA: Shop now.
- Visual: white background, front and back renders of a black rash guard with white raglan sleeves; front print is a road-sign style "REST ROUND" plate, back print is a pictogram of an old person with a walking stick.
- Hook: in-joke gym humour on the garment. Angle: product-as-joke.
- Winner evidence: 123 days, coll 2.
- Screenshot (bottom-left tile): /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/montage_statics_A.jpg

**S11. Battlegend — "Deadpool Pixel Rash Guard Holiday Edition 🎄"** — [source](https://www.facebook.com/ads/library/?id=1167717751598892)
- Page Battlegend (152908697907709). Library ID 1167717751598892. Start 2025-11-27 (354 d). Active. coll 1.
- Format: single image 2048×2048.
- Primary text: "Holiday Deadpool rash guard for training 🎄💥". Headline as title. CTA: Shop now.
- Visual: young male model, mid-thigh up, facing camera, arms by sides, on a dark charcoal studio backdrop with a soft spotlight; wearing a red/white Christmas-jumper-pattern rash guard and black shorts. No text.
- Angle: seasonal novelty / gifting.
- Winner evidence: 354 days (ran through a full year after its season).
- Screenshot (bottom-middle tile): /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/montage_statics_A.jpg

**S12. XMartial — "Phantom Collections" 4-image post** — [source](https://www.facebook.com/ads/library/?id=1723269489422350)
- Page XMartial (117814314743132). Library ID 1723269489422350. Start 2026-09-10 (67 d). Active. coll 1.
- Format: multi-image, four 1:1 images.
- Primary text: "Quiet in appearance. Distinctive in every detail.\nPhantom Collections.\nNew Drops. Check it out." No headline. CTA: Shop now.
- Visual: glossy black floor tiles, top-down. Image 1: three black tees with grey smoke-marble print and white brush-script logo fanned out. Images 2–4: one tee laid above matching shorts, each a different trim variant. Low-key lighting, no text overlay.
- Angle: drop / collection.
- Winner evidence: 67 days; same format reused on 13 of 17 XMartial ads seen (proxy 2 at format level).
- Screenshot: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/xmartial_1723269489422350/cards_sheet.jpg

**S13. Bangtao Fightstore — "Bangtao Division Black Rash Guard" carousel** — [source](https://www.facebook.com/ads/library/?id=2214184776069680)
- Page Bangtao Fightstore (130684446799408). Library ID 2214184776069680. Start 2026-06-17 (152 d). Active. coll 1.
- Format: 5-card carousel, portrait cards.
- Primary text: "Bangtao Division Black Rash Guard just dropped online.\n\nShop Now before it goes out of stock." Card headline: "Bangtao Black Rash Guard". CTA: Shop now.
- Visual: every card sits on a darkened magenta/teal graffiti mural. Card 1: tattooed athlete, hands behind back, in the black rash guard and shorts, script logo and product name in white caps top right, small pink palm icon. Card 2: three inset detail photos with thin pink keylines plus a vertical pink side banner repeating the product name. Card 3: macro of the sleeve with a pink circular call-out magnifying the woven label ("UNARMED HAND-TO-HAND COMBAT DIVISION"). Card 4: side detail of hem and logo.
- Angle: drop + product-detail.
- Winner evidence: 152 days active.
- Screenshot: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/bangtao_2214184776069680/cards_sheet.jpg

**S14. Just Jits — Engage brand static "Train pro. Look pro. Fight pro."** — [source](https://www.facebook.com/ads/library/?id=1553973829602326)
- Page Just Jits (1169536709735690). Library ID 1553973829602326. Start 2026-09-03 (74 d). Active.
- Format: single image 1440×1924 (3:4).
- Primary text: "😤 We don't stock everything, just premium gear.  Enter Engage Industries, battle-tested by world-class MMA athletes. \n\nAt Just Jits, the gear we stock is about performance & durability. \n\n✅ Trusted by 1000s of Fighters Worldwide\n✅ Secure Checkout - Pay Your Way\n✅ Free Shipping & Afterpay Available." Headline: "Train pro. Look pro. Fight pro." Description: "Discover Engage fight gear trusted by UFC champions like Israel Adesanya. Shop rash guards, gloves, shorts & more for MMA, BJJ, Muay Thai & Boxing." CTA: Shop now.
- Visual: candid photo of a laughing female fighter with a mouthguard, grey long-sleeve crop top and shorts, black Engage gloves, in a dim boxing gym with heavy bags. No overlay.
- Angle: social proof / curation.
- Winner evidence: 74 days active through the retailer's sale switch.
- Screenshot (second tile): /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/montage_statics_B.jpg

**S15. Tatami — no-gi athlete photography (two ads)** — [source 1](https://www.facebook.com/ads/library/?id=1468370195140442); [source 2](https://www.facebook.com/ads/library/?id=3597077743780471)
- Page Tatami Fightwear JiuJitsu Lifestyle (450916851708873). Library IDs 1468370195140442 and 3597077743780471. Both started 2026-10-15 (32 d). Active (second one last delivered 2026-11-11).
- Format: flexible-format; the first has 10 media assets, the second 3.
- Ad 1 primary text: "Check out the world's biggest no gi collection 🔥 \n\nAdults & Kids sizes available." Headline: "Tatami Fightwear No Gi | Premium Training & Competition Gear". Ad 2 primary text: "One team worldwide 🏆 Discover our no gi collection." Headline: "Tatami No Gi Collection". CTA: Shop now.
- Visual: low-angle event photos in a dark arena with red/blue stage lights — an athlete in a pink sponsor-printed rash guard wearing headphones; an athlete in an all-gold "TEAM TATAMI EST. 2009" kit under a ring of lights. No overlay.
- Angle: athlete/event credibility.
- Winner evidence: weak (32 d).
- Screenshots: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/tatami_1468370195140442/cards_sheet.jpg and /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/tatami_3597077743780471/cards_sheet.jpg

**S16. Catalogue ads — Raven and Venum** — [Raven](https://www.facebook.com/ads/library/?id=1390782719550245); [Venum](https://www.facebook.com/ads/library/?id=3715392485265832)
- Raven Fight Wear, Library ID 1390782719550245, start 2026-06-17 (152 d), active. Primary text: "Premium fightwear engineered for performance.\nRashguards, shorts, spats, and gis — designed to outlast every roll.\n\nTrain hard. Look sharp. Perform better." Cards: white-background product shots (spats on legs, rash guard front/back), product name as headline.
- Venum, Library ID 3715392485265832, start 2026-11-10 (6 d), active. Primary text: "Black Friday starts now for UFC Zenith. Early access is open with up to 50% off." Card description: "Black Friday, Early". Cards: models on a grey gradient studio backdrop, including a back view of a personalised jersey reading "YOUR NAME".
- Winner evidence: Raven's has run 152 days; Venum's is new.
- Screenshots: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/raven_1390782719550245/cards_sheet.jpg and /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/venum_3715392485265832/cards_sheet.jpg

### Cited Findings — VIDEO

**V1. FUJI Sports — "JIU JITSU GEAR / FROM GIS TO GYM BAGS" product-ticker video** — [source](https://www.facebook.com/ads/library/?id=1435982267851469)
- Library ID 1435982267851469. Start 2025-05-30 (534 d). Active. coll 3. 720×1280 (9:16), 15.1 s, audio present (no captions, so most likely music only).
- Primary text: "A legacy of champions starts with the right gear. FUJI has delivered since 1969—and still leads today. Find the essentials you need." Headline: "Top Jiu Jitsu Gear". Description: "Integrity Meets Innovation". CTA: Shop now.
- Layout: black 9:16 canvas. A square footage window sits in the upper-middle. Over its lower edge: "JIU JITSU GEAR" in white bold caps and "FROM GIS TO GYM BAGS" in red caps, on screen the whole time. Directly under the window, a white strip of about five product thumbnails scrolls sideways continuously (white gi, blue belt, backpack, red tape tin, black shorts, duffel, athlete portraits).
- Shot list: 0–4 s close-ups of a man swinging a black backpack onto his shoulder; 4–6 s blurred bag movement; 6.5–9 s athlete in a logo tee pulling gear out of the bag on a mat; 10.8–15 s close gi-on-gi grappling.
- Hook (first 2 s): moving product strip + bold two-line label under handheld bag footage.
- Angle: range / heritage.
- Winner evidence: 534 days active, coll 3 — the longest-running fightwear video found.
- Frames: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/fuji_1435982267851469/vid0_sheet.jpg

**V2. FUJI Sports — "THE CHAMPION'S CHOICE" kinetic-type montage** — [source](https://www.facebook.com/ads/library/?id=3084189221770561)
- Library ID 3084189221770561. Start 2026-05-27 (173 d). Active. coll 3. 9:16, 15.1 s, audio present.
- Primary text: "Whether it's comp day or your 6 AM class, FUJI's gear performs so you can focus on what matters: getting better every day. Get equipped with Jiu Jitsu gis, fight shorts, rash guards, and more". Headline: "Upgrade Your Arsenal". Description: "From Jiu Jitsu to MMA". CTA: See details.
- Shot list: 0.2 s athlete in white gi tying a black belt on a white studio, word "THE" in black caps above his head; 1.0 s bearded athlete, arms crossed, patterned rash guard on black, word "CHAMPION'S" in white; 2.0 s back view of backpack on white, word "CHOICE"; 3 s backpack in a gym; 4.3 s macro of a logo on a blue rash guard; 6.5 s macro of a red embroidered patch on a white gi; 8.6 s portrait of a black belt in a white gi; 10.8 s "ELITE GEAR." (white) / "UNMATCHED PERFORMANCE." (red) over a boxing-ring scene; 13 s black end card with logo and a tagline animating in.
- Hook: one word per cut in the first 2 s.
- Angle: authority / range.
- Winner evidence: 173 days active, coll 3.
- Frames: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/fuji_3084189221770561/vid0_sheet.jpg

**V3. Anaconda Fightwear — coach testimonial "Helps Prevent Shoulder Injuries"** — [source](https://www.facebook.com/ads/library/?id=1256238793205290)
- Page Anaconda Fightwear (114966660419611). Library ID 1256238793205290. Start 2025-12-03 (348 d). Active. coll 5, n5. 9:16, 55.4 s, speech.
- Primary text: "\"Felt relief of the shoulder pain that had been keeping me up at night immediately! I sleep great with the relief I get from my Anaconda Shoulder Brace!\"". Headline: "Helps Prevent Shoulder Injuries". Description: "180 Day Warranty". CTA: Shop now.
- Shot list: 0–3 s a tattooed coach in a black rash guard stands on gym mats, hand on his shoulder, talking to a phone camera — captions "MY LABRUM AND MY ROTATOR CUFF / IN MY SHOULDER ARE MESSED UP"; ~8 s takes the product out of its pouch ("FROM ANACONDA FIGHTWEAR THIS"); ~16 s "LIKE ME WITH A…"; ~24 s macro of the fabric ("IT FITS THE SHAPE"); 32–47 s back to talking head wearing it under the rash guard ("BECAUSE THE ONE-SIDED SHAPE AND IT'S", "ROLLING,").
- On-screen text: white bold caps, two lines, mid-frame, with a black box highlighting the current word.
- Hook: problem stated in the first second by a credible-looking practitioner.
- Angle: social proof / problem-solution.
- Winner evidence: 348 days active and the highest Meta variant count found (coll 5). AdManage reports 80 of Anaconda's 82 tracked ads are creator partnership ads.
- Frames: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/anaconda_1256238793205290/vid0_sheet.jpg

**V4. Anaconda Fightwear — showroom intro + coach testimonial "Trusted By 250,000+ Athletes"** — [source](https://www.facebook.com/ads/library/?id=856465363390551)
- Library ID 856465363390551. Start 2025-11-05 (376 d). Active. coll 1. 9:16, 66.9 s, speech.
- Same primary text as V3. Headline: "Trusted By 250,000+ Athletes". Description: "Shoulder Brace used by professional athletes". CTA: Shop now.
- Shot list: 0–2 s a presenter in a brand showroom (wall logo, product posters) holds a grey mannequin torso wearing the brace up to the lens, caption "SHOULDER PAIN" with "SHOULDER" in yellow; 3 s cut to the same coach as V3 ("MY LABRUM"); ~10 s holding the pouch ("POSSESSION TODAY FROM ANACONDA FIGHTWEAR"); ~19 s "WITH A TORN UP SHOULDER"; ~29 s split-screen insert of two other creators with caption "Labrum tears, dislocations and impingements"; 38–57 s talking head to the end.
- Hook: product on a mannequin thrust at the camera.
- Winner evidence: 376 days active.
- Frames: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/anaconda_856465363390551/vid0_sheet.jpg

**V5. Anaconda Fightwear — creator partnership ad (runs under the creator's handle)** — [source](https://www.facebook.com/ads/library/?id=1170237284548471)
- Library ID 1170237284548471. Shown as "guerra_bjj" with Anaconda's page ID. Start 2025-11-12 (369 d). Active. 9:16, 66.9 s.
- Primary text (opening): "@anaconda_fightwear has been by far the best brace I have ever used for my shoulder. Earlier this year I suffered an injury in training that ended up tearing my bicep tendon…" and ends "Stop wasting your money on cheap Walmart or Amazon braces and get a brace that will do exactly what it says it will do. \n\nGo check out their current deals and DM if you have any questions!" plus hashtags. No headline. CTA: Shop now.
- Shot list: 0–3 s sparring footage with captions "I INJURED MY / SHOULDER, / MY NECK, AND / MY BICEP IN A"; ~10 s creator kneeling in a blue gi in front of an academy wall logo with the product pouch on the mat; ~29 s gym B-roll ("HOME FIRST PLACE"); 38–57 s back to kneeling talking head ("ABLE TO LIFT MY", "I HIGHLY, HIGHLY").
- Angle: creator testimonial / us-vs-cheap-alternatives.
- Winner evidence: 369 days active.
- Frames (lower half): /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/montage_videos_C.jpg

**V6. Battlegend — "POV: I FOUND THE BEST RASHGUARD" (image + video ad)** — [source](https://www.facebook.com/ads/library/?id=847939574468902)
- Library ID 847939574468902. Start 2025-10-30 (382 d). Active (last delivery in data 2026-11-13). coll 1. Flexible-format: one 9:16 image + one 9:16 video, 17.3 s.
- Primary text: "💕 Grapple in cute Hello Kitty style 💪🎀🐾🔥". Headline: "🎀 Hello Kitty Jiu Jitsu Rash Guard 💢". CTA: Shop now.
- Video shot list: 0–1 s man in a busy gym pulls off a black tee; 2 s reveals a pink character rash guard, looks at the camera deadpan; 5–7 s turns side-on; 10 s shows the back print; 12–15 s walks toward camera. A pink rounded label "POV: I FOUND THE BEST RASHGUARD" sits at the top for the first ~8 s. A TikTok watermark is visible (reposted creator clip).
- Image: mirror selfie of a woman in the pink long-sleeve version with Instagram-story stickers "La mejor rashguard" and "@battlegendus".
- Hook: tough-looking guy revealing a cute pink top.
- Angle: humour / identity.
- Winner evidence: 382 days — the oldest active fightwear-apparel ad found in the AU feed.
- Frames (upper half): /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/montage_videos_C.jpg

**V7. Battlegend — mirror-selfie clip "Hello Kitty Rash Guard Is Here! 🌈🐾"** — [source](https://www.facebook.com/ads/library/?id=1287436793426084)
- Library ID 1287436793426084. Start 2025-11-21 (360 d). Active. coll 2. 9:16, 5.5 s, audio present.
- Primary text: "💕 Grapple hard, sparkle harder! 🌟🐱". Headline as title. CTA: Shop now.
- Shot list: one continuous take — woman films herself in a mirror, phone covering most of her face, turning left and right and waving in the pink long-sleeve rash guard and black shorts. Two story-style stickers stay on screen low-centre: "La mejor rashguard" (dark pill) and "@battlegendus".
- Hook: instant product-on-body, no intro.
- Angle: customer UGC.
- Winner evidence: 360 days, coll 2.
- Frames: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/battlegend_1287436793426084/vid0_sheet.jpg

**V8. Battlegend — raw pad-work clip "💜 Purple Hello Kitty rash guard drop!"** — [source](https://www.facebook.com/ads/library/?id=2300300277084596)
- Library ID 2300300277084596. Start 2025-11-21 (360 d). Active. coll 2. 9:16, 59.3 s, audio present.
- Primary text: "Crush limits in Hello Kitty rash guard 💜". Headline as title. CTA: Shop now.
- Shot list: one unedited phone take on blue mats in an academy — a woman in a purple character rash guard and purple shorts throws kicks and punch combinations at a shirtless coach holding pads; the two circle the mat for the full minute. Only overlay: a small creator handle low-centre.
- Hook: real training, product visible from frame one.
- Angle: athlete UGC.
- Winner evidence: 360 days, coll 2.
- Frames: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/battlegend_2300300277084596/vid0_sheet.jpg

**V9. Raven Fight Wear — "UNLEASH THE WARRIOR WITHIN" colour-swap motion graphic** — [source](https://www.facebook.com/ads/library/?id=1013010124545097)
- Page Raven Fight Wear (326863154108268). Library ID 1013010124545097. Start 2026-06-29 (140 d). Active. Flexible-format with a 9:16 and a 1:1 version, both 15.1 s, audio present.
- Card headline: "Unleash Your Inner Warrior with Legendary Fightwear". Card body begins: "🔥 The Ultimate Fightwear for Legends 🔥\nStep onto the mats in our top-selling BJJ gis, designed for warriors who embrace their dark side. Featuring the Frankenstein's, Horseman, Werewolf…" (rest not captured). CTA: Learn more.
- Layout: top ~60% is a dark charcoal wall textured with the word "UNLEASH" repeated tone-on-tone; a flat cut-out of an opened gi jacket showing its printed lining sits centred on it. Bottom ~40% is a solid colour block with a torn-paper top edge carrying "UNLEASH" (heavy condensed caps), "THE WARRIOR WITHIN", "WITH THE BEST-SELLING BJJ ESSENTIALS", and a red logo box.
- Shot list: every ~2.5 s the product cut-out slides out and the next slides in, and the colour block changes to match its trim — neon green (0–2.5 s), orange (3–5 s), yellow (6.5 s), red-orange (8.6 s), red (10.8 s), purple (13 s). Text stays fixed.
- Hook: saturated colour block + product on dark.
- Angle: best-sellers.
- Winner evidence: 140 days; one of only 4 ads the brand runs.
- Frames: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/raven_1013010124545097/card0_sheet.jpg

**V10. Raven Fight Wear — "GEAR UP FOR GLORY" colour-swap motion graphic** — [source](https://www.facebook.com/ads/library/?id=1350616436570906)
- Library ID 1350616436570906. Start 2026-06-29 (140 d). Active. 9:16 and 1:1, 15.1 s.
- Card headline: "Elevate Your Jiu-Jitsu Game with Raven". Card body: "Step onto the mat with confidence in Raven Fightwear's premium BJJ gis. Crafted for durability and comfort, our gis are designed to withstand the toughest training sessions. Elevate your game today!" CTA: Shop now.
- Layout: full-frame black-and-white photo of a bearded athlete in a gym. A torn-paper colour strip runs down the left edge with "GEAR UP" set vertically in huge black caps. A cut-out gi (jacket and trousers) is overlaid on the athlete's body. Lower right: "GEAR UP FOR GLORY", "DISCOVER THE HOTTEST BJJ BEST SELLERS OF THE SEASON", red logo box.
- Shot list: gi cut-out and strip colour change together every ~2.5 s (green, orange, yellow, red-orange with the athlete briefly shown shirtless between swaps, red, purple).
- Winner evidence: 140 days.
- Frames: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/raven_1350616436570906/card0_sheet.jpg

**V11. Engage — Black Friday poster paste-up video** — [source](https://www.facebook.com/ads/library/?id=1891204938537501)
- Library ID 1891204938537501. Start 2026-11-08 (8 d). Active. coll 3; n6. 9:16, 20.2 s, loud audio (mean −9.8 dB; no captions, so music/sound design).
- Same primary text and headline as S1. CTA: Shop now.
- Shot list: 0–2 s extreme close-up from behind of a hooded figure in a black jacket with neon-green piping pushing a paint roller on a pole up a wet black poster; huge green letters "LIVE" fill the top of frame; rain streaks. 2–3 s camera drifts back, "NOW LIVE" and the wordmark become readable. ~5.8 s the figure, now with a backpack, walks out of frame. ~8.6 s the full poster (identical to S1) on a concrete wall. 11.5–14.4 s wider night shots of the poster on a concrete pillar under an overpass, green street lighting. 17.3 s the S1 graphic full-frame as end card.
- Hook: illicit-looking paste-up action + oversized green type.
- Angle: sale launch as an event.
- Winner evidence: duplication only (coll 3, 6 copies in sample, 8 days).
- Frames: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/engage_1891204938537501/vid0_sheet.jpg

**V12. Engage — athlete roll-call "IT'S ON." Black Friday video** — [source](https://www.facebook.com/ads/library/?id=1968474637445402)
- Library ID 1968474637445402. Start 2026-11-09 (7 d). Active. coll 3; n3. 9:16, 26.3 s, speech.
- Primary text: "THE WAIT IS OVER. ⚡️\n\nENGAGE BLACK FRIDAY IS LIVE. UP TO 80% OFF 🔥\n\nShop the sale now. DON'T SLEEP." Headline: "BLACK FRIDAY IS LIVE 🔥". CTA: Shop now → /collections/bfcm-sale.
- Shot list: 0.2 s white/iridescent light-leak wipe with a circular reveal onto a zip jacket; 1.0 s athlete 1, seated on a car bonnet at night in a black track jacket over a white tee, holds up three fingers — caption "THREE."; 2.0 s points at lens — "IT'S ON."; 3.0 s athlete 2 (bleached crop, tattoos, black tee) beside a heavy bag — "IT'S ON."; 3.75 s athlete 3 (sunglasses, black anorak) outdoors in an industrial yard — "IT'S ON."; 7.5 s athlete 3 — "DAN THE HANGMAN HOOKER HERE"; 11.3 s athlete 1, both hands up — "UP TO 80% OFF"; 15 s athlete 2 — "MAKE SURE YOU GET IN"; 18.8 s athlete 1 — "LINK IN BIO"; 22.5 s S1 graphic as end card.
- On-screen text: neon green monospace caps, one short line, chest height, matching the poster.
- Hook: three sponsored fighters trading the same two words in the first four seconds.
- Angle: athlete endorsement + sale.
- Winner evidence: duplication only.
- Frames: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/engage_1968474637445402/vid0_sheet.jpg

**V13. Just Jits — "Buy 2, Get 1 FREE" 5-second meme promo** — [source](https://www.facebook.com/ads/library/?id=1149397427739845)
- Library ID 1149397427739845. Start 2026-11-14 (2 d). Active. A sibling library ID 2888778881494445 (started 2026-11-13) shows "4 ads use this creative and text". 720×900 (4:5), 5.6 s, audio present.
- Primary text: "🔥 𝗕𝗨𝗬 𝟮, 𝗚𝗘𝗧 𝟭 𝗙𝗥𝗘𝗘\nYour next no-gi rotation just got better.\nGrab any 3 no-gi items and pay for 2. \nRash guards, shorts, spats & more." Headline: "Buy 2, Get 1 FREE 🔥". CTA: Shop now.
- Shot list: 0–1.6 s a staff member sprints down a warehouse aisle toward the camera and drops into a slide; 2.0–3.2 s four quick cuts of rash-guard flat-lays on off-white (purple, blue-green, red mask print, green); 4.0–5.6 s dark grey end card with store logo, "Hurry, ends soon." and an orange "Shop now" pill button.
- On-screen text (whole video): "Buy 2, / Get 1 FREE" in large white bold sans, centre; "Valid on no-gi and apparel." small beneath; "Me when I heard the 3rd one's free." as a meme caption.
- Hook: person running at the camera + offer already on screen at 0 s.
- Angle: bundle offer.
- Winner evidence: weak (new); 4 copies.
- Frames: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/justjits_1149397427739845/vid0_sheet.jpg

**V14. XMartial — two videos: "Classic" montage and unboxing** — [Classic](https://www.facebook.com/ads/library/?id=1070608955686656); [Unboxing](https://www.facebook.com/ads/library/?id=2631368190617185)
- Classic: Library ID 1070608955686656. Start 2026-09-10 (67 d). Active. 9:16, 11.4 s. Primary text: "XMartial Classic. Classic look. Premium feel. XMartial quality.\nShop now." No headline. Shot list: 0.2 s studio hero of an athlete head-down in black tee and shorts on black; 1.0 s full-frame yellow colour flash over a second studio portrait; 1.6–2 s phone clip of a customer holding the tee up to the lens outdoors; 3 s studio athlete in a crouch, then an RGB-split glitch frame; 4.9 s phone clip of a man walking through a car park in the kit; 6.5–8.2 s creator in a room lined with title belts throwing punches in red gloves; 9.8 s same creator seated, talking. No text overlays.
- Unboxing: Library ID 2631368190617185. Start 2026-10-22 (25 d). Active. 9:16, 16.1 s. Primary text: "Fresh from the box. Ready for the mats.\nGet yours now." Shot list: 0–2.3 s branded pale-blue mailer bags thrown onto a rust-coloured bedspread; 3 s a hand unzips a black inner bag; 4.6–7 s slow handheld pan across a black rash guard with tan ornamental print; 9.2 s matching shorts; 11.5 s a second rash guard with cyan sleeve and pink graphics; 13.8 s black shorts with pink waistband logo. No overlays.
- Winner evidence: 67 days for Classic; unboxing is new.
- Frames: /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/xmartial_1070608955686656/vid0_sheet.jpg and /tmp/claude-0/-home-user-claude-code-ronanr/736a5816-bf1e-51a2-87f6-08655beb45de/scratchpad/adshots/fightwear/xmartial_2631368190617185/vid0_sheet.jpg

### Ranking (strength of winner evidence first, relevance to Cagecraft second)
| Rank | Ad | Evidence | Format |
|---|---|---|---|
| 1 | V1 FUJI product-ticker video | 534 d, coll 3 | video |
| 2 | V3 Anaconda coach testimonial | 348 d, coll 5 (highest), tracker corroboration | video |
| 3 | V6 Battlegend "POV" reveal | 382 d | video + image |
| 4 | S7 Shadow Rolls front+back on white | 369 d, coll 3; template repeated at 257 d / 154 d (S8, S9) | static |
| 5 | S6 FUJI 4-photo collage | 534 d, coll 3 | static |
| 6 | V7 / V8 Battlegend mirror selfie and pad-work UGC | 360 d, coll 2 each | video |
| 7 | V4 / V5 Anaconda showroom cut and creator partnership | 376 d / 369 d | video |
| 8 | S1 Engage "NOW LIVE" poster | 32 of 53 sampled ads, ~270-ad account | static |
| 9 | V2 FUJI "Champion's Choice" | 173 d, coll 3 | video |
| 10 | S11 Battlegend seasonal model static | 354 d | static |
| 11 | S13 Bangtao detail carousel | 152 d | carousel |
| 12 | V9 / V10 Raven colour-swap motion graphics | 140 d; half of a 4-ad account | video |
| 13 | S10 BattleFitGear joke-print static | 123 d, coll 2 | static |
| 14 | S14 Just Jits lifestyle static | 74 d | static |
| 15 | S12 XMartial 4-image flat-lays; V14 Classic montage | 67 d; format repeated 13× | static / video |
| 16 | V11 / V12 Engage BF videos | 7–8 d, coll 3, 6 and 3 copies | video |
| 17 | S5 Engage catalogue, S16 Raven catalogue | 40 d / 152 d | catalogue |
| 18 | S15 Tatami, S2–S4 Engage, V13 Just Jits, Venum catalogue | under 35 d | mixed |

### Inferences
- None of the long-running statics shows a price, a discount badge or a review-star overlay. Offer treatment appears only in sale-period creative (Engage "UPTO 80% OFF", Just Jits "Buy 2, Get 1 FREE"), and there it is the whole creative rather than a badge on a product photo.
- Long-running videos open on the product within the first second: on a body (Battlegend), in a hand (Anaconda mannequin), or in a moving product strip (FUJI). None opens on a logo.
- Lengths cluster at two extremes: 5–20 s for brand/motion pieces and 55–67 s for testimonials.

### Gaps
- Audio was not heard for any video; music genre and exact spoken script are unknown.
- Raven's fourth ad ("Unleash Your Inner Warrior", ID 871771242186535), Made4Fighters' Fumetsu ad, MMA Fight Store's sale ad and UFC's catalogue ad: visual not verified (snapshot did not return data).
- Two Engage fields were truncated in capture (catalogue copy variant B; Raven V9 body).

---

## 4. Which of these ads appear to be AI-generated or AI-assisted, and how can you tell?

### Takeaway
No ad carried Meta's AI label, but four creatives look synthetic to me: Engage's poster paste-up video, XMartial's Phantom flat-lays, Battlegend's Deadpool model shot, and the Shadow Rolls / BattleFitGear garment images (3D mock-ups rather than photographs).

### Cited Findings
- The Ad Library data field `contains_digital_created_media` was `false` on all 30 ads catalogued. — [example](https://www.facebook.com/ads/library/?id=1891204938537501)
- XMartial's first Phantom image is 1254×1254 px while the other three in the same post are 1080×1080. — [source](https://www.facebook.com/ads/library/?id=1723269489422350)
- Shadow Rolls and BattleFitGear images show front and back garment renders with identical lighting and no fabric creasing on pure white. — [Shadow Rolls](https://www.facebook.com/ads/library/?id=1228465485758821); [BattleFitGear](https://www.facebook.com/ads/library/?id=2189101771937432)

### Inferences
- Engage V11 (medium confidence AI-generated or CG): the poster in the scene is pixel-identical to the static artwork and stays perfectly flat and legible while "wet"; the figure is faceless; the concrete, rain and green lighting have the over-clean look of generated video; there is no camera shake. It is likely an AI or 3D scene with the real poster artwork composited in.
- XMartial S12 (medium confidence AI-assisted): repeating smoke-marble texture across garments and floor reflections that are too uniform, plus the non-standard 1254 px size typical of an image-model export.
- Battlegend S11 (low-medium confidence AI try-on): very smooth skin, generic studio spotlight, and the print sits on the torso without distortion at the sides.
- Shadow Rolls / BattleFitGear / Raven catalogue rash guards: template 3D mock-ups (print-on-demand style), not AI and not photography.
- Everything with creators (Battlegend, Anaconda, XMartial UGC, Engage athletes, Tatami event photos) reads as real footage.

### Gaps
- No provenance metadata was checked; these are visual judgements only and could be wrong, especially for S11.

---

## 5. Which formats recur across multiple fightwear brands?

### Takeaway
Six formats recur: catalogue ads, garment front+back on white, textured-floor flat-lays, raw creator clips with a caption sticker, 15-second branded motion templates that cycle products, and photo-only lifestyle/athlete statics with all the selling done in the copy.

### Cited Findings
| Format | Brands using it (ads) |
|---|---|
| Catalogue / dynamic product ads with one generic brand sentence | Engage (S5), FUJI (465 d), Raven (S16), Venum (S16), UFC, Bangtao, No Mercy, Progress — [example](https://www.facebook.com/ads/library/?id=1390782719550245) |
| Front + back garment on pure white, no text | Shadow Rolls (S7–S9), BattleFitGear (S10), Raven catalogue cards — [example](https://www.facebook.com/ads/library/?id=983172814485644) |
| Overhead flat-lay of a matching set on a textured floor, no text | Engage (S2, S3), XMartial (S12) — [example](https://www.facebook.com/ads/library/?id=39753172237663497) |
| Raw creator / customer clip with one caption sticker | Battlegend (V6–V8), Anaconda (V3–V5), XMartial (V14) — [example](https://www.facebook.com/ads/library/?id=1287436793426084) |
| 15 s branded motion template cycling several products | FUJI (V1, V2), Raven (V9, V10) — [example](https://www.facebook.com/ads/library/?id=1013010124545097) |
| Photo-only athlete / lifestyle static | Engage (S4), Just Jits (S14), Tatami (S15) — [example](https://www.facebook.com/ads/library/?id=3597077743780471) |
| Typography-only sale poster, reused as video end card | Engage (S1, V11, V12); Just Jits end card (V13) — [example](https://www.facebook.com/ads/library/?id=1506752394850728) |

### Inferences
- Primary text is short everywhere (one to three sentences); the only long copy is the creator's own caption in partnership ads. Headlines are either the product name or a 3–6 word claim. CTA is "Shop now" on 27 of 30 ads.
- Design-led rash-guard brands sell the print, so they show the garment flat and unobstructed; Cagecraft's colourway-led hoodies and jerseys suit the same treatment.
- Colour is used as the device in several winners (Raven's swapping colour block, Battlegend's pink, Engage's single neon green), which maps directly onto Cotton Candy / Diamond / Tiffany / Concrete.

### Gaps
- "Us vs them" comparison statics, founder-story videos, review-screenshot statics and price/bundle statics were not found among the ads I could see; I cannot say whether competitors tested and dropped them or whether they sit beyond the 30-result limit.

---

## 6. Which formats can be recreated using only real product photos composited into layouts, AI backgrounds or motion graphics?

### Takeaway
Thirteen of the catalogued concepts are HIGH recreate-ability with real Cagecraft product photos only; the creator and athlete videos are LOW because the garment has to be worn by a real person on camera.

### Cited Findings (rating per ad; ad details and sources are in section 3)
| Ad | Rating | Why |
|---|---|---|
| S1 Engage "NOW LIVE" poster | HIGH | Pure typography and line work; no garment at all. |
| S2 / S3 Engage flat-lays | HIGH | Real flat-lay cut-outs placed on an AI or stock concrete floor with colour light spill. |
| S5, S16 catalogue ads | HIGH | Existing packshots through the product feed. |
| S6 FUJI 4-photo collage | HIGH | Grid of existing photos plus a two-line text block. |
| S7–S10 front+back on white | HIGH | Real front and back packshots, overlapped on white. |
| S12 XMartial 4-image flat-lays | HIGH | Real flat-lays on a generated dark tile floor; four variants per colourway. |
| S13 Bangtao detail carousel | HIGH | Real detail close-ups in designed frames with call-out circles over a generated mural background. |
| V1 FUJI product ticker | HIGH | Scrolling strip of real packshots and fixed text are motion graphics; the footage window can be slow pans across real product photos. |
| V9 / V10 Raven colour-swap | HIGH | Real product cut-outs swapped over a static background with a colour block matched to each colourway. |
| V13 Just Jits B2G1 | MEDIUM | Packshot cuts and end card are easy; the opening gag needs one real phone clip (no garment generation required). |
| V2 FUJI "Champion's Choice" | MEDIUM | Kinetic type is easy; needs real on-body stills or macro product shots for each cut. |
| V11 Engage paste-up video | MEDIUM | Scene can be generated with the real poster artwork composited in, provided the figure is a silhouette and no Cagecraft garment is generated. |
| V14 XMartial unboxing | MEDIUM | Needs a real 15 s phone shoot of real product; nothing to generate. |
| S4, S14, S15 lifestyle / athlete photos | LOW | The image is a real person wearing the garment in a real place. |
| S11 Battlegend model static | LOW | Garment on a model would have to be generated unless a real on-model photo exists. |
| V3–V8 creator testimonials and UGC | LOW | Real people wearing and talking about the product. |
| V12 Engage athlete roll-call | LOW | Needs named sponsored athletes on camera. |

### Inferences
- The best evidence-to-effort trade for Cagecraft is V1 (534 days) and S7 (369 days): both are HIGH recreate-ability and both are among the top five by winner evidence.
- V6–V8 are the strongest apparel videos by longevity but need real customer clips; they are a sourcing task, not a design task.

### Gaps
- Ratings assume Cagecraft holds clean front/back packshots, flat-lays and detail close-ups of each colourway; I did not check what photography exists.
