import { DictionaryEntry, TranslationResult } from '@/types';
import { findEnglishTranslation } from '@/utils/searchUtils';

/**
 * Main Kokborok-to-English function for Dictionary search.
 * Since the source dictionary is English-to-Kokborok, we perform a reverse
 * lookup on each Kokborok word to find its corresponding English headword.
 */
export const translateText = (text: string, language: string = 'Kokborok', dataset: DictionaryEntry[]): TranslationResult[] => {
  if (!text.trim() || !dataset) return [];

  const tokens = text.trim().split(/[\s,]+/);

  return tokens.map(token => {
    const cleaned = token.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();
    const entries = findEnglishTranslation(cleaned, language, dataset);

    return {
      original: token,
      cleaned,
      found: entries.length > 0,
      entries: entries
    };
  });
};

/**
 * Clean dictionary Kokborok field for display in Translator.
 */
const cleanKokborokValue = (val: string): string => {
  return val
    .replace(/^(v\.t\.i\.|interro\.|interj\.|indef\.|imper\.|pr\.v\.|v\.t\.|v\.i\.|suff\.|pref\.|pron\.|prep\.|conj\.|abbr\.|f\.v\.|p\.t\.|p\.v\.|adj\.|adv\.|aux\.|vt\.|vi\.|n\.|v\.)\s*-?\s*/i, '')
    .split(/[,;]/)[0]
    .trim();
};

/**
 * Advanced English-to-Target Parallel Translator.
 */
export const translateEnglishToTarget = (text: string, language: string = 'Kokborok', dataset: DictionaryEntry[]): string => {
  if (!text.trim() || !dataset) return "";

  const field = language.toLowerCase();
  const words = text.split(/(\s+|[.,!?;:])/);
  let resultArr: string[] = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    if (!word || word.match(/^\s+$/) || word.match(/[.,!?;:]/)) {
      resultArr.push(word);
      continue;
    }

    let foundPhrase = false;
    for (let len = 5; len >= 2; len--) {
      let phraseWords: string[] = [];
      let tokenIndices: number[] = [];
      
      for (let j = i; j < words.length && phraseWords.length < len; j++) {
        const token = words[j];
        if (token && !token.match(/^\s+$/) && !token.match(/[.,!?;:]/)) {
          phraseWords.push(token);
          tokenIndices.push(j);
        } else if (token.match(/[.,!?;:]/)) {
           break;
        }
      }

      if (phraseWords.length === len) {
        const phraseStr = phraseWords.join(' ').toLowerCase();
        const entry = dataset.find(e => e.english.toLowerCase() === phraseStr);
        
        if (entry) {
          const val = (entry[field] as string) || (entry['kokborok'] as string) || "";
          resultArr.push(cleanKokborokValue(val));
          i = tokenIndices[tokenIndices.length - 1];
          foundPhrase = true;
          break;
        }
      }
    }

    if (!foundPhrase) {
      const entry = dataset.find(e => e.english.toLowerCase() === word.toLowerCase());
      if (entry) {
        const val = (entry[field] as string) || (entry['kokborok'] as string) || "";
        resultArr.push(cleanKokborokValue(val));
      } else {
        resultArr.push(word);
      }
    }
  }

  return resultArr.join('');
};

/**
 * Advanced Target-to-English Parallel Translator.
 */
export const translateTargetToEnglish = (text: string, language: string = 'Kokborok', dataset: DictionaryEntry[]): string => {
  if (!text.trim() || !dataset) return "";

  const words = text.split(/(\s+|[.,!?;:])/);
  let resultArr: string[] = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    if (!word || word.match(/^\s+$/) || word.match(/[.,!?;:]/)) {
      resultArr.push(word);
      continue;
    }

    let foundPhrase = false;
    for (let len = 5; len >= 2; len--) {
      let phraseWords: string[] = [];
      let tokenIndices: number[] = [];
      
      for (let j = i; j < words.length && phraseWords.length < len; j++) {
        const token = words[j];
        if (token && !token.match(/^\s+$/) && !token.match(/[.,!?;:]/)) {
          phraseWords.push(token);
          tokenIndices.push(j);
        } else if (token.match(/[.,!?;:]/)) {
           break;
        }
      }

      if (phraseWords.length === len) {
        const phraseStr = phraseWords.join(' ').toLowerCase();
        const entries = findEnglishTranslation(phraseStr, language, dataset);
        if (entries.length > 0) {
          resultArr.push(entries[0].english);
          i = tokenIndices[tokenIndices.length - 1];
          foundPhrase = true;
          break;
        }
      }
    }

    if (!foundPhrase) {
      const entries = findEnglishTranslation(word.toLowerCase(), language, dataset);
      if (entries.length > 0) {
        resultArr.push(entries[0].english);
      } else {
        resultArr.push(word);
      }
    }
  }

  return resultArr.join('');
};
