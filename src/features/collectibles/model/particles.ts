/**
 * Short-lived pixels for cursor click effects and trails. Pure data so the
 * motion can be tested without a canvas; `CursorEffects` only draws them.
 */
export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Downward acceleration in px/s². */
  gravity: number;
  /** Seconds the particle stays visible once it starts. */
  life: number;
  /** Seconds already lived. */
  age: number;
  /** Seconds to wait, in place and hidden, before it starts. */
  delay: number;
  /** Edge of one art pixel, in CSS pixels. */
  size: number;
  /** A colour, or a CSS custom property such as `--accent`. */
  color: string;
  /** Optional pixel art drawn centred on the particle ("#" is filled). */
  sprite?: readonly string[];
  /** Whether it fades out in steps as it ages. */
  fade: boolean;
};
export type Random = () => number;

export const MAX_LIVE_PARTICLES = 160;
const FLASH_SECONDS = 0.15;

export const particle = (
  fields: Partial<Particle> & Pick<Particle, "x" | "y" | "life">,
): Particle => ({
  vx: 0,
  vy: 0,
  gravity: 0,
  age: 0,
  delay: 0,
  size: 4,
  color: "--accent",
  fade: true,
  ...fields,
});

export function stepParticles(list: readonly Particle[], dt: number) {
  const next: Particle[] = [];
  for (const item of list) {
    if (item.delay > 0) {
      next.push({ ...item, delay: Math.max(0, item.delay - dt) });
      continue;
    }
    const age = item.age + dt;
    if (age >= item.life) continue;
    const vy = item.vy + item.gravity * dt;
    next.push({
      ...item,
      age,
      vy,
      x: item.x + item.vx * dt,
      y: item.y + vy * dt,
    });
  }
  return next;
}

export const capParticles = (
  list: readonly Particle[],
  max = MAX_LIVE_PARTICLES,
) => (list.length > max ? list.slice(list.length - max) : [...list]);

/** Reduced motion: the same burst, frozen and gone almost at once. */
export const stillFrame = (list: readonly Particle[]) =>
  list.map((item) => ({
    ...item,
    vx: 0,
    vy: 0,
    gravity: 0,
    delay: 0,
    life: Math.min(item.life, FLASH_SECONDS),
  }));

/** Opacity in four steps, so fading still reads as pixel art. */
export const stepOpacity = (item: Particle) =>
  item.fade ? Math.ceil((1 - item.age / item.life) * 4) / 4 : 1;
