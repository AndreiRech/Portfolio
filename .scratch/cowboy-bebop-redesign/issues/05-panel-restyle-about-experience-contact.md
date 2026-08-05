# 05 — Poster-panel restyle for About, Experience, and Contact cards

**What to build:** Every glass card outside the hero and navbar — the About photo frame and skill-group cards, the Experience timeline entry cards, and the Contact link cards — switches to the new solid poster-panel styling, so the whole page (minus hero/navbar, handled separately) reads as one consistent visual language.

**Blocked by:** 01

- [x] `AboutSection`'s profile-photo frame and skill-category cards use the new panel utility instead of `.glass`
- [x] `ExperienceSection`'s timeline entry cards use the new panel utility instead of `.glass`; the timeline line/dot accent colors are updated to the new noir palette
- [x] `ContactSection`'s email/LinkedIn/GitHub link cards use the new panel utility instead of `.glass`
- [x] No remaining usages of the removed `.glass`/`.glass-hover` classes exist anywhere in `src/components/sections/`
- [x] Hover states on these cards (e.g. `hover:border-accent/30`) are re-expressed using the new noir accent color and still give clear interactive feedback

## Notes

Criterion 4 pulled `ProjectsSection`'s carousel card in with the three sections
the ticket names — it was the last `.glass` consumer under `src/components/sections/`.
Its active-card state moved from a colored shadow bloom to a mustard border, and it
deliberately skips `.panel-hover`: mustard is spoken for there as the active-card
signal, so an inactive card brightens to `smoke` on hover instead.

The tech/skill chip repeated across all three panels became a `.tag-chip` utility in
`globals.css`, following the `.filter-chip` / `.category-badge` precedent.

**Not covered by this or any other ticket:** `src/components/ProjectDetails.tsx` still
consumes `.glass` and the deleted `accent`/`mist`/`desat`/`base`/`midnight` tokens, so
the project-detail page renders unstyled. `CustomCursor.tsx` has one dead `text-mist`.
Both need a ticket of their own. (`HeroSection`'s dead tokens are ticket 06's job.)
