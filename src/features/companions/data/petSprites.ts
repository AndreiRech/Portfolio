/**
 * Pixel art for the companions: 24 × 24 grids of palette keys ("." is
 * transparent), with a few frames each so CSS can animate them.
 */
export type PetFrames = {
  idle: string[];
  blink: string[];
  walkA: string[];
  walkB: string[];
};
export type PetSprite = { palette: Record<string, string>; frames: PetFrames };

const SIZE = 24;

// Chicken ------------------------------------------------------------------
// Faces left at its natural scale, like the original artwork.
const CHICKEN_BODY = [
  "........................",
  "......o.o...............",
  ".....orororo............",
  ".....orrrrro............",
  "....oowwwwwoo...........",
  "...owwwwwwwwwo..........",
  "...owwkwwwwwwo..........",
  ".oyywwkwwwwwwo..........",
  "oyyyywwwwppwwo......oo..",
  ".ooyywwwwwwwwo.....owwo.",
  "...orrwwwwwwwwo...owwwo.",
  "...orrwwwwwwwwwoooowwsso",
  "....oowwwwwwwwwwwwwwssso",
  ".....owwwwsssswwwwwsssso",
  ".....owwwswwwwswwwwssso.",
  ".....owwwwsssswwwwssso..",
  "......owwwwwwwwwwssso...",
  ".......oowwwwwwwsso.....",
  ".........oooooooo.......",
];
const CHICKEN_LEGS = {
  stand: [
    "..........ol...ol.......",
    "..........ol...ol.......",
    ".........oll..oll.......",
    "........olll.olll.......",
    "........................",
  ],
  stepA: [
    ".........ol.....ol......",
    "........ol.......ol.....",
    ".......oll.......oll....",
    "......olll.......olll...",
    "........................",
  ],
  stepB: [
    "...........ol.ol........",
    "...........ol.ol........",
    "..........oll.oll.......",
    ".........olll.olll......",
    "........................",
  ],
};
const closeEyes = (rows: string[]) =>
  rows.map((row, y) =>
    y === 6 ? row.replace("k", "w") : y === 7 ? row.replace("k", "o") : row,
  );

const CHICKEN: PetSprite = {
  palette: {
    o: "#3a2218",
    w: "#fbf6ee",
    s: "#dccfbf",
    r: "#e0383a",
    y: "#f5a524",
    l: "#f08c1c",
    k: "#1b1b1b",
    p: "#f4a0a0",
  },
  frames: {
    idle: [...CHICKEN_BODY, ...CHICKEN_LEGS.stand],
    blink: [...closeEyes(CHICKEN_BODY), ...CHICKEN_LEGS.stand],
    walkA: [...CHICKEN_BODY, ...CHICKEN_LEGS.stepA],
    walkB: [...CHICKEN_BODY, ...CHICKEN_LEGS.stepB],
  },
};

// Dice -----------------------------------------------------------------------
// The D20 mascots are rasterised from a few polygons so both colourways share
// one silhouette: a hexagonal icosahedron with a front face for the number.
type Point = [number, number];
const inside = (polygon: Point[], x: number, y: number) => {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      hit = !hit;
  }
  return hit;
};
const nearSegment = (
  [ax, ay]: Point,
  [bx, by]: Point,
  x: number,
  y: number,
) => {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(
    0,
    Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)),
  );
  return Math.hypot(x - ax - t * dx, y - ay - t * dy) < 0.55;
};

const HEX: Point[] = [
  [12, 0.5],
  [21.5, 5],
  [21.5, 15.5],
  [12, 20.5],
  [2.5, 15.5],
  [2.5, 5],
];
const FRONT: Point[] = [
  [12, 4.5],
  [18.5, 16.5],
  [5.5, 16.5],
];
const FACETS: [Point, Point][] = [
  [FRONT[0], HEX[0]],
  [FRONT[1], HEX[2]],
  [FRONT[1], HEX[3]],
  [FRONT[2], HEX[4]],
  [FRONT[2], HEX[3]],
  [FRONT[0], FRONT[1]],
  [FRONT[1], FRONT[2]],
  [FRONT[2], FRONT[0]],
];

function dieBody(): string[] {
  const rows: string[] = [];
  for (let y = 0; y < 21; y++) {
    let row = "";
    for (let x = 0; x < SIZE; x++) {
      const cx = x + 0.5;
      const cy = y + 0.5;
      if (!inside(HEX, cx, cy)) {
        row += ".";
        continue;
      }
      const edge = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([dx, dy]) => !inside(HEX, cx + dx, cy + dy));
      if (edge) row += "o";
      else if (FACETS.some(([a, b]) => nearSegment(a, b, cx, cy))) row += "e";
      else if (inside(FRONT, cx, cy)) row += "f";
      else if (cy < 6.5 + Math.abs(cx - 12) * -0.2 && cy < 7) row += "l";
      else if (cy > 16) row += "d";
      else row += cx < 12 ? "p" : "d";
    }
    rows.push(row);
  }
  return rows;
}

