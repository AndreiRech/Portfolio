import { gameSeed, seededRandom, shuffled } from "../../daily/model/daily.ts";
import { CHARACTERS } from "../data/scale/characters.ts";
import { CREATURES } from "../data/scale/creatures.ts";
import { LANDMARKS } from "../data/scale/landmarks.ts";
import { EVERYDAY } from "../data/scale/objects.ts";
import type { ScaleSprite } from "./pixelSilhouette.ts";
export type HSL = [number, number, number];
export function dailyColors(day: number): HSL[] {
  const random = seededRandom(gameSeed("color-v1", day));
  return Array.from({ length: 5 }, () => [
    Math.floor(random() * 360),
    35 + Math.floor(random() * 60),
    25 + Math.floor(random() * 50),
  ]);
}
export const cssColor = (color: readonly number[]) =>
  `hsl(${color[0]} ${color[1]}% ${color[2]}%)`;
function oklab([h, s, l]: HSL) {
  const sat = s / 100,
    light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const rgb = [0, 8, 4].map((n) => {
    const k = (n + h / 30) % 12;
    const v = light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const [r, g, b] = rgb;
  const x = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const y = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const z = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * x + 0.793617785 * y - 0.0040720468 * z,
    1.9779984951 * x - 2.428592205 * y + 0.4505937099 * z,
    0.0259040371 * x + 0.7827717662 * y - 0.808675766 * z,
  ];
}
export function colorScore(guess: HSL, target: HSL): number {
  const a = oklab(guess),
    b = oklab(target);
  return Math.round(
    Math.max(0, 100 - Math.hypot(...a.map((v, i) => v - b[i])) * 200),
  );
}
export type ObjectSize = ScaleSprite;
/** Every silhouette is original pixel art; heights are approximate typical sizes. */
export const OBJECTS: readonly ObjectSize[] = [
  ...LANDMARKS,
  ...CHARACTERS,
  ...CREATURES,
  ...EVERYDAY,
];
/** Unordered pairs only: swapping the sides must not create a second round. */
export const SCALE_PAIRS = OBJECTS.flatMap((reference, index) =>
  OBJECTS.slice(index + 1)
    .filter(
      (target) =>
        Math.max(target.meters, reference.meters) /
          Math.min(target.meters, reference.meters) <=
        8,
    )
    .map((target) => ({ reference, target })),
);
export function dailyPairs(day: number) {
  const random = seededRandom(gameSeed("scale-v3", day));
  return shuffled(SCALE_PAIRS, random)
    .slice(0, 5)
    .map(({ reference, target }) =>
      random() < 0.5
        ? { reference, target }
        : { reference: target, target: reference },
    );
}
export const scaleScore = (guess: number, actual: number) =>
  Math.round(Math.max(0, 100 - Math.abs(Math.log2(guess / actual)) * 70));
export type PerceptionProgress = {
  guesses: number[][];
  phase: "ready" | "preview" | "adjust" | "result";
};
export const freshPerception = (): PerceptionProgress => ({
  guesses: [],
  phase: "ready",
});
export function parsePerception(
  value: unknown,
  kind: "color" | "scale",
): PerceptionProgress | null {
  // ASVS 1.5.2 / 2.2.1: restore only bounded numeric guesses and known phases.
  if (!value || typeof value !== "object") return null;
  const { guesses, phase } = value as Partial<PerceptionProgress>;
  if (
    !Array.isArray(guesses) ||
    guesses.length > 5 ||
    !["ready", "preview", "adjust", "result"].includes(phase ?? "")
  )
    return null;
  if (
    (phase === "result" && !guesses.length) ||
    (guesses.length === 5 && phase !== "result") ||
    (kind === "scale" && phase === "preview")
  )
    return null;
  if (
    !guesses.every(
      (guess) =>
        Array.isArray(guess) &&
        guess.length === (kind === "color" ? 3 : 1) &&
        guess.every(
          (v, i) =>
            typeof v === "number" &&
            Number.isFinite(v) &&
            v >= (kind === "scale" ? 0.1 : 0) &&
            v <= (kind === "scale" ? 8 : i === 0 ? 360 : 100),
        ),
    )
  )
    return null;
  return { guesses, phase: phase! };
}
