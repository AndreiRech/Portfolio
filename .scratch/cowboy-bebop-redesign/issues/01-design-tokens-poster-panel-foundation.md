# 01 — Design tokens + poster-panel utility foundation

**What to build:** Replace the site's color and font design tokens with the Cowboy Bebop noir palette and stencil heading font, and introduce a solid "poster/label panel" utility to replace glassmorphism. This ticket only lands the foundation — no component needs to consume the new utility yet, but the tokens and utility classes must be fully defined and ready for later tickets to apply. Reference art lives in `docs/references/` (four images: the four-character color-block poster, the Spike Spiegel noir panel, the Cowboy Bebop logo key art, and the distressed name/role label lockup) — use it to guide exact hex values and texture feel.

**Blocked by:** None — can start immediately

- [x] `globals.css`'s `@theme inline` block defines a noir palette (near-black base, deep purple, mustard, blood red) replacing `--color-midnight`/`--color-mist`/`--color-accent`/`--color-base`/`--color-desat`
- [x] Four new "block color" tokens (green/red/blue/yellow) are defined, documented as reserved for project-category usage only (not general-purpose accents)
- [x] The `:root.light` override block and all `:root.light`-scoped selectors are removed — only one (dark/noir) mode exists in the stylesheet
- [x] `--font-heading` is swapped to a bold stencil/condensed display font loaded via `next/font/google` (replacing Archivo Black); `--font-body` stays on Literata
- [x] A new solid panel utility (e.g. `.panel`) exists: solid background color, solid border, hard offset drop-shadow, square-ish corners — no backdrop blur
- [x] The old `.glass`/`.glass-hover` utilities and their light-mode overrides are removed from `globals.css`
- [x] `npm run build` (or `next build`) succeeds with no components broken by the removed `.glass` classes yet unconsumed — i.e. this ticket doesn't need to touch component files, only the stylesheet
