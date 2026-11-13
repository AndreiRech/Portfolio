"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "@/shared/ui/useReducedMotion";
import { seededRandom } from "@/features/games/daily/model/daily";

/** Quadratic density and longer waves make every extra point more exuberant. */
export default function PixelRain({
  points,
  seed,
}: {
  points: number;
  seed: number;
}) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setActive(false), 6000);
    return () => clearTimeout(timer);
  }, []);
  if (reduced || !active || points < 1) return null;
  const score = Math.max(1, Math.min(10, points));
  const random = seededRandom(seed);
  const count = 12 + score * score * 2;
  const colors =
    score === 10
      ? ["#ffe49a", "#ffd35c", "#fff7d6", "#ed9fda", "#a9e9dc"]
      : score >= 7
        ? ["#c8a1ed", "#9faeff", "#f2d7ff", "#e4bd6a"]
        : score >= 4
          ? ["#99c28a", "#cce5a4", "#81c9bd"]
          : ["#d2d5de", "#a9b3c9", "#e7eaf0"];
  return createPortal(
    <div className="rarity-rain" aria-hidden="true" data-score={score}>
      {Array.from({ length: count }, (_, index) => {
        const size = 3 + Math.floor(random() * (3 + score * 0.4));
        const style = {
          "--pixel-x": `${random() * 100}vw`,
          "--pixel-drift": `${(random() - 0.5) * (8 + score * 2)}vw`,
          "--pixel-size": `${size}px`,
          "--pixel-delay": `${random() * (0.15 + score * 0.12)}s`,
          "--pixel-fall": `${1.3 + score * 0.18 + random() * 0.8}s`,
          "--pixel-spin": `${(random() - 0.5) * 1080}deg`,
          "--pixel-color": colors[index % colors.length],
        } as CSSProperties;
        return (
          <i
            key={index}
            style={style}
            data-trail={score >= 7 && index % 3 === 0}
          />
        );
      })}
      {score >= 7 ? <span className="rarity-rain-flash" /> : null}
    </div>,
    document.body,
  );
}
