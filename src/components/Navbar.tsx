// src/components/Navbar.tsx
'use client';

import { useState, useEffect, useCallback, useRef, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Settings } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '@/components/icons';
import { navLinks } from '@/data/navigation';
import { useSettings } from '@/context/SettingsContext';
import { IconConfig } from '@/types';

const ICON_CONFIG: IconConfig[] = [
  { id: 'linkedin', component: LinkedinIcon, href: 'https://www.linkedin.com/in/rechandrei/', ariaLabel: 'LinkedIn' },
  { id: 'github', component: GithubIcon, href: 'https://github.com/AndreiRech', ariaLabel: 'GitHub' }
];

/** The backing layers of a torn-poster panel: the offset print shadow and
    the scrap itself. They paint the background of whatever `torn` container
    they sit in, so they go *beside* that container's content — `clip-path`
    clips descendants, and the settings dropdown has to be free to overflow. */
function TornBacking() {
  return (
    <>
      <span aria-hidden="true" className="torn-shadow" />
      <span aria-hidden="true" className="torn-scrap" />
    </>
  );
}

export default function Navbar() {
  const { language, toggleLanguage, t } = useSettings();
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const settingsRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    if (settingsOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsOpen]);

  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.id);
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-40% 0px -55% 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-6"
    >
      {/* `torn` isolates this box, so the settings dropdown's own z-index no
          longer reaches past it — the bar has to outrank the mobile menu here
          for the dropdown to stay on top of an open menu. */}
      <div className="torn z-10 mx-auto flex max-w-5xl items-center justify-between px-7 py-4" data-scrolled={scrolled}>
        <TornBacking />

        <button
          onClick={() => handleNavClick('#hero')}
          className="glitch-hover text-base font-black tracking-wide uppercase text-paper transition-colors hover:text-mustard"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Andrei Rech
        </button>

        <div className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.href)}
              className={`glitch-hover relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                activeSection === link.id ? 'text-mustard' : 'text-paper hover:text-mustard'
              }`}
            >
              {t(link.id === 'hero' ? 'nav_home' : `nav_${link.id}`)}
              {activeSection === link.id && (
                <span aria-hidden="true" className="absolute inset-x-2 bottom-0.5 h-[2px] bg-mustard" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 relative" ref={settingsRef}>
          <div className="hidden sm:flex items-center gap-1 border-r border-panel-border pr-2 mr-1">
            {ICON_CONFIG.map((icon) => {
              const Icon = icon.component;
              return (
                <a
                  key={icon.id}
                  href={icon.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={icon.ariaLabel}
                  className="flex items-center justify-center p-2 text-paper transition-colors duration-200 hover:text-mustard"
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>

          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`flex h-8 w-8 items-center justify-center rounded-[2px] border-2 transition-colors duration-200 ${
              settingsOpen
                ? 'border-mustard bg-mustard text-ink'
                : 'border-panel-border bg-transparent text-paper hover:border-mustard hover:text-mustard'
            }`}
            aria-label="Settings"
          >
            <Settings size={14} />
          </button>

          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="panel absolute right-0 top-full mt-4 w-40 p-4"
                style={{ zIndex: 100, '--panel-offset': '4px' } as CSSProperties}
              >
                <div>
                  <span className="mb-2 block text-[10px] font-bold tracking-widest text-smoke uppercase">{t('lang_label')}</span>
                  <div className="relative flex h-10 w-full items-center rounded-[2px] border-2 border-panel-border bg-ink p-1">
                    <motion.div
                      className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[2px] bg-plum"
                      animate={{ left: language === 'en' ? 'calc(50% + 2px)' : '4px' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    />
                    <button onClick={() => toggleLanguage('pt')} className="relative z-10 flex flex-1 items-center justify-center"><span className="text-[16px] leading-none grayscale-[0.2]">🇧🇷</span></button>
                    <button onClick={() => toggleLanguage('en')} className="relative z-10 flex flex-1 items-center justify-center"><span className="text-[16px] leading-none grayscale-[0.2]">🇺🇸</span></button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="ml-1 p-2 text-smoke transition-colors hover:text-paper md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="torn torn-menu mx-auto mt-3 max-w-5xl overflow-hidden md:hidden"
          >
            <TornBacking />

            <div className="flex flex-col gap-1 p-4 pr-6 pb-6">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.href)}
                  className={`glitch-hover px-4 py-2.5 text-left text-sm transition-colors ${
                    activeSection === link.id
                      ? 'text-mustard border-l-2 border-mustard'
                      : 'text-paper border-l-2 border-transparent hover:text-mustard'
                  }`}
                >
                  {t(link.id === 'hero' ? 'nav_home' : `nav_${link.id}`)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}