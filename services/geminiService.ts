
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeWithGemini = async (text: string): Promise<string> => {
  try {
    const model = 'gemini-3-pro-preview';
    const prompt = `
      You are an expert NLP system acting as the digital interface for Binoy Debbarma's "English-Kokborok-Bengali Dictionary".
      
      Your task is to analyze the following Kokborok input: "${text}"
      
      RULES FOR ANALYSIS (Strictly from the provided lexicon):
      1. PRONUNCIATION (Page 18):
         - A = Apple
         - E = Emperor
         - I = Ink
         - O = Oblige
         - U = Utgard
         - W = (U) Wake (e.g., 'Wng' = To be)
      2. NUMBERS (Appendix XII): 
         - Use the 'Pe' method for tens (Nwipe=20, Thampe=30).
         - 10,000 = Thwlwng. 100,000 = Rwbam.
      3. BODY PARTS (Appendix XVII):
         - Bwkha = Heart/Liver/Mind. Omthai = Navel.
      4. KINSHIP (Appendix XIII):
         - Chu = Grandfather, Chwi = Grandmother.
      
      For each word in the input, provide:
      - The English Meaning.
      - Part of Speech (POS) using dictionary abbreviations (n., v.t., v.i., adj., adv., pref., pron., etc.)
      - Pronunciation Guide.
      
      Return a clean Markdown response with a "Lexical Breakdown" section.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1500 }
      }
    });

    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    throw error;
  }
};
