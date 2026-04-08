// src/components/Navbar.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '@/components/icons';
import { navLinks } from '@/data/navigation';

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Intersection observer for active section tracking
  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.id);
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
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
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-6"
    >
      <div
        className={`mx-auto flex max-w-5xl items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500 ${
          scrolled
            ? 'glass shadow-lg shadow-black/20'
            : 'bg-transparent border border-transparent'
        }`}
      >
        {/* Brand */}
        <button
          onClick={() => handleNavClick('#hero')}
          className="text-base font-black tracking-tight text-mist transition-colors hover:text-accent"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Andrei Rech
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.href)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                activeSection === link.id
                  ? 'text-accent'
                  : 'text-desat hover:text-mist'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right side — social + controls */}
        <div className="flex items-center gap-1.5">
          <a
            href="https://www.linkedin.com/in/rechandrei/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-glass-border px-3 py-1.5 text-xs text-desat transition-all hover:border-mist/20 hover:text-mist"
            aria-label="LinkedIn"
          >
            <LinkedinIcon size={12} />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>
          <a
            href="https://github.com/AndreiRech"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-glass-border px-3 py-1.5 text-xs text-desat transition-all hover:border-mist/20 hover:text-mist"
            aria-label="GitHub"
          >
            <GithubIcon size={12} />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="ml-1 rounded-full p-2 text-desat transition-colors hover:text-mist md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
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
                    activeSection === link.id
                      ? 'text-accent'
                      : 'text-desat hover:text-mist'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}