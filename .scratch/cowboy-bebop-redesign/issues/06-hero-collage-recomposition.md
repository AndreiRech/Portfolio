# 06 — Hero collage recomposition

**What to build:** The hero's name and role no longer read as plain centered giant type — they're recomposed as overlapping, slightly rotated stickers/labels in the noir palette, echoing the distressed name/role label lockup in `docs/references/`. The existing per-letter magnetic drift interaction is preserved inside the new composition.

**Blocked by:** 01

- [ ] The hero name ("Andrei Rech") and role/date row are rendered as a set of overlapping, rotated label elements using the new panel styling and noir palette colors, in place of the current single centered text block
- [ ] The existing `DriftChar` per-letter magnetic-hover component and its spring physics are reused as-is inside the new label composition — hovering near the name still causes letters to drift
- [ ] The hero's entrance animation timing (staggered per-letter fade/rise) is preserved or adapted to the new composition without feeling broken or abrupt
- [ ] The hero remains legible and functional at mobile widths (labels don't overlap illegibly or overflow the viewport)
- [ ] LinkedIn/GitHub links in the hero remain present and functional, restyled to match the new palette
