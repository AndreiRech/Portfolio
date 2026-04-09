'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { en, TranslationKey } from '@/locales/en';
import { pt } from '@/locales/pt';

type Theme = 'dark' | 'light';
type Language = 'en' | 'pt';

interface SettingsContextType {
  theme: Theme;
  language: Language;
  toggleTheme: (t: Theme) => void;
  toggleLanguage: (l: Language) => void;
  t: (key: TranslationKey | string) => string;
}

const dictionaries = { en, pt };

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

  // Função de tradução super robusta
  const t = (key: TranslationKey | string) => {
    return dictionaries[language][key as TranslationKey] || key;
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