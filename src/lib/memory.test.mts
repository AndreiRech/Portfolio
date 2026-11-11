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

test("replaying clears partial input without extending the sequence", () => {
  const input: MemoryState = {
    phase: "input",
    sequence: [0, 0, 3],
    inputIndex: 2,
    best: 2,
  };
  const replay = memoryReducer(input, { type: "replay" });
  assert.equal(replay.phase, "watch");
  assert.equal(replay.inputIndex, 0);
  assert.deepEqual(replay.sequence, [0, 0, 3]);
  assert.equal(memoryReducer(input, { type: "next", pad: 1 }), input);
});
