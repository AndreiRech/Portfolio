import test from "node:test";
import assert from "node:assert/strict";
import { containPet, movePet, petFacing } from "./companion.ts";
import { FACES_LEFT, PET_SPRITES } from "../data/petSprites.ts";
import { REWARDS } from "../../collectibles/data/collectibles.ts";

test("every collectible companion has complete square animation frames and defined pixel colors", () => {
  for (const reward of REWARDS.filter(
    (reward) => reward.kind === "companion",
  )) {
    const sprite = PET_SPRITES[reward.id];
    assert.ok(sprite, reward.id);
    const size = sprite.frames.idle.length;
    for (const [frame, rows] of Object.entries(sprite.frames)) {
      assert.equal(rows.length, size, `${reward.id}/${frame}`);
      for (const row of rows) {
        assert.equal(row.length, size, `${reward.id}/${frame}: ${row}`);
        for (const pixel of row) {
          assert.ok(
            pixel === "." || sprite.palette[pixel],
            `${reward.id}: ${pixel}`,
          );
        }
      }
    }
    assert.notDeepEqual(sprite.frames.blink, sprite.frames.idle, reward.id);
    // A four-beat cycle needs both extra frames, and every beat must differ.
    const { walkA, walkB, walkC, walkD } = sprite.frames;
    assert.equal(Boolean(walkC), Boolean(walkD), reward.id);
    const beats = [walkA, walkB, walkC, walkD].filter(Boolean);
    assert.equal(
      new Set(beats.map((rows) => rows?.join("\n"))).size,
      beats.length,
      `${reward.id}: repeated walk frame`,
    );
  }
});
test("walking side-view pets keep their feet on the ground", () => {
  for (const id of ["cat", "frog"]) {
    const { idle, walkA } = PET_SPRITES[id].frames;
    const lastRow = (rows: string[]) =>
      rows.findLastIndex((row) => /[^.]/.test(row));
    assert.equal(lastRow(idle), 22, id);
    assert.equal(lastRow(walkA), 22, id);
  }
});
test("side-view pets are marked as facing left so scenes mirror them", () => {
  // A front-view pet is close to symmetric; a side view is not.
  for (const [id, sprite] of Object.entries(PET_SPRITES)) {
    const asymmetric = sprite.frames.idle.flatMap((row) =>
      [...row].filter(
        (pixel, i) => (pixel === ".") !== (row.at(-1 - i) === "."),
      ),
    ).length;
    assert.equal(FACES_LEFT.has(id), asymmetric > 60, `${id}: ${asymmetric}`);
  }
});
test("left-facing artwork is mirrored only when walking right and keeps its facing vertically", () => {
  assert.equal(petFacing({ x: 50, y: 50 }, { x: 60, y: 50 }), -1);
  assert.equal(petFacing({ x: 50, y: 50 }, { x: 40, y: 50 }), 1);
  assert.equal(petFacing({ x: 50, y: 50 }, { x: 50, y: 70 }, -1), -1);
});
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
