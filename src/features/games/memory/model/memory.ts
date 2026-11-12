export type MemoryPad = 0 | 1 | 2 | 3 | 4;
export type MemoryState = {
  phase: "idle" | "watch" | "input" | "success" | "lost";
  sequence: MemoryPad[];
  inputIndex: number;
  best: number;
};
export type MemoryAction =
  | { type: "start" | "next"; pad: MemoryPad }
  | { type: "press"; pad: MemoryPad }
  | { type: "ready" | "reset" };

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
    case "reset":
      return initialMemory;
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

export type MemoryLevel = "easy" | "normal" | "hard";
/** Easy uses only the first three signs; hard casts much faster. */
export const MEMORY_LEVELS: Record<
  MemoryLevel,
  { pads: number; lit: number; gap: number }
> = {
  easy: { pads: 3, lit: 720, gap: 420 },
  normal: { pads: 5, lit: 480, gap: 300 },
  hard: { pads: 5, lit: 260, gap: 140 },
};
export const isMemoryLevel = (value: unknown): value is MemoryLevel =>
  typeof value === "string" && Object.hasOwn(MEMORY_LEVELS, value);
