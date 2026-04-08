// src/components/sections/ProjectsSection.tsx
'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ImageIcon } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import { projects } from '@/data/projects';

const CARD_WIDTH = 380;
const CARD_HEIGHT = 460;
const CARD_GAP = 28;
const CLONE_SETS = 3;

export default function ProjectsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 38 });

  const items = useMemo(() => {
    const result = [];
    for (let s = 0; s < CLONE_SETS; s++) {
      for (let i = 0; i < projects.length; i++) {
        result.push({ ...projects[i], _setIndex: s, _origIndex: i });
      }
    }
    return result;
  }, []);

  const singleSetWidth = projects.length * (CARD_WIDTH + CARD_GAP);
  const totalWidth = singleSetWidth * CLONE_SETS;

  const getCenterOffset = useCallback(
    (origIndex: number) => {
      if (typeof window === 'undefined') return 0;
      const viewportCenter = window.innerWidth / 2;
      const middleSetStart = singleSetWidth;
      const cardCenter =
        middleSetStart + origIndex * (CARD_WIDTH + CARD_GAP) + CARD_WIDTH / 2;
      return viewportCenter - cardCenter;
    },
    [singleSetWidth]
  );

  useEffect(() => {
    x.set(getCenterOffset(0));
  }, [getCenterOffset, x]);

  const wrapPosition = useCallback(
    (currentX: number) => {
      const minBound = getCenterOffset(projects.length - 1) - singleSetWidth;
      const maxBound = getCenterOffset(0) + singleSetWidth;
      if (currentX < minBound) return currentX + singleSetWidth;
      if (currentX > maxBound) return currentX - singleSetWidth;
      return currentX;
    },
    [getCenterOffset, singleSetWidth]
  );

  const handleDragEnd = useCallback(() => {
    const currentX = wrapPosition(x.get());
    const viewportCenter = typeof window !== 'undefined' ? window.innerWidth / 2 : 600;

    let closest = 0;
    let minDist = Infinity;
    const middleSetStart = singleSetWidth;
    for (let i = 0; i < projects.length; i++) {
      const cardCenter =
        middleSetStart + i * (CARD_WIDTH + CARD_GAP) + CARD_WIDTH / 2;
      const dist = Math.abs(cardCenter + currentX - viewportCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    }
    setActiveIndex(closest);
    x.set(getCenterOffset(closest));
  }, [getCenterOffset, singleSetWidth, wrapPosition, x]);

  const goTo = useCallback(
    (index: number) => {
      const wrapped =
        ((index % projects.length) + projects.length) % projects.length;
      setActiveIndex(wrapped);
      x.set(getCenterOffset(wrapped));
    },
    [getCenterOffset, x]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(activeIndex + 1);
      if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeIndex, goTo]);

  return (
    <section id="projects" className="section-overlay py-28 md:py-36">
      <div className="section-container mb-12">
        <AnimatedSection direction="up">
          <span className="text-sm font-medium tracking-widest text-accent uppercase">
            Work
          </span>
          <h2
            className="mt-3 text-4xl font-black text-mist md:text-5xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Featured Projects
          </h2>
          <p className="mt-4 max-w-2xl text-base text-desat md:text-lg">
            Drag or use arrow keys to browse.
          </p>
        </AnimatedSection>
      </div>

      {/* Infinite carousel */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex items-start"
          data-cursor="grab"
          style={{
            x: springX,
            width: totalWidth,
            gap: CARD_GAP,
            paddingTop: 32,
            paddingBottom: 32,
          }}
          drag="x"
          dragConstraints={{
            left: -totalWidth,
            right: totalWidth,
          }}
          dragElastic={0.04}
          onDragEnd={handleDragEnd}
        >
          {items.map((project, i) => (
            <CarouselCard
              key={`${project.id}-${project._setIndex}`}
              project={project}
              globalIndex={i}
              activeOrigIndex={activeIndex}
              origIndex={project._origIndex}
              dragX={springX}
              singleSetWidth={singleSetWidth}
              onClick={() => goTo(project._origIndex)}
            />
          ))}
        </motion.div>

        {/* Pagination dots */}
        <div className="mt-6 flex justify-center gap-2">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === i
                  ? 'w-8 bg-accent'
                  : 'w-2 bg-desat/30 hover:bg-desat/50'
              }`}
              aria-label={`Go to project ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CarouselCardProps {
  project: (typeof projects)[number];
  globalIndex: number;
  activeOrigIndex: number;
  origIndex: number;
  dragX: ReturnType<typeof useSpring>;
  singleSetWidth: number;
  onClick: () => void;
}

function CarouselCard({
  project,
  globalIndex,
  activeOrigIndex,
  origIndex,
  dragX,
  onClick,
}: CarouselCardProps) {
  const cardCenterInTrack =
    globalIndex * (CARD_WIDTH + CARD_GAP) + CARD_WIDTH / 2;

  const viewportCenter =
    typeof window !== 'undefined' ? window.innerWidth / 2 : 600;

  const distFromCenter = useTransform(dragX, (latestX: number) =>
    Math.abs(cardCenterInTrack + latestX - viewportCenter)
  );

  const scale = useTransform(distFromCenter, [0, 450], [1.06, 0.88]);
  const opacity = useTransform(distFromCenter, [0, 600], [1, 0.45]);
  const springScale = useSpring(scale, { stiffness: 280, damping: 30 });

  const isActive = origIndex === activeOrigIndex;

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={containerRef}
      className="flex-shrink-0"
      style={{
        width: CARD_WIDTH,
        scale: springScale,
        opacity,
      }}
      onClick={onClick}
    >
      <div
        className={`glass flex flex-col overflow-hidden rounded-2xl transition-all duration-500 ${
          isActive
            ? 'border-accent/40 shadow-xl shadow-accent/10'
            : 'hover:border-mist/15'
        }`}
        style={{ height: CARD_HEIGHT }}
      >
        {/* Image area — top portion */}
        <div className="relative flex h-56 items-center justify-center overflow-hidden bg-midnight/40">
          <div className="flex flex-col items-center gap-2 text-desat/30">
            <ImageIcon size={32} strokeWidth={1} />
            <span className="text-[10px] tracking-widest uppercase">
              Preview
            </span>
          </div>
          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-base/60 to-transparent" />
        </div>

        {/* Content — bottom portion */}
        <div className="flex flex-1 flex-col p-5">
          {/* Title */}
          <h3
            className="text-lg font-bold leading-tight text-mist"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {project.title}
          </h3>

          {/* Type + Year */}
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[11px] font-medium tracking-wider text-accent/80 uppercase">
              {project.type}
            </span>
            <span className="text-[10px] text-desat/50">•</span>
            <span className="text-[11px] font-medium text-desat/60">
              {project.year}
            </span>
          </div>

          {/* Tech stack */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-glass-border bg-glass-hover px-2 py-0.5 text-[11px] text-desat"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="mt-3 flex-1 text-xs leading-relaxed text-desat/75">
            {project.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}