// Authoring helpers. Every sprite ends up as a plain grid of "#" and ".".
const clean = (s) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/[^#]/g, "."));

/** Literal grid. */
export const g = (s) => clean(s);
/** Mirror around the last column (odd width). */
export const m = (s) =>
  clean(s).map((l) => l + [...l.slice(0, -1)].reverse().join(""));
/** Mirror without a shared column (even width). */
export const me = (s) => clean(s).map((l) => l + [...l].reverse().join(""));

/** Mutable canvas for geometric sprites. */
export class C {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.p = Array.from({ length: h }, () => Array(w).fill(false));
  }
  set(x, y, v = true) {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.p[y][x] = v;
    return this;
  }
  rect(x, y, w, h, v = true) {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) this.set(i, j, v);
    return this;
  }
  clear(x, y, w, h) {
    return this.rect(x, y, w, h, false);
  }
  /** Row centred on cx with the given width. */
  span(cx, y, w, v = true) {
    return this.rect(Math.round(cx - w / 2), y, w, 1, v);
  }
  disc(cx, cy, r, v = true) {
    for (let j = Math.floor(cy - r); j <= Math.ceil(cy + r); j++)
      for (let i = Math.floor(cx - r); i <= Math.ceil(cx + r); i++)
        if ((i + 0.5 - cx) ** 2 + (j + 0.5 - cy) ** 2 <= r * r)
          this.set(i, j, v);
    return this;
  }
  ring(cx, cy, r, t = 1) {
    for (let j = Math.floor(cy - r); j <= Math.ceil(cy + r); j++)
      for (let i = Math.floor(cx - r); i <= Math.ceil(cx + r); i++) {
        const d = Math.hypot(i + 0.5 - cx, j + 0.5 - cy);
        if (d <= r && d > r - t) this.set(i, j);
      }
    return this;
  }
  line(x0, y0, x1, y1, w = 1) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let k = 0; k <= n; k++) {
      const x = Math.round(x0 + ((x1 - x0) * k) / n);
      const y = Math.round(y0 + ((y1 - y0) * k) / n);
      this.rect(x - Math.floor((w - 1) / 2), y, w, 1);
    }
    return this;
  }
  stamp(x, y, rows, v = true) {
    clean(rows.join ? rows.join("\n") : rows).forEach((l, j) =>
      [...l].forEach((c, i) => c === "#" && this.set(x + i, y + j, v)),
    );
    return this;
  }
  rows() {
    return this.p.map((r) => r.map((v) => (v ? "#" : ".")).join(""));
  }
}

/** Trim empty borders and pad rows to the same width. */
export function normalize(rows) {
  const w = Math.max(...rows.map((r) => r.length));
  let grid = rows.map((r) => r.padEnd(w, "."));
  while (grid.length && !grid[0].includes("#")) grid.shift();
  while (grid.length && !grid.at(-1).includes("#")) grid.pop();
  const cols = grid[0].length;
  let left = 0,
    right = cols - 1;
  while (left < cols && grid.every((r) => r[left] === ".")) left++;
  while (right > left && grid.every((r) => r[right] === ".")) right--;
  return grid.map((r) => r.slice(left, right + 1));
}

export const s = (shape, pt, en, meters, art) => ({
  shape,
  pt,
  en,
  meters,
  art,
});
