import React from 'react';
import { MessageType, TerminalMessage } from '../types';

interface MessageItemProps {
  message: TerminalMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { type, content, timestamp } = message;

  const timeString = new Date(timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (type === MessageType.USER) {
    return (
      <div className="mb-2 break-words">
        <span className="text-terminal-gray mr-2">[{timeString}]</span>
        <span className="text-terminal-blue font-bold mr-2">➜</span>
        <span className="text-terminal-text whitespace-pre-wrap font-mono">{content}</span>
      </div>
    );
  }

  if (type === MessageType.SYSTEM) {
    return (
      <div className="mb-2 break-words text-terminal-yellow">
        <span className="text-terminal-gray mr-2">[{timeString}]</span>
        <span className="font-bold mr-2">ℹ</span>
        <span className="whitespace-pre-wrap font-mono">{content}</span>
      </div>
    );
  }

  if (type === MessageType.ERROR) {
    return (
      <div className="mb-2 break-words text-terminal-red">
        <span className="text-terminal-gray mr-2">[{timeString}]</span>
        <span className="font-bold mr-2">✖</span>
        <span className="whitespace-pre-wrap font-mono">{content}</span>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="mb-4 break-words">
      <div className="flex flex-row items-start">
        <span className="text-terminal-gray mr-2 mt-[2px] select-none">[{timeString}]</span>
        <span className="text-terminal-green font-bold mr-2 mt-[2px] select-none">gemini</span>
        <span className="text-terminal-text font-mono whitespace-pre-wrap leading-relaxed flex-1">
            {/* We use basic pre-wrap for authentic terminal feel, could enhance with react-markdown if desired */}
            {content}
        </span>
      </div>
    </div>
  );
};

export default React.memo(MessageItem);