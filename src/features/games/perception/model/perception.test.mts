import assert from "node:assert/strict";
import test from "node:test";
import {
  colorScore,
  dailyColors,
  dailyPairs,
  parsePerception,
  scaleScore,
} from "./perception.ts";
test("five daily colors and size pairs are stable, distinct and within the controls", () => {
  for (let day = 1; day < 50; day++) {
    assert.deepEqual(dailyColors(day), dailyColors(day));
    assert.equal(dailyColors(day).length, 5);
    const pairs = dailyPairs(day);
    assert.deepEqual(pairs, dailyPairs(day));
    assert.equal(pairs.length, 5);
    assert.equal(
      new Set(pairs.map((p) => `${p.reference.shape}:${p.target.shape}`)).size,
      5,
    );
    for (const { reference, target } of pairs) {
      assert.notEqual(reference.shape, target.shape);
      assert.ok(
        target.meters / reference.meters >= 0.125 &&
          target.meters / reference.meters <= 8,
      );
    }
  }
  assert.notDeepEqual(dailyColors(1), dailyColors(2));
});
test("perceptual color score treats hue wraparound and neutral colors correctly", () => {
  assert.equal(colorScore([120, 50, 50], [120, 50, 50]), 100);
  assert.equal(colorScore([0, 0, 50], [240, 0, 50]), 100);
  assert.equal(colorScore([0, 100, 50], [360, 100, 50]), 100);
  assert.ok(colorScore([359, 100, 50], [0, 100, 50]) > 95);
  assert.ok(colorScore([0, 0, 0], [0, 0, 100]) < 10);
  assert.equal(scaleScore(1.7 / 3.2, 1.7 / 3.2), 100);
  assert.equal(scaleScore(2, 1), scaleScore(0.5, 1));
  assert.ok(scaleScore(1.1, 1) > scaleScore(2, 1));
});
test("restored rounds reject malformed and impossible progress", () => {
  for (const invalid of [
    null,
    {},
    { guesses: [[NaN]], phase: "result" },
    { guesses: [], phase: "result" },
    { guesses: Array(6).fill([1]), phase: "result" },
    { guesses: [[9]], phase: "result" },
    { guesses: [], phase: "preview" },
  ])
    assert.equal(parsePerception(invalid, "scale"), null);
  const color = { guesses: [[120, 50, 50]], phase: "result" };
  assert.deepEqual(parsePerception(color, "color"), color);
  assert.equal(
    parsePerception({ guesses: [[400, 50, 50]], phase: "result" }, "color"),
    null,
  );
  const finished = { guesses: Array(5).fill([1]), phase: "result" };
  assert.deepEqual(parsePerception(finished, "scale"), finished);
  assert.equal(
    parsePerception({ ...finished, phase: "adjust" }, "scale"),
    null,
  );
});
