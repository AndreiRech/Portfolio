"use client";
import { sfx } from "@/shared/lib/sfx";
import { useEffect, useRef } from "react";
import type {
  DieController,
  DieSides,
  DieVariant,
} from "@/features/dice/components/dice3d";
import { useReducedMotion } from "../../../shared/ui/useReducedMotion";

export type DieRoll = { value: number; id: number; direction?: number };

/**
 * A pixelated 3D die (d4 to d20). Each new `roll` tumbles the die until `roll.value`
 * faces the viewer, then calls `onLanded`. Three.js loads only when a die is
 * on screen; without WebGL the roll still resolves so games keep working.
 */
export default function Die3D({
  roll,
  onLanded,
  variant = "purple",
  sides = 20,
  resolution = 88,
  className,
}: {
  roll: DieRoll | null;
  onLanded?: (roll: DieRoll) => void;
  variant?: DieVariant;
  sides?: DieSides;
  resolution?: number;
  className?: string;
}) {
  const host = useRef<HTMLSpanElement>(null);
  const controller = useRef<DieController | null>(null);
  const failed = useRef(false);
  const queued = useRef<DieRoll | null>(null);
  const landed = useRef(onLanded);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  useEffect(() => {
    landed.current = onLanded;
    reducedRef.current = reduced;
  });

  useEffect(() => {
    const box = host.current;
    if (!box) return;
    // A fresh canvas per mount: a disposed die gives its WebGL context back.
    const node = document.createElement("canvas");
    box.append(node);
    let disposed = false;
    (async () => {
      try {
        const [{ createDie }] = await Promise.all([
          import("@/features/dice/components/dice3d"),
          document.fonts?.ready,
        ]);
        if (disposed) return;
        const font =
          getComputedStyle(document.documentElement)
            .getPropertyValue("--font-heading")
            .trim() || "monospace";
        controller.current = createDie(node, {
          variant,
          resolution,
          font,
          sides,
        });
        controller.current.show(queued.current?.value ?? sides);
        if (queued.current) perform(queued.current);
      } catch {
        failed.current = true;
        if (queued.current) perform(queued.current);
      }
    })();
    return () => {
      disposed = true;
      controller.current?.dispose();
      controller.current = null;
      node.remove();
    };
  }, [variant, resolution, sides]);

  function perform(next: DieRoll) {
    queued.current = null;
    const die = controller.current;
    if (!die || reducedRef.current) {
      die?.show(next.value);
      // Without animation the result still arrives on the next tick.
      setTimeout(() => landed.current?.(next), failed.current ? 500 : 0);
      return;
    }
    void die.roll(next.value, next.direction).then(() => {
      sfx.land();
      landed.current?.(next);
    });
  }

  useEffect(() => {
    if (!roll) return;
    if (controller.current || failed.current) perform(roll);
    else queued.current = roll;
    // Only a new roll id starts a throw.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roll?.id]);

  return (
    <span
      ref={host}
      className={["die-3d", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  );
}
