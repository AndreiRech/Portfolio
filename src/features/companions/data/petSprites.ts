import { breathe, shift } from "../model/pixelSprite.ts";
import { DETAILED_PETS } from "./detailedPets.ts";
/**
 * Pixel art for the companions: 24 × 24 grids of palette keys ("." is
 * transparent), with a few frames each so CSS can animate them.
 */
export type PetFrames = {
  idle: string[];
  /** A breath: alternates with idle while the pet stands still. */
  breathe?: string[];
  blink: string[];
  walkA: string[];
  walkB: string[];
  /** Optional third and fourth beats for a four-step cycle. */
  walkC?: string[];
  walkD?: string[];
  /** Frames of the pet's own action, played once when it is used. */
  action?: string[][];
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

const CHICKEN_STAND = [...CHICKEN_BODY, ...CHICKEN_LEGS.stand];
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
    idle: CHICKEN_STAND,
    // Breathing bends the knees: the body sinks onto shorter legs.
    breathe: breathe(CHICKEN_STAND, CHICKEN_BODY.length + 1),
    blink: [...closeEyes(CHICKEN_BODY), ...CHICKEN_LEGS.stand],
    walkA: [...CHICKEN_BODY, ...CHICKEN_LEGS.stepA],
    walkB: [...CHICKEN_BODY, ...CHICKEN_LEGS.stepB],
    // A happy hop.
    action: [shift(CHICKEN_STAND, 0, -3), shift(CHICKEN_STAND, 0, -1)],
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
      breathe: breathe(withLegs(body, "stand"), body.length + 1),
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
    // The eyes flare between blinks.
    breathe: MEDALLION_ROWS.map((row) => row.replace(/h/g, "i")),
    blink: MEDALLION_ROWS.map((row) => row.replace(/[hi]/g, "g")),
    walkA: MEDALLION_ROWS,
    walkB: MEDALLION_ROWS.map((row, y) =>
      y === 10 || y === 11 || y === 18 || y === 19
        ? row.replace(/l/g, "d")
        : row,
    ),
  },
};

// Shared helpers for the side-view pets -------------------------------------
const blankGrid = () =>
  Array.from({ length: SIZE }, () => Array<string>(SIZE).fill("."));
/** Copies the non-transparent pixels of `rows` onto `grid` at (x, y). */
function stamp(grid: string[][], rows: string[], x = 0, y = 0) {
  rows.forEach((row, dy) =>
    [...row].forEach((key, dx) => {
      if (key !== "." && grid[y + dy]?.[x + dx]) grid[y + dy][x + dx] = key;
    }),
  );
  return grid;
}
const toRows = (grid: string[][]) => grid.map((row) => row.join(""));

