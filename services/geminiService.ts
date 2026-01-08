import { GoogleGenAI, Chat } from "@google/genai";
import { GeminiModel } from '../types';
import { mcpRegistry } from './mcp';

interface StreamResponseCallback {
  (chunkText: string): void;
}

interface ToolExecutionCallback {
  (toolName: string, args: any): void;
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
      this.ai = new GoogleGenAI({ apiKey: 'MISSING_KEY' });
    }
  }

  public async streamChat(
    model: GeminiModel,
    prompt: string,
    history: { role: string; parts: any[] }[],
    systemInstruction: string | undefined,
    enableMcp: boolean,
    onChunk: StreamResponseCallback,
    onToolStart: ToolExecutionCallback
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("API Key is missing. Please check your configuration.");
    }

    try {
      let modelName = 'gemini-3-flash-preview';
      let thinkingBudget = 0;

      if (model === GeminiModel.PRO) {
        modelName = 'gemini-3-pro-preview';
      } else if (model === GeminiModel.THINKING_PRO) {
        modelName = 'gemini-3-pro-preview';
        thinkingBudget = 1024;
      }

      // Prepare tools if enabled
      const tools = enableMcp ? mcpRegistry.getGeminiTools() : undefined;

      // Initialize Chat
      const chat = this.ai.chats.create({
        model: modelName,
        history: history,
        config: {
          systemInstruction: systemInstruction,
          thinkingConfig: thinkingBudget > 0 ? { thinkingBudget } : undefined,
          tools: tools,
        },
      });

      // Initial message
      let currentResult = await chat.sendMessageStream({ message: prompt });
      let finalFullText = '';
      
      // Loop to handle potential multiple turns of tool usage
      while (true) {
        let textInTurn = '';
        let functionCalls: any[] = [];

        // Process stream
        for await (const chunk of currentResult) {
          // 1. Text content
          const text = chunk.text;
          if (text) {
            textInTurn += text;
            finalFullText += text;
            onChunk(text);
          }
          
          // 2. Function Calls (accumulate them, as they might be split or multiple)
          const calls = chunk.functionCalls;
          if (calls && calls.length > 0) {
            functionCalls.push(...calls);
          }
        }

        // If no function calls, we are done with this turn
        if (functionCalls.length === 0) {
          break;
        }

        // Execute Tools
        const functionResponses = [];
        for (const call of functionCalls) {
          onToolStart(call.name, call.args);
          try {
            const result = await mcpRegistry.executeTool(call.name, call.args);
            functionResponses.push({
              id: call.id,
              name: call.name,
              response: { result: result }
            });
          } catch (e: any) {
            functionResponses.push({
              id: call.id,
              name: call.name,
              response: { error: e.message } 
            });
          }
        }

        // Send tool results back to the model and continue the stream
        currentResult = await chat.sendMessageStream({
          parts: [{ functionResponse: { functionResponses } }] 
        });
      }

      return finalFullText;

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new Error(error.message || "An unknown error occurred while communicating with Gemini.");
    }
  }
}

export const geminiService = new GeminiService();
