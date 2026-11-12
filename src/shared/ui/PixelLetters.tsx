"use client";
import type { CSSProperties } from "react";

/** Animate only the glyph whose fixed hit area the pointer entered. */
export function animatePixelLetter(letter: HTMLElement | null) {
  if (!letter || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return;
  const glyph = letter.querySelector<HTMLElement>(".pixel-letter-glyph");
  if (!glyph) return;
  glyph.getAnimations().forEach((animation) => animation.cancel());
  glyph.animate(
    [
      { transform: "translateY(0) rotate(0deg)" },
      { transform: "translateY(-0.15em) rotate(-5deg)", offset: 0.32 },
      { transform: "translateY(0.025em) rotate(2deg)", offset: 0.72 },
      { transform: "translateY(0) rotate(0deg)" },
    ],
    { duration: 480, easing: "cubic-bezier(.2,.7,.2,1)" },
  );
}

export default function PixelLetters({
  text,
  offset = 0,
}: {
  text: string;
  offset?: number;
}) {
  return (
    <span className="pixel-letters" aria-hidden="true">
      {Array.from(text, (letter, index) => (
        <span
          className="pixel-letter"
          key={index}
          style={{ "--letter": offset + index } as CSSProperties}
          onPointerEnter={(event) => {
            if (event.pointerType !== "touch")
              animatePixelLetter(event.currentTarget);
          }}
          onPointerDown={(event) => animatePixelLetter(event.currentTarget)}
        >
          <span className="pixel-letter-glyph">{letter}</span>
        </span>
      ))}
    </span>
  );
}
