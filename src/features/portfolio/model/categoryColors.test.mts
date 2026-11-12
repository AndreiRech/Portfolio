// src/lib/categoryColors.test.mts
// `.mts` so Node reads it as ESM without the repo declaring "type": "module".
import test from "node:test";
import assert from "node:assert/strict";

import { getCategoryColor } from "./categoryColors.ts";
import { PROJECT_CATEGORIES } from "./types.ts";

test("maps each category to its block-color token", () => {
  assert.equal(getCategoryColor("iOS").block, "var(--color-block-blue)");
  assert.equal(
    getCategoryColor("University").block,
    "var(--color-block-green)",
  );
  assert.equal(getCategoryColor("Personal").block, "var(--color-block-red)");
  assert.equal(getCategoryColor("Others").block, "var(--color-block-yellow)");
});

test("mapping is exhaustive — every ProjectCategory resolves to a block color", () => {
  for (const category of PROJECT_CATEGORIES) {
    assert.match(
      getCategoryColor(category).block,
      /^var\(--color-block-(green|red|blue|yellow)\)$/,
      `${category} has no block color`,
    );
  }
});

test("no two categories share a block color", () => {
  const blocks = PROJECT_CATEGORIES.map((c) => getCategoryColor(c).block);
  assert.equal(new Set(blocks).size, PROJECT_CATEGORIES.length);
});

// The four block colors span too wide a lightness range for one text color to
// read on all of them, so every entry has to name its own — see CategoryColor.
test("every category pairs its block color with a legible text color", () => {
  for (const category of PROJECT_CATEGORIES) {
    const { on } = getCategoryColor(category);
    assert.ok(
      on === "var(--color-ink)" || on === "var(--color-paper)",
      `${category} has no ink/paper text color, got ${on}`,
    );
  }
});
