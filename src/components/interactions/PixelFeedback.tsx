"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";
export default function PixelFeedback() {
  const layer = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const active = new Set<Animation>();
    const container = layer.current;
    const burst = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest("button, a");
      if (!control || !layer.current || control.closest(".contribution-grid"))
        return;
      const rect = control.getBoundingClientRect();
      const x = event.detail ? event.clientX : rect.x + rect.width / 2;
      const y = event.detail ? event.clientY : rect.y + rect.height / 2;
      if (active.size > 40) return;
      for (let i = 0; i < 6; i++) {
        const pixel = document.createElement("i");
        pixel.style.left = `${x}px`;
        pixel.style.top = `${y}px`;
        layer.current.appendChild(pixel);
        const angle = (i * Math.PI) / 3;
        const animation = pixel.animate(
          [
            { transform: "translate(0, 0)", opacity: 1 },
            {
              transform: `translate(${Math.cos(angle) * 30}px, ${Math.sin(angle) * 30}px)`,
              opacity: 0,
            },
          ],
          { duration: 420, easing: "steps(7, end)" },
        );
        active.add(animation);
        animation.onfinish = () => {
          active.delete(animation);
          pixel.remove();
        };
      }
    };
    document.addEventListener("click", burst);
    return () => {
      document.removeEventListener("click", burst);
      active.forEach((animation) => animation.cancel());
      container?.replaceChildren();
    };
  }, [reduced]);
  return <div ref={layer} className="pixel-feedback" aria-hidden="true" />;
}
