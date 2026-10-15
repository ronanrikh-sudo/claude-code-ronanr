# Art direction: choosing the look for each project

The **motion language is fixed** (see `motion-language.md`). The **look is chosen per project**: palette, type, surfaces, texture, light or dark, motion temperament, music mood and a signature device. A finance board update, a skincare launch and a dev-tool teaser should all feel equally premium and kinetic, but none of them should look like the others.

## Contents
1. The process (do this before writing any scene)
2. Reading the project: signals → decisions
3. The look spec (what to write down)
4. Direction library (8 starting points with full tokens)
5. Blending, brand guidelines and custom fonts
6. Quality bar: what makes a look feel premium
7. Pitfalls

---

## 1. The process

1. **Gather signals** (section 2) from the brief, the user's words, any brand assets, the audience and where the video will play. Look at anything they attach: logo, site, deck, product screenshots.
2. **Pick a direction** from the library (section 4), or blend two. If the user has brand guidelines, the brand wins on colour and type; the direction then only supplies the surface, texture and motion treatment.
3. **Write a look spec** (section 3) and fill `src/theme.ts` and `src/fonts.ts` from it. Set `motion` (temperament) in the theme and `music.mood` in `script.json`.
4. **Tell the user the look in 2–3 sentences** before building, e.g. *"Editorial Light: warm off-white, Instrument Serif headlines with Inter body, one deep-green accent, hairline rules, calm motion. It suits a board audience and the quarterly-report tone."* Then proceed. Only stop to ask if the signals genuinely conflict (for example "playful" plus a conservative audience) or brand assets are referenced but missing.
5. After the first stills, **judge the look** against the quality bar (section 6) and adjust tokens, not the motion.

## 2. Reading the project: signals → decisions

| Signal | Leans toward |
|---|---|
| Audience: executives, board, finance, legal, government | Editorial Light, Corporate Clean, Midnight Signal; calm or balanced; muted accent |
| Audience: developers, IT, technical buyers | Midnight Signal, Swiss Bold, Electric; mono accents, terminals and UIs welcome |
| Audience: consumers, social feeds | Playful Pop, Electric, Warm Organic; punchy; bigger type, faster beats |
| Luxury, fashion, property, hospitality, premium goods | Luxury Noir, Editorial Light; calm; serif display, generous space, no UI chrome |
| Wellness, food, sustainability, education, non-profit | Warm Organic; calm or balanced; soft radii, paper grain |
| Launch, event, sport, hype-y product drop | Swiss Bold, Electric, Playful Pop; punchy; hard cuts, scale slams |
| Data story, report, results | Editorial Light or Swiss Bold; stat reveals and charts as heroes |
| Internal pitch, process improvement, tooling | Midnight Signal or Corporate Clean; recreated app UIs carry the story |
| Words like "clean / trustworthy / enterprise" | Corporate Clean |
| Words like "bold / loud / disruptive" | Swiss Bold |
| Words like "elegant / timeless / understated" | Luxury Noir or Editorial Light |
| Words like "fun / friendly / approachable" | Playful Pop or Warm Organic |
| Words like "futuristic / AI / next-gen" | Electric or Midnight Signal |
| Plays on a big screen in a dark room | dark mode, higher contrast, larger type |
| Plays muted in a feed | captions on and prominent, punchy, kinetic type does the talking |
| Plays in a meeting or presentation | balanced; legibility over flourish; captions on |

Brand colour present → it becomes the **accent**. Pick the ground (light or dark) that gives that colour the most contrast and dignity. A brand with two colours: the stronger one is the accent, the other becomes `bgCenter` or the `paperChrome` tint, never a second accent.

## 3. The look spec

Write these down (in your head or in a comment at the top of `theme.ts`):

- **Direction**: name, plus the one sentence of why.
- **World**: dark or light ground, gradient centre or edge, glow on or off.
- **Accent**: one colour, plus what it is reserved for (the hero moment in each scene).
- **Type**: display family, weight, tracking and case; body family; mono family, if code or IDs appear.
- **Surfaces**: panel fill, radius (0 for Swiss, 24 default, 32+ for soft), shadow depth (none, soft, deep).
- **Texture**: grain amount, vignette, any signature texture (paper, gradient mesh, hairline grid).
- **Motion temperament**: calm, balanced or punchy.
- **Signature device**: one recurring motif that ties the film together and stars in the finale (see the list in section 4).
- **Finale world**: same as the story world, or a contrasting "brand world" (for example dark story → ivory sign-off).
- **Music mood**: warm, bright, dark, minimal or none.

