import test from "node:test";
import assert from "node:assert/strict";
import { initialMemory, memoryReducer, type MemoryState } from "./memory.ts";

test("a round only accepts the sequence in order, after playback", () => {
  let state = memoryReducer(initialMemory, { type: "start", pad: 2 });
  assert.equal(memoryReducer(state, { type: "press", pad: 2 }), state);
  state = memoryReducer(state, { type: "ready" });
  state = memoryReducer(state, { type: "press", pad: 2 });
  assert.equal(state.phase, "success");
  assert.equal(state.best, 1);
  state = memoryReducer(state, { type: "next", pad: 0 });
  assert.deepEqual(state.sequence, [2, 0]);
  state = memoryReducer(state, { type: "ready" });
  state = memoryReducer(state, { type: "press", pad: 2 });
  assert.equal(state.phase, "input");
  state = memoryReducer(state, { type: "press", pad: 0 });
  assert.equal(state.phase, "success");
  assert.equal(state.best, 2);
});

test("a wrong pad ends the round and restarting retains only the session best", () => {
  const input: MemoryState = {
    phase: "input",
    sequence: [0, 3],
    inputIndex: 0,
    best: 4,
  };
  const lost = memoryReducer(input, { type: "press", pad: 3 });
  assert.equal(lost.phase, "lost");
  assert.equal(memoryReducer(lost, { type: "press", pad: 0 }), lost);
  assert.deepEqual(memoryReducer(lost, { type: "start", pad: 1 }), {
    ...initialMemory,
    phase: "watch",
    sequence: [1],
    best: 4,
  });
});

test("next is ignored until the round is cleared", () => {
  const input: MemoryState = {
    phase: "input",
    sequence: [0, 0, 3],
    inputIndex: 2,
    best: 2,
  };
  assert.equal(memoryReducer(input, { type: "next", pad: 1 }), input);
});

test("all five signs can join a sequence, including consecutive Axii casts", () => {
  const input: MemoryState = {
    phase: "input",
    sequence: [0, 1, 2, 3, 4, 4],
    inputIndex: 0,
    best: 0,
  };
  const result = input.sequence.reduce(
    (state, pad) => memoryReducer(state, { type: "press", pad }),
    input,
  );
  assert.equal(result.phase, "success");
  assert.equal(result.best, 6);
  const next = memoryReducer(result, { type: "next", pad: 4 });
  assert.deepEqual(next.sequence, [0, 1, 2, 3, 4, 4, 4]);
  assert.equal(next.phase, "watch");
});

test("difficulty levels narrow signs on easy and speed up on hard", async () => {
  const { MEMORY_LEVELS, isMemoryLevel } = await import("./memory.ts");
  assert.equal(MEMORY_LEVELS.easy.pads, 3);
  assert.equal(MEMORY_LEVELS.normal.pads, 5);
  assert.ok(MEMORY_LEVELS.hard.lit < MEMORY_LEVELS.normal.lit);
  assert.ok(MEMORY_LEVELS.hard.gap < MEMORY_LEVELS.normal.gap);
  assert.ok(isMemoryLevel("hard"));
  assert.ok(!isMemoryLevel("constructor"));
});
