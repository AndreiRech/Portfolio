Status: ready-for-agent

# Cowboy Bebop Visual Redesign

## Problem Statement

The site's current visual identity (dark glassmorphism, blurred glass panels, a soft animated 3D gradient background, muted midnight/rose accent colors, and a light/dark theme toggle) reads as a generic modern portfolio. The owner wants the portfolio to instead feel like it belongs to the world of *Cowboy Bebop* — a 90s noir-anime bounty-hunter aesthetic: bold block colors, stencil/stamped typography, worn poster and collage textures, film grain, and RGB glitch accents — while keeping the existing content, structure, and animation mechanics that already work well.

## Solution

Re-skin the entire site through its design-token layer and a handful of targeted component changes:

- Replace the color palette with a noir/jazz base (near-black background, deep purple, mustard, blood red) as the dominant identity, and introduce a secondary 4-color "block" palette (green/red/blue/yellow) used only to distinguish project categories.
- Replace the heading font with a bold stencil/condensed display face; keep a serif body face for readability.
- Remove glassmorphism entirely (including the navbar) in favor of solid "poster/label" panels with hard borders and offset shadows; the navbar becomes a torn/glued-poster panel with an irregular edge.
- Remove the animated 3D shader background; replace with a static, grain-textured dark background.
- Add film grain globally (subtle), halftone texture on featured imagery (profile photo, project card images), and RGB glitch flicker as a hover/reveal accent (interactive elements, section title entrances) — not a constant, page-wide effect.
- Restyle the custom cursor as a reticle/crosshair, keeping its existing magnetic-hover mechanic unchanged.
- Recompose the Hero as an overlapping, rotated sticker/label collage for the name and role (instead of centered plain type), keeping the existing per-letter magnetic drift interaction.
- Remove the light theme and the theme toggle UI; the site ships in one dark noir mode only. The language toggle (PT/EN) is unaffected and remains.
- Introduce a single pure function mapping each project category to one of the 4 block colors, used by the project filter buttons and category badges.

## User Stories

1. As a visitor, I want the site's color palette to evoke a noir/neon-nightscape mood, so that the portfolio feels distinctive rather than a generic dark-mode template.
2. As a visitor, I want section headings rendered in a bold stencil/stamped typeface, so that the site reads like a stylized poster rather than a standard SaaS site.
3. As a visitor, I want body text to stay in a legible serif face, so that reading project descriptions and experience details remains comfortable.
4. As a visitor, I want cards and panels (About, Experience, Projects, Contact) to look like solid printed labels rather than translucent glass, so that the visual language matches a vintage poster/collage aesthetic.
5. As a visitor, I want the navbar to look like a torn or glued poster fragment instead of a blurred glass pill, so that even the persistent chrome carries the theme.
6. As a visitor, I want the page background to be a static, grain-textured dark surface instead of an animated 3D gradient, so that the mood feels analog/vintage rather than techy/generic.
7. As a visitor, I want a subtle film grain over the whole page, so that the site feels like it was shot on film rather than rendered flat.
8. As a visitor, I want halftone-dot texture on featured images (profile photo, project thumbnails), so that imagery matches the comic/poster style of the reference art.
9. As a visitor, I want a brief RGB glitch flicker when I hover interactive elements or when a section title scrolls into view, so that the interface has a "signal glitch" personality without being distracting or constant.
10. As a visitor, I want my mouse cursor replaced by a reticle/crosshair shape, so that the cursor itself feels like part of the bounty-hunter theme.
11. As a visitor, I want the cursor's existing hover/grab state behavior (expand on interactive elements, drag hint on the projects carousel) to keep working exactly as it does today, just with new visuals.
12. As a visitor, I want the hero name and role to appear as overlapping, slightly rotated stickers/labels in themed colors, so that the hero reads as a poster collage rather than plain centered type.
13. As a visitor, I want the existing per-letter magnetic drift interaction on the hero name to still work after the redesign.
14. As a visitor, I want each project category (iOS, University, Personal, Others) to have a consistent, distinct block color (green/red/blue/yellow), so that I can visually distinguish categories at a glance in the filter buttons and on project cards.
15. As a visitor, I no longer want a light/dark theme toggle in the settings panel, since the site now ships in a single dark noir mode.
16. As a visitor, I still want to switch between Portuguese and English via the settings panel, since language preference is unrelated to the visual theme change.
17. As a visitor, I want section entrance animations (fade/slide into view) to keep their current smooth spring motion, so that the existing feel of the site is preserved.
18. As a visitor, I want the section title glitch-flicker to trigger once per entrance (not loop continuously), so that it reads as an accent rather than a distraction.
19. As a maintainer, I want the color and font redesign centralized in the existing CSS custom-property theme layer, so that I don't have to hunt through every component to reskin the site again in the future.
20. As a maintainer, I want the category → color mapping expressed as a single pure function, so that it's trivial to test and to extend if a new project category is added later.
21. As a maintainer, I want the shader-gradient dependency removed from the project once the animated background is gone, so that the dependency tree and bundle size don't carry dead weight.
22. As a maintainer, I want the theme-toggle code path (state, localStorage key, settings UI) fully removed rather than disabled, so that there's no dead/unreachable branch left behind.

## Implementation Decisions

- **Design tokens (`globals.css` `@theme inline` block + `:root` overrides)** is the single seam for the palette and font swap:
  - Replace `--color-midnight`, `--color-mist`, `--color-accent`, `--color-base`, `--color-desat` with a noir palette (near-black base, deep purple, mustard, blood red — exact hex values to be chosen during implementation, consistent with the reference imagery).
  - Add 4 new block-color tokens (green/red/blue/yellow) reserved for project-category usage only, not used as general-purpose accents elsewhere.
  - Remove the `:root.light` override block and all `:root.light` selectors (`.section-overlay::before`, `.glass`) — only one mode ships.
  - Swap `--font-heading` to a bold stencil/condensed display font loaded via `next/font/google` (replacing Archivo Black); keep `--font-body` on Literata.
