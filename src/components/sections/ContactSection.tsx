// src/components/sections/ContactSection.tsx
'use client';

import { Mail } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '@/components/icons';
import AnimatedSection from '@/components/AnimatedSection';
import { useSettings } from '@/context/SettingsContext';

export default function ContactSection() {
  const { t } = useSettings();

  return (
    <section id="contact" className="section-overlay py-28 md:py-36">
      <div className="section-container">
        <AnimatedSection direction="up">
          <span className="text-sm font-medium tracking-widest text-accent uppercase">
            {t('contact_subtitle')}
          </span>
          <h2 className="mt-3 text-4xl font-black text-mist md:text-5xl" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('contact_title')}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-desat md:text-lg">
            {t('contact_desc')}
          </p>
        </AnimatedSection>

        <AnimatedSection direction="up" delay={0.2}>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {/* ... o restante dos seus cartões de email/linkedin/github continuam iguais ... */}
            <a href="mailto:andreirech22@outlook.com" className="glass flex items-center gap-4 rounded-xl p-5 transition-all duration-300 hover:border-accent/30">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10"><Mail size={20} className="text-accent" /></div>
              <div><p className="text-sm font-bold text-mist">Email</p><p className="mt-0.5 text-xs text-desat">andreirech22@outlook.com</p></div>
            </a>
            <a href="https://www.linkedin.com/in/rechandrei/" target="_blank" rel="noopener noreferrer" className="glass flex items-center gap-4 rounded-xl p-5 transition-all duration-300 hover:border-accent/30">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10"><LinkedinIcon size={20} className="text-accent" /></div>
              <div><p className="text-sm font-bold text-mist">LinkedIn</p><p className="mt-0.5 text-xs text-desat">/in/rechandrei</p></div>
            </a>
            <a href="https://github.com/AndreiRech" target="_blank" rel="noopener noreferrer" className="glass flex items-center gap-4 rounded-xl p-5 transition-all duration-300 hover:border-accent/30">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10"><GithubIcon size={20} className="text-accent" /></div>
              <div><p className="text-sm font-bold text-mist">GitHub</p><p className="mt-0.5 text-xs text-desat">/AndreiRech</p></div>
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}