import { GoogleGenAI } from "@google/genai";
import { GeminiModel } from '../types';

interface StreamResponseCallback {
  (chunkText: string): void;
}

export class GeminiService {
  private ai: GoogleGenAI;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.API_KEY;
    if (this.apiKey) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    } else {
      console.error("API_KEY is missing from environment variables.");
      // Fallback instance to prevent crash, though calls will fail
      this.ai = new GoogleGenAI({ apiKey: 'MISSING_KEY' });
    }
  }

  public async streamChat(
    model: GeminiModel,
    prompt: string,
    history: { role: string; parts: { text: string }[] }[],
    systemInstruction: string | undefined,
    onChunk: StreamResponseCallback
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("API Key is missing. Please check your configuration.");
    }

    try {
      // Determine model name and configuration based on internal enum
      let modelName = 'gemini-3-flash-preview';
      let thinkingBudget = 0;

      if (model === GeminiModel.PRO) {
        modelName = 'gemini-3-pro-preview';
      } else if (model === GeminiModel.THINKING_PRO) {
        modelName = 'gemini-3-pro-preview';
        thinkingBudget = 1024; // Default budget for thinking mode
      } else {
        modelName = 'gemini-3-flash-preview';
      }

      // Configure the chat session
      const chat = this.ai.chats.create({
        model: modelName,
        history: history,
        config: {
          systemInstruction: systemInstruction,
          thinkingConfig: thinkingBudget > 0 ? { thinkingBudget } : undefined,
        },
      });

      const result = await chat.sendMessageStream({ message: prompt });
      
      let fullText = '';
      
      for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          onChunk(text);
        }
      }

      return fullText;

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new Error(error.message || "An unknown error occurred while communicating with Gemini.");
    }
  }
}

export const geminiService = new GeminiService();
