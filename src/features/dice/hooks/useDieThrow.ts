"use client";
import { sfx } from "@/shared/lib/sfx";
import { useEffect, useRef, useState, type PointerEvent } from "react";

type Drag = { pointer: number; x: number; y: number; moved: boolean };
const clamp = (value: number, limit: number) =>
  Math.max(-limit, Math.min(limit, value));

/**
 * Drag-and-release throwing for a die button, shared by the Home die and the
 * duel. While dragging, `target` follows the pointer anywhere on screen; on
 * release it arcs back home and `onThrow` receives the throw direction. A
 * plain click or Enter throws too.
 */
export function useDieThrow({
  disabled,
  reduced,
  onThrow,
}: {
  disabled: boolean;
  reduced: boolean;
  onThrow: (direction: number) => void;
}) {
  /** Attach to the element that follows the pointer. */
  const target = useRef<HTMLSpanElement>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<Drag | null>(null);
  const ignoreClick = useRef(false);
  const flight = useRef<Animation | null>(null);

  useEffect(() => () => flight.current?.cancel(), []);

  function fly(direction: number) {
    const node = target.current;
    if (!node) return;
    const from = node.style.transform || "translate(0, 0)";
    node.style.transform = "";
    flight.current?.cancel();
    if (reduced) return;
    flight.current = node.animate(
      [
        { transform: from },
        {
          transform: `translate(${direction * 46}px, -70px) rotate(${direction * 8}deg)`,
          offset: 0.35,
        },
        { transform: `translate(${-direction * 10}px, 6px)`, offset: 0.72 },
        { transform: "translate(0, 0)" },
      ],
      { duration: 900, easing: "cubic-bezier(.25,.65,.35,1)" },
    );
  }

  function release(direction: number) {
    sfx.whoosh();
    fly(direction);
    onThrow(direction);
  }

  const handlers = {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (disabled || !event.isPrimary || event.button !== 0) return;
      ignoreClick.current = false;
      drag.current = {
        pointer: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        moved: false,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      const start = drag.current;
      const node = target.current;
      if (!start || start.pointer !== event.pointerId || !node) return;
      const x = event.clientX - start.x;
      const y = event.clientY - start.y;
      if (Math.hypot(x, y) > 8) start.moved = true;
      if (!reduced)
        node.style.transform = `translate(${x}px, ${y}px) rotate(${clamp(x / 4, 45)}deg)`;
    },
    onPointerUp(event: PointerEvent<HTMLElement>) {
      const start = drag.current;
      if (!start || start.pointer !== event.pointerId) return;
      drag.current = null;
      setDragging(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId);
      if (start.moved) {
        ignoreClick.current = true;
        release(event.clientX < start.x ? -1 : 1);
      } else {
        const node = target.current;
        if (node) node.style.transform = "";
      }
    },
    onPointerCancel(event: PointerEvent<HTMLElement>) {
      if (drag.current?.pointer !== event.pointerId) return;
      drag.current = null;
      setDragging(false);
      const node = target.current;
      if (node) node.style.transform = "";
    },
    onClick(event: React.MouseEvent<HTMLElement>) {
      if (event.detail > 0 && ignoreClick.current) {
        ignoreClick.current = false;
        return;
      }
      if (!disabled) release(1);
    },
  };
  return {
    target,
    dragging,
    handlers: { ...handlers, onLostPointerCapture: handlers.onPointerCancel },
  };
}
