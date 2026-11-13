/**
 * Descida na masmorra: each Raridade point is one floor. The companion (or the
 * miner slime) hops one floor per hop, and every pose is a pure function of
 * time so the scene can be drawn at any instant without stored state.
 */
import { REWARDS } from "../../../collectibles/data/collectibles.ts";
import {
  canUseCompanion,
  type Collection,
} from "../../../collectibles/model/collection.ts";
import { totalPoints, type RarityState } from "./rarity.ts";

export const FLOORS = 50;
export const HOP_SECONDS = 0.42;
export const REVEAL_DELAY_SECONDS = 1.6;
export const LAG_SECONDS = 0.07;
/** One floor is four 8 × 4 steps: 32 px to the right and 16 px down. */
export const RUN_PX = 32;
export const DROP_PX = 16;
export const LIFT_PX = 14;

export type Biome =
  "stone" | "catacombs" | "crystals" | "lava" | "lair" | "treasure";
const BIOMES: Biome[] = ["stone", "catacombs", "crystals", "lava", "lair"];

/** Floors 0–9 stone, 10–19 catacombs, … 40–49 lair, 50 the treasure room. */
export const biomeOf = (floor: number): Biome =>
  floor >= FLOORS
    ? "treasure"
    : BIOMES[Math.max(0, Math.min(4, Math.floor(floor / 10)))];

export type Body = {
  w: number;
  h: number;
  lift: number;
  travel: number;
  air: boolean;
};
export type BodyState = Body & { hop: number; x: number; y: number };

/** One hop, u ∈ [0, 1): crouch, fly (stretched, on an arc), land (squashed). */
export function hopBody(u: number): Body {
  if (u < 0.18) {
    const e = (u / 0.18) ** 2;
    return { w: 18 + 4 * e, h: 13 - 3 * e, lift: 0, travel: 0, air: false };
  }
  if (u < 0.82) {
    const k = (u - 0.18) / 0.64;
    const s = Math.sin(Math.PI * k);
    return { w: 16 - s, h: 14 + 2 * s, lift: s, travel: k, air: true };
  }
  const k = (u - 0.82) / 0.18;
  const e = 1 - (1 - k) ** 2;
  return { w: 22 - 4 * e, h: 10 + 3 * e, lift: 0, travel: 1, air: false };
}

/** Idle breathing, on absolute time so it never jumps. */
export function breathe(seconds: number): Body {
  const b = Math.sin(seconds * 3.2) * 0.7;
  return { w: 18 + b, h: 13 - b, lift: 0, travel: 0, air: false };
}

export const descentSeconds = (floors: number) => floors * HOP_SECONDS;

/** The body `seconds` into a run of `floors` hops; idle before and after. */
export function bodyAt(
  seconds: number,
  floors: number,
  clock: number,
): BodyState {
  if (seconds < 0 || floors <= 0)
    return { ...breathe(clock), hop: 0, x: 0, y: 0 };
  if (seconds >= descentSeconds(floors))
    return {
      ...breathe(clock),
      hop: floors,
      x: floors * RUN_PX,
      y: floors * DROP_PX,
    };
  const hop = Math.floor(seconds / HOP_SECONDS);
  const body = hopBody((seconds % HOP_SECONDS) / HOP_SECONDS);
  const along = hop + body.travel;
  return {
    ...body,
    hop,
    x: along * RUN_PX,
    y: along * DROP_PX - body.lift * LIFT_PX,
  };
}

/** Damped spring after the latest touchdown: e^(−7τ)·cos(26τ). */
export function landingBob(seconds: number, floors: number): number {
  if (seconds < 0 || floors <= 0) return 0;
  const landed = Math.min(floors, Math.floor(seconds / HOP_SECONDS + 0.18));
  if (landed < 1) return 0;
  const tau = seconds - (landed - 1 + 0.82) * HOP_SECONDS;
  return tau < 0 ? 0 : 1.6 * Math.exp(-7 * tau) * Math.cos(26 * tau);
}

export type HelmetState = { body: BodyState; press: 0 | 1; lifted: number };

/**
 * The helmet trails the head by LAG_SECONDS: pushed down on take-off (brim
 * sinks 1 px), lifted up to 2 px when it falls behind, bobbing after landing.
 * Only vertical — a 1 px sideways shift or shear reads as misalignment.
 */
export function helmetAt(
  seconds: number,
  floors: number,
  clock: number,
  lift = LIFT_PX,
  drop = DROP_PX,
): HelmetState {
  const head = (body: BodyState) =>
    (body.hop + body.travel) * drop - body.lift * lift - body.h;
  const now = bodyAt(seconds, floors, clock);
  const past = bodyAt(seconds - LAG_SECONDS, floors, clock - LAG_SECONDS);
  const dy = (head(past) - head(now)) * 0.22 + landingBob(seconds, floors);
  const rounded = Math.round(dy);
  return {
    body: now,
    press: rounded >= 1 ? 1 : 0,
    lifted: Math.max(-2, Math.min(0, rounded)),
  };
}

export const depthAfter = (state: RarityState) => totalPoints(state);
export const depthBefore = (state: RarityState) =>
  totalPoints(state) - (state.rounds.at(-1)?.points ?? 0);

/** Visiting companion, then the equipped one, then the rarest owned. */
export function pickCompanion(
  collection: Collection,
  visiting: string | null,
): string | null {
  if (visiting && canUseCompanion(collection, visiting)) return visiting;
  const equipped = collection.equipped.companion;
  if (equipped && canUseCompanion(collection, equipped)) return equipped;
  const owned = REWARDS.filter((reward) =>
    canUseCompanion(collection, reward.id),
  );
  return owned.at(-1)?.id ?? null;
}
