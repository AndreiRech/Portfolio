/**
 * The 32 × 32 companions, drawn from shaded shapes by `pixelSprite`: the
 * slime, the bat and the legendary golden dragon. Each has idle, breathe and
 * blink frames, a four-beat walk (or flight) and two action frames.
 */
import {
  dots,
  ellipse,
  grid,
  outline,
  polygon,
  shift,
  toRows,
  type Grid,
  type Ramp,
} from "../model/pixelSprite.ts";
import type { PetSprite } from "./petSprites.ts";

const SIZE = 32;
type Point = [number, number];
const mirror = (points: readonly Point[]): Point[] =>
  points.map(([x, y]) => [SIZE - x, y]);

// Slime ----------------------------------------------------------------------
// Front view, a jelly dome that squashes and stretches as it bounces.
const GEL: Ramp = { light: "l", mid: "m", dark: "d" };
type Blob = { cx: number; cy: number; rx: number; ry: number; floor: number };
function slimeFace(pixels: Grid, { cx, cy, rx }: Blob, closed: boolean) {
  const eye = Math.round(rx * 0.38);
  const left = Math.round(cx - eye - 1);
  const right = Math.round(cx + eye);
  const y = Math.round(cy - 1);
  if (closed)
    dots(pixels, [
      [left, y + 1, "k"],
      [left + 1, y + 1, "k"],
      [right, y + 1, "k"],
      [right + 1, y + 1, "k"],
    ]);
  else
    for (const x of [left, right])
      dots(pixels, [
        [x, y, "w"],
        [x + 1, y, "k"],
        [x, y + 1, "k"],
        [x + 1, y + 1, "k"],
        [x, y + 2, "k"],
        [x + 1, y + 2, "k"],
      ]);
  const mouth = Math.round(cx) - 1;
  dots(pixels, [
    [mouth, y + 3, "k"],
    [mouth + 1, y + 3, "k"],
    [left - 2, y + 3, "b"],
    [left - 1, y + 3, "b"],
    [right + 2, y + 3, "b"],
    [right + 3, y + 3, "b"],
  ]);
}
function slime(blobs: Blob[], closed = false) {
  const pixels = grid(SIZE);
  for (const blob of blobs) {
    ellipse(pixels, blob.cx, blob.cy, blob.rx, blob.ry, GEL, blob.floor);
    // A wet highlight and a bubble suspended in the gel.
    const top = Math.round(blob.cy - blob.ry * 0.55);
    const side = Math.round(blob.cx - blob.rx * 0.55);
    dots(pixels, [
      [side, top, "w"],
      [side + 1, top, "w"],
      [side, top + 1, "w"],
      [
        Math.round(blob.cx + blob.rx * 0.45),
        Math.round(blob.cy + blob.ry * 0.3),
        "l",
      ],
    ]);
    slimeFace(pixels, blob, closed);
  }
  return toRows(outline(pixels));
}
const REST: Blob = { cx: 16, cy: 21, rx: 12, ry: 10, floor: 28 };
const SLIME: PetSprite = {
  palette: {
    o: "#14402e",
    l: "#c4f7cf",
    m: "#62d98f",
    d: "#2f9a63",
    w: "#ffffff",
    k: "#0f2a1d",
    b: "#ff9fb2",
  },
  frames: {
    idle: slime([REST]),
    breathe: slime([{ ...REST, rx: 13, ry: 9, cy: 22 }]),
    blink: slime([REST], true),
    walkA: slime([{ cx: 16, cy: 24, rx: 14, ry: 7, floor: 28 }]),
    walkB: slime([REST]),
    walkC: slime([{ cx: 16, cy: 17, rx: 10, ry: 12, floor: 25 }]),
    walkD: slime([{ cx: 16, cy: 19, rx: 11, ry: 11, floor: 27 }]),
    // It pinches in the middle, then two small slimes hop apart.
    action: [
      slime([
        { cx: 11, cy: 22, rx: 8, ry: 8, floor: 28 },
        { cx: 21, cy: 22, rx: 8, ry: 8, floor: 28 },
      ]),
      slime([
        { cx: 5.5, cy: 23.5, rx: 5.5, ry: 5, floor: 28 },
        { cx: 26.5, cy: 23.5, rx: 5.5, ry: 5, floor: 28 },
      ]),
    ],
  },
};

