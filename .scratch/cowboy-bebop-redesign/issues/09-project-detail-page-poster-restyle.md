# 09 — Poster restyle for the project detail page

**What to build:** `ProjectDetails.tsx` — the `/projects/[id]` page — gets the same poster/noir treatment the home page already has. It was missed at spec level: `spec.md`'s panel-utility decision lists only "Navbar, About skill cards + photo frame, Experience timeline cards, Projects carousel cards, Contact cards", and ticket 05's fourth criterion scoped itself to `src/components/sections/`, which this file sits outside of. It is currently the largest broken surface in the redesign: ~67 class references to utilities and tokens that ticket 01 deleted (`glass`, `border-glass-border`, `accent`, `mist`, `desat`, `base`, `midnight`). Tailwind emits nothing for any of them, so the page renders as transparent boxes with inherited text color.

**Blocked by:** 01 (landed — provides `.panel`, `.panel-hover`, `.tag-chip`, and the noir tokens)

- [x] The page shell (`<main>`: `bg-base text-mist selection:bg-accent selection:text-mist`) uses the noir tokens; the page background matches the home page's ink surface
- [x] Every `.glass` surface becomes the panel utility from ticket 01: the logo frame, the gallery/media cards, the link buttons, and the team-member cards
- [x] The technology and role chips reuse the shared `.tag-chip` utility rather than restating its border/background inline (precedent: ticket 05)
- [x] Hover states (`hover:text-accent`, `hover:border-accent`) are re-expressed on the noir accent and still give clear interactive feedback; card hovers use `.panel-hover` for consistency with the home page
- [x] The award pills drop the stock `bg-yellow-500/60` for a palette color — mustard, not a reserved block color, since an award is site chrome and not a project category
- [x] The category badge reuses the `.category-badge` utility and `getCategoryColor()` from ticket 03, so a project's category reads in the same block color here as on its carousel card and filter chip
- [x] The `border-b border-glass-border` section rules and the `rounded-xl`/`2xl`/`3xl`/`full` radii are restated in the poster language (square-ish corners, `panel-border` rules)
- [x] No remaining usages of `.glass`/`.glass-hover` or the deleted `accent`/`mist`/`desat`/`base`/`midnight` tokens exist anywhere in `src/components/`
- [x] The gallery carousel's existing drag/scroll mechanics are untouched — only its visual presentation changes

**Out of scope:** halftone on the gallery images (ticket 07 deliberately covers only the About photo and the carousel card images) and the glitch hover accent on this page's links (ticket 08).

## Notes

`ProjectDetails` now consumes the same noir tokens and shared poster utilities as
the home page. Category colors come directly from `getCategoryColor()`, while
awards deliberately use mustard so the reserved project-category colors remain
exclusive to category identity. The gallery's mouse handlers and scroll state
were left unchanged.
