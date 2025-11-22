import { GoogleGenAI, Type } from "@google/genai";
import { HAIKU_DATA } from '../constants';
import { GeminiResponse } from '../types';

export const matchHaikuWithGemini = async (userFeeling: string): Promise<GeminiResponse | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare a condensed list of haikus for the context
  const haikuContext = HAIKU_DATA.map(h => `ID: ${h.id}, Tags: ${h.tags.join(', ')}, Text: "${h.text.replace(/\n/g, ' ')}"`).join('\n');

  const prompt = `
    You are a sensitive and poetic assistant. 
    I have a collection of Haikus in French. 
    User input: "${userFeeling}"
    
    Your task is to select the single best matching Haiku ID from the list below that resonates with the user's input feeling or thought.
    If the user input is abstract, find the closest emotional or thematic match.
    
    List of Haikus:
    ${haikuContext}
    
    Return the result in JSON format with two fields:
    1. "haikuId" (number): The ID of the selected haiku.
    2. "explanation" (string): A brief, poetic sentence explaining why this haiku fits the feeling (in French).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            haikuId: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["haikuId", "explanation"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiResponse;
    }
    return null;

  } catch (error) {
    console.error("Error matching haiku:", error);
    return null;
  }
};

export const generateHaigaImage = async (haikuText: string, tags: string[]): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Create a photorealistic, artistic nature photography style image.
    Subject: A visual interpretation of this Haiku poem.
    Haiku: "${haikuText}"
    Themes: ${tags.join(', ')}.
    Mood: Serene, poetic, atmospheric, "National Geographic" style nature photography.
    Aspect Ratio: 3:4 (Portrait).
    No text in the image. High resolution, detailed.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to generate Haiga:", error);
    return null;
  }
};