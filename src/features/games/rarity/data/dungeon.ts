/** Palettes and glyphs for the Raridade dungeon, drawn pixel by pixel on a canvas. */
import type { Biome } from "../model/descent";

export type BiomeColors = {
  wall: string;
  mortar: string;
  hi: string;
  step: string;
  stepHi: string;
  acc: [string, string];
};

export const BIOME_COLORS: Record<Exclude<Biome, "treasure">, BiomeColors> = {
  stone: {
    wall: "#3b4252",
    mortar: "#262a35",
    hi: "#4c566a",
    step: "#6b7590",
    stepHi: "#8a94ad",
    acc: ["#5f8a5a", "#7aa36f"],
  },
  catacombs: {
    wall: "#5a4a3a",
    mortar: "#3a2f25",
    hi: "#6e5b47",
    step: "#8a765c",
    stepHi: "#a8916f",
    acc: ["#e8dcc0", "#cbbd9c"],
  },
  crystals: {
    wall: "#2a2045",
    mortar: "#18122c",
    hi: "#3d2f63",
    step: "#5a4a8a",
    stepHi: "#7a68b0",
    acc: ["#70d8d4", "#c38af5"],
  },
  lava: {
    wall: "#3a1a14",
    mortar: "#1f0c08",
    hi: "#552418",
    step: "#6e3022",
    stepHi: "#8c4230",
    acc: ["#ff7a2a", "#ffd35c"],
  },
  lair: {
    wall: "#1c1a24",
    mortar: "#0e0d14",
    hi: "#2c2838",
    step: "#3e3950",
    stepHi: "#5a5470",
    acc: ["#f7c23a", "#ffe49a"],
  },
};

export const colorsOf = (biome: Biome) =>
  BIOME_COLORS[biome === "treasure" ? "lair" : biome];

export const SLIME_COLORS = {
  outline: "#173a22",
  body: "#7ad67a",
  shade: "#4fa65a",
  base: "#3d8a4a",
  shine: "#d8fbd0",
  eye: "#1b1b1b",
  mouth: "#2a0a10",
  helmetOutline: "#3a2208",
  helmet: "#f5b324",
  helmetShade: "#c27a10",
  helmetShine: "#ffe08a",
  lampRim: "#5a5f6e",
  lamp: "#fff7d6",
  beam: "rgba(255, 247, 214, 0.12)",
};

export const PLAQUE = { border: "#0e0d14", face: "#cbbd9c", ink: "#1b1b1b" };
export const TORCH = {
  stick: "#5a3a22",
  flame: "#ff7a2a",
  bright: "#ffd35c",
  core: "#fff7d6",
};
export const TREASURE = {
  wood: "#8a5a22",
  dark: "#5e3a14",
  gold: "#f7c23a",
  shine: "#ffe49a",
};

/** 3 × 5 digits for the floor plaques. */
export const DIGITS: Record<string, string[]> = {
  "0": ["###", "#.#", "#.#", "#.#", "###"],
  "1": [".#.", "##.", ".#.", ".#.", "###"],
  "2": ["###", "..#", "###", "#..", "###"],
  "3": ["###", "..#", ".##", "..#", "###"],
  "4": ["#.#", "#.#", "###", "..#", "..#"],
  "5": ["###", "#..", "###", "..#", "###"],
  "6": ["###", "#..", "###", "#.#", "###"],
  "7": ["###", "..#", ".#.", ".#.", ".#."],
  "8": ["###", "#.#", "###", "#.#", "###"],
  "9": ["###", "#.#", "###", "..#", "###"],
};
