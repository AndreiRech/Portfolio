"use client";
import { useEffect, useRef } from "react";
import { CLICK_EFFECTS } from "@/features/collectibles/data/clickEffects";
import { TRAILS } from "@/features/collectibles/data/trails";
import {
  capParticles,
  stepOpacity,
  stepParticles,
  stillFrame,
  type Particle,
} from "@/features/collectibles/model/particles";
import { useReducedMotion } from "@/shared/ui/useReducedMotion";

/** Most emissions for one pointer event, so a fast flick stays cheap. */
const MAX_TRAIL_STEPS = 16;

/**
 * One fixed canvas for the equipped cursor's click effect and the equipped
 * trail. It never takes pointer events and only runs while pixels are alive.
 * Touch input is ignored: there is no cursor to decorate.
 */
export default function CursorEffects({
  cursor,
  trail,
}: {
  cursor: string | null;
  trail: string | null;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const effect = cursor ? CLICK_EFFECTS[cursor] : undefined;
  const emitter = trail && !reduced ? TRAILS[trail] : undefined;

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context || (!effect && !emitter)) return;
    const fine = window.matchMedia("(pointer: fine)");
    let particles: Particle[] = [];
    let frame = 0;
    let previous = 0;
    let last: { x: number; y: number } | null = null;
    const colors = new Map<string, string>();
    const resolve = (color: string) => {
      if (!color.startsWith("--")) return color;
      if (!colors.has(color))
        colors.set(
          color,
          getComputedStyle(document.documentElement)
            .getPropertyValue(color)
            .trim() || "#ffffff",
        );
      return colors.get(color)!;
    };
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      element.width = Math.round(window.innerWidth * ratio);
      element.height = Math.round(window.innerHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.imageSmoothingEnabled = false;
    };
    const draw = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const item of particles) {
        if (item.delay > 0) continue;
        context.globalAlpha = stepOpacity(item);
        context.fillStyle = resolve(item.color);
        if (!item.sprite) {
          const half = item.size / 2;
          context.fillRect(
            Math.round(item.x - half),
            Math.round(item.y - half),
            item.size,
            item.size,
          );
          continue;
        }
        const left = Math.round(
          item.x - (item.sprite[0].length * item.size) / 2,
        );
        const top = Math.round(item.y - (item.sprite.length * item.size) / 2);
        item.sprite.forEach((row, y) => {
          for (let x = 0; x < row.length; x++)
            if (row[x] === "#")
              context.fillRect(
                left + x * item.size,
                top + y * item.size,
                item.size,
                item.size,
              );
        });
      }
      context.globalAlpha = 1;
    };
    const tick = (time: number) => {
      const dt = previous ? Math.min(time - previous, 50) / 1000 : 0;
      previous = time;
      particles = stepParticles(particles, dt);
      draw();
      if (particles.length) frame = requestAnimationFrame(tick);
      else {
        frame = 0;
        previous = 0;
      }
    };
    const add = (fresh: Particle[]) => {
      particles = capParticles([...particles, ...fresh]);
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const click = (event: PointerEvent) => {
      if (!effect || event.pointerType === "touch" || !fine.matches) return;
      colors.clear();
      const burst = effect(event.clientX, event.clientY, Math.random);
      add(reduced ? stillFrame(burst) : burst);
    };
    const move = (event: PointerEvent) => {
      if (!emitter || event.pointerType === "touch" || !fine.matches) return;
      const point = { x: event.clientX, y: event.clientY };
      if (!last) {
        last = point;
        return;
      }
      const dx = point.x - last.x;
      const dy = point.y - last.y;
      const distance = Math.hypot(dx, dy);
      if (distance < emitter.spacing) return;
      const steps = Math.min(
        MAX_TRAIL_STEPS,
        Math.floor(distance / emitter.spacing),
      );
      const fresh: Particle[] = [];
      for (let step = 1; step <= steps; step++) {
        const t = step / steps;
        fresh.push(
          ...emitter.emit(
            last.x + dx * t,
            last.y + dy * t,
            dx,
            dy,
            Math.random,
          ),
        );
      }
      last = point;
      add(fresh);
    };
    const leave = () => {
      last = null;
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointerdown", click, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", click);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      context.clearRect(0, 0, element.width, element.height);
    };
  }, [effect, emitter, reduced]);

  if (!effect && !TRAILS[trail ?? ""]) return null;
  return <canvas ref={canvas} className="cursor-effects" aria-hidden="true" />;
}
