Status: ready-for-agent

# 10 — Reticle/crosshair custom cursor

**What to build:** `CustomCursor.tsx` is restyled from a filled circle into a reticle/crosshair, per `spec.md` user stories 10 and 11. This is the one implementation decision in the spec that never got a ticket in the original 01–08 breakdown, so the cursor is still wearing the pre-redesign palette: `STATE_CONFIG` hardcodes `#8384B1` and `#CC3766` — the old mist and rose accent — and the grab-state label still carries a dead `text-mist` class.

**Blocked by:** 01 (landed — provides the noir tokens)

- [ ] The cursor renders as a reticle/crosshair shape rather than a filled circle, in the noir palette
- [ ] `STATE_CONFIG`'s hardcoded hexes (`#8384B1`, `#CC3766`) are replaced by the noir palette; if the values must stay literal for Framer Motion's `animate`, they are read from the design tokens rather than restated by hand
- [ ] The grab-state "↔" label's dead `text-mist` class is migrated to the noir palette
- [ ] The existing `default` / `hover` / `grab` state machine, motion values, spring config, and event wiring are unchanged — only the rendered shape and colors change (`spec.md`: "keeps its existing state machine … unchanged; only the rendered shape/style per state changes")
- [ ] Each of the three states stays visually distinguishable, and the cursor remains visible against both the ink page surface and the lighter `.panel` cards
- [ ] The projects carousel's grab/drag hint still appears on `[data-cursor="grab"]`, and interactive elements still trigger the expanded hover state
