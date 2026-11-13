/**
 * Size it up silhouettes are pixel art grids: "#" is filled, "." is empty.
 * The grid's height is the object's height, so the bottom row stands on the
 * ground line and the top row touches the stated size.
 */
export type ScaleSprite = {
  shape: string;
  pt: string;
  en: string;
  meters: number;
  art: readonly string[];
};

const filled = (art: readonly string[], x: number, y: number) =>
  art[y]?.[x] === "#";

/** Width over height, in pixels. */
export const spriteAspect = (art: readonly string[]) =>
  art[0].length / art.length;

/** One subpath per horizontal run of filled pixels. */
export function spriteFill(art: readonly string[]): string {
  let d = "";
  art.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== "#") continue;
      let end = x + 1;
      while (row[end] === "#") end++;
      d += `M${x} ${y}h${end - x}v1h${x - end}z`;
      x = end;
    }
  });
  return d;
}

/** Only the edges between filled and empty pixels, merged into runs. */
export function spriteOutline(art: readonly string[]): string {
  const height = art.length;
  const width = art[0].length;
  let d = "";
  for (let y = 0; y <= height; y++) {
    for (let x = 0; x < width; x++) {
      if (filled(art, x, y - 1) === filled(art, x, y)) continue;
      let end = x + 1;
      while (
        end < width &&
        filled(art, end, y - 1) !== filled(art, end, y) &&
        filled(art, end, y) === filled(art, x, y)
      )
        end++;
      d += `M${x} ${y}h${end - x}`;
      x = end - 1;
    }
  }
  for (let x = 0; x <= width; x++) {
    for (let y = 0; y < height; y++) {
      if (filled(art, x - 1, y) === filled(art, x, y)) continue;
      let end = y + 1;
      while (
        end < height &&
        filled(art, x - 1, end) !== filled(art, x, end) &&
        filled(art, x, end) === filled(art, x, y)
      )
        end++;
      d += `M${x} ${y}v${end - y}`;
      y = end - 1;
    }
  }
  return d;
}

/** A sprite is drawable when it is rectangular, trimmed and only uses # and . */
export function isTrimmedSprite(art: readonly string[]): boolean {
  if (!art.length) return false;
  const width = art[0].length;
  if (!width || art.some((row) => row.length !== width || /[^#.]/.test(row)))
    return false;
  const column = (x: number) => art.some((row) => row[x] === "#");
  return (
    art[0].includes("#") &&
    art[art.length - 1].includes("#") &&
    column(0) &&
    column(width - 1)
  );
}
