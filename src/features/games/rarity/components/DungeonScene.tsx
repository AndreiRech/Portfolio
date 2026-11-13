"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/shared/ui/useReducedMotion";
import { FACES_LEFT } from "@/features/companions/data/petSprites";
import {
  LIFT_PX,
  RUN_PX,
  breathe,
  helmetAt,
  type HelmetState,
} from "../model/descent";
import {
  CAM_X,
  FLOOR_Y,
  SCENE_H,
  SCENE_W,
  STEPS_PER_FLOOR,
  paintSlime,
  paintSprite,
  paintVignette,
  paintWorld,
} from "./paintDungeon";

const BLINK_EVERY = 2.2;
const BLINK_FOR = 0.13;

/**
 * The character hops down from floor `from` to floor `to`, one hop per floor,
 * after `delay` seconds dimmed. `companion` null means the miner slime. The
 * canvas, the HUD and the dimming are driven directly from the animation
 * frame, so the loop never re-renders React.
 */
export default function DungeonScene({
  from,
  to,
  companion,
  delay,
  floorLabel,
}: {
  from: number;
  to: number;
  companion: string | null;
  delay: number;
  floorLabel: string;
}) {
  const scene = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const hud = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx || !scene.current || !hud.current) return;
    const root = scene.current;
    const label = hud.current;
    const floors = Math.max(0, to - from);
    let shown = -1;
    const paint = (clock: number, seconds: number) => {
      const helmet: HelmetState = reduced
        ? {
            body: { ...breathe(0), hop: floors, x: floors * RUN_PX, y: 0 },
            press: 0,
            lifted: 0,
          }
        : helmetAt(seconds, floors, clock);
      const depth = from + helmet.body.x / RUN_PX;
      ctx.clearRect(0, 0, SCENE_W, SCENE_H);
      paintWorld(ctx, depth * STEPS_PER_FLOOR, reduced ? 0 : clock);
      // Feet stand on the outline row just above the step's lit edge.
      const feet = FLOOR_Y - 1 - Math.round(helmet.body.lift * LIFT_PX);
      const blink =
        !reduced && !helmet.body.air && clock % BLINK_EVERY < BLINK_FOR;
      if (companion)
        paintSprite(
          ctx,
          companion,
          helmet.body.air ? "walkA" : blink ? "blink" : "idle",
          CAM_X,
          feet,
          FACES_LEFT.has(companion),
        );
      else paintSlime(ctx, CAM_X, feet, helmet, { blink, beam: true });
      paintVignette(ctx);
      const floor = Math.floor(depth);
      if (floor !== shown)
        label.textContent = `${floorLabel} ${(shown = floor)}`;
    };
    if (reduced) {
      root.dataset.dim = "false";
      paint(0, 0);
      return;
    }
    root.dataset.dim = String(delay > 0);
    let frame = 0;
    let start: number | null = null;
    const loop = (now: number) => {
      start ??= now;
      const clock = (now - start) / 1000;
      paint(clock, clock - delay);
      if (clock >= delay && root.dataset.dim === "true")
        root.dataset.dim = "false";
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [from, to, companion, delay, reduced, floorLabel]);

  return (
    <div className="dungeon-scene" ref={scene} data-dim={delay > 0}>
      <canvas
        ref={canvas}
        width={SCENE_W}
        height={SCENE_H}
        aria-hidden="true"
      />
      {/* A single text child: React writes it with textContent, like the loop. */}
      <span className="dungeon-hud" ref={hud}>{`${floorLabel} ${from}`}</span>
    </div>
  );
}
