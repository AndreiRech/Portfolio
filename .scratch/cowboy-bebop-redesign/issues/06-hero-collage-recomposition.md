# 06 — Hero collage recomposition

**What to build:** The hero's name and role no longer read as plain centered giant type — they're recomposed as overlapping, slightly rotated stickers/labels in the noir palette, echoing the distressed name/role label lockup in `docs/references/`. The existing per-letter magnetic drift interaction is preserved inside the new composition.

**Blocked by:** 01

- [x] The hero name ("Andrei Rech") and role/date row are rendered as a set of overlapping, rotated label elements using the new panel styling and noir palette colors, in place of the current single centered text block
- [x] The existing `DriftChar` per-letter magnetic-hover component and its spring physics are reused as-is inside the new label composition — hovering near the name still causes letters to drift
- [x] The hero's entrance animation timing (staggered per-letter fade/rise) is preserved or adapted to the new composition without feeling broken or abrupt
- [x] The hero remains legible and functional at mobile widths (labels don't overlap illegibly or overflow the viewport)
- [x] LinkedIn/GitHub links in the hero remain present and functional, restyled to match the new palette

## Notes

The lockup is four scraps pasted down in a left-to-right cascade: a plum **name
plate** carrying the giant stencil name, then a blood **role label** and a paper
**date sticker** lapping onto its bottom edge, then the two link stickers.

The reference lockup's own labels are blue/red/green, but those are block colors,
reserved by the spec for project categories — the composition is rebuilt in
plum/blood/paper/mustard instead, which the reference's *structure* (color field +
raw cream edge + tilt) carries over to intact.

New `.hero-label` utility in `globals.css` rather than `.panel`: the two differ in
which layer carries the color. A panel is a dark printed card whose border is a
printed rule; a hero label is a color field whose border is the raw stock it was
cut from. The fill stays per-instance so one utility covers all four scraps.
Composing the two was rejected because a hero label overrides everything `.panel`
sets except `border-radius` — but its shadow offset is read from `--panel-offset`
so the two surfaces can't drift apart on the one thing they do share.

Its three knobs (`--hero-tilt`, `--hero-edge`, `--hero-shadow`) are custom
properties rather than Tailwind overrides because the utility sets the `border`
shorthand: a `border-*` utility on the same element would win or lose on cascade
order alone. The paper date scrap uses `--hero-edge` to take an ink keyline,
since the default cream edge would vanish into a cream fill.

Two mechanics worth flagging for later tickets:

- The paste angle uses the standalone `rotate` property, not `transform`, so a
  label can be a `motion` element and animate its entrance without the two
  fighting over one declaration.
- The name plate's own fade finishes at 0.3s, exactly when `DriftChar`'s first
  letter starts to rise, so the per-letter stagger is inherited untouched rather
  than being composited through a parent that is still fading.

`DriftChar`'s dead-token colors (`--color-mist`, the `#CC3766` hover) moved to
`paper`/`mustard`; the file no longer references any pre-redesign token.

Every scrap laps the one before it, not just the rows: the date scrap pulls left
onto the role label, and the link row pulls up onto both. That overlap sits on
the interactive layer, so each row's own box is `pointer-events-none` and the
scraps in it take the pointer back — otherwise the lapped strip would swallow
hover on the `DriftChar` letters underneath.

Legibility at narrow widths comes from letting the plate rewrap: the name is
split per word with a collapsible space between, so "ANDREI RECH" breaks to two
lines instead of overflowing, and both the role/date row and the link row are
`flex-wrap`. Verified by build and typecheck only — there is no browser
automation in this environment, so the visual pass is manual, per the spec's
Testing Decisions. The tilt/lap magnitudes in particular were reasoned about
rather than seen, so they are the first thing to nudge on that pass.

The section also moved from `justify-end` to `justify-center`: four stacked
scraps pinned to the bottom edge had nowhere to lap. No acceptance criterion
covers hero vertical placement, so this is noted as fallout, not as asked-for.

**Left for later, deliberately:** the LinkedIn/GitHub URLs are now hardcoded in
three files (`Navbar.tsx`, `ContactSection.tsx`, and here). The hero already
hardcoded them before this change, so it adds no duplication, but `data/` is the
established home for that data and a consolidation pass is worth its own ticket.
