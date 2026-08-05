// src/components/sections/ProjectsSection.tsx
'use client';

import { useRef, useState, useEffect, useCallback, Suspense, CSSProperties } from 'react';
import { motion, useMotionValue, useSpring, useTransform, animate, PanInfo, MotionValue } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';
import { getProjects } from '@/data/projects';
import { getCategoryColor } from '@/lib/categoryColors';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FilterType, Project, PROJECT_CATEGORIES } from '@/types';
import { useSettings } from '@/context/SettingsContext';
import Image from 'next/image';
import { ImageIcon, Trophy } from 'lucide-react';

const CARD_WIDTH = 380;
const CARD_HEIGHT = 460;
const CARD_GAP = 28;
const ITEM_WIDTH = CARD_WIDTH + CARD_GAP;

/** Hands a category's colors to the `.filter-chip` / `.category-badge`
    utilities, which style themselves off `--category-color`. Returns nothing
    for 'All Projects' — it isn't a category, so those utilities fall back to
    their neutral noir treatment. */
function categoryColorStyle(filter: FilterType): CSSProperties | undefined {
  if (filter === 'All Projects') return undefined;
  const { block, on } = getCategoryColor(filter);
  return { '--category-color': block, '--category-on': on } as CSSProperties;
}

function FilterButtons() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useSettings();
  const currentFilter = (searchParams.get('filter') as FilterType) || 'All Projects';

  const filters: FilterType[] = ['All Projects', ...PROJECT_CATEGORIES];

  // Mapeamos o valor do filtro para a label traduzida
  const filterLabels: Record<FilterType, string> = {
    'All Projects': t('cat_all'),
    'iOS': t('cat_ios'),
    'University': t('cat_university'),
    'Personal': t('cat_personal'),
    'Others': t('cat_others'),
  };

  const handleFilter = (f: FilterType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('filter', f);
    router.push(`${pathname}?${params.toString()}#projects`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-6 md:mt-0 md:ml-auto">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => handleFilter(filter)}
          data-active={currentFilter === filter}
          style={categoryColorStyle(filter)}
          className="filter-chip glitch-hover px-4 py-1.5 text-sm font-bold capitalize"
        >
          {filterLabels[filter]}
        </button>
      ))}
    </div>
  );
}

function ProjectsCarousel() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchParams = useSearchParams();
  const { language, t } = useSettings();
  
  const currentFilter = (searchParams.get('filter') as FilterType) || 'All Projects';
  const localizedProjects = getProjects(language);
  
  const filteredProjects = currentFilter === 'All Projects' 
    ? localizedProjects 
    : localizedProjects.filter(p => p.category === currentFilter);

  const TOTAL_WIDTH = filteredProjects.length * ITEM_WIDTH;
  const x = useMotionValue(0);

  useEffect(() => {
    setIsMounted(true);
    setActiveIndex(0);
    x.set(0);
  }, [currentFilter, x]);

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    if (filteredProjects.length === 0) return;
    const currentX = x.get();
    const predictedX = currentX + velocity.x * 0.2;
    const closestIndex = Math.round(-predictedX / ITEM_WIDTH);
    const targetX = -closestIndex * ITEM_WIDTH;
    
    animate(x, targetX, { type: "spring", stiffness: 260, damping: 38 });
    
    const origIndex = ((closestIndex % filteredProjects.length) + filteredProjects.length) % filteredProjects.length;
    setActiveIndex(origIndex);
  };

  const goTo = useCallback((targetOrigIndex: number) => {
    if (filteredProjects.length === 0) return;
    const currentX = x.get();
    const currentIndex = Math.round(-currentX / ITEM_WIDTH);
    const currentOrigIndex = ((currentIndex % filteredProjects.length) + filteredProjects.length) % filteredProjects.length;
    let diff = targetOrigIndex - currentOrigIndex;
    
    if (diff > filteredProjects.length / 2) diff -= filteredProjects.length;
    if (diff < -filteredProjects.length / 2) diff += filteredProjects.length;
    
    const targetIndex = currentIndex + diff;
    const targetX = -targetIndex * ITEM_WIDTH;
    
    animate(x, targetX, { type: "spring", stiffness: 260, damping: 38 });
    setActiveIndex(targetOrigIndex);
  }, [x, filteredProjects.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(activeIndex + 1);
      if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeIndex, goTo]);

  if (!isMounted) return <div className="min-h-[500px]" />;

  if (filteredProjects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-smoke">
        {t('proj_empty')}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden min-h-[700px] flex items-center justify-center">
      <motion.div
        className="absolute left-1/2 flex items-center"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -100000, right: 100000 }}
        dragElastic={0}
        onDragEnd={handleDragEnd}
        data-cursor="grab"
      >
        {filteredProjects.map((project, i) => (
          <CarouselCard
            key={project.id}
            project={project}
            origIndex={i}
            activeOrigIndex={activeIndex}
            dragX={x}
            totalWidth={TOTAL_WIDTH}
            onClick={() => goTo(i)}
            t={t}
          />
        ))}
      </motion.div>
    </div>
  );
}

interface CarouselCardProps {
  project: Project;
  origIndex: number;
  activeOrigIndex: number;
  dragX: MotionValue<number>;
  totalWidth: number;
  onClick: () => void;
  t: any;
}

