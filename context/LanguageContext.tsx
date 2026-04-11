import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { getAvailableLanguages } from '../services/languageDiscovery';
import { Language } from '../types';

interface LanguageContextType {
  selectedLanguage: Language;
  setSelectedLanguage: (lang: Language) => void;
  availableLanguages: Language[];
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [availableLanguages] = useState<Language[]>(() => {
    const langs = getAvailableLanguages();
    console.log('Available Languages:', langs);
    return langs;
  });
  
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    const defaultLang = availableLanguages.includes('Kokborok') ? 'Kokborok' : availableLanguages[0];
    console.log('Initial Selected Language:', defaultLang);
    return defaultLang;
  });

  // Translation helper function
  const t = useMemo(() => (text: string): string => {
    if (!selectedLanguage) return text;
    
    return text.replace(/kokborok/gi, (match) => {
      const displayLang = selectedLanguage || 'Kokborok';
      if (match === 'Kokborok') return displayLang;
      if (match === 'KOKBOROK') return displayLang.toUpperCase();
      return displayLang.toLowerCase();
    });
  }, [selectedLanguage]);

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage, availableLanguages, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