## 4. Direction library

These are starting points; adjust them freely. All fonts are on npm as `@fontsource/<name>`.

### Midnight Signal — tech, AI, internal tooling, dev audiences
- Ground: deep navy radial (`#060A14` → `#0D1830` centre), drifting accent glow 0.16, grain 0.075, vignette 0.55.
- Accent: warm coral `#D97757`, or the brand colour. Text `#F3F6FB`, muted `#93A0B8`.
- Type: Inter 760 display, tracking −0.036 em; Inter body; JetBrains Mono.
- Surfaces: dark glass panels (`#141C2F→#0D1424`), radius 24, deep shadows; light app windows tilted in 3D.
- Temperament: balanced. Signature: spark or asterisk mark. Finale: ivory brand world `#F0EEE6` / ink `#141413`. Music: warm.

### Editorial Light — finance, consulting, reports, culture, boards
- Ground: warm paper `#F6F3EC` → `#EFEADF`, no glow, grain 0.04 (multiply), vignette 0.15.
- Accent: one deep, confident colour (forest `#1F5C46`, oxblood `#7A1F2B`, ink-blue `#1D3A6E`). Text `#1A1A18`, muted `#6B675F`, lines `rgba(0,0,0,.10)`.
- Type: **Instrument Serif** or **Newsreader** display at 400–500, tracking −0.01 em; **Inter** body; IBM Plex Mono for figures.
- Surfaces: white cards with hairline borders and *soft* shadows (`0 20px 60px rgba(0,0,0,.08)`), radius 10–14; thin rules and generous margins.
- Temperament: calm. Signature: a hairline rule that draws across, then becomes the underline on the payoff word. Finale: same paper world, centred serif wordmark. Music: minimal.

### Swiss Bold — launches, agencies, manifestos, data stories
- Ground: pure white `#FFFFFF` or near-black `#0B0B0B`; flat, no glow, no grain, no vignette.
- Accent: one saturated primary (signal red `#FF3B1F`, cobalt `#1F4BFF`, or yellow `#FFD400` on black).
- Type: **Inter Tight** or **Archivo** at 800–900, tracking −0.045 em, often uppercase for short words; huge sizes (200+ px) cropped by the frame.
- Surfaces: none or flat blocks with radius 0; strong grid alignment; colour-block wipes for transitions.
- Temperament: punchy. Signature: full-frame colour-block wipe, or a giant numeral. Finale: accent full-bleed with a knocked-out wordmark. Music: bright or none.

### Electric — consumer tech, AI products, events, gaming-adjacent
- Ground: near-black `#07060B`, with animated gradient mesh blobs (violet `#7C5CFF` → cyan `#22D3EE` → magenta) at 0.25–0.35, slight grain.
- Accent: the brightest stop of the gradient. Text white, muted `#A6A3B8`.
- Type: **Sora** or **Unbounded** display 700; **Manrope** body; Geist Mono.
- Surfaces: frosted glass (`backdrop` look faked with a translucent fill plus a 1 px top highlight), radius 28, coloured glow shadows.
- Temperament: punchy. Signature: a gradient light-trail that sweeps through transitions. Finale: dark, logo in a gradient glow ring. Music: bright or dark.

### Warm Organic — wellness, food, sustainability, education, non-profits
- Ground: sand `#F3EBDD`, clay `#E9DCC7`, or deep olive `#2F3A2B` for a dark variant; paper grain 0.06; no vignette.
- Accent: terracotta `#C8643B` or sage `#6E8B5E`. Text `#2B2620`.
- Type: **Fraunces** (soft, optical-size serif) display 600; **DM Sans** body.
- Surfaces: rounded radius 32+, soft shadows, organic blob shapes behind heroes.
- Temperament: calm. Signature: a hand-drawn-feel stroke path (a stroke-dash draw) or a growing leaf or circle. Finale: same world, wordmark plus soft blob. Music: warm.

### Luxury Noir — fashion, property, premium goods, hospitality
- Ground: true black `#0A0A0A` → `#141210` centre, faint warm glow, grain 0.05, vignette 0.6.
- Accent: champagne `#C9A96E` or cream `#EDE6D6`, used sparingly. Text `#F2EEE6`, muted `#8C857A`.
- Type: **Cormorant Garamond** or **Playfair Display** display 500, tracking 0.01 em; small-caps labels in Inter 500, tracking +0.25 em.
- Surfaces: almost none; thin gold hairlines, full-bleed imagery or product renders if supplied; radius 0–4.
- Temperament: calm (slow pushes, long holds, letter-spacing reveals). Signature: a slow light sweep across type. Finale: black, centred serif wordmark, one line. Music: minimal.

