# 02 — Remove theme toggle and animated shader background

**What to build:** The site ships in a single dark noir mode — no light/dark toggle anywhere, no animated 3D shader background, and no dead code left behind from either. A static, grain-textured dark background replaces the shader.

**Blocked by:** 01

- [x] `SettingsContext` no longer exposes `theme`/`toggleTheme`; the `'theme'` localStorage key and `root.classList` light/dark toggling are removed entirely
- [x] The sun/moon theme toggle UI is removed from the Navbar's settings panel; the language (PT/EN) toggle remains and still works
- [x] The now-unused `theme_label` locale keys are removed from `en.ts` and `pt.ts`
- [x] `ShaderBackground.tsx` is deleted, along with its usage in `ClientApp.tsx`
- [x] A static dark background with a subtle, low-opacity film-grain overlay renders in the same fixed, page-covering position `ShaderBackground` used to occupy
- [x] `@shadergradient/react` is removed from `package.json`; `three`, `three-stdlib`, `camera-controls`, and `@react-three/fiber` are removed too if nothing else in the codebase imports them (verify before removing)
- [x] Visiting the site shows one consistent dark theme with no flash of a now-removed light mode and no console errors about missing theme state
