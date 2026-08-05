# 08 — Glitch RGB accent on hover and section-title reveal

**What to build:** A small, reusable RGB-offset glitch flicker effect that fires (a) on hover of interactive elements and (b) once when a section's title scrolls into view, reusing the existing `AnimatedSection` visibility mechanism rather than a new observer. This is the last visual layer, applied once the navbar, cards, and hero are already restyled.

**Blocked by:** 01, 04, 05, 06

- [x] A reusable glitch-flicker effect (CSS keyframes or a small wrapper component) applies a brief RGB-channel-offset flicker
- [x] Interactive elements (nav links, buttons, project filter buttons, contact links) trigger the glitch flicker on hover
- [x] Each section's title (About, Experience, Projects, Contact — the elements already wrapped in `AnimatedSection`) triggers the glitch flicker once when it scrolls into view, using `AnimatedSection`'s existing `useInView` state rather than a new IntersectionObserver
- [x] The glitch flicker plays once per title reveal (does not loop or repeat while the title stays in view)
- [x] The effect does not impair text legibility at any point during or after the flicker, and does not trigger on every scroll re-entry if `AnimatedSection`'s `once` behavior is active

## Notes

One `@keyframes glitch-flicker` in `globals.css` with two plain-class triggers,
`.glitch-hover` and `.glitch-reveal`. The split rides `text-shadow` rather than a
pair of absolutely positioned `::before`/`::after` copies of the string: shadows
inherit, so a contact tile splits its whole label off one class; there is no
duplicate of the text to fall out of sync with the other locale or to reach a
screen reader; and it costs no layout.

`AnimatedSection` now publishes its `useInView` state as `data-revealed`, and the
reveal is a descendant rule off that attribute — no second observer, per the
spec's stated seam. `once` (the default, and what every title uses) means the
attribute flips false → true exactly one time, so the flicker cannot loop or
replay on scrolling back through.

Fringe colors are `blood` and `plum` lifted toward `paper` (#B44F4A / #8C7896).
At full strength those two sit at 2.6:1 and 1.8:1 on ink — a fringe that dark on
a near-black page is a fringe nobody sees. The palette has no cyan and the block
colors are reserved for project categories, so the cool channel reads as a light
lavender ghost rather than a true RGB blue; that is the constraint, not an
oversight.

`steps(1, end)`, not an ease: each keyframe is held flat and jumped out of, where
a tween smears the fringes in and out and comes off as a soft glow.

Two calibrations made against renders of the real compiled stylesheet (no
Chrome/Playwright here; macOS QuickLook renders local HTML through WebKit):
- Shift is 2px on chrome-sized text but 3px under `.glitch-reveal` — the titles
  are 36–48px, where 2px all but disappears. Compared 2/3/4/5px on the real
  titles: 3px is the last step that still splits cleanly, past which the fringes
  fill the counters of E and R.
- Verified frame by frame that no keyframe touches the text's color or opacity,
  and that a finished title is pixel-identical to one that never animated —
  the animation carries no fill mode, so it leaves nothing behind.

Added beyond the ticket: `:focus-visible` fires the hover trigger too, so the
accent is not mouse-only, and a `prefers-reduced-motion: reduce` block drops the
effect outright. A hard chromatic stutter is exactly what that setting is asking
about, and it carries no information, so it is removed rather than softened.

Deliberately skipped: the icon-only navbar chrome (settings gear, mobile menu
toggle, the two social glyphs). A `text-shadow` split has nothing to grab on a
stroked SVG, and the `filter: drop-shadow()` variant that would work there
fringes the element's whole box — on a bordered button that reads as the button
breaking, not as a signal drop. They keep their existing color transition.

The project detail page's interactive elements are left alone; ticket 09 restyles
that page and can pick the effect up with the same class.
