# 04 — Navbar as torn/glued poster panel

**What to build:** The navbar no longer looks like a blurred glass pill — it reads as a torn or glued poster fragment, using the new noir palette and panel styling, with an irregular edge instead of a clean rounded rect. Reference art in `docs/references/` (particularly the distressed name/role label lockup) shows the torn/layered-label feel to aim for.

**Blocked by:** 01, 02

- [x] The navbar's background uses the new solid poster-panel styling from ticket 01 (no backdrop blur, no translucency)
- [x] The navbar has a distinct irregular/torn edge (via CSS `clip-path` polygon or an SVG mask) rather than the current `rounded-full` pill shape
- [x] The navbar no longer contains a theme toggle (already removed in ticket 02) — only the language toggle and nav links remain in the settings/menu area
- [x] Desktop nav links, the mobile menu, and the settings dropdown all read legibly against the new panel background and edge treatment
- [x] The navbar remains fixed/floating on scroll and its existing show/hide-on-scroll and active-section-highlighting behavior is unchanged
