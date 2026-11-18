# CAGECRAFT model shots — oversized tees

AI model shots for the new oversized tees, with the real artwork placed back onto the shirt
so no print, embroidery or lettering comes from the AI model.

## Pipeline

1. **Reference.** Pull the flat lays and close-ups from Shopify, plus existing on-model shots
   (Apex, Pegasus, Menace) for fit and house style: light-grey seamless studio, soft light,
   grey shorts, sneakers.
2. **Generate.** Higgsfield `gpt_image_2_6`, quality `high`, 2k, 4:5, with references:
   tee flat lay + print close-up + one on-model style shot. Nano Banana 2.1 was tested too;
   GPT Image 2.6 kept the boxy dropped-shoulder fit better.
3. **Replace prints** (`tools/comp.py`). SIFT feature matching finds where the AI drew the
   graphic and builds a homography from the real flat-lay graphic onto it. The AI graphic is
   masked (shirt-only) and inpainted, then the real graphic is added back over the black fabric,
   scaled by the fabric's local lighting so folds and shadows carry through.
4. **Replace sleeve embroidery** (`tools/sleeve.py`). The AI sleeve text is removed and the real
   embroidery crop is placed parallel to the cuff. CAGECRAFT wraps around the outer fold of the
   sleeve, so a front or back view only shows part of the word: front shows `RAFT` (image-left) and
   `CAGE` (image-right); back shows `RAFT` and `CAGEC`, matching the flat lays.
5. **Fit.** Edit each shot in Higgsfield with `heavy-hitters/fit-reference-torso.jpg` (the real
   tee worn) as the fit reference. The target fit: relaxed heavyweight drape about 20–25% wider than
   the torso, falling straight from the chest; shoulder seam dropped a few cm; sleeves hang DOWN
   along the arm, slightly loose, ending 3–4 cm above the elbow (no sideways flare); hem at the top
   of the thigh: on a front full-body shot, just below the wrist, about halfway down the hand. Then re-run steps 3–4.
6. **Restore the face** (`tools/headfix.py`). Every Higgsfield edit re-draws the whole image, so
   faces drift (warmer skin, harder contrast, changing features) over repeated edits. After the last
   edit, put the head from the first-round generation back: SIFT-aligned, blended only where both
   images show head/neck, with arm and leg skin tone matched to the original.
   `python3 tools/headfix.py <first-gen.png> <current.png> <out.png> <x0> <x1> <collar_y>`
7. **Check.** Compare against the flat lays at 1:1 and fix any edge, scale or crop errors.

## Variations (new model, poses, outdoor)

Generate variations fresh from an approved final as the reference, not by chaining edits, so
faces don't drift. Then run steps 3–4 once.

- **Chest close-up is clipped.** The Shopify chest close-up cuts off the tip of the S spike. Run
  `comp.py` twice, once with the close-up (with `valid_trim_right`) and once with the flat lay,
  then `tools/merge_sources.py` keeps the sharp close-up and fills the spike from the flat lay.
- **Dark backgrounds.** On outdoor shots with a dark roller door the sleeve-edge search runs into
  the background; set `"anchor": "ai"` in the sleeve config to place the real embroidery where the
  AI drew its partial word.
- **Removal.** Use `thr` ~10 and `mdil` ~6 so the AI print's faint gold halo is removed too.
  `comp.py` protects large skin areas (hands near the print) from removal.

## Real-photo method (preferred)

Start from a real CAGECRAFT shoot photo of the same black blank instead of a generated model:

1. Mask the old print (and sleeve logo) on the shirt only.
2. Higgsfield `nano_banana_2_1` with `is_inpaint: true` + the mask regenerates just that area as
   plain black fabric; paste the untouched original back outside the mask.
3. Placement: SIFT-match the old design's flat lay to the photo (gives flat-lay → photo mapping on
   the real shirt), register the new tee's flat lay to the old one by shirt silhouette (same
   blank), and carry the new print through: `comp.py` with a `quad`.
4. Sleeve embroidery with `tools/place_word.py` at the old sleeve logo's spot, parallel to the cuff.

## Sets

- `final/`: studio, original models (front, mid, back, female back).
- `final-new-model/`: studio, second model (front, seated pose, hand-wraps pose).
- `final-outdoor/`: inner-city laneway, original models (front, mid, back).
- `final-real/`: real CAGECRAFT shoot photos with the Heavy Hitters print swapped in.

## Re-running for a new tee

Configs in `<tee>/config/` use paths relative to a working folder containing `source/`
(the Shopify flat lays) and `raw/` (the Higgsfield outputs named `g0.png`…).

```bash
python3 tools/comp.py heavy-hitters/config/print-f.json
```

```bash
python3 tools/sleeve.py heavy-hitters/config/sleeve-f.json
```

Needs `opencv-python-headless`, `numpy`, `Pillow`.
