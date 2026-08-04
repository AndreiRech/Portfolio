# 08 — Glitch RGB accent on hover and section-title reveal

**What to build:** A small, reusable RGB-offset glitch flicker effect that fires (a) on hover of interactive elements and (b) once when a section's title scrolls into view, reusing the existing `AnimatedSection` visibility mechanism rather than a new observer. This is the last visual layer, applied once the navbar, cards, and hero are already restyled.

**Blocked by:** 01, 04, 05, 06

- [ ] A reusable glitch-flicker effect (CSS keyframes or a small wrapper component) applies a brief RGB-channel-offset flicker
- [ ] Interactive elements (nav links, buttons, project filter buttons, contact links) trigger the glitch flicker on hover
- [ ] Each section's title (About, Experience, Projects, Contact — the elements already wrapped in `AnimatedSection`) triggers the glitch flicker once when it scrolls into view, using `AnimatedSection`'s existing `useInView` state rather than a new IntersectionObserver
- [ ] The glitch flicker plays once per title reveal (does not loop or repeat while the title stays in view)
- [ ] The effect does not impair text legibility at any point during or after the flicker, and does not trigger on every scroll re-entry if `AnimatedSection`'s `once` behavior is active
