import React from 'react';
import { User } from 'firebase/auth';

export function SettingsTab({ onLogout, user }: { onLogout: () => void, user: User | null }) {
  return (
    <div className="flex flex-col h-full bg-[#F0F4F8] p-6 pb-24 overflow-y-auto">
      <div className="flex items-center space-x-3 mb-6">
         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
            <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeWidth="2"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2"/></svg>
         </div>
         <h2 className="text-xl font-bold text-slate-800 tracking-tight">Settings</h2>
      </div>
      
      <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 shadow-xl border border-white space-y-6">
        <div className="flex items-center space-x-4">
          <img src={user?.photoURL || "https://i.postimg.cc/7Z6pX8kL/1000137821.png"} alt="Profile" className="w-16 h-16 rounded-[20px] shadow-sm shadow-[#00D4FF]/30 border border-slate-100 object-cover" />
          <div className="overflow-hidden">
            <h3 className="font-bold text-lg text-slate-800 truncate">{user?.displayName || 'PIVINDU USER'}</h3>
            <p className="text-[10px] text-[#007AFF] font-bold tracking-widest uppercase bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1 border border-blue-100">{user?.email || 'Verified Access'}</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-slate-700">Dark Theme</span>
              <span className="text-xs text-slate-400 border border-slate-100 bg-slate-50 px-3 py-1 rounded-full font-medium">Disabled</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-slate-700">System Language</span>
              <span className="text-xs font-bold text-[#007AFF]">English (1000+)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-slate-700">Version</span>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-md">26.04.1</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full mt-6 bg-red-50 text-red-600 font-bold py-4 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors shadow-sm tracking-widest uppercase text-sm mt-8 active:scale-95"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
