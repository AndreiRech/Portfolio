// src/components/sections/ContactSection.tsx
'use client';

import { Mail } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '@/components/icons';
import AnimatedSection from '@/components/AnimatedSection';
import { useSettings } from '@/context/SettingsContext';
import { ContactLink } from '@/types';

/** The three contact cards differ only in icon, label, and href — one shared
    definition keeps their poster-panel styling from drifting apart. */
const CONTACT_LINKS: ContactLink[] = [
  { id: 'email', label: 'Email', value: 'andreirech22@outlook.com', href: 'mailto:andreirech22@outlook.com', component: Mail },
  { id: 'linkedin', label: 'LinkedIn', value: '/in/rechandrei', href: 'https://www.linkedin.com/in/rechandrei/', component: LinkedinIcon },
  { id: 'github', label: 'GitHub', value: '/AndreiRech', href: 'https://github.com/AndreiRech', component: GithubIcon },
];

export default function ContactSection() {
  const { t } = useSettings();

  return (
    <section id="contact" className="section-overlay py-28 md:py-36">
      <div className="section-container">
        <AnimatedSection direction="up">
          <span className="text-sm font-medium tracking-widest text-mustard uppercase">
            {t('contact_subtitle')}
          </span>
          <h2 className="mt-3 text-4xl font-black text-paper md:text-5xl" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('contact_title')}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-smoke md:text-lg">
            {t('contact_desc')}
          </p>
        </AnimatedSection>

        <AnimatedSection direction="up" delay={0.2}>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {CONTACT_LINKS.map(({ id, label, value, href, component: Icon }) => (
              <a
                key={id}
                href={href}
                {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="panel panel-hover group flex items-center gap-4 p-5"
              >
                {/* Plum is unreadable as text on ink but reads fine as a solid
                    stamp under a paper glyph; hovering flips it to mustard so
                    the tile confirms the hover alongside `.panel-hover`'s border. */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] bg-plum text-paper transition-colors duration-200 group-hover:bg-mustard group-hover:text-ink">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-paper">{label}</p>
                  <p className="mt-0.5 text-xs text-smoke">{value}</p>
                </div>
              </a>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}