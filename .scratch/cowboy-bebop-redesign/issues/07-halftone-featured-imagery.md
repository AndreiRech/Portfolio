# 07 — Halftone texture on featured imagery

**What to build:** The About section's profile photo and each Projects carousel card's image get a halftone-dot treatment, matching the comic/poster texture in the reference art, without being applied as a global page-wide effect.

**Blocked by:** 01, 03, 05

- [x] The About section's profile photo renders with a halftone-dot overlay/filter (CSS or SVG-based)
- [x] Each `CarouselCard`'s project image (`cardImageUrl`) renders with the same halftone treatment, consistent in dot scale/contrast with the About photo
- [x] The halftone effect does not degrade image load performance noticeably (no added network requests per image; pure CSS/SVG filter)
- [x] The halftone effect is not applied anywhere else on the page (not global, not on icons/logos)
- [x] Images remain recognizable and the effect reads as intentional texture rather than visual noise/artifact

## Notes

The screen is a `.halftone` utility in `globals.css`: two half-cell-offset grids of
the same radial-gradient dot, painted on `::after` and blended `multiply` over the
image. Both surfaces take the utility unmodified — one 5px pitch, one dot size, one
opacity — so the portrait and the cards look shot through the same plate, which is
what criterion 2 asks for. Nothing overrides the pitch per instance.

`multiply` over the alternatives: the dots bite into paper-white and midtones and
fade out in the shadows, the way ink behaves on press. A `color-burn` variant was
tried against the real images and rejected — it leaves white paper completely
untouched, so the card art (mostly white line-art plates) came out with no visible
texture at all. Solid blacks staying flat under `multiply` is the effect being
faithful, not the effect failing.

Both consumers put the utility on a wrapper around the image rather than on the
frame that holds it:
- About's photo is letterboxed inside its `.panel`, so screening the frame would
  print dots over bare panel fill either side of the portrait.
- The carousel's image box also hosts the no-image placeholder icon, and a halftoned
  icon is just a chewed-up icon. The wrapper doubles as the positioned ancestor that
  the `fill` image was previously resolving against by accident.

Verified visually by rendering the exported `out/` build and the card markup against
the real compiled stylesheet (no Chrome/Playwright in this environment; macOS
QuickLook renders local HTML through WebKit). Checked against all five real card
images plus the portrait — every one stays recognizable.

Out of scope and untouched, per ticket 09's own note: the project detail page's
gallery imagery.
