import test from "node:test";
import assert from "node:assert/strict";
import {
  breathe,
  ellipse,
  grid,
  outline,
  polygon,
  shift,
  toRows,
} from "./pixelSprite.ts";

const ramp = { light: "l", mid: "m", dark: "d" };

test("ellipses are lit from the top left and shaded bottom right", () => {
  const rows = toRows(ellipse(grid(16), 8, 8, 6, 6, ramp));
  assert.equal(rows[8][8], "m");
  assert.equal(rows[3][4], "l");
  assert.equal(rows[12][10], "d");
  assert.equal(rows[0], ".".repeat(16));
});

test("a floor flattens an ellipse", () => {
  const rows = toRows(ellipse(grid(16), 8, 8, 6, 6, ramp, 10));
  assert.ok(/[lmd]/.test(rows[10]));
  assert.equal(rows[11], ".".repeat(16));
});

test("polygons get a lit top edge and a shaded bottom edge", () => {
  const rows = toRows(
    polygon(
      grid(8),
      [
        [1, 1],
        [7, 1],
        [7, 7],
        [1, 7],
      ],
      ramp,
    ),
  );
  assert.equal(rows[1].slice(1, 6), "lllll");
  assert.equal(rows[6].slice(1, 7), "dddddd");
  assert.equal(rows[3][3], "m");
});

test("outline wraps the silhouette without touching the inside", () => {
  const rows = toRows(outline(ellipse(grid(12), 6, 6, 3, 3, ramp)));
  assert.equal(rows[6][2], "o");
  assert.equal(rows[6][6], "m");
  assert.equal(rows[0], ".".repeat(12));
});

test("shift and breathe keep the grid size", () => {
  const rows = ["ab..", "cd..", "ef..", "gh.."];
  assert.deepEqual(shift(rows, 1, 1), ["....", ".ab.", ".cd.", ".ef."]);
  assert.deepEqual(breathe(rows, 2), ["....", "ab..", "ef..", "gh.."]);
});
