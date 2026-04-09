// src/components/Navbar.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Settings, Sun, Moon } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '@/components/icons';
import { navLinks } from '@/data/navigation';
import { useSettings } from '@/context/SettingsContext';
import { IconConfig } from '@/types';

const ICON_CONFIG: IconConfig[] = [
  { id: 'linkedin', component: LinkedinIcon, href: 'https://www.linkedin.com/in/rechandrei/', ariaLabel: 'LinkedIn' },
  { id: 'github', component: GithubIcon, href: 'https://github.com/AndreiRech', ariaLabel: 'GitHub' }
];

export default function Navbar() {
  const { theme, language, toggleTheme, toggleLanguage, t } = useSettings();
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
      <div
        className={`mx-auto flex max-w-5xl items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500 glass shadow-lg shadow-black/20`}
      >
        <button
          onClick={() => handleNavClick('#hero')}
          className="text-base font-black tracking-tight text-mist transition-colors hover:text-accent"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Andrei Rech
        </button>

        <div className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.href)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                activeSection === link.id ? 'text-accent' : 'text-mist hover:text-accent'
              }`}
            >
              {t(link.id === 'hero' ? 'nav_home' : `nav_${link.id}`)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 relative" ref={settingsRef}>
          <div className="hidden sm:flex items-center gap-1 border-r border-glass-border pr-2 mr-1">
            {ICON_CONFIG.map((icon) => {
              const Icon = icon.component;
              return (
                <motion.a
                  key={icon.id}
                  href={icon.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={icon.ariaLabel}
                  className="flex items-center justify-center rounded-full p-2"
                  initial={{ color: '#ECEFF1', backgroundColor: 'transparent' }}
                  whileHover={{ color: '#CC3766', backgroundColor: 'rgba(236, 239, 241, 0.05)' }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size={16} />
                </motion.a>
              );
            })}
          </div>

          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
              settingsOpen
                ? 'border-mist/30 bg-mist/10 text-accent shadow-inner'
                : 'border-glass-border bg-transparent text-mist hover:text-accent'
            }`}
            aria-label="Settings"
          >
            <Settings size={14} className={settingsOpen ? 'animate-spin-slow' : ''} />
          </button>

          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`absolute right-0 top-full mt-3 w-40 rounded-2xl border border-glass-border ${theme === 'light' ? 'bg-mist' : 'bg-base'} p-4 shadow-2xl`}
                style={{ zIndex: 100 }}
              >
                <div className="mb-5">
                  <span className="mb-2 block text-[10px] font-bold tracking-widest text-desat uppercase">{t('theme_label')}</span>
                  <div className={`relative flex h-10 w-full items-center rounded-full ${theme === 'light' ? 'bg-mist' : 'bg-base'} p-1 shadow-inner border border-white/5`}>
                    <motion.div
                      className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full ${theme === 'light' ? 'bg-accent' : 'bg-midnight'}`}
                      animate={{ left: theme === 'dark' ? 'calc(50% + 2px)' : '4px' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    />
                    <button onClick={() => toggleTheme('light')} className={`relative z-10 flex flex-1 items-center justify-center transition-colors duration-200 ${theme === 'light' ? 'text-white' : 'text-desat'}`}><Sun size={14} /></button>
                    <button onClick={() => toggleTheme('dark')} className={`relative z-10 flex flex-1 items-center justify-center transition-colors duration-200 ${theme === 'dark' ? 'text-white' : 'text-desat'}`}><Moon size={14} /></button>
                  </div>
                </div>
                <div>
                  <span className="mb-2 block text-[10px] font-bold tracking-widest text-desat uppercase">{t('lang_label')}</span>
                  <div className={`relative flex h-10 w-full items-center rounded-full ${theme === 'light' ? 'bg-mist' : 'bg-base'} p-1 shadow-inner border border-white/5`}>
                    <motion.div
                      className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full ${theme === 'light' ? 'bg-accent' : 'bg-midnight'}`}
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
            className="ml-1 rounded-full p-2 text-desat transition-colors hover:text-mist md:hidden"
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
            className="glass mx-auto mt-2 max-w-5xl overflow-hidden rounded-2xl md:hidden"
          >
            <div className="flex flex-col gap-1 p-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.href)}
                  className={`rounded-lg px-4 py-2.5 text-left text-sm transition-colors ${
                    activeSection === link.id ? 'text-accent' : 'text-desat hover:text-mist'
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