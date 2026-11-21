/**
 * A tiny rasteriser for pixel-art sprites. Shapes are filled with a three-key
 * colour ramp lit from the top left, then `outline` traces the silhouette.
 * Grids hold one palette key per pixel; "." is transparent.
 */
export type Grid = string[][];
/** Palette keys for the lit, base and shaded parts of one material. */
export type Ramp = { light: string; mid: string; dark: string };

export const grid = (size: number): Grid =>
  Array.from({ length: size }, () => Array<string>(size).fill("."));

export const toRows = (pixels: Grid) => pixels.map((row) => row.join(""));
export const fromRows = (rows: readonly string[]): Grid =>
  rows.map((row) => [...row]);

const set = (pixels: Grid, x: number, y: number, key: string) => {
  if (pixels[y]?.[x] !== undefined) pixels[y][x] = key;
};

/**
 * A filled ellipse shaded by its surface normal: the top-left rim is lit and
 * the bottom-right falls into shade. `floor` flattens everything below it.
 */
export function ellipse(
  pixels: Grid,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  ramp: Ramp,
  floor = Infinity,
) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x + 0.5 - cx) / rx;
      const ny = (y + 0.5 - cy) / ry;
      if (nx * nx + ny * ny > 1 || y > floor) continue;
      const light = -0.55 * nx - 0.8 * ny;
      set(
        pixels,
        x,
        y,
        light > 0.45 ? ramp.light : light < -0.3 ? ramp.dark : ramp.mid,
      );
    }
  return pixels;
}

/** Whether (x, y) is inside a polygon, by the even-odd rule. */
export function insidePolygon(
  points: readonly [number, number][],
  x: number,
  y: number,
) {
  let hit = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      hit = !hit;
  }
  return hit;
}

/**
 * A filled polygon with rim lighting: pixels on its top or left edge take the
 * light key, pixels on its bottom or right edge the dark key.
 */
export function polygon(
  pixels: Grid,
  points: readonly [number, number][],
  ramp: Ramp,
) {
  const inside = (x: number, y: number) =>
    insidePolygon(points, x + 0.5, y + 0.5);
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  for (
    let y = Math.floor(Math.min(...ys));
    y <= Math.ceil(Math.max(...ys));
    y++
  )
    for (
      let x = Math.floor(Math.min(...xs));
      x <= Math.ceil(Math.max(...xs));
      x++
    ) {
      if (!inside(x, y)) continue;
      const lit = !inside(x, y - 1) || !inside(x - 1, y);
      const shaded = !inside(x, y + 1) || !inside(x + 1, y);
      set(pixels, x, y, shaded ? ramp.dark : lit ? ramp.light : ramp.mid);
    }
  return pixels;
}

/** Individual pixels, for eyes, highlights and other hand-placed details. */
export function dots(pixels: Grid, list: readonly [number, number, string][]) {
  for (const [x, y, key] of list) set(pixels, x, y, key);
  return pixels;
}

/** Hand-drawn rows stamped at (x, y); "." leaves the pixel below. */
export function stamp(pixels: Grid, rows: readonly string[], x = 0, y = 0) {
  rows.forEach((row, dy) =>
    [...row].forEach((key, dx) => {
      if (key !== ".") set(pixels, x + dx, y + dy, key);
    }),
  );
  return pixels;
}

/** Traces the silhouette: every empty pixel touching a filled one. */
export function outline(pixels: Grid, key = "o") {
  const edge: [number, number][] = [];
  pixels.forEach((row, y) =>
    row.forEach((pixel, x) => {
      if (pixel !== ".") return;
      const touches = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([dx, dy]) => {
        const next = pixels[y + dy]?.[x + dx];
        return next !== undefined && next !== "." && next !== key;
      });
      if (touches) edge.push([x, y]);
    }),
  );
  for (const [x, y] of edge) pixels[y][x] = key;
  return pixels;
}

/** Moves the whole sprite by (dx, dy), dropping what leaves the grid. */
export function shift(rows: readonly string[], dx: number, dy: number) {
  const size = rows.length;
  const moved = grid(size);
  rows.forEach((row, y) =>
    [...row].forEach((key, x) => {
      if (key !== ".") set(moved, x + dx, y + dy, key);
    }),
  );
  return toRows(moved);
}

/**
 * A breath: everything above `chest` sinks one pixel, swallowing the row just
 * above it, so the body squashes while the feet stay planted.
 */
export function breathe(rows: readonly string[], chest: number) {
  const blank = ".".repeat(rows[0].length);
  return [blank, ...rows.slice(0, chest - 1), ...rows.slice(chest)];
}
