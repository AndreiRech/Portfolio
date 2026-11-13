/**
 * Canvas painters for the Raridade dungeon. Everything is drawn in whole
 * pixels on a 192 × 108 canvas that CSS scales up with crisp edges.
 */
import { PET_SPRITES } from "@/features/companions/data/petSprites";
import {
  DIGITS,
  PLAQUE,
  SLIME_COLORS as S,
  TORCH,
  TREASURE,
  colorsOf,
} from "../data/dungeon";
import { FLOORS, biomeOf, type HelmetState } from "../model/descent";

type Ctx = CanvasRenderingContext2D;

export const SCENE_W = 192;
export const SCENE_H = 108;
/** The character stays here while the world scrolls past. */
export const CAM_X = 92;
export const CAM_Y = 62;
/** Top of the step under the character. */
export const FLOOR_Y = CAM_Y + 12;
export const STEPS_PER_FLOOR = 4;
const LAST_STEP = FLOORS * STEPS_PER_FLOOR;

const fill = (ctx: Ctx, color: string, x: number, y: number, w = 1, h = 1) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
};

/** Deterministic noise for bricks: same wall every time, no Math.random. */
const hash = (x: number, y: number) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** Screen position of step `i` when the camera sits on step `p`. */
const stepX = (i: number, p: number) => CAM_X + (i - p) * 8;
/** Past floor 50 the stairs end in a flat treasure room. */
const stepY = (i: number, p: number) =>
  CAM_Y + (Math.min(i, LAST_STEP) - p) * 4;

function digits(ctx: Ctx, n: number, x: number, y: number, color: string) {
  String(n)
    .split("")
    .forEach((digit, k) =>
      DIGITS[digit].forEach((row, j) =>
        [...row].forEach((cell, i) => {
          if (cell === "#") fill(ctx, color, x + k * 4 + i, y + j);
        }),
      ),
    );
}

/**
 * Wall, floor plaques with torches, stairs and (on floor 50) the treasure.
 * `p` is the camera position in steps (floor × 4); `clock` drives the torches.
 */
export function paintWorld(ctx: Ctx, p: number, clock: number) {
  const camX = p * 8;
  const camY = p * 4;
  // Bricks are anchored to the world so they scroll with the camera. A brick
  // takes the biome of the stair column at the same x, so biomes change at
  // the floor plaques.
  for (let sy = -8; sy < SCENE_H + 8; sy += 4) {
    const wy = Math.floor((sy + camY) / 4);
    const y = wy * 4 - camY;
    const shift = wy & 1 ? 4 : 0;
    for (let sx = -16; sx < SCENE_W + 16; sx += 8) {
      const wx = Math.floor((sx + camX - shift) / 8);
      const x = wx * 8 + shift - camX;
      const noise = hash(wx, wy);
      const step = (x + 4 - CAM_X) / 8 + p;
      const c = colorsOf(biomeOf(Math.floor(step / STEPS_PER_FLOOR)));
      fill(ctx, c.mortar, x, y, 8, 4);
      fill(ctx, noise < 0.15 ? c.hi : c.wall, x, y, 7, 3);
      if (noise > 0.94) {
        fill(ctx, c.acc[0], x + 2, y + 1, 2, 1);
        fill(ctx, c.acc[0], x + 3, y, 1, 3);
      } else if (noise > 0.9) fill(ctx, c.acc[1], x + 4, y + 1, 2, 2);
    }
  }
  // One plaque and torch per floor, above its first step.
  const here = Math.floor(p / STEPS_PER_FLOOR);
  for (let f = Math.max(1, here - 3); f <= Math.min(FLOORS, here + 4); f++) {
    const i = f * STEPS_PER_FLOOR;
    const x = stepX(i, p);
    const y = stepY(i, p);
    const width = String(f).length * 4 + 3;
    fill(ctx, PLAQUE.border, x - 2, y - 30, width + 2, 9);
    fill(ctx, PLAQUE.face, x - 1, y - 29, width, 7);
    digits(ctx, f, x + 1, y - 28, PLAQUE.ink);
    const flame = Math.floor(clock * 8 + f) % 3;
    fill(ctx, TORCH.stick, x + width + 4, y - 26, 2, 6);
    fill(ctx, flame ? TORCH.flame : TORCH.bright, x + width + 3, y - 30, 4, 4);
    fill(ctx, TORCH.core, x + width + 4, y - 29, 2, 2);
  }
  // Stairs: 8 × 4 steps with a lit edge; past floor 50 the floor is flat.
  for (let i = Math.floor(p) - 16; i <= Math.floor(p) + 16; i++) {
    const x = stepX(i, p) - 4;
    const y = stepY(i, p) + 12;
    const c = colorsOf(biomeOf(Math.floor(i / STEPS_PER_FLOOR)));
    fill(ctx, c.step, x, y, 8, SCENE_H);
    fill(ctx, c.stepHi, x, y, 8, 1);
    if (i < LAST_STEP) fill(ctx, "rgba(0,0,0,.25)", x + 7, y + 1, 1, SCENE_H);
  }
  paintTreasure(ctx, stepX(LAST_STEP + 3, p), stepY(LAST_STEP, p) + 12);
}

