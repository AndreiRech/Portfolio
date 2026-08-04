# 07 — Halftone texture on featured imagery

**What to build:** The About section's profile photo and each Projects carousel card's image get a halftone-dot treatment, matching the comic/poster texture in the reference art, without being applied as a global page-wide effect.

**Blocked by:** 01, 03, 05

- [ ] The About section's profile photo renders with a halftone-dot overlay/filter (CSS or SVG-based)
- [ ] Each `CarouselCard`'s project image (`cardImageUrl`) renders with the same halftone treatment, consistent in dot scale/contrast with the About photo
- [ ] The halftone effect does not degrade image load performance noticeably (no added network requests per image; pure CSS/SVG filter)
- [ ] The halftone effect is not applied anywhere else on the page (not global, not on icons/logos)
- [ ] Images remain recognizable and the effect reads as intentional texture rather than visual noise/artifact
