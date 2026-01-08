import React from 'react';
import Terminal from './components/Terminal';

const App: React.FC = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center p-2 sm:p-4 bg-gray-900">
      <div className="w-full h-full max-w-5xl bg-terminal-bg border border-gray-700 rounded-lg shadow-2xl overflow-hidden flex flex-col relative">
        {/* Window Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-700 select-none">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors" />
          </div>
          <div className="text-xs font-mono text-gray-400 font-medium">gemini-cli — -bash — 80x24</div>
          <div className="w-14"></div> {/* Spacer for centering */}
        </div>
        
        {/* Terminal Content */}
        <div className="flex-1 relative">
          <Terminal />
        </div>
      </div>
    </div>
  );
};

export default App;