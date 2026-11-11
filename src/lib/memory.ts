export type MemoryPad = 0 | 1 | 2 | 3;
export type MemoryState = {
  phase: "idle" | "watch" | "input" | "success" | "lost";
  sequence: MemoryPad[];
  inputIndex: number;
  best: number;
};
export type MemoryAction =
  | { type: "start" | "next"; pad: MemoryPad }
  | { type: "press"; pad: MemoryPad }
  | { type: "ready" | "replay" };

export const initialMemory: MemoryState = {
  phase: "idle",
  sequence: [],
  inputIndex: 0,
  best: 0,
};

export function memoryReducer(
  state: MemoryState,
  action: MemoryAction,
): MemoryState {
  switch (action.type) {
    case "start":
      return {
        ...initialMemory,
        phase: "watch",
        sequence: [action.pad],
        best: state.best,
      };
    case "next":
      return state.phase === "success"
        ? {
            ...state,
            phase: "watch",
            sequence: [...state.sequence, action.pad],
            inputIndex: 0,
          }
        : state;
    case "ready":
      return state.phase === "watch" ? { ...state, phase: "input" } : state;
    case "replay":
      return state.phase === "input"
        ? { ...state, phase: "watch", inputIndex: 0 }
        : state;
    case "press": {
      if (state.phase !== "input") return state;
      if (action.pad !== state.sequence[state.inputIndex])
        return { ...state, phase: "lost" };
      const inputIndex = state.inputIndex + 1;
      return inputIndex === state.sequence.length
        ? {
            ...state,
            inputIndex,
            phase: "success",
            best: Math.max(state.best, inputIndex),
          }
        : { ...state, inputIndex };
    }
  }
}
