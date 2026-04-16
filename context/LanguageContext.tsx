import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { getAvailableLanguages } from '@/services/languageDiscovery';
import { Language, DictionaryEntry } from '@/types';

interface LanguageContextType {
  selectedLanguage: Language;
  setSelectedLanguage: (lang: Language) => void;
  availableLanguages: Language[];
  dictionaryData: DictionaryEntry[];
  isLoadingData: boolean;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>(['Kokborok']);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('Kokborok');
  const [dictionaryData, setDictionaryData] = useState<DictionaryEntry[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // 1. Initial Load of available languages
  useEffect(() => {
    const loadLangs = async () => {
      const langs = await getAvailableLanguages();
      setAvailableLanguages(langs);
    };
    loadLangs();
  }, []);

  // 2. Fetch dictionary data whenever selectedLanguage changes
  useEffect(() => {
    const fetchDictionary = async () => {
      setIsLoadingData(true);
      try {
        // Find filename from manifest or fallback to lowercase name
        // For simplicity, we assume /{lang}.json or check manifest if we had more info
        // Let's try to fetch specifically what we need.
        const response = await fetch('/data/languages.json');
        const manifest = await response.json();
        const langInfo = manifest.languages.find((l: any) => l.name.toLowerCase() === selectedLanguage.toLowerCase());
        
        const fileName = langInfo ? langInfo.file : `${selectedLanguage.toLowerCase()}.json`;
        const dictResponse = await fetch(`/data/${fileName}`);
        
        if (dictResponse.ok) {
          const data = await dictResponse.json();
          setDictionaryData(data);
        } else {
          console.error('Failed to load dictionary for', selectedLanguage);
          setDictionaryData([]);
        }
      } catch (error) {
        console.error('Error fetching dictionary:', error);
        setDictionaryData([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDictionary();
  }, [selectedLanguage]);

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
    <LanguageContext.Provider value={{ 
      selectedLanguage, 
      setSelectedLanguage, 
      availableLanguages, 
      dictionaryData, 
      isLoadingData,
      t 
    }}>
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
