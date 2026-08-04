'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { en, TranslationKey } from '@/locales/en';
import { pt } from '@/locales/pt';

type Language = 'en' | 'pt';

interface SettingsContextType {
  language: Language;
  toggleLanguage: (l: Language) => void;
  t: (key: TranslationKey | string) => string;
}

const dictionaries = { en, pt };

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const toggleLanguage = (l: Language) => {
    setLanguage(l);
    localStorage.setItem('lang', l);
  };

  // Função de tradução super robusta
  const t = (key: TranslationKey | string) => {
    return dictionaries[language][key as TranslationKey] || key;
  };

  return (
    <SettingsContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
