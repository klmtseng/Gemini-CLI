import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TerminalMessage, MessageType, TerminalConfig, GeminiModel } from '../types';
import { INITIAL_WELCOME_MESSAGE, DEFAULT_MODEL } from '../constants';
import { geminiService } from '../services/geminiService';
import MessageItem from './MessageItem';

const Terminal: React.FC = () => {
  // State
  const [messages, setMessages] = useState<TerminalMessage[]>([
    {
      id: uuidv4(),
      type: MessageType.SYSTEM,
      content: INITIAL_WELCOME_MESSAGE,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [config, setConfig] = useState<TerminalConfig>({
    model: DEFAULT_MODEL,
    systemInstruction: undefined,
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  // Refs
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isProcessing]);

  // Focus input on click anywhere
  const handleContainerClick = () => {
    // Only focus if user isn't selecting text
    const selection = window.getSelection();
    if (selection && selection.type !== 'Range') {
      inputRef.current?.focus();
    }
  };

  const addMessage = useCallback((type: MessageType, content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        type,
        content,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          content: content,
        };
      }
      return newMessages;
    });
  }, []);

  const handleCommand = (cmd: string, args: string[]) => {
    switch (cmd) {
      case 'help':
        addMessage(MessageType.SYSTEM, INITIAL_WELCOME_MESSAGE);
        break;
      case 'clear':
        setMessages([]);
        break;
      case 'model':
        if (args.length === 0) {
          addMessage(MessageType.SYSTEM, `Current model: ${config.model}`);
        } else {
          const modelName = args[0].toLowerCase();
          if (modelName === 'flash') {
            setConfig(prev => ({ ...prev, model: GeminiModel.FLASH }));
            addMessage(MessageType.SYSTEM, `Switched to ${GeminiModel.FLASH}`);
          } else if (modelName === 'pro') {
            setConfig(prev => ({ ...prev, model: GeminiModel.PRO }));
            addMessage(MessageType.SYSTEM, `Switched to ${GeminiModel.PRO}`);
          } else {
            addMessage(MessageType.ERROR, `Unknown model: ${modelName}. Available: flash, pro`);
          }
        }
        break;
      case 'system':
        if (args.length === 0) {
           addMessage(MessageType.SYSTEM, `Current system instruction: ${config.systemInstruction || '(none)'}`);
        } else {
           const instruction = args.join(' ');
           setConfig(prev => ({ ...prev, systemInstruction: instruction }));
           addMessage(MessageType.SYSTEM, `System instruction updated.`);
        }
        break;
      default:
        addMessage(MessageType.ERROR, `Command not found: /${cmd}. Type /help for assistance.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt || isProcessing) return;

    // Add to command history
    setCommandHistory(prev => [prompt, ...prev]);
    setHistoryIndex(-1);
    setInput('');

    // Handle slash commands
    if (prompt.startsWith('/')) {
      const parts = prompt.slice(1).split(' ');
      const command = parts[0].toLowerCase();
      const args = parts.slice(1);
      
      // Render user command first
      addMessage(MessageType.USER, prompt);
      
      // Execute
      setTimeout(() => handleCommand(command, args), 10);
      return;
    }

    // Handle normal chat
    addMessage(MessageType.USER, prompt);
    setIsProcessing(true);
    
    // Add placeholder for assistant response
    addMessage(MessageType.ASSISTANT, '');

    try {
      // Prepare history for API
      // Filter out system/error messages and map to API format
      const apiHistory = messages
        .filter(m => m.type === MessageType.USER || m.type === MessageType.ASSISTANT)
        // Simple mapping: if previous was empty (the placeholder we just added), ignore it for now
        .filter(m => m.content !== '')
        .map(m => ({
          role: m.type === MessageType.USER ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

      let currentText = '';
      
      await geminiService.streamChat(
        config.model,
        prompt,
        apiHistory,
        config.systemInstruction,
        (chunk) => {
          currentText += chunk;
          updateLastMessage(currentText);
        }
      );

    } catch (error: any) {
      updateLastMessage(`Error: ${error.message}`);
      // Change the type of the last message to error if possible, or just append error text
      // For simplicity in this structure, we just show the error in the assistant block
    } finally {
      setIsProcessing(false);
      // Ensure focus returns to input after generation
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      // Ctrl+C simulation (clear input)
      e.preventDefault();
      setInput('');
      addMessage(MessageType.SYSTEM, '^C');
    }
  };

  return (
    <div 
      className="h-full w-full flex flex-col font-mono text-sm sm:text-base overflow-hidden"
      onClick={handleContainerClick}
    >
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
      >
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-terminal-bg border-t border-gray-800 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-terminal-blue font-bold mr-2 select-none whitespace-nowrap">
            {isProcessing ? 'Thinking...' : '$'}
          </span>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              autoFocus
              className="w-full bg-transparent border-none outline-none text-terminal-text placeholder-gray-700 caret-terminal-green"
              placeholder={isProcessing ? "Wait for response..." : "Type a command or message..."}
              autoComplete="off"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Terminal;