// src/app/projects/[id]/page.tsx
'use client';

import { use, useRef, useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Smartphone, Image as ImageIcon, Trophy } from 'lucide-react';
import { GithubIcon, ExternalSquareIcon } from '@/components/icons';
import { getProjects } from '@/data/projects';
import { useSettings } from '@/context/SettingsContext';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = use(params);
  const { language, t } = useSettings();
  const project = getProjects(language).find((p) => p.id === resolvedParams.id);

  // ─── LÓGICA DE DRAG (ARRASTAR) PARA A GALERIA ───
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Velocidade do arrasto
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };
  // ────────────────────────────────────────────────

  if (!project) notFound();

  const categoryLabel = t(`cat_${project.category.toLowerCase()}`) || project.category;

  return (
    <main className="min-h-screen bg-base text-mist pb-8 pt-16 px-6 md:px-10 selection:bg-accent selection:text-mist">
      <div className="max-w-5xl mx-auto">
        
        <Link 
          href="/#projects" 
          className="inline-flex items-center gap-2 text-sm font-medium text-desat hover:text-accent transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          {t('proj_back')}
        </Link>

        {/* Header Block */}
        <header className="flex flex-row justify-between relative border-b border-glass-border pb-8">
          <div className="flex flex-row gap-6">
            {project.logoUrl ? (
                <div className="w-28 h-28 rounded-xl overflow-hidden glass flex items-center justify-center shrink-0 bg-midnight">
                  <Image src={project.logoUrl} alt={`${project.name} Logo`} width={300} height={300} className="object-cover" />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-xl overflow-hidden glass flex items-center justify-center shrink-0 bg-midnight/20 border border-glass-border">
                  <ImageIcon size={32} className="text-desat/50" strokeWidth={1.5} />
                </div>
              )}
            <div className="flex flex-col gap-3 max-w-[3xl] justify-center">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl md:text-6xl font-black text-accent" style={{ fontFamily: 'var(--font-heading)' }}>
                  {project.name}
                </h1>
              </div>
              <div className="text-lg md:text-xl text-mist leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                {project.shortDescription}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end justify-center gap-2 ml-10 pt-8 mt-4 shrink-0">
            <span className="text-mist font-medium tracking-wide">
              {project.date}
            </span>
            <div className="flex flex-row items-center gap-2">
              {project.awards && project.awards.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                  {project.awards.map(award => (
                    <span key={award.short} className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-widest bg-yellow-500/60 border border-glass-border text-mist rounded-full uppercase">
                      <Trophy size={14} />
                      {award.short}
                    </span>
                  ))}
                </div>
              )}
              <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest bg-midnight/40 border border-glass-border text-mist rounded-full uppercase">
                {categoryLabel}
              </span>
            </div>
          </div>
        </header>
        
        <section className="w-full mt-8 mb-12 border-b border-glass-border pb-8">
          <h2 className="text-2xl font-bold text-accent tracking-wide mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('proj_gallery')}
          </h2>
          
          <div 
            ref={carouselRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex items-center overflow-x-auto gap-6 pb-6 no-scrollbar transition-all ${
              isDragging ? 'cursor-grabbing snap-none select-none' : 'cursor-grab snap-x'
            }`}
          >
            {project.media && project.media.length > 0 ? (
              project.media.map((media, idx) => {
                // Mantemos a verificação de orientação apenas para fixar a altura ideal da galeria
                const isVertical = project.orientation === 'vertical';
                
                return (
                  <div 
                    key={idx} 
                    className={`relative rounded-3xl glass border border-glass-border snap-center shrink-0 bg-midnight/10 flex items-center justify-center ${
                      isVertical 
                        ? 'h-[400px] md:h-[500px]' 
                        : 'h-[250px] md:h-[350px]'
                    }`}
                  >
                    <Image 
                      src={media} 
                      alt={`${project.name} screenshot ${idx + 1}`} 
                      width={0}
                      height={0}
                      sizes="100vw"
                      quality={100}
                      draggable={false}
                      className="h-full w-auto object-contain pointer-events-none rounded-xl"
                    />
                  </div>
                );
              })
            ) : (
              /* Fallback Placeholder Logic */
              [1, 2, 3].map((_, idx) => (
                <div key={idx} className="relative h-[300px] md:h-[300px] min-w-[280px] md:min-w-[500px] rounded-2xl overflow-hidden glass border border-glass-border snap-center shrink-0 flex flex-col items-center justify-center bg-midnight/20">
                  <div className="flex flex-col items-center gap-3 text-desat/40">
                    <ImageIcon size={48} strokeWidth={1} />
                    <span className="text-sm font-bold tracking-widest uppercase">
                      Media Placeholder {idx + 1}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Block 2: Information Split Layout */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 ${project.team && project.team.length > 0 ? 'border-b border-glass-border pb-12' : 'pb-4 mt-12'}`}>
          <div className="lg:col-span-7 flex flex-col gap-12">
            <section className="flex flex-col gap-5">
              <h2 className="text-2xl font-bold text-accent tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>{t('proj_about')}</h2>
              <div className="text-base md:text-lg text-mist leading-relaxed space-y-5" style={{ fontFamily: 'var(--font-body)' }}>
                {project.description}
              </div>
            </section>
            <section className="flex flex-col gap-5">
              <h2 className="text-2xl font-bold text-accent tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>{t('proj_role')}</h2>
              <div className="text-base md:text-lg text-mist leading-relaxed space-y-5" style={{ fontFamily: 'var(--font-body)' }}>
                {project.detailedRole}
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 flex flex-col lg:items-end pt-12 lg:pt-0">
            <div className="flex flex-col gap-10 w-full lg:max-w-sm">
              {(project.links.github || project.links.appStore || project.links.live || project.links.other) && (
                <section className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold tracking-widest text-mist uppercase">{t('proj_links')}</h3>
                  <div className="flex flex-wrap gap-3">
                    {project.links.github && (
                      <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium text-mist hover:text-accent transition-colors glass px-5 py-3 rounded-xl border border-glass-border w-fit">
                        <GithubIcon size={18} /> GitHub
                      </a>
                    )}
                    {project.links.appStore && (
                      <a href={project.links.appStore} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium text-mist hover:text-accent transition-colors glass px-5 py-3 rounded-xl border border-glass-border w-fit">
                        <Smartphone size={18} /> App Store
                      </a>
                    )}
                    {project.links.live && (
                      <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium text-mist hover:text-accent transition-colors glass px-5 py-3 rounded-xl border border-glass-border w-fit">
                        <ExternalLink size={18} /> Website
                      </a>
                    )}
                    {project.links.other && (
                      <a href={project.links.other[1]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium text-mist hover:text-accent transition-colors glass px-5 py-3 rounded-xl border border-glass-border w-fit">
                        <ExternalLink size={18} /> {project.links.other[0]}
                      </a>
                    )}
                  </div>
                </section>
              )}
              <section className="flex flex-col gap-4">
                <h3 className="text-xs font-bold tracking-widest text-mist uppercase">{t('proj_techs')}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="px-4 py-2 rounded-xl text-sm font-medium text-mist border border-glass-border transition-colors hover:text-accent">{tech}</span>
                  ))}
                </div>
              </section>
              <section className="flex flex-col gap-4">
                <h3 className="text-xs font-bold tracking-widest text-mist uppercase">{t('proj_roles')}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {project.roles.map((role) => (
                    <span key={role} className="px-4 py-2 rounded-xl text-sm font-medium text-mist border border-glass-border transition-colors hover:text-accent">{role}</span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Block 3: Credits / Team Section */}
        {project.team && project.team.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-12 gap-6">
              {project.team.map((member, idx) => (
                <div key={idx} className="flex flex-col gap-2 glass p-6 rounded-2xl border border-glass-border hover:border-accent transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-mist text-lg">{member.name}</span>
                    {member.linkedinUrl && (
                      <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-mist hover:text-accent transition-colors" aria-label={`${member.name}'s LinkedIn`}>
                        <ExternalSquareIcon size={18} />
                      </a>
                    )}
                  </div>
                  <span className="text-sm text-accent font-medium leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{member.role}</span>
                </div>
              ))}
            </div>
        )}
      </div>
    </main>
  );
}