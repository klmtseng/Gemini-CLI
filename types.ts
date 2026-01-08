export enum MessageType {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
  ERROR = 'ERROR'
}

export interface TerminalMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: number;
}

export enum GeminiModel {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview',
  THINKING_PRO = 'gemini-3-pro-preview-thinking', // Internal representation for Pro with thinking budget
}

export interface TerminalConfig {
  model: GeminiModel;
  systemInstruction?: string;
}
