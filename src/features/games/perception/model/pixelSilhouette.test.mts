import assert from "node:assert/strict";
import test from "node:test";
import {
  isTrimmedSprite,
  spriteAspect,
  spriteFill,
  spriteOutline,
} from "./pixelSilhouette.ts";

test("fill merges each row into horizontal runs", () => {
  assert.equal(
    spriteFill(["##.#", "####"]),
    "M0 0h2v1h-2zM3 0h1v1h-1zM0 1h4v1h-4z",
  );
});

test("outline traces only edges between filled and empty pixels", () => {
  // A 2×2 block has a 4-segment border and no inner seams.
  assert.equal(spriteOutline(["##", "##"]), "M0 0h2M0 2h2M0 0v2M2 0v2");
  // A hole adds its own border.
  const ring = spriteOutline(["###", "#.#", "###"]);
  assert.match(ring, /M1 1h1/);
  assert.match(ring, /M1 2h1/);
  assert.match(ring, /M1 1v1/);
  assert.match(ring, /M2 1v1/);
});

test("aspect and trimming checks use the grid", () => {
  assert.equal(spriteAspect(["####", "####"]), 2);
  assert.ok(isTrimmedSprite(["#.", ".#"]));
  assert.ok(!isTrimmedSprite(["..", "##"]));
  assert.ok(!isTrimmedSprite(["#.", "#."]));
  assert.ok(!isTrimmedSprite(["##", "#"]));
  assert.ok(!isTrimmedSprite(["#x"]));
});