### Playful Pop — consumer apps, kids, social, friendly brands
- Ground: candy pastels (`#FFE8F0`, `#E6F4FF`) or bold brights; flat; no grain.
- Accent: one punchy colour (`#FF5A36`, `#7B61FF`) plus sticker-like secondary shapes in the *same family*.
- Type: **Bricolage Grotesque** or **Fredoka** display 800; **Plus Jakarta Sans** body.
- Surfaces: chunky radius 28–40, thick 3 px outlines, hard offset shadows (`8px 8px 0 #1A1A1A`).
- Temperament: punchy (overshoot, squash on landings, quick rotations). Signature: stickers that slap on with a bounce. Finale: wordmark bounces in, confetti shapes. Music: bright.

### Corporate Clean — enterprise, healthcare, government, B2B SaaS
- Ground: light grey `#F5F7FA` → white, or deep brand navy for a dark variant; no grain; vignette 0.1.
- Accent: the brand blue or teal (`#0B6BCB`, `#0E9F8E`). Text `#0F172A`, muted `#64748B`.
- Type: **IBM Plex Sans** or **Plus Jakarta Sans** display 700, tracking −0.02 em; Plex Mono.
- Surfaces: white cards, 1 px `#E2E8F0` borders, soft layered shadows, radius 16.
- Temperament: balanced. Signature: a connector line that links the steps (draws between cards). Finale: same world, logo plus one line. Music: warm or bright.

**Signature device ideas** (pick one per film): a spark or asterisk mark; a hairline that draws; a colour-block wipe; a gradient light-trail; a circle that grows and becomes the logo; a giant numeral; a sticker slap; a connector line; a light sweep; a dot grid that ripples. Use it in at least two transitions and in the finale.

## 5. Blending, brand guidelines and custom fonts

- **Blend** by taking the ground and surfaces from one direction and the type from another, e.g. Midnight ground with Editorial serif headlines for an "AI for law firms" pitch. Keep **one** accent.
- **Brand guidelines** override palette and type. Map the brand palette onto the tokens: primary → `accent`; brand dark → `bg`/`text` depending on mode; brand neutral → `muted`/`line`.
- **Brand fonts not on fontsource**: place `.woff2` files in `public/fonts/`, declare `@font-face` in a CSS string injected in `fonts.ts` using `staticFile("fonts/…")`, and use the family name in `THEME.families`. Never rely on system or CDN fonts at render time.
- **Real logos**: only when the user supplies them. Drop the SVG into `src/assets/` and use it in place of the placeholder mark in the finale and terminal welcome.
- **Recreated third-party app UIs** keep *their* app colours inside the window (that's what makes them recognisable), whatever the theme. The theme governs everything around them.

## 6. Quality bar: what makes a look feel premium

- **Restraint.** One accent; two type families (plus mono at most); three or fewer surface treatments.
- **Contrast.** Body text at least 4.5:1 against its surface, headlines at least 3:1. Check muted text on the darkest and lightest surfaces in stills.
- **Scale contrast.** Headlines 4–8× body size; numbers huge; labels small and tracked.
- **Space.** Fewer, bigger things; generous margins (at least 80 px at 1080p); nothing touching frame edges unless deliberately cropped.
- **Depth or flatness, chosen.** Either commit to depth (shadows, glass, parallax) or to flat (Swiss, Pop). Half-and-half reads cheap.
- **Consistency.** Every headline uses `display()`; every card uses the theme radius and shadow; the signature device recurs.
- **Type care.** Tight tracking on large grotesks, near-zero on serifs, positive on small caps; tabular figures for numbers.

## 7. Pitfalls

- Copying the previous project's look by default. Choose fresh each time unless the user asks for continuity.
- Rainbow palettes, or a second accent that competes. Status colours (ok/warn/bad) are for meaning only.
- Light themes with dark-theme shadows: on light grounds, use soft, low-opacity shadows.
- Thin serif display type at small sizes. Serif headlines need at least about 72 px to sing.
- Grain and vignette on flat Swiss or Pop looks. Set `grain: 0, vignette: 0`.
- Forgetting to switch captions and terminal tokens when the world is light. Check the stills.
