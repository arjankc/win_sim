import { GoogleGenAI, Type } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("No API_KEY provided for Gemini. Using fallback content.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateInstallationTips = async (): Promise<string[]> => {
  const ai = getClient();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate 5 short, concise, marketing-style sentences (max 10 words each) that would appear on a modern OS installation screen while files are copying. They should be positive and welcoming.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Failed to generate tips:", error);
    return [];
  }
};

export const generateWelcomeMessage = async (username: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return `Welcome, ${username}. We're glad you're here.`;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a short, friendly, single-sentence welcome message for a new user named "${username}" starting their new computer.`,
      });
  
      return response.text?.trim() || `Welcome, ${username}.`;
    } catch (error) {
      console.error("Failed to generate welcome:", error);
      return `Welcome, ${username}.`;
    }
  };