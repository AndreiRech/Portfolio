// src/components/CustomCursor.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

// ─── Selectors ─────────────────────────────────────────────────────────────────
// Elements that trigger the "hover" expanded accent state
const INTERACTABLE = 'a, button, [data-cursor-hover], input, textarea, select, label[for]';

// ─── Helpers ───────────────────────────────────────────────────────────────────
// Shifted to data attributes to avoid getComputedStyle conflicts with global cursor: none
function isGrabTarget(el: Element): boolean {
  return !!el.closest('[data-cursor="grab"]');
}

function isInteractable(el: Element): boolean {
  return !!el.closest(INTERACTABLE);
}

// ─── Cursor states ─────────────────────────────────────────────────────────────
type CursorState = 'default' | 'hover' | 'grab';

// ─── Config ────────────────────────────────────────────────────────────────────
const STATE_CONFIG: Record<
  CursorState,
  { width: number; height: number; bg: string; border: string; color: string; opacity: number; scale: number }
> = {
  default: { width: 18, height: 18, bg: 'transparent', border: 'var(--color-paper)', color: 'var(--color-paper)', opacity: 1, scale: 1 },
  hover:   { width: 40, height: 40, bg: 'transparent', border: 'var(--color-mustard)', color: 'var(--color-mustard)', opacity: 1, scale: 1 },
  grab:    { width: 36, height: 36, bg: 'transparent', border: 'var(--color-paper)', color: 'var(--color-paper)', opacity: 0.9, scale: 1 },
};

const SPRING = { stiffness: 500, damping: 38, mass: 0.5 };
const SIZE_SPRING = { type: 'spring' as const, stiffness: 420, damping: 30 };

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(-160);
  const rawY = useMotionValue(-160);
  const x = useSpring(rawX, SPRING);
  const y = useSpring(rawY, SPRING);

  const [state, setState] = useState<CursorState>('default');
  const [visible, setVisible] = useState(false);

  // Track the current target so we can re-evaluate on mousemove (grab → grabbing)
  const currentTargetRef = useRef<Element | null>(null);

  const evaluate = useCallback((target: Element | null) => {
    if (!target) { setState('default'); return; }
    // Prioriza o estado clicável (hover) antes do estado de arrastar (grab)
    if (isInteractable(target)) { setState('hover'); return; } 
    if (isGrabTarget(target))   { setState('grab');  return; }
    setState('default');
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      if (!visible) setVisible(true);

      // Re-evaluate on move
      const target = e.target as Element;
      currentTargetRef.current = target;
      evaluate(target);
    },
    [rawX, rawY, visible, evaluate]
  );

  const handleMouseOver = useCallback(
    (e: MouseEvent) => {
      const target = e.target as Element;
      currentTargetRef.current = target;
      evaluate(target);
    },
    [evaluate]
  );

  const handleMouseOut = useCallback(
    (e: MouseEvent) => {
      const related = e.relatedTarget as Element | null;
      currentTargetRef.current = related;
      evaluate(related);
    },
    [evaluate]
  );

  const handleMouseLeave = useCallback(() => {
    setVisible(false);
    setState('default');
    currentTargetRef.current = null;
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout',  handleMouseOut,  { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout',  handleMouseOut);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseOver, handleMouseOut, handleMouseLeave]);

  const cfg = STATE_CONFIG[state];

  return (
    <motion.div
      ref={cursorRef}
      aria-hidden="true"
      className="custom-cursor"
      style={{ 
        x, 
        y, 
        opacity: visible ? 1 : 0,
        borderWidth: '1.5px',
        borderStyle: state === 'grab' ? 'dashed' : 'solid',
      }}
      animate={{
        width:           cfg.width,
        height:          cfg.height,
        backgroundColor: cfg.bg,
        borderColor:     cfg.border,
        color:           cfg.color,
        scale:           cfg.scale,
      }}
      transition={{
        width:           SIZE_SPRING,
        height:          SIZE_SPRING,
        backgroundColor: { duration: 0.18, ease: 'easeOut' },
        borderColor:     { duration: 0.18, ease: 'easeOut' },
        color:           { duration: 0.18, ease: 'easeOut' },
        opacity:         { duration: 0.2 },
        scale:           SIZE_SPRING,
      }}
    >
      {/* The animated ring stays open while these two token-colored hairlines
          extend past it, turning the cursor into a true crosshair. */}
      <span className="absolute left-1/2 top-1/2 h-[1.5px] w-[calc(100%+10px)] -translate-x-1/2 -translate-y-1/2 bg-current" />
      <span className="absolute left-1/2 top-1/2 h-[calc(100%+10px)] w-[1.5px] -translate-x-1/2 -translate-y-1/2 bg-current" />

      {/* Grab-state label — "drag" hint */}
      <AnimatePresence>
        {state === 'grab' && (
          <motion.span
            key="grab-label"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 text-[10px] font-bold tracking-widest text-mustard"
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            ↔
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
