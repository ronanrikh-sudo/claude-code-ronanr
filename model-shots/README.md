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
   of the thigh, around wrist level. Then re-run steps 3–4.
6. **Check.** Compare against the flat lays at 1:1 and fix any edge, scale or crop errors.

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
