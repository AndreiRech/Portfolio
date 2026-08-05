// src/components/sections/ExperienceSection.tsx
'use client';

import AnimatedSection from '@/components/AnimatedSection';
import { getExperiences } from '@/data/experiences';
import { useSettings } from '@/context/SettingsContext';

export default function ExperienceSection() {
  const { language, t } = useSettings();
  const experiences = getExperiences(language);

  return (
    <section id="experience" className="section-overlay py-28 md:py-36">
      <div className="section-container">
        <AnimatedSection direction="up">
          <span className="text-sm font-medium tracking-widest text-mustard uppercase">
            {t('exp_subtitle')}
          </span>
          <h2 className="mt-3 text-4xl font-black text-paper md:text-5xl" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('exp_title')}
          </h2>
        </AnimatedSection>

        {/* Timeline */}
        <div className="relative mt-14">
          <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-mustard via-smoke/30 to-transparent md:left-1/2 md:-translate-x-px" />

          {experiences.map((exp, i) => {
            const isLeft = i % 2 === 0;
            return (
              <AnimatedSection key={exp.id} direction={isLeft ? 'left' : 'right'} delay={i * 0.15} className="relative mb-12 last:mb-0">
                <div className={`flex flex-col md:flex-row ${isLeft ? '' : 'md:flex-row-reverse'}`}>
                  <div className={`ml-8 md:ml-0 md:w-1/2 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className="panel panel-hover p-6">
                      <span className="text-xs font-medium tracking-wider text-smoke uppercase">{exp.period}</span>
                      <h3 className="mt-2 text-lg font-bold text-paper" style={{ fontFamily: 'var(--font-heading)' }}>{exp.role}</h3>
                      <p className="mt-1 text-sm font-medium text-mustard">{exp.company}</p>
                      <div className="mt-3 text-sm leading-relaxed text-smoke">
                        {exp.description}
                      </div>
                      <div className={`mt-4 flex flex-wrap gap-2 ${isLeft ? 'md:justify-end' : ''}`}>
                        {exp.technologies.map((tech) => (
                          <span key={tech} className="tag-chip px-2 py-0.5 text-xs">{tech}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute left-0 top-6 -translate-x-1/2 md:left-1/2">
                  {/* A solid mustard stamp with `.panel`'s 2px radius, not the old
                      glowing rose ring — a soft halo is the one thing a printed
                      poster can't do, and a hollow dot would let the timeline
                      line show through its centre. */}
                  <div className="h-3 w-3 rounded-[2px] bg-mustard" />
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}