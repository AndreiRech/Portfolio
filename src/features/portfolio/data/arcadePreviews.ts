/**
 * 20 × 12 pixel previews of each daily game, shown on the arcade screen.
 * Drawn in code from a few shapes so they stay aligned to the grid.
 */
const W = 20;
const H = 12;
type Grid = string[][];
const blank = (): Grid =>
  Array.from({ length: H }, () => Array<string>(W).fill("."));
function rect(
  grid: Grid,
  x: number,
  y: number,
  w: number,
  h: number,
  key: string,
) {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++)
      if (grid[y + dy]?.[x + dx] !== undefined) grid[y + dy][x + dx] = key;
  return grid;
}
/** Tiles of `w × h` with a one-pixel gap, one key per tile. */
function tiles(layout: string[], w: number, h: number, x = 0, y = 0) {
  const grid = blank();
  layout.forEach((row, ty) =>
    [...row].forEach((key, tx) =>
      rect(grid, x + tx * (w + 1), y + ty * (h + 1), w, h, key),
    ),
  );
  return grid;
}
function art(grid: Grid, rows: string[], x: number, y: number) {
  rows.forEach((row, dy) =>
    [...row].forEach((key, dx) => {
      if (key !== ".") grid[y + dy][x + dx] = key;
    }),
  );
  return grid;
}
const done = (grid: Grid) => grid.map((row) => row.join(""));

/** One 3 × 3 box of the grid: given digits, your digits and empty cells. */
function sudoku() {
  const grid = tiles(["wxa", "xwx", "axw"], 5, 3, 2, 0);
  const digits: Record<string, string[]> = {
    w: [".k.", "kk.", ".k."],
    a: ["kk.", ".k.", ".kk"],
  };
  ["wxa", "xwx", "axw"].forEach((row, ty) =>
    [...row].forEach((key, tx) => {
      if (digits[key]) art(grid, digits[key], 3 + tx * 6, ty * 4);
    }),
  );
  return grid;
}
function equalizer() {
  const grid = art(
    blank(),
    ["..wwww", "..w..w", "..w..w", "..w..w", "www.ww", "ww..w.", "ww...."],
    1,
    2,
  );
  [5, 8, 4, 10, 6, 9].forEach((height, index) =>
    rect(grid, 9 + index * 2, 12 - height, 1, height, "a"),
  );
  return grid;
}

export const PREVIEW_PALETTE: Record<string, string> = {
  g: "#a2cc98",
  y: "#dec77d",
  b: "#a5d9e2",
  r: "#e56d68",
  p: "#c8a1ed",
  q: "#9a74c9",
  x: "#4a4d55",
  w: "#e6e7eb",
  k: "#1c1d1f",
  a: "var(--accent)",
};

export const ARCADE_PREVIEWS: Record<string, string[]> = {
  termo: done(tiles(["gyxxg", "ggggg", "xxxxx"], 3, 3)),
  conexo: done(tiles(["yyyy", "gggg", "xxxx", "xxxx"], 4, 2)),
  crossword: done(tiles(["wwwkw", "wkwww", "wwwkw"], 3, 3)),
  rarity: done(
    art(
      blank(),
      [
        "..ppwwppqq..",
        ".ppwwppppqq.",
        "pppppppppqqq",
        ".pppppppqqq.",
        "..ppppppqq..",
        "...pppppq...",
        "....ppqq....",
        ".....pq.....",
      ],
      4,
      2,
    ),
  ),
  sudoku: done(sudoku()),
  color: done(rect(tiles(["rygbp", "pbgyr"], 3, 4, 0, 2), 0, 0, 19, 1, "a")),
  scale: done(
    art(
      art(blank(), [".w.", "www", ".w.", "w.w"], 2, 8),
      [
        "...wwww.",
        "..wwwwww",
        "..ww.www",
        "..wwwwww",
        "...wwww.",
        ".wwwwwww",
        "wwwwwwww",
        "w.wwwwww",
        "..ww..ww",
        "..ww..ww",
      ],
      10,
      2,
    ),
  ),
  songs: done(equalizer()),
  "higher-lower": done(
    art(
      art(
        blank(),
        [
          "...g...",
          "..ggg..",
          ".ggggg.",
          "ggggggg",
          "..ggg..",
          "..ggg..",
          "..ggg..",
        ],
        1,
        2,
      ),
      [
        "..rrr..",
        "..rrr..",
        "..rrr..",
        "rrrrrrr",
        ".rrrrr.",
        "..rrr..",
        "...r...",
      ],
      12,
      3,
    ),
  ),
};
