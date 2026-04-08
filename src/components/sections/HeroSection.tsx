// src/components/sections/HeroSection.tsx
'use client';

import { useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { LinkedinIcon, GithubIcon } from '@/components/icons';

// ─── Date ─────────────────────────────────────────────────────────────────────
const today = new Date();
const formattedDate = today.toLocaleDateString('en-US', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

// ─── DriftChar ────────────────────────────────────────────────────────────────
// Each character in the hero title drifts on hover via spring physics.

const DRIFT_RADIUS = 200; // max px offset
const SPRING_CONFIG = { stiffness: 220, damping: 24, mass: 0.6 };

interface DriftCharProps {
  char: string;
  index: number;
}

function DriftChar({ char, index }: DriftCharProps) {
  const ref = useRef<HTMLSpanElement>(null);

  // Raw target positions
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);

  // Spring-smoothed output
  const x = useSpring(targetX, SPRING_CONFIG);
  const y = useSpring(targetY, SPRING_CONFIG);

  // Apply a subtle rotation that mirrors the drift angle
  // FIX: Using the single motion value signature resolves the TypeScript array overlap error
  const rotate = useTransform(x, (latestX) => (latestX / DRIFT_RADIUS) * 6);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      // Clamp to the drift radius
      const dist = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(dist, DRIFT_RADIUS);
      const scale = clamped / dist;

      targetX.set(dx * scale * 0.7);
      targetY.set(dy * scale * 0.7);
    },
    [targetX, targetY]
  );

  const handleMouseLeave = useCallback(() => {
    targetX.set(0);
    targetY.set(0);
  }, [targetX, targetY]);

  // Stagger the entrance animation per character
  const entranceDelay = 0.3 + index * 0.04;

  return (
    <motion.span
      ref={ref}
      data-cursor-hover
      className="inline-block cursor-none"
      style={{ x, y, rotate, display: 'inline-block' }}
      initial={{ opacity: 0, y: 40, color: 'var(--color-mist)' }}
      animate={{ opacity: 1, y: 0, color: 'var(--color-mist)' }}
      whileHover={{ color: '#CC3766' }}
      transition={{
        opacity: { duration: 0.5, delay: entranceDelay },
        y: { duration: 0.9, delay: entranceDelay, ease: [0.16, 1, 0.3, 1] },
        color: { duration: 0.3, ease: 'easeOut' }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-hidden="true"
    >
      {char}
    </motion.span>
  );
}

// ─── SplitText ────────────────────────────────────────────────────────────────
// Splits a string into DriftChar spans, preserving spaces as non-breaking.

function SplitText({
  text,
  startIndex = 0,
}: {
  text: string;
  startIndex?: number;
}) {
  return (
    <>
      {text.split('').map((char, i) =>
        char === ' ' ? (
          <span key={i} className="inline-block" style={{ width: '0.25em' }} />
        ) : (
          <DriftChar key={i} char={char} index={startIndex + i} />
        )
      )}
    </>
  );
}

// ─── HeroSection ──────────────────────────────────────────────────────────────

export default function HeroSection() {
  const line1 = 'Andrei';
  const line2 = 'Rech';

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col justify-end overflow-hidden px-6 pb-10 md:px-10 md:pb-14"
    >
      {/* Accessible text — visually hidden, preserves SEO / screen-reader semantics */}
      <h1 className="sr-only">Andrei Rech</h1>

      {/* Giant editorial typography — fills the viewport */}
      <div
        className="absolute inset-0 flex items-center justify-center px-4"
        aria-hidden="true"
      >
        <p
          role="presentation"
          className="select-none text-center text-[15vw] font-black leading-[0.85] text-mist md:text-[13vw]"
          style={{
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.04em',
          }}
        >
          <span className="block">
            <SplitText text={line1} startIndex={0} />
          </span>
          <span className="block">
            <SplitText text={line2} startIndex={line1.length + 1} />
          </span>
        </p>
      </div>

      {/* Bottom bar — metadata + social links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex items-end justify-between"
      >
        {/* Left — date + role */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium tracking-wider text-accent uppercase">
            {formattedDate}
          </span>
          <span className="text-sm font-medium text-mist">
            iOS &amp; Fullstack Developer
          </span>
        </div>

        {/* Right — social links */}
        <div className="flex items-center gap-4">
          <a
            href="https://www.linkedin.com/in/rechandrei/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-mist/80 uppercase transition-colors hover:text-accent"
          >
            <LinkedinIcon size={13} />
            LinkedIn
          </a>
          <a
            href="https://github.com/AndreiRech"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-mist/80 uppercase transition-colors hover:text-accent"
          >
            <GithubIcon size={13} />
            GitHub
          </a>
        </div>
      </motion.div>
    </section>
  );
}