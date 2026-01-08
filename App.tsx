import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Terminal from './components/Terminal';

interface Tab {
  id: string;
  title: string;
}

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: uuidv4(), title: 'Terminal 1' }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);

  const createTab = () => {
    const newTab = { id: uuidv4(), title: `Terminal ${tabs.length + 1}` };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    // Don't close the last tab
    if (tabs.length === 1) return;

    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);

    // If we closed the active tab, switch to the last available one
    if (id === activeTabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center p-2 sm:p-4 bg-gray-900">
      <div className="w-full h-full max-w-5xl bg-terminal-bg border border-gray-700 rounded-lg shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Tab Bar Header */}
        <div className="flex items-center bg-[#161b22] border-b border-gray-700 select-none overflow-x-auto no-scrollbar">
          
          {/* Mac-like Traffic Lights (Visual Decoration) */}
          <div className="flex items-center space-x-2 px-4 py-3 border-r border-gray-800 mr-1 shrink-0">
             <div className="w-3 h-3 bg-red-500 rounded-full"></div>
             <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
             <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>

          {/* Tabs Container */}
          <div className="flex flex-1 items-end h-full">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`
                    group relative flex items-center justify-between
                    min-w-[140px] max-w-[200px] px-3 py-2 text-xs font-mono cursor-pointer border-r border-gray-800
                    transition-colors duration-150
                    ${isActive 
                      ? 'bg-terminal-bg text-gray-100 border-t-2 border-t-terminal-blue' 
                      : 'bg-[#161b22] text-gray-500 hover:bg-[#1c2128] hover:text-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center truncate mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-2 ${isActive ? 'text-terminal-green' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
                    </svg>
                    <span className="truncate">{tab.title}</span>
                  </div>

                  {/* Close Button */}
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => closeTab(e, tab.id)}
                      className={`
                        p-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity
                        ${isActive ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-700 text-gray-500'}
                      `}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}

            {/* New Tab Button */}
            <button
              onClick={createTab}
              className="px-3 py-2 text-gray-500 hover:text-terminal-blue hover:bg-[#1c2128] transition-colors"
              title="New Terminal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Terminal Content Area */}
        {/* We render ALL active terminals to preserve their state, but hide inactive ones */}
        <div className="flex-1 relative bg-terminal-bg">
          {tabs.map((tab) => (
            <div 
              key={tab.id} 
              className={`absolute inset-0 flex flex-col ${tab.id === activeTabId ? 'z-10' : 'z-0 invisible'}`}
            >
              <Terminal isVisible={tab.id === activeTabId} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;