
import { findEnglishTranslation } from '../constants';
import { TranslationResult } from '../types';

/**
 * Main translation function.
 * Since the source dictionary is English-to-Kokborok, we perform a reverse
 * lookup on each Kokborok word to find its corresponding English headword.
 */
export const translateText = (text: string): TranslationResult[] => {
  if (!text.trim()) return [];

  // Split the input into words, ignoring common punctuation
  const tokens = text.trim().split(/[\s,]+/);

  return tokens.map(token => {
    // Clean token (remove ending punctuation, lowercase)
    const cleaned = token.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();

    // Find the English entries that have this Kokborok word in definition
    const entries = findEnglishTranslation(cleaned);

    return {
      original: token,
      cleaned,
      found: entries.length > 0,
      entries: entries
    };
  });
};
