
import { DictionaryEntry } from './types';
import dictionaryData from './src/data/dictionary.json';
import numberData from './src/data/numbers.json';

// Cast imported data to DictionaryEntry[] to handle extra fields like 'page'
const DICTIONARY: DictionaryEntry[] = [
  ...(dictionaryData as unknown as DictionaryEntry[]),
  ...(numberData as unknown as DictionaryEntry[])
];

export const MOCK_EXAMPLES = [
  "thansa khlaima",
  "akhra",
  "kula",
  "lekhama",
  "phrem",
  "Nwipe bwtang"
];

export const STATIC_DATASET: DictionaryEntry[] = DICTIONARY;

export const findTargetTranslation = (english: string, language: string = 'kokborok'): string => {
  const field = language.toLowerCase();
  const result = STATIC_DATASET.find(e => e.english.toLowerCase() === english.toLowerCase());
  if (!result) return "Translation not found";
  return (result[field] as string) || (result['kokborok'] as string) || "Translation not found";
};

/**
 * Normalizes a Kokborok phrase for comparison.
 * Removes leading/trailing punctuation, extra spaces, and common dictionary markers like '-'.
 */
const normalizePhrase = (phrase: string): string => {
  return phrase
    .toLowerCase()
    .replace(/^[\s\-\.]+|[\s\-\.]+$/g, '') // Trim leading/trailing dashes, dots, spaces
    .replace(/\s+/g, ' ') // Collapse spaces
    .trim();
};

/**
 * Searches for a word in the dataset and returns ALL matching English headwords.
 * Uses STRICT PHRASE MATCHING (comma/semicolon/slash separated).
 */
export const findEnglishTranslation = (query: string, language: string = 'kokborok'): DictionaryEntry[] => {
  if (!query) return [];

  const inputPhrase = normalizePhrase(query);
  if (!inputPhrase) return [];

  const field = language.toLowerCase();

  return STATIC_DATASET.filter(e => {
    // Get the definition string for the specified language
    const definition = (e[field] as string) || (e['kokborok'] as string) || "";
    if (!definition) return false;

    // 1. Check if the input specifically matches the field itself
    if (normalizePhrase(definition) === inputPhrase) return true;

    // 2. Split the definition into phrases based on common delimiters
    const phrases = definition.split(/[,;\/]/);

    return phrases.some(p => {
      const cleanP = normalizePhrase(p);
      // Remove common garbage prefixes like "v.t. - " or "n. - " that might be stuck in the text
      const cleanPWithoutPOS = cleanP.replace(/^(v\.t\.|v\.i\.|n\.|adj\.|adv\.)\s*-?\s*/, '');

      return cleanP === inputPhrase || cleanPWithoutPOS === inputPhrase;
    });
  });
};