const paint = (rows: string[], pixels: [number, number, string][]) => {
  const grid = rows.map((row) => row.split(""));
  for (const [x, y, key] of pixels) if (grid[y]?.[x]) grid[y][x] = key;
  return grid.map((row) => row.join(""));
};
// Eyes with a highlight, blush and a little open smile.
const FACE: [number, number, string][] = [
  [7, 8, "k"],
  [8, 8, "k"],
  [7, 9, "k"],
  [8, 9, "w"],
  [7, 10, "k"],
  [8, 10, "k"],
  [15, 8, "k"],
  [16, 8, "k"],
  [15, 9, "w"],
  [16, 9, "k"],
  [15, 10, "k"],
  [16, 10, "k"],
  [5, 11, "b"],
  [6, 11, "b"],
  [17, 11, "b"],
  [18, 11, "b"],
  [11, 10, "m"],
  [12, 10, "m"],
  [10, 9, "m"],
  [13, 9, "m"],
  [11, 11, "t"],
  [12, 11, "t"],
];
const CLOSED: [number, number, string][] = [
  [7, 8, "p"],
  [8, 8, "p"],
  [7, 9, "k"],
  [8, 9, "k"],
  [7, 10, "p"],
  [8, 10, "p"],
  [15, 8, "d"],
  [16, 8, "d"],
  [15, 9, "k"],
  [16, 9, "k"],
  [15, 10, "d"],
  [16, 10, "d"],
];
/** Legs grow from the underside of the body; a step lifts one foot. */
function withLegs(body: string[], step: "stand" | "left" | "right") {
  const grid = [
    ...body,
    ...Array.from({ length: SIZE - body.length }, () => ".".repeat(SIZE)),
  ].map((row) => row.split(""));
  const legs = [
    { outline: 7, fill: 8, toes: [6, 7, 8], lifted: step === "left" },
    { outline: 16, fill: 15, toes: [15, 16, 17], lifted: step === "right" },
  ];
  for (const leg of legs) {
    let top = grid.length - 1;
    while (top > 0 && grid[top][leg.fill] === ".") top--;
    const foot = leg.lifted ? 21 : 22;
    for (let y = top + 1; y < foot; y++) {
      grid[y][leg.outline] = "o";
      grid[y][leg.fill] = "g";
    }
    leg.toes.forEach((x) => {
      grid[foot][x] =
        x === leg.outline - (leg.outline < leg.fill ? 1 : -1) ? "o" : "g";
    });
  }
  return grid.map((row) => row.join(""));
}

function dieSprite(palette: Record<string, string>): PetSprite {
  const body = paint(dieBody(), FACE);
  const blink = paint(body, CLOSED);
  return {
    palette,
    frames: {
      idle: withLegs(body, "stand"),
      blink: withLegs(blink, "stand"),
      walkA: withLegs(body, "left"),
      walkB: withLegs(body, "right"),
    },
  };
}

// Wolf School medallion --------------------------------------------------------
// 32 × 32: it blinks its eyes and its side studs twinkle as it floats.
const MEDALLION_ROWS = [
  "................................",
  ".............aaaaaa.............",
  ".............aaaaaa.............",
  "...........aaabbbbaaa...........",
  "...........aaabbbbaaa...........",
  "...........aaabbbbaaa...........",
  "....dddddddaaabbbbaaaddddddd....",
  "....ddddddddcaaaaaacdddddddd....",
  "....ddffeedddcaaaacdddeeffdd....",
  "....ddffeeedddc..cdddeeeffdd....",
  "..llddffggeedddccdddeeggffddll..",
  "..llddffgggeeddddddeegggffddll..",
  "....ddffggggeeddddeeggggffdd....",
  "....ddffgggggeeddeegggggffdd....",
  "....ddffhhiiggeeeeggiihhffdd....",
  "....ddffhhiihgggggghiihhffdd....",
  "....ddffgghhhgggggghhhggffdd....",
  "....ddffgghhhhjjjjhhhhggffdd....",
  "....lldffgggggjjjjgggggffdll....",
  "....lldfffggggjjjjggggfffdll....",
  ".....dddffegjjkkkkjjgeffddd.....",
  "......dddffejjkkkkjjeffddd......",
  ".......ddfffjjjjjjjjfffdd.......",
  ".......dddffjjjjjjjjffddd.......",
  "........ddfffellllefffdd........",
  ".........ddfffllllfffdd.........",
  "..........ddffjjjjffdd..........",
  "...........ddfjjjjfdd...........",
  "............ddffffdd............",
  ".............ddffdd.............",
  "..............dddd..............",
  "...............dd...............",
];
const MEDALLION: PetSprite = {
  palette: {
    a: "#626979",
    b: "#22252c",
    c: "#272b34",
    d: "#777f90",
    e: "#c3c9d2",
    f: "#929bab",
    g: "#3c4351",
    h: "#f37970",
    i: "#ffc3a1",
    j: "#b4bdcc",
    k: "#262c36",
    l: "#e0e3e9",
  },
  frames: {
    idle: MEDALLION_ROWS,
    blink: MEDALLION_ROWS.map((row) => row.replace(/[hi]/g, "g")),
    walkA: MEDALLION_ROWS,
    walkB: MEDALLION_ROWS.map((row, y) =>
      y === 10 || y === 11 || y === 18 || y === 19
        ? row.replace(/l/g, "d")
        : row,
    ),
  },
};

export const PET_SPRITES: Record<string, PetSprite> = {
  chicken: CHICKEN,
  medallion: MEDALLION,
  d20: dieSprite({
    o: "#2b0b4d",
    l: "#c38af5",
    p: "#9846e0",
    d: "#7429bd",
    f: "#a95ced",
    e: "#5a1a9c",
    k: "#160725",
    w: "#ffffff",
    b: "#f59ac4",
    m: "#3a0a2a",
    t: "#ff6f9f",
    g: "#7a2fc4",
    n: "#ffffff",
  }),
  "gold-d20": dieSprite({
    o: "#3c1400",
    l: "#fff0a0",
    p: "#f7c23a",
    d: "#de921a",
    f: "#fcd651",
    e: "#b86a0a",
    k: "#2a0e00",
    w: "#ffffff",
    b: "#f7906e",
    m: "#4a1600",
    t: "#ff7a52",
    g: "#d99a1c",
    n: "#3c1400",
  }),
};
