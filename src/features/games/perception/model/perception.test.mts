import assert from "node:assert/strict";
import test from "node:test";
import {
  OBJECTS,
  SCALE_PAIRS,
  colorScore,
  dailyColors,
  dailyPairs,
  parsePerception,
  scaleScore,
} from "./perception.ts";
import { isTrimmedSprite } from "./pixelSilhouette.ts";
test("five daily colors and size pairs are stable, distinct and within the controls", () => {
  for (let day = 1; day < 1000; day++) {
    assert.deepEqual(dailyColors(day), dailyColors(day));
    assert.equal(dailyColors(day).length, 5);
    const pairs = dailyPairs(day);
    assert.deepEqual(pairs, dailyPairs(day));
    assert.equal(pairs.length, 5);
    assert.equal(
      new Set(
        pairs.map((p) => [p.reference.shape, p.target.shape].sort().join(":")),
      ).size,
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

test("every catalog entry is trimmed pixel art and every supported pair occurs once", () => {
  assert.equal(OBJECTS.length, 142);
  assert.equal(new Set(OBJECTS.map((object) => object.shape)).size, 142);
  for (const object of OBJECTS) {
    assert.ok(isTrimmedSprite(object.art), object.shape);
    // Wide enough to read, never wider than the stage half can fit.
    assert.ok(object.art.length >= 9, object.shape);
    assert.ok(object.art[0].length / object.art.length <= 4.5, object.shape);
    assert.ok(Number.isFinite(object.meters) && object.meters > 0);
    assert.ok(object.pt && object.en);
    assert.ok(
      SCALE_PAIRS.filter(
        (pair) => pair.reference === object || pair.target === object,
      ).length >= 10,
      object.shape,
    );
  }
  assert.equal(SCALE_PAIRS.length, 4269);
  assert.equal(
    new Set(
      SCALE_PAIRS.map((pair) =>
        [pair.reference.shape, pair.target.shape].sort().join(":"),
      ),
    ).size,
    SCALE_PAIRS.length,
  );
});