// Bat ------------------------------------------------------------------------
// Front view; the walk cycle is a wingbeat.
const FUR: Ramp = { light: "l", mid: "m", dark: "d" };
const WING: Ramp = { light: "q", mid: "r", dark: "s" };
const WINGS: Record<"up" | "mid" | "down" | "folded", Point[]> = {
  up: [
    [12, 15],
    [9, 8],
    [3, 3],
    [1, 10],
    [3, 12],
    [3, 16],
    [6, 15],
    [8, 18],
    [11, 18],
  ],
  mid: [
    [12, 14],
    [7, 11],
    [1, 11],
    [2, 16],
    [4, 15],
    [5, 19],
    [8, 17],
    [10, 20],
    [12, 19],
  ],
  down: [
    [12, 14],
    [8, 15],
    [3, 20],
    [3, 26],
    [6, 23],
    [8, 26],
    [9, 22],
    [12, 23],
  ],
  folded: [
    [12, 13],
    [9, 16],
    [8, 22],
    [10, 24],
    [11, 21],
    [13, 22],
  ],
};
function bat(wings: keyof typeof WINGS, { closed = false, dy = 0 } = {}) {
  const pixels = grid(SIZE);
  polygon(pixels, WINGS[wings], WING);
  polygon(pixels, mirror(WINGS[wings]), WING);
  // Ears with pink insides.
  polygon(
    pixels,
    [
      [11, 13],
      [12, 5],
      [16, 12],
    ],
    FUR,
  );
  polygon(
    pixels,
    mirror([
      [11, 13],
      [12, 5],
      [16, 12],
    ]),
    FUR,
  );
  dots(pixels, [
    [12, 8, "e"],
    [12, 9, "e"],
    [13, 10, "e"],
    [19, 8, "e"],
    [19, 9, "e"],
    [18, 10, "e"],
  ]);
  ellipse(pixels, 16, 17, 6.5, 6.5, FUR);
  dots(pixels, [
    [14, 23, "d"],
    [17, 23, "d"],
    [14, 24, "d"],
    [17, 24, "d"],
  ]);
  if (closed)
    dots(pixels, [
      [12, 16, "k"],
      [13, 16, "k"],
      [18, 16, "k"],
      [19, 16, "k"],
    ]);
  else
    dots(pixels, [
      [12, 15, "y"],
      [13, 15, "y"],
      [12, 16, "y"],
      [13, 16, "k"],
      [18, 15, "y"],
      [19, 15, "y"],
      [18, 16, "k"],
      [19, 16, "y"],
    ]);
  dots(pixels, [
    [15, 19, "k"],
    [16, 19, "k"],
    [14, 20, "f"],
    [17, 20, "f"],
  ]);
  return shift(toRows(outline(pixels)), 0, dy);
}
const BAT: PetSprite = {
  palette: {
    o: "#140d1f",
    l: "#9a7dc0",
    m: "#654b8c",
    d: "#3e2d5c",
    q: "#8a68b5",
    r: "#4e3873",
    s: "#2f2247",
    e: "#f0a3c8",
    y: "#fff3b5",
    k: "#140d1f",
    f: "#ffffff",
  },
  frames: {
    idle: bat("folded"),
    breathe: bat("folded", { dy: 1 }),
    blink: bat("folded", { closed: true }),
    walkA: bat("up", { dy: 1 }),
    walkB: bat("mid"),
    walkC: bat("down", { dy: -1 }),
    walkD: bat("mid", { dy: 1 }),
    // A swoop: wings tucked in a dive, then thrown wide to pull up.
    action: [bat("folded", { dy: 3 }), bat("up", { dy: -2 })],
  },
};

