# Size it up: pixel art catalog

- Catalog: 100 vector icons (Font Awesome + PhyloPic/Openclipart) → 142 original pixel art sprites. Nothing is imported anymore: the SVG sprite sheet, the credits file and the Font Awesome license were removed.
- New themes: 34 monuments (Giza pyramid and sphinx, El Castillo, Tikal, Babylon ziggurat, Ishtar Gate, Colosseum, Eiffel, Burj Khalifa, Christ the Redeemer, Sugarloaf…), 23 geek characters (Pikachu, Pickle Rick, Yoda, Vader, R2-D2, AT-AT, Godzilla, Colossal Titan, Creeper, Enderman…), 35 animals and plants, 50 vehicles and objects (Game Boy, arcade cabinet, Rubik's Cube, D20, LEGO minifigure…).
- Dropped bad shapes: diagonal tools (pencil, spoon, key, hammer, screwdriver, carrot, chili, wheat, guitar, football), top views (mosquito, spider), groups (beetles, champagne glasses, fork and knife) and hollow icons (laptop, monitor, tablet, keyboard, trash can).
- Unordered comparisons: 3,552 → 4,269. Every sprite takes part in at least 10.
- Seed and save key moved to `scale-v3` / `perception-scale-v3`.
- Contact sheets reviewed: `pixel-art/{landmarks,characters,creatures,objects}.png`. The generator used to draw them is in `pixel-art/authoring/` (`node build.mjs [--emit]`).
- Tests: 150 passed (`npm test`), including new `pixelSilhouette.test.mts` and the catalog test (trimmed grids, ≥ 9 rows, aspect ≤ 4.5, ≥ 10 pairs each).
- TypeScript (`npx tsc --noEmit`) and ESLint passed.
- Browser (dev server, desktop 1280 and mobile 390): rounds render crisp pixel art; the correct-size outline traces only the outer pixel edges (`game-result.png`).