function CarouselCard({ project, origIndex, activeOrigIndex, dragX, totalWidth, onClick, t }: CarouselCardProps) {
  const router = useRouter(); 
  const isActive = origIndex === activeOrigIndex;
  const baseOffset = origIndex * ITEM_WIDTH;

  const xOffset = useTransform(dragX, (latestDragX) => {
    if (totalWidth === 0) return 0;
    const absoluteCenter = latestDragX + baseOffset;
    const shiftCount = Math.round(-absoluteCenter / totalWidth);
    return shiftCount * totalWidth;
  });

  const cardX = useTransform(xOffset, (offset) => baseOffset + offset);
  const distFromCenter = useTransform(dragX, (latestDragX) => {
    if (totalWidth === 0) return 0;
    const absoluteCenter = latestDragX + baseOffset;
    const shiftCount = Math.round(-absoluteCenter / totalWidth);
    return Math.abs(absoluteCenter + shiftCount * totalWidth);
  });

  const scale = useTransform(distFromCenter, [0, 450], [1.06, 0.88]);
  const opacity = useTransform(distFromCenter, [0, 600], [1, 0.45]);
  const springScale = useSpring(scale, { stiffness: 280, damping: 30 });
  const pointerDownPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) < 5) {
      isActive ? router.push(`/projects/${project.id}`) : onClick();
    }
  };

  // Mapeia a categoria para exibir na linguagem correta no card
  const categoryLabel = t(`cat_${project.category.toLowerCase()}`) || project.category;

  return (
    <motion.div
      data-cursor-hover 
      className={`absolute cursor-pointer ${isActive ? 'z-10' : 'z-0'}`}
      style={{ left: -CARD_WIDTH / 2, width: CARD_WIDTH, x: cardX, scale: springScale, opacity }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={(e) => e.preventDefault()}
    >
      {/* The active card is called out by a mustard border rather than a bloom
          of colored shadow — `.panel`'s own hard offset shadow is the only one
          a printed label gets. Deliberately *not* `.panel-hover`: mustard is
          spoken for as this carousel's active-card signal, so an inactive card
          brightens to `smoke` on hover instead of claiming the active look. */}
      <div className={`panel flex flex-col overflow-hidden transition-colors duration-500 ${isActive ? 'border-mustard' : 'hover:border-smoke'}`} style={{ height: CARD_HEIGHT }}>
        <div className="relative flex h-56 items-center justify-center overflow-hidden bg-ink pointer-events-none">
          {/* The screen belongs to the artwork, so it rides a wrapper around
              the image itself — the placeholder branch is an icon, and an icon
              printed through a halftone is just a chewed-up icon. That wrapper
              is also what `fill` positions against. */}
          {project.cardImageUrl ? (
            <div className="halftone absolute inset-0">
              <Image src={project.cardImageUrl} alt={`${project.name} card`} fill sizes="100vw" className="object-cover" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-smoke/30">
              <ImageIcon size={32} strokeWidth={1} />
              <span className="text-[10px] tracking-widest uppercase">{isActive ? t('proj_view_details') : t('proj_preview')}</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-ink/60 to-transparent" />
        </div>

        <div className="flex flex-1 flex-col p-5 pointer-events-none">
          {/* `mustard`, not the reserved `block-yellow` — an award is site
              chrome, not a project category. */}
          {project.awards && project.awards.length > 0 && (
            <div className="mb-2 flex items-center gap-1.5 text-mustard">
              <Trophy size={14} />
              <span className="text-[10px] font-bold tracking-widest uppercase truncate">
                {project.awards[0].long}
              </span>
            </div>
          )}

          <h3 className="text-2xl font-bold leading-tight text-paper" style={{ fontFamily: 'var(--font-heading)' }}>{project.name}</h3>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className="category-badge px-2 py-0.5 text-xs font-bold tracking-wider uppercase"
              style={categoryColorStyle(project.category)}
            >
              {categoryLabel}
            </span>
            <span className="text-sm text-smoke/50">•</span>
            <span className="text-sm font-medium text-smoke/60">{project.date}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.technologies.map((tag) => (
              <span key={tag} className="tag-chip px-2 py-0.5 text-xs">{tag}</span>
            ))}
          </div>
          <p className="mt-3 flex-1 text-base leading-relaxed text-paper">{project.shortDescription}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectsSection() {
  const { t } = useSettings();

  return (
    <section id="projects" className="section-overlay py-28 md:py-36">
      <div className="section-container mb-12 flex flex-col md:flex-row md:items-end justify-between">
        <AnimatedSection direction="up" className="flex-1">
          <span className="text-sm font-medium tracking-widest text-mustard uppercase">{t('proj_subtitle')}</span>
          <h2 className="glitch-reveal mt-3 text-4xl font-black text-paper md:text-5xl" style={{ fontFamily: 'var(--font-heading)' }}>{t('proj_title')}</h2>
          <p className="mt-4 max-w-2xl text-base text-smoke md:text-lg">{t('proj_desc')}</p>
        </AnimatedSection>
        
        <Suspense fallback={<div className="h-10 w-full md:w-64" />}>
          <FilterButtons />
        </Suspense>
      </div>
      <Suspense fallback={<div className="min-h-[500px]" />}>
        <ProjectsCarousel />
      </Suspense>
    </section>
  );
}