# 05 — Poster-panel restyle for About, Experience, and Contact cards

**What to build:** Every glass card outside the hero and navbar — the About photo frame and skill-group cards, the Experience timeline entry cards, and the Contact link cards — switches to the new solid poster-panel styling, so the whole page (minus hero/navbar, handled separately) reads as one consistent visual language.

**Blocked by:** 01

- [ ] `AboutSection`'s profile-photo frame and skill-category cards use the new panel utility instead of `.glass`
- [ ] `ExperienceSection`'s timeline entry cards use the new panel utility instead of `.glass`; the timeline line/dot accent colors are updated to the new noir palette
- [ ] `ContactSection`'s email/LinkedIn/GitHub link cards use the new panel utility instead of `.glass`
- [ ] No remaining usages of the removed `.glass`/`.glass-hover` classes exist anywhere in `src/components/sections/`
- [ ] Hover states on these cards (e.g. `hover:border-accent/30`) are re-expressed using the new noir accent color and still give clear interactive feedback
