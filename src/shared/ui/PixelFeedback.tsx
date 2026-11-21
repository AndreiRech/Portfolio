"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "./useReducedMotion";
export default function PixelFeedback() {
  const layer = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const pathname = usePathname();
  useEffect(() => {
    if (reduced) return;
    const active = new Set<Animation>();
    const container = layer.current;
    const reveals = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveals.unobserve(entry.target);
          const animation = entry.target.animate(
            [
              { opacity: 0.4, transform: "translateY(14px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 480, easing: "cubic-bezier(.2,.7,.2,1)" },
          );
          active.add(animation);
          animation.onfinish = () => {
            active.delete(animation);
          };
        }
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(".section-heading, .project-inspector, .explore-card")
      .forEach((element) => reveals.observe(element));
    const burst = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      // An equipped cursor draws its own click effect instead.
      const cursor = document.documentElement.dataset.cursor;
      if (cursor && cursor !== "default") return;
      const control = event.target.closest("button, a");
      if (
        !control ||
        !layer.current ||
        control.closest(".calendar, .memory-board")
      )
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
      reveals.disconnect();
      active.forEach((animation) => animation.cancel());
      container?.replaceChildren();
    };
  }, [reduced, pathname]);
  return <div ref={layer} className="pixel-feedback" aria-hidden="true" />;
}
