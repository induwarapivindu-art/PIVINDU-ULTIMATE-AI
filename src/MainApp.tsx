import React, { useState } from 'react';
import { MessageSquare, LayoutGrid, Camera, Settings as SettingsIcon } from 'lucide-react';
import { AssistantTab } from './tabs/AssistantTab';
import { VisionTab } from './tabs/VisionTab';
import { StudioTab } from './tabs/StudioTab';
import { SettingsTab } from './tabs/SettingsTab';
import { User } from 'firebase/auth';

export function MainApp({ onLogout, user }: { onLogout: () => void, user: User | null }) {
  const [activeTab, setActiveTab] = useState<'assistant' | 'vision' | 'studio' | 'settings'>('assistant');

  return (
    <div className="flex h-screen w-full bg-[#F0F4F8] items-center justify-center relative overflow-hidden font-sans text-slate-800">
      {/* Background Mesh Gradient on large screens */}
      <div className="absolute inset-0 opacity-20 pointer-events-none hidden md:block">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#00D4FF] blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#007AFF] blur-[120px]"></div>
      </div>

      <div className="flex flex-col h-full w-full md:max-w-[400px] md:h-[800px] md:my-auto md:bg-white md:rounded-[50px] md:border-[8px] md:border-slate-900 md:shadow-2xl relative overflow-hidden z-10 w-full h-[100dvh]">
        {/* iOS style Top Status Bar Mock */}
        <div className="flex-none h-14 w-full flex items-end justify-between px-6 pb-3 bg-white/90 backdrop-blur-md z-50 border-b border-slate-100 shadow-sm relative pt-4">
          <div className="text-xs font-bold text-slate-800">9:41</div>
          <h1 className="font-bold text-xs tracking-widest text-slate-800 absolute left-1/2 -translate-x-1/2 bottom-3">PIVINDU <span className="text-[#007AFF]">AI</span></h1>
          <div className="flex space-x-1 items-center pb-1">
            <div className="w-4 h-2 bg-slate-800 rounded-full"></div>
            <div className="w-3 h-3 bg-slate-800 rounded-sm"></div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden relative bg-white">
          {activeTab === 'assistant' && <AssistantTab />}
          {activeTab === 'vision' && <VisionTab />}
          {activeTab === 'studio' && <StudioTab />}
          {activeTab === 'settings' && <SettingsTab onLogout={onLogout} user={user} />}
        </div>

        {/* iOS Style Bottom Navigation Bar */}
        <div className="flex-none h-[88px] w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 pb-safe shadow-[0_-10px_30px_rgba(0,123,255,0.05)] relative z-50 rounded-b-[42px]">
          <div className="flex justify-around items-center h-full px-4 pb-2">
            
            <button 
              onClick={() => setActiveTab('assistant')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === 'assistant' ? 'text-[#007AFF]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className={`p-2 rounded-2xl transition-all ${activeTab === 'assistant' && 'bg-blue-50'}`}>
                <MessageSquare size={24} strokeWidth={activeTab === 'assistant' ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold tracking-wide ${activeTab === 'assistant' && 'text-slate-800'}`}>Assistant</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('vision')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === 'vision' ? 'text-[#00D4FF]' : 'text-slate-400 hover:text-slate-600'}`}
            >
               <div className={`p-2 rounded-2xl transition-all ${activeTab === 'vision' && 'bg-cyan-50'}`}>
                <Camera size={24} strokeWidth={activeTab === 'vision' ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold tracking-wide ${activeTab === 'vision' && 'text-slate-800'}`}>Vision</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('studio')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === 'studio' ? 'text-indigo-500' : 'text-slate-400 hover:text-slate-600'}`}
            >
               <div className={`p-2 rounded-2xl transition-all ${activeTab === 'studio' && 'bg-indigo-50'}`}>
                <LayoutGrid size={24} strokeWidth={activeTab === 'studio' ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold tracking-wide ${activeTab === 'studio' && 'text-slate-800'}`}>Studio</span>
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === 'settings' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
               <div className={`p-2 rounded-2xl transition-all ${activeTab === 'settings' && 'bg-slate-100'}`}>
                <SettingsIcon size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold tracking-wide ${activeTab === 'settings' && 'text-slate-800'}`}>Settings</span>
            </button>

          </div>
          
          {/* iOS Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
