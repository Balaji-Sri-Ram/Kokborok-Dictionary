import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 
  | 'Kokborok' | 'Reang' | 'Jamatia' | 'Uchoi' | 'Noatia' 
  | 'Halam' | 'Chakma' | 'Mog' | 'Munda' | 'Oraon' 
  | 'Santhal' | 'Kuki' | 'Lusai (Mizo)' | 'Chaimal' 
  | 'Garo' | 'Lepcha';

interface LanguageContextType {
  selectedLanguage: Language;
  setSelectedLanguage: (lang: Language) => void;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('Kokborok');

  // Translation helper function
  const t = (text: string): string => {
    // Replace "Kokborok" (case insensitive) with the selected language
    // But maintain the case (Kokborok -> Uchoi, kokborok -> uchoi)
    return text.replace(/kokborok/gi, (match) => {
      if (match === 'Kokborok') return selectedLanguage;
      if (match === 'KOKBOROK') return selectedLanguage.toUpperCase();
      return selectedLanguage.toLowerCase();
    });
  };

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage, t }}>
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
