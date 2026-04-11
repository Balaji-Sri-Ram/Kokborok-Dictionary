import dictionaryData from '../src/data/dictionary.json';

const BASE_LANGUAGES = [
  'Kokborok', 'Reang', 'Jamatia', 'Uchoi', 'Noatia', 
  'Halam', 'Chakma', 'Mog', 'Munda', 'Oraon', 
  'Santhal', 'Kuki', 'Lusai (Mizo)', 'Chaimal', 
  'Garo', 'Lepcha'
];

/**
 * Scans the dictionary to find all available language keys.
 * Merges the base list with any new languages found in the JSON.
 */
export const getAvailableLanguages = (): string[] => {
  const metadataKeys = ['english', 'pos', 'pronunciation', 'page', 'id', 'bengali'];
  const detectedKeys = new Set<string>();
  
  // Check first 100 entries to catch languages that might not be in entry #1
  const limit = Math.min(Array.isArray(dictionaryData) ? dictionaryData.length : 0, 100);
  for (let i = 0; i < limit; i++) {
    Object.keys(dictionaryData[i]).forEach(key => {
      if (!metadataKeys.includes(key.toLowerCase())) {
        detectedKeys.add(capitalize(key));
      }
    });
  }

  // Combine Base list with Detected keys
  const combined = new Set([...BASE_LANGUAGES, ...Array.from(detectedKeys)]);
  
  // Sort, but keep Kokborok first
  return Array.from(combined).sort((a, b) => {
    if (a === 'Kokborok') return -1;
    if (b === 'Kokborok') return 1;
    return a.localeCompare(b);
  });
};

const capitalize = (s: string) => {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};
