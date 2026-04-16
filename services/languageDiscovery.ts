
const BASE_LANGUAGES = [
  'Kokborok', 'Reang', 'Jamatia', 'Uchoi', 'Noatia', 
  'Halam', 'Chakma', 'Mog', 'Munda', 'Oraon', 
  'Santhal', 'Kuki', 'Lusai (Mizo)', 'Chaimal', 
  'Garo', 'Lepcha'
];

/**
 * Fetches available languages from the manifest and merges with base list.
 */
export const getAvailableLanguages = async (): Promise<string[]> => {
  try {
    const response = await fetch('/data/languages.json');
    if (!response.ok) throw new Error('Failed to load manifest');
    const data = await response.json();
    
    const manifestLangs = data.languages.map((l: any) => l.name);
    const combined = new Set([...BASE_LANGUAGES, ...manifestLangs]);
    
    return Array.from(combined).sort((a, b) => {
      if (a === 'Kokborok') return -1;
      if (b === 'Kokborok') return 1;
      return a.localeCompare(b);
    });
  } catch (error) {
    console.error('Error loading languages:', error);
    return BASE_LANGUAGES;
  }
};
