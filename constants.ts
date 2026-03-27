
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

export const findKokborokTranslation = (english: string): string => {
  const result = STATIC_DATASET.find(e => e.english.toLowerCase() === english.toLowerCase());
  return result ? result.kokborok : "Translation not found";
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
 * Searches for a Kokborok word in the dataset and returns ALL matching English headwords.
 * Uses STRICT PHRASE MATCHING (comma/semicolon/slash separated).
 */
export const findEnglishTranslation = (kokborok: string): DictionaryEntry[] => {
  if (!kokborok) return [];

  const inputPhrase = normalizePhrase(kokborok);
  if (!inputPhrase) return [];

  return STATIC_DATASET.filter(e => {
    // 1. Check if the input specifically matches the "kokborok" field itself (rare, but possibly for single word entries)
    if (normalizePhrase(e.kokborok) === inputPhrase) return true;

    // 2. Split the kokborok definition into phrases based on common delimiters
    // Delimiters found in PDF: comma (,), semicolon (;), slash (/), and sometimes dash (-)
    const phrases = e.kokborok.split(/[,;\/]/);

    return phrases.some(p => {
      const cleanP = normalizePhrase(p);
      // Remove common garbage prefixes like "v.t. - " or "n. - " that might be stuck in the text
      const cleanPWithoutPOS = cleanP.replace(/^(v\.t\.|v\.i\.|n\.|adj\.|adv\.)\s*-?\s*/, '');

      return cleanP === inputPhrase || cleanPWithoutPOS === inputPhrase;
    });
  });
};
