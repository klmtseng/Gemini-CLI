import { GeminiModel } from './types';

export const INITIAL_WELCOME_MESSAGE = `
Welcome to Gemini CLI [Version 1.0.0]
(c) Google GenAI SDK. All rights reserved.

Type a message to start chatting.
----------------------------------------------------------------
Available Commands:
  /help       - Show this help message
  /clear      - Clear terminal history
  /model      - Switch AI models (flash | pro)
  /system     - Set system instruction
----------------------------------------------------------------
`;

export const DEFAULT_MODEL = GeminiModel.FLASH;
