export enum MessageType {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
  ERROR = 'ERROR',
  TOOL_LOG = 'TOOL_LOG'
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
  enableMcp: boolean;
}

// MCP / Tool Definitions
export interface McpTool {
  name: string;
  description: string;
  parameters: {
    type: string; // usually 'OBJECT'
    properties: Record<string, any>;
    required?: string[];
  };
  execute: (args: any) => Promise<any>;
}

export interface McpServer {
  name: string;
  tools: McpTool[];
}
