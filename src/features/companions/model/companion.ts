export type Point = { x: number; y: number };
export type Bounds = { width: number; height: number; floor: number };
// The chicken artwork faces left at its natural scale.
export function petFacing(from: Point, to: Point, previous = 1): number {
  return to.x === from.x ? previous : to.x < from.x ? 1 : -1;
}
export function containPet(point: Point, bounds: Bounds): Point {
  const right = Math.max(8, bounds.width - 76);
  const bottom = Math.max(8, bounds.height - bounds.floor - 76);
  return {
    x: Math.max(8, Math.min(right, point.x)),
    y: Math.max(Math.min(110, bottom), Math.min(bottom, point.y)),
  };
}
export function movePet(from: Point, to: Point, distance: number): Point {
  const gap = Math.hypot(to.x - from.x, to.y - from.y);
  if (gap <= distance || gap === 0) return to;
  return {
    x: from.x + ((to.x - from.x) / gap) * distance,
    y: from.y + ((to.y - from.y) / gap) * distance,
  };
}