- **Panel utility**: replace the `.glass` / `.glass-hover` utilities with a new solid "poster/label panel" utility (solid background color, solid border, hard offset drop-shadow, square-ish corners). Every current consumer of `.glass` (Navbar, About skill cards + photo frame, Experience timeline cards, Projects carousel cards, Contact cards) switches to this new utility.
- **Navbar**: gets a distinct treatment beyond the shared panel utility — an irregular/torn edge (implementation detail: CSS `clip-path` polygon or an SVG mask), still using the solid poster panel as its base fill. No backdrop blur anywhere on the navbar.
- **Background**: delete `ShaderBackground.tsx` and its usage in `ClientApp.tsx`; replace with a static dark background (a plain colored div, or a lightweight CSS/SVG grain texture) rendered in the same fixed, `-z-10` position it occupies today.
- **Grain**: a global, low-opacity film-grain overlay (CSS-only or a small tiled texture), applied once at the layout level so it covers every section consistently.
- **Halftone**: a CSS/SVG halftone-dot treatment applied specifically to the About profile photo and Projects carousel card images — not a global effect.
- **Glitch accent**: a small reusable RGB-offset flicker effect (CSS keyframes or a tiny wrapper component), triggered on (a) hover of interactive elements and (b) once when a section's `AnimatedSection`-wrapped title scrolls into view — reusing the existing `useInView` mechanism in `AnimatedSection` rather than introducing a new visibility observer.
- **Cursor**: `CustomCursor.tsx` keeps its existing state machine (`default` / `hover` / `grab`), motion values, and event wiring unchanged; only the rendered shape/style per state changes (reticle/crosshair instead of filled circle).
- **Hero**: `HeroSection.tsx` recomposes the name/role block as a set of overlapping, rotated label elements (using the new panel/label styling and noir palette colors) in place of the current single centered `SplitText` block; the existing `DriftChar` per-letter magnetic-hover component and its spring physics are reused as-is inside the new label composition.
- **Category color mapping**: add a single pure function (e.g. `getCategoryColor(category: ProjectCategory): string`) mapping each of `'iOS' | 'University' | 'Personal' | 'Others'` to one of the 4 new block-color tokens. `ProjectsSection.tsx`'s `FilterButtons` and `CarouselCard` (category label/badge) both call this function instead of hardcoding the shared accent color.
- **Theme removal**: remove `theme`/`toggleTheme` from `SettingsContext` (state, the `localStorage` `'theme'` key, and the `root.classList` light/dark toggling); remove the theme sun/moon toggle UI from `Navbar`'s settings panel, keeping only the language toggle. Remove the now-unused `theme_label` locale keys from `en.ts`/`pt.ts`.
- **Dependency cleanup**: remove `@shadergradient/react` and, if nothing else in the codebase uses it, `three`/`three-stdlib`/`camera-controls`/`@react-three/fiber` from `package.json` once `ShaderBackground.tsx` is deleted (verify no other consumer first).

## Testing Decisions

- This is a primarily visual redesign; there is no meaningful business logic to unit-test beyond one seam, and the main verification path is manual/visual (run the dev server, inspect Hero/Navbar/About/Experience/Projects/Contact in the browser, check both desktop and mobile breakpoints, confirm the glitch/grain/halftone accents don't hurt legibility or performance).
- The one pure, testable seam is `getCategoryColor`: a plain unit test (no rendering) asserting each `ProjectCategory` value maps to its expected block-color token, and that the mapping is exhaustive (every category in the `ProjectCategory` union has an entry) — similar in spirit to how `getProjects`/`getExperiences` are plain data-returning functions with no existing test coverage to model against, so this would be the first unit test in the repo; keep it minimal (a single small test file colocated with the mapping function).
- No visual regression/snapshot tooling exists in this repo today and none is being introduced as part of this spec — confirmed with the user that manual verification is acceptable for this change.

## Out of Scope

- Any change to page/section structure, content, copy, or data (projects, experience entries, skills list) beyond what's needed to apply the new visual theme.
- Adding decorative Japanese/katakana text or literal anime character artwork — the redesign borrows the aesthetic (color blocking, stencil type, poster texture) but does not reproduce copyrighted character likenesses or imagery.
- A "light but sepia/aged-poster" alternate theme — explicitly rejected in favor of a single dark noir mode.
- Visual regression/snapshot test infrastructure.
- Changes to the PT/EN language toggle or translation content beyond removing the now-dead `theme_label` keys.
- Changes to the Projects carousel's drag/keyboard-navigation mechanics, the `AnimatedSection` reveal mechanism itself, or the `CustomCursor` state machine — only their visual presentation changes.
- SEO/metadata changes in `layout.tsx` beyond what naturally follows from the visual change (e.g. no title/description rewrite requested).

## Further Notes

- Exact color hex values, the specific stencil display font, and the precise CSS technique for the navbar's torn edge (clip-path vs. SVG mask) are implementation-time choices, not fixed by this spec — they should stay faithful to the four reference images (Cowboy Bebop key art, the Spike Spiegel noir panel, the four-character color-block poster, and the distressed-label lockup) but aren't pinned to exact values here.
- The four block colors (green/red/blue/yellow) are reserved for project-category usage only; implementers should resist the temptation to sprinkle them elsewhere as general accents, since that was explicitly weighed and rejected in favor of a single coherent noir accent for the rest of the site.
