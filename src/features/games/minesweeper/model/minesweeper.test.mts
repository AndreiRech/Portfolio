import assert from "node:assert/strict";
import test from "node:test";
import {
  LEVELS,
  flagCell,
  freshField,
  neighbors,
  openCell,
} from "./minesweeper.ts";
test("every difficulty guarantees a clear first opening and the requested mine count", () => {
  for (const level of ["easy", "normal", "hard"] as const)
    for (const seed of [0, 1, 42, 999]) {
      const initial = freshField(level),
        index = Math.floor(initial.side ** 2 / 2);
      const field = openCell(initial, index, LEVELS[level].mines, seed);
      assert.equal(field.mines.length, LEVELS[level].mines);
      assert.equal(new Set(field.mines).size, field.mines.length);
      for (const safe of [index, ...neighbors(index, field.side)])
        assert.ok(!field.mines.includes(safe));
      assert.ok(field.opened.includes(index));
      assert.ok(field.opened.every((cell) => !field.mines.includes(cell)));
      assert.notEqual(field.status, "lost");
    }
});
test("flags block opening, a mine loses, and all safe squares win", () => {
  const ready = freshField("easy");
  const flagged = flagCell(ready, 0);
  assert.equal(openCell(flagged, 0, 10, 42), flagged);
  assert.deepEqual(flagCell(flagged, 0), ready);
  const field = openCell(ready, 0, 10, 42);
  const lost = openCell(field, field.mines[0], 10, 42);
  assert.equal(lost.status, "lost");
  assert.equal(flagCell(lost, 1), lost);
  let win = field;
  for (let i = 0; i < 81; i++)
    if (!win.mines.includes(i)) win = openCell(win, i, 10, 42);
  assert.equal(win.status, "won");
  assert.equal(win.opened.length, 71);
  for (const index of [-1, 81, NaN, 1.5])
    assert.equal(openCell(field, index, 10, 42), field);
});

test("the minefield clock starts on the first opening and freezes on a win or loss", () => {
  const fresh = freshField("easy");
  assert.equal(flagCell(fresh, 0).clock.startedAt, null);
  const field = openCell(fresh, 0, 10, 1000);
  assert.equal(field.clock.startedAt, 1000);
  assert.equal(field.clock.finishedAt, null);
  const lost = openCell(field, field.mines[0], 10, 8000);
  assert.equal(lost.clock.finishedAt, 8000);
  assert.equal(openCell(lost, 1, 10, 9000), lost);
  let won = field;
  for (let index = 0; index < 81; index++)
    if (!won.mines.includes(index)) won = openCell(won, index, 10, 7000);
  assert.equal(won.status, "won");
  assert.deepEqual(won.clock, { startedAt: 1000, finishedAt: 7000 });
  assert.equal(freshField("easy").clock.startedAt, null);
});