// Cat ------------------------------------------------------------------------
// Side view facing left, like the chicken. Short, sturdy legs grow out of the
// belly (they replace its outline, so they stay attached) and walk in four
// beats: near and far legs swing in opposition while the tail sways.
const CAT_BODY = [
  "..o....o................",
  ".opo..opo...............",
  ".oppooppo...............",
  "oaaaaaaaao..............",
  "oaaaaaaaaao.............",
  "okwaaakwaao.............",
  "okkaaakkaao.............",
  "oaawpwaaaaoooooooooo....",
  "oawwwwaasaaasaasaasao...",
  ".owwwwaaasaasaasaasaao..",
  "..oowwaaaaaaaaaaaaaaao..",
  "....owwaaaaaaaaaaaaaao..",
  "....owwwwaaaaaaaaaaaso..",
  ".....ooooooooooooooooo..",
];
const CAT_TOP = 5;
const CAT_BELLY = CAT_TOP + CAT_BODY.length - 1;
const CAT_TAILS = [
  ["...oo", "..oaao", "..oaso", ".oao", ".oso", "oao", "oso", "oao"],
  ["oo", "oaao", ".oaso", "..oao", "..oso", "..oao", ".oso", ".oao"],
];
/** A leg two pixels wide; its paw shifts by `dx` as it swings. */
type CatLeg = { x: number; dx?: number; lift?: boolean };
type CatLegs = { front: [CatLeg, CatLeg]; back: [CatLeg, CatLeg] };
function catLeg(grid: string[][], fill: string, { x, dx = 0, lift }: CatLeg) {
  const foot = lift ? 21 : 22;
  for (let y = CAT_BELLY; y <= foot; y++) {
    const cx = x + Math.round((dx * (y - CAT_BELLY)) / (foot - CAT_BELLY));
    if (y === CAT_BELLY) {
      // Joined to the belly: fill over its outline, no seam.
      grid[y][cx] = fill;
      grid[y][cx + 1] = fill;
    } else if (y === foot) {
      for (let px = cx - 1; px <= cx + 2; px++) grid[y][px] = "o";
    } else {
      grid[y][cx - 1] = "o";
      grid[y][cx] = fill;
      grid[y][cx + 1] = fill;
      grid[y][cx + 2] = "o";
      if (y === foot - 1) {
        // The paw: toes reach one pixel forward.
        grid[y][cx - 2] = "o";
        grid[y][cx - 1] = fill;
      }
    }
  }
}
/** Each pair lists the far leg (darker, peeking out behind) then the near one. */
function catFrame({ front, back }: CatLegs, { tail = 0, blink = false } = {}) {
  const grid = blankGrid();
  const body = blink
    ? CAT_BODY.map((row, y) =>
        y === 5
          ? row.replace(/[kw]/g, "a")
          : y === 6
            ? row.replace(/k/g, "o")
            : row,
      )
    : CAT_BODY;
  stamp(grid, CAT_TAILS[tail], 18, CAT_TOP - 1);
  stamp(grid, body, 0, CAT_TOP);
  catLeg(grid, "s", { ...front[0], x: 8 });
  catLeg(grid, "s", { ...back[0], x: 18 });
  catLeg(grid, "a", { ...front[1], x: 6 });
  catLeg(grid, "a", { ...back[1], x: 16 });
  return toRows(grid);
}
type CatPose = [CatLeg, CatLeg, CatLeg, CatLeg];
/** Far front, near front, far back, near back (x is filled in by catFrame). */
const catPose = ([farFront, nearFront, farBack, nearBack]: CatPose) => ({
  front: [farFront, nearFront] as [CatLeg, CatLeg],
  back: [farBack, nearBack] as [CatLeg, CatLeg],
});
const CAT_STAND = catPose([{ x: 0 }, { x: 0 }, { x: 0 }, { x: 0 }]);
const CAT: PetSprite = {
  palette: {
    o: "#4d2b28",
    a: "#edaa64",
    s: "#c87c4b",
    p: "#f3a4b3",
    k: "#292735",
    w: "#fff2d4",
  },
  frames: {
    idle: catFrame(CAT_STAND),
    breathe: breathe(catFrame(CAT_STAND), CAT_BELLY + 2),
    blink: catFrame(CAT_STAND, { blink: true }),
    // Contact: the near legs reach apart while the far legs cross under.
    walkA: catFrame(
      catPose([
        { x: 0, dx: 1 },
        { x: 0, dx: -1 },
        { x: 0, dx: -1 },
        { x: 0, dx: 1 },
      ]),
    ),
    // Passing: the far front and near back paws lift as they swing through.
    walkB: catFrame(
      catPose([{ x: 0, lift: true }, { x: 0 }, { x: 0 }, { x: 0, lift: true }]),
      { tail: 1 },
    ),
    // Contact, mirrored: now the far legs reach apart.
    walkC: catFrame(
      catPose([
        { x: 0, dx: -1 },
        { x: 0, dx: 1 },
        { x: 0, dx: 1 },
        { x: 0, dx: -1 },
      ]),
      { tail: 1 },
    ),
    walkD: catFrame(
      catPose([{ x: 0 }, { x: 0, lift: true }, { x: 0, lift: true }, { x: 0 }]),
    ),
  },
};

// Frog -----------------------------------------------------------------------
// Side view facing left. Walking is a hop in four poses (crouch, push off,
// stretch in the air, land) kept in time with the hop in the CSS.
const FROG_SIT = [
  "....ooo.................",
  "...owwwo................",
  "...owkwoooooo...........",
  "..oggggggggggoo.........",
  ".oggggggggggggggo.......",
  "ogggggggggggdgggggo.....",
  "ommmmmgggggggggdggo.....",
  "olllllmgggggggoooggo....",
  ".olllllgggggoggggoggo...",
  "..ollllggggogggggggo....",
  "..ogoollgggoggggggo.....",
  "..ogo.olllgooooooooo....",
  ".oggo..ooooooggggggo....",
];
const FROG_PUSH = [
  "..ooo...................",
  ".owwwo..................",
  ".owkwooooo..............",
  "oggggggggggoo...........",
  "ogggggggggggggo.........",
  "ommmmgggggggdgggo.......",
  "olllllmggggggggggo......",
  ".olllllgggggggdggo......",
  "..oogllllggggggggoo.....",
  "...oggoolllgggggggo.....",
  "...ogo..oooooggggggo....",
  "...ogo.......ooogggo....",
  "..oggo.........oogggo...",
];
const FROG_AIR = [
  "........................",
  "...ooo..................",
  "..owwwo.................",
  "..owkwoooooo............",
  ".ogggggggggggoo.........",
  "ommmmggggggdggggoo......",
  "olllllmgggggggggggoo....",
  ".ollllllgggggggdggggoo..",
  "..oogolllllgggggggoooggo",
  "...ogo..ooooooooooo.oggo",
  "...oo................ogo",
  "......................oo",
  "........................",
];
const FROG_LAND = [
  "........................",
  "....ooo.................",
  "...owwwo................",
  "...owkwoooooo...........",
  "..oggggggggggoo.........",
  ".ogggggggggggdggo.......",
  "ommmmmgggggggggggo......",
  "olllllmgggggggggggo.....",
  ".olllllgggggggoooggoo...",
  "..ogoollgggggogggggggo..",
  "..ogo.olllllgooooooggo..",
  "..ogo..ooooooo....oggo..",
  ".oggo............oggggo.",
];
const frogFrame = (rows: string[], blink = false) =>
  toRows(
    stamp(
      blankGrid(),
      blink
        ? rows.map((row) =>
            row.replace("owkwo", "ommmo").replace("owwwo", "ogggo"),
          )
        : rows,
      0,
      10,
    ),
  );
