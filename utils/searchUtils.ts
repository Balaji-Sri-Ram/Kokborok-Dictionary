import { DictionaryEntry } from '@/types';

/**
 * Normalizes a phrase for comparison.
 */
export const normalizePhrase = (phrase: string): string => {
  return phrase
    .toLowerCase()
    .replace(/^[\s\-\.]+|[\s\-\.]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Searches for a word in the dataset and returns ALL matching English headwords.
 */
export const findEnglishTranslation = (query: string, language: string, dataset: DictionaryEntry[]): DictionaryEntry[] => {
  if (!query || !dataset) return [];

  const inputPhrase = normalizePhrase(query);
  if (!inputPhrase) return [];

  const field = language.toLowerCase();

  return dataset.filter(e => {
    const definition = (e[field] as string) || (e['kokborok'] as string) || "";
    if (!definition) return false;

    if (normalizePhrase(definition) === inputPhrase) return true;

    const phrases = definition.split(/[,;\/]/);

    return phrases.some(p => {
      const cleanP = normalizePhrase(p);
      const cleanPWithoutPOS = cleanP.replace(/^(v\.t\.|v\.i\.|n\.|adj\.|adv\.)\s*-?\s*/, '');
      return cleanP === inputPhrase || cleanPWithoutPOS === inputPhrase;
    });
  });
};

export const findTargetTranslation = (english: string, language: string, dataset: DictionaryEntry[]): string => {
  if (!dataset) return "Translation not found";
  const field = language.toLowerCase();
  const result = dataset.find(e => e.english.toLowerCase() === english.toLowerCase());
  if (!result) return "Translation not found";
  return (result[field] as string) || (result['kokborok'] as string) || "Translation not found";
};
