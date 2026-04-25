import React, { useState } from 'react';
import { Upload, FileSearch, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function VisionTab() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileMimeType, setFileMimeType] = useState<string>('');
  const [prompt, setPrompt] = useState('Please provide a detailed analysis and description of this image, including object recognition and context.');
  const [result, setResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFileMimeType(selected.type);
      setResult('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setFileBase64(base64String);
      };
      reader.readAsDataURL(selected);
    }
  };

  const analyzeFile = async () => {
    if (!fileBase64) return;
    setIsAnalyzing(true);
    setResult('');
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: {
          parts: [
            { inlineData: { data: fileBase64, mimeType: fileMimeType } },
            { text: prompt }
          ]
        }
      });
      setResult(response.text || "No analysis generated.");
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F0F4F8] p-6 pb-24 overflow-y-auto">
      <div className="flex items-center space-x-3 mb-6">
         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2"/></svg>
         </div>
         <h2 className="text-xl font-bold text-slate-800 tracking-tight">Vision Scanner</h2>
      </div>
      
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-white shadow-xl flex flex-col space-y-4">
        <label className="border-2 border-dashed border-cyan-200 bg-cyan-50/50 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-50 transition-colors group relative overflow-hidden">
          <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
          {file ? (
            <div className="flex flex-col items-center z-10 relative">
              {file.type.startsWith('image/') ? (
                <img src={`data:${file.type};base64,${fileBase64}`} alt="Preview" className="max-h-32 object-contain mb-3 rounded-[16px] shadow-md border border-white" />
              ) : (
                <FileSearch size={48} className="text-[#007AFF] mb-3 drop-shadow-md" />
              )}
              <span className="text-sm font-bold text-slate-700 truncate w-48 text-center bg-white px-3 py-1 rounded-full shadow-sm">{file.name}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-[#007AFF] z-10 relative">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                <Upload size={28} className="text-[#007AFF]" />
              </div>
              <span className="font-bold text-sm">Tap to Upload</span>
              <span className="text-xs text-slate-500 mt-1">Images & PDFs Supported</span>
            </div>
          )}
        </label>

        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full text-sm p-4 rounded-2xl border border-slate-100 resize-none outline-none focus:border-[#007AFF] focus:ring-4 focus:ring-blue-50 bg-slate-50/50 text-slate-800 font-medium transition-all"
          rows={2}
          placeholder="What do you want to know about this file?"
        ></textarea>

        <button 
          onClick={analyzeFile}
          disabled={!file || isAnalyzing}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00D4FF] to-[#007AFF] text-white font-bold uppercase tracking-widest disabled:opacity-50 hover:opacity-90 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          {isAnalyzing ? <Sparkles size={20} className="animate-spin" /> : <FileSearch size={20} />}
          {isAnalyzing ? 'Analyzing Data...' : 'Execute Analysis'}
        </button>
      </div>

      {result && (
        <div className="mt-6 bg-gradient-to-tr from-cyan-50 to-blue-50 rounded-[32px] p-6 border border-white shadow-sm">
          <h3 className="font-bold text-xs uppercase tracking-widest text-[#007AFF] mb-4 bg-white inline-block px-3 py-1 rounded-full border border-blue-100 flex items-center space-x-2 w-max">
            <Sparkles size={12}/> <span>Analysis Result</span>
          </h3>
          <div className="text-sm text-slate-700 markdown-body max-w-none space-y-3 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&_a]:text-[#007AFF] [&_a]:underline font-medium">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