// Golden dragon -------------------------------------------------------------
// Side view facing left, in chibi proportions: a big head, a short snout,
// small ribbed wings, a curled tail and stubby legs. It flies, so its walk
// frames are wingbeats.
const SCALES: Ramp = { light: "l", mid: "m", dark: "d" };
const BELLY: Ramp = { light: "u", mid: "v", dark: "x" };
const MEMBRANE: Ramp = { light: "q", mid: "r", dark: "s" };
const HORN: Ramp = { light: "h", mid: "h", dark: "n" };
type Wing = { shape: Point[]; ribs: Point[] };
const DRAGON_WINGS: Record<"up" | "mid" | "down", Wing> = {
  up: {
    shape: [
      [18, 17],
      [19, 10],
      [23, 3],
      [26, 7],
      [28, 6],
      [28, 11],
      [30, 12],
      [25, 16],
    ],
    ribs: [
      [21, 9],
      [22, 7],
      [24, 9],
      [26, 11],
    ],
  },
  mid: {
    shape: [
      [18, 17],
      [21, 11],
      [27, 9],
      [29, 12],
      [31, 13],
      [28, 15],
      [30, 18],
      [24, 18],
    ],
    ribs: [
      [23, 12],
      [25, 12],
      [27, 13],
      [26, 15],
    ],
  },
  down: {
    shape: [
      [18, 17],
      [24, 16],
      [29, 19],
      [30, 24],
      [27, 22],
      [26, 25],
      [22, 21],
    ],
    ribs: [
      [24, 18],
      [26, 19],
      [27, 21],
    ],
  },
};
function dragon(
  wing: keyof typeof DRAGON_WINGS,
  {
    closed = false,
    open = false,
    step = 0,
    dx = 0,
    dy = 0,
  }: {
    closed?: boolean;
    open?: boolean;
    step?: number;
    dx?: number;
    dy?: number;
  } = {},
) {
  const pixels = grid(SIZE);
  // Curled tail behind the body, ending in a spade.
  polygon(
    pixels,
    [
      [21, 22],
      [26, 23],
      [28, 21],
      [29, 18],
      [31, 20],
      [30, 24],
      [26, 27],
      [21, 26],
    ],
    SCALES,
  );
  polygon(
    pixels,
    [
      [28, 17],
      [31, 15],
      [31, 19],
    ],
    HORN,
  );
  // Far legs, a shade darker behind the body.
  for (const x of [14 - step, 22 + step])
    dots(pixels, [
      [x, 26, "d"],
      [x + 1, 26, "d"],
      [x, 27, "d"],
      [x + 1, 27, "d"],
    ]);
  ellipse(pixels, 18.5, 21, 7, 5.5, SCALES);
  ellipse(pixels, 16.5, 23, 5, 3, BELLY);
  // Belly plates.
  for (const x of [13, 15, 17, 19]) dots(pixels, [[x, 23, "x"]]);
  // Back spikes.
  dots(pixels, [
    [18, 15, "h"],
    [21, 15, "h"],
    [24, 17, "h"],
  ]);
  // Near legs: short and stubby, with ivory claws.
  for (const [x, lift] of [
    [12 + step, 0],
    [20 - step, step === 0 ? 0 : 1],
  ] as const) {
    polygon(
      pixels,
      [
        [x, 24],
        [x + 3, 24],
        [x + 3, 28 - lift],
        [x, 28 - lift],
      ],
      SCALES,
    );
    dots(pixels, [
      [x, 28 - lift, "h"],
      [x + 2, 28 - lift, "h"],
    ]);
  }
  // A big round head with a short snout.
  ellipse(pixels, 10.5, 13, 6, 5.5, SCALES);
  ellipse(pixels, 5, 15.5, 3.4, open ? 2 : 2.6, SCALES);
  if (open)
    polygon(
      pixels,
      [
        [2, 17],
        [8, 16],
        [8, 19],
        [3, 19],
      ],
      BELLY,
    );
  else
    dots(pixels, [
      [3, 17, "d"],
      [4, 17, "d"],
      [5, 17, "d"],
      [6, 17, "d"],
    ]);
  // Swept-back horns and a nostril.
  polygon(
    pixels,
    [
      [12, 9],
      [17, 5],
      [15, 10],
    ],
    HORN,
  );
  polygon(
    pixels,
    [
      [9, 8],
      [12, 4],
      [11, 9],
    ],
    HORN,
  );
  dots(pixels, [[3, 14, "x"]]);
  // A big eye with a highlight; closed, it becomes a lid line.
  if (closed)
    dots(pixels, [
      [8, 13, "k"],
      [9, 13, "k"],
      [10, 13, "k"],
    ]);
  else
    dots(pixels, [
      [8, 11, "w"],
      [9, 11, "k"],
      [8, 12, "k"],
      [9, 12, "k"],
      [10, 12, "k"],
      [8, 13, "k"],
      [9, 13, "k"],
      [10, 13, "w"],
    ]);
  const { shape, ribs } = DRAGON_WINGS[wing];
  polygon(pixels, shape, MEMBRANE);
  // Ribs run from the shoulder out to each scallop.
  for (const [x, y] of ribs) dots(pixels, [[x, y, "d"]]);
  return shift(toRows(outline(pixels)), dx, dy);
}
/** Fire breath: puffs that grow from the mouth, hot at the core. */
function breath(rows: string[], reach: number) {
  const pixels = rows.map((row) => [...row]);
  const puffs: [number, number, number][] = [
    [7, 18, 1.6],
    [5, 19, 2.2],
    [3, 18, 2.8],
    [1, 19, 3.3],
  ];
  puffs.slice(0, reach).forEach(([cx, cy, r]) => {
    ellipse(pixels, cx, cy, r + 0.6, r, { light: "F", mid: "G", dark: "H" });
  });
  return pixels.map((row) => row.join(""));
}
const DRAGON: PetSprite = {
  palette: {
    o: "#3d2203",
    l: "#fff1a8",
    m: "#f5c13a",
    d: "#c3800f",
    u: "#fff8dc",
    v: "#ffe38f",
    x: "#d9a441",
    q: "#ffb870",
    r: "#e6782f",
    s: "#a64b18",
    h: "#fffbe6",
    n: "#d8c49a",
    k: "#2a1400",
    w: "#ffffff",
    F: "#fff6c2",
    G: "#ffc93c",
    H: "#ff7b2b",
  },
  frames: {
    idle: dragon("mid"),
    breathe: dragon("mid", { dy: 1 }),
    blink: dragon("mid", { closed: true }),
    walkA: dragon("up", { step: 1 }),
    walkB: dragon("mid", { dy: 1 }),
    walkC: dragon("down", { step: -1, dy: 1 }),
    walkD: dragon("mid", { dy: -1 }),
    // It rears back a little, then the fire grows.
    action: [
      breath(dragon("up", { open: true, dx: 6 }), 2),
      breath(dragon("mid", { open: true, dx: 6 }), 4),
    ],
  },
};

export const DETAILED_PETS: Record<string, PetSprite> = {
  slime: SLIME,
  bat: BAT,
  dragon: DRAGON,
};
