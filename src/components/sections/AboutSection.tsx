'use client';

import AnimatedSection from '@/components/AnimatedSection';
import { User } from 'lucide-react';
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
          <span className="text-sm font-medium tracking-widest text-accent uppercase">
            {t('about_subtitle')}
          </span>
          <h2
            className="mt-3 text-4xl font-black text-mist md:text-5xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t('about_title')}
          </h2>
        </AnimatedSection>

        <div className="mt-12 grid gap-12 md:grid-cols-[280px_1fr]">
          <AnimatedSection direction="left" delay={0.15}>
            <div className="flex flex-col items-center gap-8 md:items-start w-full">
              <div className="glass flex h-72 w-full items-center justify-center overflow-hidden rounded-2xl md:h-80">
                <div className="flex flex-col items-center gap-3 text-desat/40">
                  <User size={48} strokeWidth={1} />
                  <span className="text-xs tracking-widest uppercase">
                    {t('about_photo')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <h2 className="text-md font-bold text-accent leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t('about_edu_title')}
                </h2>
                <h3 className="text-lg font-bold text-mist leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t('about_edu_degree')}
                </h3>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-desat leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                    {t('about_edu_uni')}
                  </p>
                  <span className="text-xs font-medium tracking-wider text-desat/60 uppercase">
                    2023 — 2026
                  </span>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <div className="flex flex-col gap-10">
            <AnimatedSection direction="right" delay={0.2}>
              <div className="space-y-5 text-base leading-relaxed text-desat md:text-lg">
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
                    className="glass rounded-xl p-5 transition-all duration-300 hover:border-accent/30"
                  >
                    <h3 className="mb-4 text-sm font-bold tracking-wider text-accent uppercase">
                      {group.category}
                    </h3>
                    
                    <ul className="flex flex-wrap gap-3">
                      {group.items.map((item) => (
                        <li 
                          key={item} 
                          className="rounded-md border border-glass-border bg-glass-hover px-2.5 py-1 text-xs text-mist transition-colors hover:text-accent"
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