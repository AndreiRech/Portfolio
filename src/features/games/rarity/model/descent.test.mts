import assert from "node:assert/strict";
import test from "node:test";
import { emptyCollection } from "../../../collectibles/model/collection.ts";
import {
  biomeOf,
  bodyAt,
  depthAfter,
  depthBefore,
  descentSeconds,
  helmetAt,
  pickCompanion,
} from "./descent.ts";
import { initialRarity } from "./rarity.ts";

test("biomes change every ten floors", () => {
  assert.equal(biomeOf(0), "stone");
  assert.equal(biomeOf(9), "stone");
  assert.equal(biomeOf(10), "catacombs");
  assert.equal(biomeOf(29), "crystals");
  assert.equal(biomeOf(30), "lava");
  assert.equal(biomeOf(49), "lair");
  assert.equal(biomeOf(50), "treasure");
});

test("a descent takes one hop per floor", () => {
  assert.ok(Math.abs(descentSeconds(10) - 10 * 0.42) < 1e-9);
  assert.equal(descentSeconds(0), 0);
});

test("the body rests before and after the hops", () => {
  const before = bodyAt(-1, 3, 0);
  assert.deepEqual([before.x, before.y, before.lift], [0, 0, 0]);
  const after = bodyAt(descentSeconds(3), 3, 0);
  assert.deepEqual([after.x, after.y, after.lift], [96, 48, 0]);
});

test("the body moves continuously between hops", () => {
  for (let n = 1; n <= 4; n++) {
    const a = bodyAt(n * 0.42 - 1e-6, 5, 0);
    const b = bodyAt(n * 0.42 + 1e-6, 5, 0);
    assert.ok(Math.abs(a.x - b.x) < 0.5, `hop ${n}: ${a.x} → ${b.x}`);
    assert.ok(Math.abs(a.y - b.y) < 0.5, `hop ${n}: ${a.y} → ${b.y}`);
  }
});

test("the helmet stays on the head", () => {
  let pressed = false;
  let lifted = false;
  for (let t = 0; t <= descentSeconds(10) + 1; t += 1 / 120) {
    const helmet = helmetAt(t, 10, t);
    assert.ok(helmet.press === 0 || helmet.press === 1, `press at ${t}`);
    assert.ok(helmet.lifted >= -2 && helmet.lifted <= 0, `lifted at ${t}`);
    pressed ||= helmet.press === 1;
    lifted ||= helmet.lifted < 0;
  }
  assert.ok(pressed, "the helmet is pushed onto the head on take-off");
  assert.ok(lifted, "the helmet trails behind the head");
});

test("depth accumulates points and ignores skips", () => {
  const state = {
    rounds: [
      { answer: "a", points: 3 },
      { answer: null, points: 0 },
      { answer: "b", points: 7 },
    ],
  };
  assert.equal(depthAfter(state), 10);
  assert.equal(depthBefore(state), 3);
  assert.equal(depthAfter(initialRarity()), 0);
  assert.equal(depthBefore(initialRarity()), 0);
});

test("the visitor's own companion is chosen first", () => {
  const owned = {
    ...emptyCollection(),
    counts: { chicken: 1, d20: 1 },
    equipped: {
      palette: null,
      cursor: null,
      companion: "chicken",
      trail: null,
    },
  };
  assert.equal(pickCompanion(owned, "d20"), "d20");
  assert.equal(pickCompanion(owned, null), "chicken");
  assert.equal(pickCompanion(owned, "medallion"), "chicken");
  const unequipped = {
    ...owned,
    equipped: { ...owned.equipped, companion: null },
  };
  assert.equal(pickCompanion(unequipped, null), "d20");
  const stale = {
    ...owned,
    equipped: { ...owned.equipped, companion: "gold-d20" },
  };
  assert.equal(pickCompanion(stale, null), "d20");
  assert.equal(pickCompanion(emptyCollection(), null), null);
});
