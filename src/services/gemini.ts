import { GoogleGenAI, Modality, Type } from "@google/genai";
import { usageService } from "./usageService";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async generateText(prompt: string, image?: { data: string; mimeType: string }) {
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: image 
        ? [{ parts: [{ text: prompt }, { inlineData: { data: image.data, mimeType: image.mimeType } }] }]
        : [{ parts: [{ text: prompt }] }],
    });
    const response = await model;
    return response.text || "";
  },

  async generateImage(prompt: string, images: { data: string; mimeType: string }[] = []) {
    if (usageService.hasReachedLimit()) {
      throw new Error("Limit harian tercapai. Silakan coba lagi besok atau upgrade akun.");
    }

    const parts: any[] = [{ text: prompt }];
    images.forEach((img) => {
      parts.push({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType,
        },
      });
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ parts }],
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (imagePart?.inlineData) {
      usageService.incrementUsage();
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    
    // Fallback to text if no image returned (e.g. safety filter)
    const textPart = response.candidates?.[0]?.content?.parts?.find((p) => p.text);
    if (textPart?.text) {
      throw new Error(textPart.text);
    }
    
    throw new Error("Failed to generate image");
  },

  async generateSpeech(text: string, voice: string = "Kore", instruction?: string) {
    const prompt = instruction ? `${instruction}: ${text}` : text;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/wav;base64,${base64Audio}`;
    }
    throw new Error("Failed to generate speech");
  },
};