const FROG: PetSprite = {
  palette: {
    o: "#28483c",
    g: "#8fc978",
    d: "#5f9e5b",
    l: "#d4df9b",
    m: "#3b6b4f",
    k: "#203b39",
    w: "#f2f7d9",
  },
  frames: {
    idle: frogFrame(FROG_SIT),
    breathe: breathe(frogFrame(FROG_SIT), 19),
    blink: frogFrame(FROG_SIT, true),
    walkA: frogFrame(FROG_SIT),
    walkB: frogFrame(FROG_PUSH),
    walkC: frogFrame(FROG_AIR),
    walkD: frogFrame(FROG_LAND),
  },
};

// Ghost ----------------------------------------------------------------------
// Faces the viewer and floats: the hem ripples in four phases while the
// little arms paddle.
const GHOST_TOP = [
  ".........oooooo.........",
  ".......oowwwwwwoo.......",
  "......owwwwwwwwwwo......",
  ".....owwwwwwwwwwwso.....",
  ".....owwwwwwwwwwwso.....",
  "....owwwwwwwwwwwwwso....",
  "....owwkkwwwwwwkkwso....",
  "....owwkkwwwwwwkkwso....",
  "....owpwwwwkkwwwwpso....",
  "....owwwwwwwwwwwwwso....",
];
const GHOST_ARMS = [
  [
    "...o................o...",
    "..owo..............owo..",
    "...o................o...",
  ],
  [
    "........................",
    "..oo................oo..",
    ".owo................owo.",
  ],
];
function ghostFrame(phase: number, blink = false) {
  const grid = blankGrid();
  const top = blink
    ? GHOST_TOP.map((row, y) =>
        y === 6
          ? row.replace(/k/g, "w")
          : y === 7
            ? row.replace(/kk/g, "oo")
            : row,
      )
    : GHOST_TOP;
  stamp(grid, top, 0, 3);
  for (let y = 13; y < 18; y++) stamp(grid, ["....owwwwwwwwwwwwwso...."], 0, y);
  // A wave along the hem: each column hangs to its own depth.
  for (let x = 4; x <= 19; x++) {
    const depth =
      19 + Math.round(1 + Math.sin(((x + phase * 2) * Math.PI) / 4));
    for (let y = 18; y < depth; y++)
      grid[y][x] = x === 4 || x === 19 ? "o" : x >= 18 ? "s" : "w";
    grid[depth][x] = "o";
  }
  stamp(grid, GHOST_ARMS[phase % 2], 0, 14);
  return toRows(grid);
}
const GHOST: PetSprite = {
  palette: {
    o: "#665785",
    w: "#e8e7ff",
    s: "#b5acd6",
    p: "#e5abd0",
    k: "#46375f",
  },
  frames: {
    idle: ghostFrame(0),
    breathe: shift(ghostFrame(0), 0, 1),
    blink: ghostFrame(0, true),
    walkA: ghostFrame(0),
    walkB: ghostFrame(1),
    walkC: ghostFrame(2),
    walkD: ghostFrame(3),
  },
};

/**
 * Side-view art drawn facing left. Every scene that moves a pet mirrors these
 * to face right; front-view pets are never mirrored.
 */
export const FACES_LEFT: ReadonlySet<string> = new Set([
  "dragon",
  "chicken",
  "cat",
  "frog",
]);

export const PET_SPRITES: Record<string, PetSprite> = {
  ...DETAILED_PETS,
  chicken: CHICKEN,
  cat: CAT,
  frog: FROG,
  ghost: GHOST,
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
};
