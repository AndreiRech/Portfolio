// src/context/SettingsContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
type Language = 'en' | 'pt';

interface SettingsContextType {
  theme: Theme;
  language: Language;
  toggleTheme: (t: Theme) => void;
  toggleLanguage: (l: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    hero_role: 'iOS & Fullstack Developer',
    nav_home: 'Home',
    nav_about: 'About',
    nav_projects: 'Projects',
    nav_experience: 'Experience',
    nav_contact: 'Contact',
    about_title: 'Who I Am',
    about_subtitle: 'About',
    contact_title: "Let's Connect",
    contact_subtitle: 'Get in Touch',
    theme_label: 'THEME',
    lang_label: 'LANGUAGE',
  },
  pt: {
    hero_role: 'Desenvolvedor iOS & Fullstack',
    nav_home: 'Início',
    nav_about: 'Sobre',
    nav_projects: 'Projetos',
    nav_experience: 'Experiência',
    nav_contact: 'Contato',
    about_title: 'Quem Eu Sou',
    about_subtitle: 'Sobre',
    contact_title: 'Vamos Conversar',
    contact_subtitle: 'Contato',
    theme_label: 'TEMA',
    lang_label: 'IDIOMA',
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedLang = localStorage.getItem('lang') as Language;
    if (savedTheme) setTheme(savedTheme);
    if (savedLang) setLanguage(savedLang);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = (t: Theme) => setTheme(t);
  const toggleLanguage = (l: Language) => {
    setLanguage(l);
    localStorage.setItem('lang', l);
  };

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <SettingsContext.Provider value={{ theme, language, toggleTheme, toggleLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};