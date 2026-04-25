import React, { useState } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup } from 'firebase/auth';

interface AuthScreenProps {
  onLogin: () => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F0F4F8] font-sans relative overflow-hidden p-6 text-slate-800">
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#00D4FF] blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#007AFF] blur-[120px]"></div>
      </div>

      <div className="z-10 w-full max-w-sm mx-auto flex flex-col bg-white/80 backdrop-blur-xl p-8 rounded-[40px] border border-white shadow-xl relative">
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#00D4FF] to-[#007AFF] rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-200">
           <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 leading-tight tracking-tight">
            PIVINDU <br/>
            <span className="text-[#007AFF]">Ultimate AI</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2 font-medium uppercase tracking-widest">System Core V4.0</p>
        </div>

        <div className="mt-8 space-y-3">
           <div className="flex items-center space-x-3 bg-white/60 p-3 rounded-2xl border border-white/50 shadow-sm transition hover:shadow-md hover:bg-white/80">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-700">1,000+ Languages Active</span>
          </div>
          <div className="flex items-center space-x-3 bg-white/60 p-3 rounded-2xl border border-white/50 shadow-sm transition hover:shadow-md hover:bg-white/80">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span className="text-xs font-semibold text-slate-700">Google Sync: Ready</span>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs mt-4 text-center">{error}</p>}

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mt-6 bg-white border border-slate-200 py-3.5 rounded-2xl flex items-center justify-center space-x-3 hover:bg-slate-50 transition-colors shadow-sm active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <span className="text-sm font-bold text-slate-700">Connecting...</span>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/></svg>
              <span className="text-sm font-bold text-slate-700">Continue with Google</span>
            </>
          )}
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full text-center z-10 px-6">
        <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">
          Neural Link Active • Encrypted
        </p>
      </div>
    </div>
  );
}
