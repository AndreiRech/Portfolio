'use client';

import AnimatedSection from '@/components/AnimatedSection';
import Image from 'next/image';
import { useSettings } from '@/context/SettingsContext';

const skills = [
  { category: 'Backend & Web', items: ['Node.js', 'NestJS', 'FastAPI', 'React', 'Next', 'Tailwind', 'TypeScript', 'SpringBoot'] },
  { category: 'iOS', items: ['Swift', 'SwiftUI', 'CloudKit', 'Testing', 'XCodeCloud', 'MVVM'] },
  { category: 'Data & Languages', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Cassandra', 'Python', 'Java', 'Swift', 'TypeScript'] },
  { category: 'Tools & DevOps', items: ['Docker', 'Github Action', 'Figma', 'Azure', 'Prisma'] },
];

export default function AboutSection() {
  const { t } = useSettings();

  return (
    <section id="about" className="section-overlay py-28 md:py-36">
      <div className="section-container">
        <AnimatedSection direction="left">
          <span className="text-sm font-medium tracking-widest text-mustard uppercase">
            {t('about_subtitle')}
          </span>
          <h2
            className="glitch-reveal mt-3 text-4xl font-black text-paper md:text-5xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t('about_title')}
          </h2>
        </AnimatedSection>

        <div className="mt-12 grid gap-12 md:grid-cols-[280px_1fr]">
          <AnimatedSection direction="left" delay={0.15}>
            <div className="flex flex-col items-center gap-8 md:items-start w-full">
              <div className="panel flex h-72 w-full items-center justify-center overflow-hidden md:h-80">
                {/* The screen wraps the photo, not the frame: the portrait is
                    letterboxed inside the panel, and dots multiplied over the
                    bare panel fill either side of it would read as a dirty
                    label rather than a screened photograph. */}
                <div className="halftone h-full">
                  <Image
                    src={t('about_photo')}
                    alt="Profile Photo"
                    width={400}
                    height={400}
                    quality={100}
                    draggable={false}
                    className="h-full w-auto object-contain pointer-events-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <h2 className="text-base font-bold text-mustard leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t('about_edu_title')}
                </h2>
                <h3 className="text-lg font-bold text-paper leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t('about_edu_degree')}
                </h3>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-smoke leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                    {t('about_edu_uni')}
                  </p>
                  <span className="text-xs font-medium tracking-wider text-smoke/60 uppercase">
                    2023 — 2026
                  </span>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <div className="flex flex-col gap-10">
            <AnimatedSection direction="right" delay={0.2}>
              <div className="space-y-5 text-base leading-relaxed text-smoke md:text-lg">
                <p>{t('about_p1')}</p>
                <p>{t('about_p2')}</p>
                <p>{t('about_p3')}</p>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.3}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skills.map((group) => (
                  <div
                    key={group.category}
                    className="panel panel-hover p-5"
                  >
                    <h3 className="mb-4 text-sm font-bold tracking-wider text-mustard uppercase">
                      {group.category}
                    </h3>
                    
                    <ul className="flex flex-wrap gap-3">
                      {group.items.map((item) => (
                        <li 
                          key={item} 
                          className="tag-chip px-2.5 py-1 text-xs"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                    
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}