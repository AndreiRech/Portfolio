import test from "node:test";
import assert from "node:assert/strict";
import { containPet, movePet } from "./companion.ts";
test("pets stay within desktop, mobile and small landscape bounds", () => {
  for (const [width, height, floor] of [
    [1440, 900, 96],
    [390, 844, 160],
    [320, 260, 160],
  ]) {
    for (const target of [
      { x: -200, y: -10 },
      { x: 9999, y: 9999 },
    ]) {
      const point = containPet(target, { width, height, floor });
      assert.ok(point.x >= 8 && point.x <= Math.max(8, width - 76));
      assert.ok(point.y >= 8 && point.y <= Math.max(8, height - floor - 76));
    }
  }
});
test("movement has the same speed in all directions and never overshoots", () => {
  assert.deepEqual(movePet({ x: 0, y: 0 }, { x: 3, y: 4 }, 2.5), {
    x: 1.5,
    y: 2,
  });
  assert.deepEqual(movePet({ x: 0, y: 0 }, { x: 3, y: 4 }, 10), { x: 3, y: 4 });
  assert.deepEqual(movePet({ x: 3, y: 4 }, { x: 3, y: 4 }, 10), { x: 3, y: 4 });
});
