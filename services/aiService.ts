import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const analyzeWithAI = async (text: string, model: string): Promise<string> => {
    try {
        const prompt = `
      You are an expert linguist and translator specializing in the Kokborok language (Tripuri).

      Your task is to provide a detailed analysis of the following Kokborok input: "${text}"

      Please utilize your wide range of knowledge sources (including linguistic databases, cultural context, and general knowledge similar to Wikipedia) to explain the input.

      For the input, please provide:
      1. **Meaning**: The detailed English meaning or definition.
      2. **Example Usage**: Provide sentence examples or passage usage to demonstrate how the word/phrase is used in context.

      Return the response in a clear, formatted Markdown style.
    `;

        if (model.includes('gemini')) {
            if (!import.meta.env.VITE_GEMINI_API_KEY) {
                throw new Error("Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.");
            }

            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
            });

            return response.text || "Analysis unavailable.";
        } else if (model.includes('claude')) {
            const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
            if (!anthropicKey) {
                throw new Error("Anthropic API key is missing. Please add VITE_ANTHROPIC_API_KEY to your .env.local file to use Claude models.");
            }

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': anthropicKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: model,
                    max_tokens: 1024,
                    messages: [
                        { role: "user", content: prompt }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "Failed to analyze with Claude.");
            }

            const data = await response.json();
            return data.content[0].text;
        }

        throw new Error("Unsupported model selected.");

    } catch (error: any) {
        console.error("AI analysis failed:", error);
        throw new Error(error.message || "Failed to analyze text.");
    }
};
