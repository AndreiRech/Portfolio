import test from "node:test";
import assert from "node:assert/strict";
import { contributionLevel } from "./contributionLevels.ts";
import snapshot from "../data/contributions.json" with { type: "json" };

test("twenty contributions remain a strong day even when another day has over two hundred", () => {
  assert.equal(contributionLevel(20), 3);
  assert.equal(contributionLevel(250), 4);
  assert.deepEqual(
    [0, 1, 5, 6, 15, 16, 40, 41, 200].map(contributionLevel),
    [0, 1, 1, 2, 2, 3, 3, 4, 4],
  );
});

test("real activity uses all five visual levels without modifying contribution counts", () => {
  const levels = new Set(
    snapshot.days.map((day) => contributionLevel(day.count)),
  );
  assert.equal(levels.size, 5);
  assert.ok(
    snapshot.days.some(
      (day) =>
        day.count >= 20 &&
        day.count <= 40 &&
        contributionLevel(day.count) === 3,
    ),
  );
});