/** A 12 × 8 chest and a spill of coins, feet on (x, floor). */
export function paintTreasure(ctx: Ctx, x: number, floor: number) {
  if (x < -24 || x > SCENE_W + 24) return;
  const top = floor - 9;
  fill(ctx, PLAQUE.border, x - 1, top - 1, 14, 10);
  fill(ctx, TREASURE.wood, x, top, 12, 8);
  fill(ctx, TREASURE.dark, x, top + 3, 12, 1);
  fill(ctx, TREASURE.gold, x, top + 2, 12, 1);
  fill(ctx, TREASURE.gold, x + 5, top + 2, 2, 3);
  fill(ctx, TREASURE.shine, x + 1, top, 2, 1);
  for (let k = 0; k < 9; k++)
    fill(
      ctx,
      k % 3 ? TREASURE.gold : TREASURE.shine,
      x - 8 + k * 3,
      floor - 2 - (k % 2),
      2,
      2,
    );
}

/**
 * The miner slime, feet at (fx, fy). The body is rasterised from a blob so
 * it can squash and stretch; the helmet dome copies the head's silhouette
 * (+1 px), so it stays centred and seated in every pose.
 */
export function paintSlime(
  ctx: Ctx,
  fx: number,
  fy: number,
  { body, press, lifted }: HelmetState,
  { blink, beam }: { blink: boolean; beam: boolean },
) {
  const w = Math.round(body.w);
  const h = Math.round(body.h);
  const top = Math.round(fy - h);
  const half = (row: number) => {
    const yn = Math.min(1, ((row + 0.5) / h) * 1.25);
    return (w / 2) * Math.sqrt(Math.max(0, 1 - (1 - yn) ** 2));
  };
  for (let row = 0; row < h; row++) {
    const hw = Math.max(1, Math.round(half(row)));
    const x0 = Math.round(fx - hw);
    const x1 = Math.round(fx + hw) - 1;
    for (let x = x0; x <= x1; x++) {
      let c = row === h - 1 ? S.base : row > h - 3 ? S.shade : S.body;
      if (x === x0 || x === x1 || row === 0) c = S.outline;
      fill(ctx, c, x, top + row);
    }
  }
  fill(ctx, S.outline, fx - w / 2, fy, w, 1);
  const shine = top + Math.round(h * 0.45);
  fill(ctx, S.shine, fx - w / 2 + 3, shine, 1, 2);
  fill(ctx, S.shine, fx - w / 2 + 4, shine - 1);
  const ey = top + Math.round(h * 0.58);
  const ex = Math.round(fx + w * 0.06);
  for (const dx of [0, 4])
    fill(ctx, S.eye, ex + dx, blink ? ey + 1 : ey, 1, blink ? 1 : 2);
  fill(ctx, S.mouth, ex + 1, ey + 3, 3, 1);
  if (body.air) fill(ctx, S.mouth, ex + 2, ey + 4);

  // Helmet: pressing sinks the brim 1 px, lagging lifts it up to 2 px.
  const domeTop = top - 1 + lifted;
  const seat = top + Math.max(3, Math.round(h * 0.3)) + press + lifted;
  const edges = (y: number, back = 0, front = 0) => {
    const row = Math.max(0, Math.min(h - 1, y - lifted - top));
    const span = Math.max(2, Math.round(half(row))) + 1;
    return [Math.round(fx - span) - back, Math.round(fx + span) - 1 + front];
  };
  for (let y = domeTop; y < seat; y++) {
    const [x0, x1] = edges(y);
    for (let x = x0; x <= x1; x++) {
      let c = S.helmet;
      if (y === domeTop || x === x0 || x === x1) c = S.helmetOutline;
      else if (x === x0 + 1 && y < seat - 1) c = S.helmetShine;
      else if (x === Math.round(fx) - 1) c = S.helmetShade;
      fill(ctx, c, x, y);
    }
  }
  const [b0, b1] = edges(seat, 1, 2);
  for (let x = b0; x <= b1; x++)
    fill(ctx, x === b0 || x === b1 ? S.helmetOutline : S.helmetShade, x, seat);
  fill(ctx, S.helmetOutline, b0, seat + 1, b1 - b0 + 1, 1);
  // Headlamp inside the front of the dome, with its beam.
  const ly = Math.max(domeTop + 1, seat - 4);
  const lx = edges(ly + 1)[1] - 4;
  for (const [a, b] of [
    [1, 0],
    [2, 0],
    [0, 1],
    [3, 1],
    [0, 2],
    [3, 2],
    [1, 3],
    [2, 3],
  ])
    fill(ctx, S.lampRim, lx + a, ly + b);
  fill(ctx, S.lamp, lx + 1, ly + 1, 2, 2);
  if (beam)
    for (let i = 0; i < 28; i++)
      fill(
        ctx,
        S.beam,
        lx + 4 + i,
        ly + 1 - Math.floor(i * 0.1),
        1,
        2 + Math.floor(i * 0.5),
      );
}

/** A 24 × 24 companion sprite, its feet (row 22) on `fy`. */
export function paintSprite(
  ctx: Ctx,
  id: string,
  frame: "idle" | "blink" | "walkA",
  fx: number,
  fy: number,
  flip: boolean,
) {
  const sprite = PET_SPRITES[id];
  if (!sprite) return;
  const rows = sprite.frames[frame];
  const left = Math.round(fx - 12);
  const top = Math.round(fy - 22);
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const color = sprite.palette[row[i]];
      if (row[i] === "." || !color) continue;
      fill(ctx, color, left + (flip ? row.length - 1 - i : i), top + j);
    }
  });
}

export function paintVignette(ctx: Ctx) {
  const gradient = ctx.createRadialGradient(
    CAM_X,
    CAM_Y,
    26,
    CAM_X,
    CAM_Y,
    110,
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,.6)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
}
