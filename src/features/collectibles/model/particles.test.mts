import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_LIVE_PARTICLES,
  capParticles,
  particle,
  stepParticles,
  stillFrame,
} from "./particles.ts";
import { CLICK_EFFECTS } from "../data/clickEffects.ts";
import { TRAILS } from "../data/trails.ts";
import { REWARDS } from "../data/collectibles.ts";

const seeded =
  (seed = 1) =>
  () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

test("particles move with their velocity and gravity, then expire", () => {
  const [moved] = stepParticles(
    [particle({ x: 10, y: 20, vx: 100, vy: 0, gravity: 200, life: 1 })],
    0.5,
  );
  assert.equal(moved.x, 60);
  assert.equal(moved.vy, 100);
  assert.equal(moved.y, 70);
  assert.equal(moved.age, 0.5);
  assert.deepEqual(stepParticles([moved], 0.6), []);
});

test("delayed particles wait in place before they start", () => {
  const [waiting] = stepParticles(
    [particle({ x: 0, y: 0, vx: 50, life: 0.2, delay: 0.1 })],
    0.05,
  );
  assert.equal(waiting.x, 0);
  assert.equal(waiting.delay, 0.05);
  assert.equal(waiting.age, 0);
});

test("the live particle count is capped, keeping the newest", () => {
  const many = Array.from({ length: MAX_LIVE_PARTICLES + 20 }, (_, index) =>
    particle({ x: index, y: 0, life: 1 }),
  );
  const kept = capParticles(many);
  assert.equal(kept.length, MAX_LIVE_PARTICLES);
  assert.equal(kept.at(-1)!.x, MAX_LIVE_PARTICLES + 19);
  assert.equal(capParticles(kept.slice(0, 3)).length, 3);
});

test("reduced motion turns an effect into one short still flash", () => {
  const flash = stillFrame([
    particle({ x: 1, y: 2, vx: 40, vy: -40, gravity: 900, life: 2 }),
    particle({ x: 5, y: 5, life: 1, delay: 0.2 }),
  ]);
  assert.equal(flash.length, 2);
  for (const item of flash) {
    assert.equal(item.vx, 0);
    assert.equal(item.vy, 0);
    assert.equal(item.gravity, 0);
    assert.equal(item.delay, 0);
    assert.ok(item.life <= 0.15);
  }
});

test("every cursor reward has a click effect with a bounded burst", () => {
  const cursors = REWARDS.filter((reward) => reward.kind === "cursor");
  assert.deepEqual(
    Object.keys(CLICK_EFFECTS).sort(),
    cursors.map((reward) => reward.id).sort(),
  );
  for (const reward of cursors) {
    const burst = CLICK_EFFECTS[reward.id](100, 100, seeded());
    assert.ok(burst.length >= 1 && burst.length <= 40, reward.id);
    for (const item of burst) {
      assert.ok(Number.isFinite(item.x) && Number.isFinite(item.y));
      assert.ok(item.life > 0 && item.life <= 2, reward.id);
    }
  }
});

test("every trail reward has art and emits a few finite particles", () => {
  const trails = REWARDS.filter((reward) => reward.kind === "trail");
  assert.deepEqual(
    Object.keys(TRAILS).sort(),
    trails.map((reward) => reward.id).sort(),
  );
  for (const reward of trails) {
    const trail = TRAILS[reward.id];
    const emitted = trail.emit(50, 50, 6, -2, seeded());
    assert.ok(emitted.length >= 1 && emitted.length <= 8, reward.id);
    assert.ok(emitted.every((item) => Number.isFinite(item.x + item.y)));
    assert.ok(trail.art.every((row) => row.length === trail.art.length));
    for (const key of trail.art.join("").replaceAll(".", ""))
      assert.ok(key in trail.palette, `${reward.id} uses ${key}`);
  }
});
