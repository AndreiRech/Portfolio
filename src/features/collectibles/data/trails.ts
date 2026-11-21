import { particle, type Particle, type Random } from "../model/particles.ts";

type Trail = {
  /** Particles left at the pointer after it moved by (dx, dy). */
  emit: (
    x: number,
    y: number,
    dx: number,
    dy: number,
    random: Random,
  ) => Particle[];
  /** Pointer travel, in px, between two emissions. */
  spacing: number;
  /** Square inventory icon. */
  art: readonly string[];
  palette: Record<string, string>;
};

const BUBBLE = [".##.", "#..#", "#..#", ".##."];
const RAINBOW = [
  "#ff5d5d",
  "#ff9f43",
  "#ffd23f",
  "#5cf2a6",
  "#4f9dff",
  "#b07cff",
];

/** A wavy six-band ribbon, generated so the bands stay aligned. */
const rainbowArt = Array.from({ length: 12 }, (_, y) =>
  Array.from({ length: 12 }, (_, x) => {
    const band = y - (3 + (Math.floor(x / 3) % 2));
    return band >= 0 && band < 6 ? "roygbv"[band] : ".";
  }).join(""),
);

export const TRAILS: Record<string, Trail> = {
  dust: {
    spacing: 7,
    emit: (x, y, _dx, _dy, random) => [
      particle({
        x: x + (random() - 0.5) * 6,
        y: y + (random() - 0.5) * 6,
        vy: 30,
        life: 0.45,
        size: random() < 0.5 ? 3 : 4,
        color: random() < 0.7 ? "--accent" : "--fg",
      }),
    ],
    art: [
      "..........aa",
      "..........aa",
      "........f...",
      ".......aa...",
      ".......aa...",
      "....f.......",
      "...a........",
      "..f.....a...",
      "............",
      ".a..........",
      "............",
      "f...........",
    ],
    palette: { a: "var(--accent)", f: "var(--fg)" },
  },
  bubbles: {
    spacing: 9,
    emit: (x, y, _dx, _dy, random) =>
      random() < 0.45
        ? [
            particle({
              x: x + (random() - 0.5) * 10,
              y,
              vx: (random() - 0.5) * 20,
              vy: -40 - random() * 30,
              life: 0.8 + random() * 0.3,
              size: random() < 0.5 ? 2 : 3,
              sprite: BUBBLE,
              color: "#9fe3ff",
            }),
          ]
        : [particle({ x, y, life: 0.2, size: 2, color: "#d9f6ff" })],
    art: [
      "......bbb...",
      ".....b..wb..",
      ".....b...b..",
      "......bbb...",
      "..bb........",
      ".b.wb.......",
      ".b..b...bb..",
      "..bb...b.wb.",
      "........bb..",
      "...bb.......",
      "..b.wb......",
      "...bb.......",
    ],
    palette: { b: "#9fe3ff", w: "#ffffff" },
  },
  embers: {
    spacing: 7,
    emit: (x, y, _dx, _dy, random) =>
      Array.from({ length: 2 }, () =>
        particle({
          x: x + (random() - 0.5) * 8,
          y: y + (random() - 0.5) * 4,
          vx: (random() - 0.5) * 40,
          vy: -50 - random() * 50,
          life: 0.45 + random() * 0.25,
          size: 3,
          color: ["#ffe08a", "#ffb347", "#ff6b2b"][Math.floor(random() * 3)],
        }),
      ),
    art: [
      "....y.......",
      "............",
      ".......o....",
      "...o........",
      "......y.....",
      "..o.....r...",
      "....r.......",
      "...oyo......",
      "..oyyyo.....",
      "..oyyyo..r..",
      "...ooo......",
      "............",
    ],
    palette: { y: "#ffe08a", o: "#ffb347", r: "#ff6b2b" },
  },
  // Six bands stacked across the direction of travel.
  rainbow: {
    // Close enough that the bands read as one continuous ribbon.
    spacing: 3,
    emit: (x, y, dx, dy) => {
      const length = Math.hypot(dx, dy) || 1;
      const nx = -dy / length;
      const ny = dx / length;
      return RAINBOW.map((color, band) =>
        particle({
          x: x + nx * (band - 2.5) * 4,
          y: y + ny * (band - 2.5) * 4,
          life: 0.4,
          size: 4,
          color,
        }),
      );
    },
    art: rainbowArt,
    palette: Object.fromEntries(
      [..."roygbv"].map((key, band) => [key, RAINBOW[band]]),
    ),
  },
};
