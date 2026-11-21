import { particle, type Particle, type Random } from "../model/particles.ts";

type Effect = (x: number, y: number, random: Random) => Particle[];

const HIT_MARKER = [
  "#.......#",
  ".#.....#.",
  "..#...#..",
  ".........",
  ".........",
  ".........",
  "..#...#..",
  ".#.....#.",
  "#.......#",
];
const PAW = [
  "..#.#..",
  "#.....#",
  "...#...",
  "..###..",
  ".#####.",
  ".#####.",
  "..###..",
];
const STAR = [".#.", "###", ".#."];
const GLINT = [
  "...#...",
  "...#...",
  "..###..",
  "#######",
  "..###..",
  "...#...",
  "...#...",
];
const COIN = [".##.", "####", "####", ".##."];

/** Points on an arc, each lighting up a moment after the previous one. */
function swing(
  x: number,
  y: number,
  {
    radius,
    from,
    to,
    count,
    colors,
    size,
  }: {
    radius: number;
    from: number;
    to: number;
    count: number;
    colors: readonly string[];
    size: number;
  },
) {
  return Array.from({ length: count }, (_, index) => {
    const angle = from + ((to - from) * index) / (count - 1);
    return particle({
      x: x + Math.cos(angle) * radius,
      y: y + Math.sin(angle) * radius,
      life: 0.2,
      delay: index * 0.012,
      size,
      color: colors[index % colors.length],
    });
  });
}

/** Chunks thrown up and out that fall back down. */
function debris(
  x: number,
  y: number,
  random: Random,
  {
    count,
    colors,
    size,
    sprite,
  }: {
    count: number;
    colors: readonly string[];
    size: number;
    sprite?: readonly string[];
  },
) {
  return Array.from({ length: count }, (_, index) =>
    particle({
      x,
      y,
      vx: (random() - 0.5) * 260,
      vy: -160 - random() * 200,
      gravity: 1100,
      life: 0.55 + random() * 0.2,
      size,
      sprite,
      color: colors[index % colors.length],
      fade: false,
    }),
  );
}

/** Each cursor's reaction to a click, drawn where the pointer lands. */
export const CLICK_EFFECTS: Record<string, Effect> = {
  // A square ripple: pixels leave at the same speed along a square outline.
  arrow: (x, y) =>
    Array.from({ length: 16 }, (_, index) => {
      const angle = (index / 16) * Math.PI * 2;
      const scale = Math.max(
        Math.abs(Math.cos(angle)),
        Math.abs(Math.sin(angle)),
      );
      return particle({
        x,
        y,
        vx: (Math.cos(angle) / scale) * 90,
        vy: (Math.sin(angle) / scale) * 90,
        life: 0.32,
        size: 3,
        color: "--accent",
      });
    }),
  crosshair: (x, y, random) => [
    particle({
      x,
      y,
      life: 0.28,
      size: 2,
      sprite: HIT_MARKER,
      color: "#ffffff",
    }),
    ...Array.from({ length: 4 }, () =>
      particle({
        x,
        y,
        vx: (random() - 0.5) * 160,
        vy: (random() - 0.5) * 160,
        life: 0.22,
        size: 2,
        color: "#ff5d5d",
      }),
    ),
  ],
  paw: (x, y) => [
    particle({
      x,
      y: y + 4,
      life: 1.1,
      size: 2,
      sprite: PAW,
      color: "--muted",
    }),
  ],
  sword: (x, y) =>
    swing(x, y, {
      radius: 24,
      from: -Math.PI * 0.85,
      to: -Math.PI * 0.1,
      count: 12,
      colors: ["#eef3ff", "#c3d0e8"],
      size: 4,
    }),
  wand: (x, y, random) =>
    Array.from({ length: 8 }, (_, index) =>
      particle({
        x,
        y,
        vx: (random() - 0.5) * 180,
        vy: -60 - random() * 120,
        gravity: 160,
        life: 0.6 + random() * 0.3,
        size: 2,
        sprite: STAR,
        color: ["#f6d66f", "#65d9df", "#f395bf"][index % 3],
      }),
    ),
  knife: (x, y, random) => [
    particle({ x, y, life: 0.35, size: 2, sprite: GLINT, color: "#fff3b5" }),
    ...debris(x, y, random, {
      count: 5,
      colors: ["#ffd23f", "#e0a526"],
      size: 2,
      sprite: COIN,
    }),
  ],
  pickaxe: (x, y, random) =>
    debris(x, y, random, {
      count: 7,
      colors: ["#8b8f99", "#6b6f78", "#8a5a31", "#a3afc2"],
      size: 5,
    }),
  saber: (x, y) => [
    ...swing(x, y, {
      radius: 30,
      from: -Math.PI * 0.95,
      to: -Math.PI * 0.05,
      count: 16,
      colors: ["#3fd8ff"],
      size: 6,
    }),
    ...swing(x, y, {
      radius: 30,
      from: -Math.PI * 0.95,
      to: -Math.PI * 0.05,
      count: 16,
      colors: ["#ffffff"],
      size: 3,
    }),
  ],
};
