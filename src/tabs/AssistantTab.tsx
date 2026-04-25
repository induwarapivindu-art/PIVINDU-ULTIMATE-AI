import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, Globe, Sparkles, Languages } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'user' | 'model';
  text: string;
}

const langCodes: Record<string, string> = {
  'Auto': 'en-US',
  'English': 'en-US',
  'Sinhala': 'si-LK',
  'Tamil': 'ta-IN',
  'Spanish': 'es-ES',
  'French': 'fr-FR',
  'German': 'de-DE',
  'Japanese': 'ja-JP',
  'Korean': 'ko-KR',
  'Chinese': 'zh-CN',
  'Hindi': 'hi-IN',
  'Arabic': 'ar-SA',
  'Russian': 'ru-RU'
};

export function AssistantTab() {
  const [language, setLanguage] = useState('Sinhala');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am PIVINDU Ultimate AI. How can I assist you today? (I will respond in your chosen language)' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const clearChat = () => {
    setMessages([
      { role: 'model', text: 'Hello! I am PIVINDU Ultimate AI. How can I assist you today? (I will respond in your chosen language)' }
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    try {
      // Build previous context
      const contents = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const promptModifier = language !== 'Auto' ? `(Please respond entirely in ${language}) ` : '';
      contents.push({ role: 'user', parts: [{ text: promptModifier + text }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: contents,
        // @ts-ignore
        tools: [{ googleSearch: {} }] // Enable Google Search Grounding & Maps
      });

      const reply = response.text || "I'm sorry, I couldn't generate a response.";
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
      
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', text: `Error: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSpeechToText = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = langCodes[language] || 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleTextToSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCodes[language] || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full bg-[#F0F4F8] relative">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-white sticky top-0 z-10">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                 <Languages size={16} className="text-[#007AFF]" />
              </div>
              <span className="text-xs font-bold text-slate-800 tracking-tight">Translation Engine</span>
           </div>
           <select 
             value={language}
             onChange={(e) => setLanguage(e.target.value)}
             className="bg-white border border-slate-200 text-[#007AFF] text-xs rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-300 block px-3 py-2 outline-none font-bold shadow-sm"
           >
             <option value="Auto">Auto-Detect</option>
             <option value="English">English</option>
             <option value="Sinhala">Sinhala (සිංහල)</option>
             <option value="Tamil">Tamil (தமிழ்)</option>
             <option value="Spanish">Spanish</option>
             <option value="French">French</option>
             <option value="German">German</option>
             <option value="Japanese">Japanese</option>
             <option value="Korean">Korean</option>
             <option value="Chinese">Chinese</option>
             <option value="Hindi">Hindi</option>
             <option value="Arabic">Arabic</option>
             <option value="Russian">Russian</option>
           </select>
           <button 
             onClick={clearChat}
             className="ml-2 w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors shadow-sm"
             title="Clear Chat"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
           </button>
        </div>

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-[24px] p-5 ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-[#00D4FF] to-[#007AFF] text-white rounded-br-[8px] shadow-lg shadow-blue-200 border border-white/20' 
                : 'bg-white/80 backdrop-blur-xl border border-white shadow-xl text-slate-800 rounded-bl-[8px]'
            }`}>
              <div className="text-sm font-medium whitespace-pre-wrap leading-relaxed">
                {msg.role === 'user' ? (
                  msg.text
                ) : (
                  <div className="markdown-body max-w-none space-y-2 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&_a]:text-[#007AFF] [&_a]:underline [&_table]:w-full [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
              
              {msg.role === 'model' && (
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <button 
                    onClick={() => handleTextToSpeech(msg.text)}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-[#007AFF] transition-colors font-bold tracking-wide"
                  >
                    <Volume2 size={14} /> Speak
                  </button>
                  <div className="flex items-center gap-1 text-slate-400 font-medium">
                    <Globe size={12} /> Live Grounding
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-tr from-cyan-50 to-blue-50 border border-white shadow-sm text-slate-800 rounded-[24px] rounded-bl-[8px] p-5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                <Sparkles size={16} className="animate-spin text-cyan-600" />
              </div>
              <span className="text-sm font-bold italic opacity-70">Synthesizing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F0F4F8] via-[#F0F4F8]/90 to-transparent pt-12">
        <div className="flex items-center gap-2 bg-white rounded-[32px] border-[4px] border-white shadow-xl shadow-slate-200/50 p-1 pl-5">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tap to Command..."
            className="flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-400 text-sm font-medium"
          />
          <button 
            onClick={handleSpeechToText}
            className={`p-3.5 rounded-full transition-all ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
          >
            <Mic size={20} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="p-3.5 rounded-full bg-[#007AFF] text-white disabled:opacity-50 hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200"
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

