# 03 — Category color mapping + project filter/badge colors

**What to build:** Each project category (iOS, University, Personal, Others) gets a consistent, distinct block color from the four new block-color tokens, visible on the Projects section's filter buttons and on each project card's category badge.

**Blocked by:** 01

- [ ] A single pure function (e.g. `getCategoryColor(category: ProjectCategory): string`) maps each of the four `ProjectCategory` values to one of the four block-color tokens from ticket 01
- [ ] The mapping is exhaustive — every value in the `ProjectCategory` union has an entry — and this is covered by a small colocated unit test (no rendering required)
- [ ] `ProjectsSection`'s `FilterButtons` use the mapped color per category (active/inactive states both read cleanly against the new noir background)
- [ ] Each `CarouselCard`'s category label/badge uses the same mapped color, consistent with its filter button
- [ ] The "All Projects" filter option does not use a category color (it's not a category) and keeps a neutral/noir treatment
