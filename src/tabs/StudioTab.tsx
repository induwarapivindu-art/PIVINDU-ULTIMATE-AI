import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Music, Code, Video, Sparkles, Download, Upload, Play, Square } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function StudioTab() {
  const [activeMode, setActiveMode] = useState<'image' | 'code' | 'video' | 'music'>('image');
  
  // Image State
  const [imagePrompt, setImagePrompt] = useState('A futuristic neon city at night, cyber blue colors, highly detailed');
  const [imageUrl, setImageUrl] = useState('');
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  // Code State
  const [codePrompt, setCodePrompt] = useState('Write an Arduino code to blink an LED on pin 13 every 1 second');
  const [codeResult, setCodeResult] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Music State
  const [musicPrompt, setMusicPrompt] = useState('A happy, fast-paced 8-bit adventure melody');
  const [musicTempo, setMusicTempo] = useState('120');
  const [musicInstrument, setMusicInstrument] = useState('triangle');
  const [musicNotes, setMusicNotes] = useState<{freq: number, duration: number}[]>([]);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Video State
  const [videoImage, setVideoImage] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateImage = async () => {
    if (!imagePrompt) return;
    setIsGeneratingImg(true);
    setImageUrl('');
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: imagePrompt,
        config: {
          imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
        }
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setImageUrl(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err: any) {
      alert(`Error generating image: ${err.message}`);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const generateCode = async () => {
    if (!codePrompt) return;
    setIsGeneratingCode(true);
    setCodeResult('');
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `You are an Arduino expert. Write Arduino code for the following request. Return ONLY the code in a markdown block, and a very brief explanation below it.\n\nRequest: ${codePrompt}`
      });
      setCodeResult(response.text || '');
    } catch (err: any) {
      setCodeResult(`Error generating code: ${err.message}`);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const generateMusic = async () => {
    if (!musicPrompt) return;
    setIsGeneratingMusic(true);
    setMusicNotes([]);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
         contents: `Generate a simple melody based on this mood: "${musicPrompt}" with a tempo around ${musicTempo} BPM. Return ONLY a valid JSON array of objects with 'freq' (number, frequency in Hz) and 'duration' (number, duration in milliseconds). Max 30 notes. Do NOT include markdown tags like \`\`\`json.`
      });
      let text = response.text || '[]';
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const notes = JSON.parse(text);
      if (Array.isArray(notes)) {
         setMusicNotes(notes);
      }
    } catch (err: any) {
      alert(`Error generating music structure: ${err.message}`);
    } finally {
      setIsGeneratingMusic(false);
    }
  }

  const playMusic = () => {
     if (musicNotes.length === 0) return;
     setIsPlayingMusic(true);
     const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
     let time = audioCtx.currentTime;

     musicNotes.forEach((note) => {
         const osc = audioCtx.createOscillator();
         const gainNode = audioCtx.createGain();
         osc.type = musicInstrument as OscillatorType;
         osc.frequency.setValueAtTime(note.freq || 440, time);
         
         gainNode.gain.setValueAtTime(0.1, time);
         gainNode.gain.exponentialRampToValueAtTime(0.0001, time + (note.duration || 500) / 1000);
         
         osc.connect(gainNode);
         gainNode.connect(audioCtx.destination);
         
         osc.start(time);
         osc.stop(time + (note.duration || 500) / 1000);
         time += (note.duration || 500) / 1000;
     });

     setTimeout(() => {
         setIsPlayingMusic(false);
     }, (time - audioCtx.currentTime) * 1000);
  }

  const handleVideoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
         const reader = new FileReader();
         reader.onload = (e) => setVideoImage(e.target?.result as string);
         reader.readAsDataURL(file);
         setVideoUrl(null);
     }
  }

  const generateVideo = () => {
      if (!videoImage || !canvasRef.current) return;
      setIsGeneratingVideo(true);
      setVideoUrl(null);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
          canvas.width = 640;
          canvas.height = 640;

          const stream = canvas.captureStream(30);
          const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
          const chunks: BlobPart[] = [];

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };
          recorder.onstop = () => {
              const blob = new Blob(chunks, { type: 'video/webm' });
              setVideoUrl(URL.createObjectURL(blob));
              setIsGeneratingVideo(false);
          };

          recorder.start();

          let frame = 0;
          const totalFrames = 150; // 5 seconds at 30 fps

          const draw = () => {
              // Ken Burns zoom effect
              const scale = 1 + (frame / totalFrames) * 0.4;
              const angle = Math.sin((frame / totalFrames) * Math.PI) * 0.05;

              ctx.fillStyle = '#000';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.save();
              ctx.translate(canvas.width / 2, canvas.height / 2);
              ctx.rotate(angle);
              ctx.scale(scale, scale);

              const ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
              const w = img.width * ratio;
              const h = img.height * ratio;
              
              ctx.globalAlpha = 1;
              ctx.drawImage(img, -w / 2, -h / 2, w, h);

              // Cyberpunk neon pulse overlay effect
              ctx.globalCompositeOperation = 'screen';
              ctx.fillStyle = `rgba(0, 212, 255, ${Math.abs(Math.sin(frame * 0.1)) * 0.15})`;
              ctx.fillRect(-w / 2, -h / 2, w, h);

              ctx.restore();

              frame++;
              if (frame < totalFrames) {
                  requestAnimationFrame(draw);
              } else {
                  recorder.stop();
              }
          };

          draw();
      };
      img.src = videoImage;
  };

  return (
    <div className="flex flex-col h-full bg-[#F0F4F8] pb-24">
      <div className="p-6 pb-4">
         <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
               <svg className="w-6 h-6 text-[#007AFF]" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Creator Studio</h2>
         </div>
        
        {/* Horizontal Scroll Menu */}
        <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
          <button onClick={() => setActiveMode('image')} className={`flex-none px-5 py-2.5 rounded-full font-bold text-[11px] tracking-widest uppercase transition-all flex items-center gap-2 shadow-sm ${activeMode === 'image' ? 'bg-[#007AFF] text-white border-none' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
             Image
          </button>
          <button onClick={() => setActiveMode('code')} className={`flex-none px-5 py-2.5 rounded-full font-bold text-[11px] tracking-widest uppercase transition-all flex items-center gap-2 shadow-sm ${activeMode === 'code' ? 'bg-[#007AFF] text-white border-none' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
             Arduino
          </button>
          <button onClick={() => setActiveMode('music')} className={`flex-none px-5 py-2.5 rounded-full font-bold text-[11px] tracking-widest uppercase transition-all flex items-center gap-2 shadow-sm ${activeMode === 'music' ? 'bg-[#007AFF] text-white border-none' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
             Sounds
          </button>
          <button onClick={() => setActiveMode('video')} className={`flex-none px-5 py-2.5 rounded-full font-bold text-[11px] tracking-widest uppercase transition-all flex items-center gap-2 shadow-sm ${activeMode === 'video' ? 'bg-[#007AFF] text-white border-none' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
             Video
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-6">
        
        {activeMode === 'image' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 shadow-xl border border-white space-y-5">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><ImageIcon size={16} className="text-blue-500"/> Image Generation</h3>
            <textarea 
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="w-full text-sm p-4 rounded-2xl border border-slate-100 resize-none outline-none focus:border-[#007AFF] bg-slate-50/50 text-slate-800 font-medium"
              rows={3}
              placeholder="Describe the image you want..."
            ></textarea>
            <button 
              onClick={generateImage}
              disabled={!imagePrompt || isGeneratingImg}
              className="w-full py-4 rounded-2xl bg-[#007AFF] text-white font-bold tracking-widest uppercase disabled:opacity-50 hover:bg-blue-600 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {isGeneratingImg ? <Sparkles size={20} className="animate-spin" /> : <Sparkles size={20} />}
              {isGeneratingImg ? 'Synthesizing...' : 'Generate Art'}
            </button>

            {imageUrl && (
              <div className="mt-4 rounded-3xl overflow-hidden shadow-xl border-4 border-white relative group bg-slate-100">
                <img src={imageUrl} alt="Generated" className="w-full h-auto" />
                <a href={imageUrl} download="pivindu-ai-art.png" className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-2xl text-[#007AFF] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-sm">
                  <Download size={20} />
                </a>
              </div>
            )}
          </div>
        )}

        {activeMode === 'code' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 shadow-xl border border-white space-y-5">
             <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><Code size={16} className="text-emerald-500"/> Arduino Studio</h3>
             <textarea 
              value={codePrompt}
              onChange={(e) => setCodePrompt(e.target.value)}
              className="w-full text-sm p-4 rounded-2xl border border-slate-100 resize-none outline-none focus:border-emerald-500 bg-slate-50/50 text-slate-800 font-mono tracking-tight"
              rows={3}
              placeholder="What should the Arduino do?"
            ></textarea>
            <button 
              onClick={generateCode}
              disabled={!codePrompt || isGeneratingCode}
              className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold tracking-widest uppercase disabled:opacity-50 hover:bg-emerald-600 shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {isGeneratingCode ? <Sparkles size={20} className="animate-spin" /> : <Code size={20} />}
              {isGeneratingCode ? 'Writing Code...' : 'Compile Request'}
            </button>

            {codeResult && (
              <div className="mt-4 bg-[#0F172A] rounded-3xl p-5 text-emerald-400 font-mono text-xs overflow-x-auto shadow-2xl border border-slate-700/50">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                  pre: ({node, ...props}) => <pre className="bg-[#0b1121] p-3 rounded-xl border border-slate-800"{...props} />,
                  code: ({node, ...props}) => <code className="text-cyan-400"{...props} />
                }}>
                  {codeResult}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {activeMode === 'music' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 shadow-xl border border-white space-y-5">
             <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><Music size={16} className="text-purple-500"/> Neural Audio Synthesis</h3>
             <textarea 
              value={musicPrompt}
              onChange={(e) => setMusicPrompt(e.target.value)}
              className="w-full text-sm p-4 rounded-2xl border border-slate-100 resize-none outline-none focus:border-purple-500 bg-slate-50/50 text-slate-800 font-medium"
              rows={3}
              placeholder="Describe the melody..."
            ></textarea>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Tempo (BPM)</label>
                <input 
                  type="number" 
                  value={musicTempo}
                  onChange={(e) => setMusicTempo(e.target.value)}
                  className="w-full text-sm p-2 rounded-xl border border-slate-100 outline-none focus:border-purple-500 bg-slate-50/50 text-slate-800 font-medium"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Instrument</label>
                <select 
                  value={musicInstrument}
                  onChange={(e) => setMusicInstrument(e.target.value)}
                  className="w-full text-sm p-2 rounded-xl border border-slate-100 outline-none focus:border-purple-500 bg-slate-50/50 text-slate-800 font-medium"
                >
                  <option value="triangle">8-Bit (Triangle)</option>
                  <option value="sine">Smooth (Sine)</option>
                  <option value="square">Retro (Square)</option>
                  <option value="sawtooth">Sharp (Sawtooth)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={generateMusic}
              disabled={!musicPrompt || isGeneratingMusic}
              className="w-full py-4 rounded-2xl bg-purple-500 text-white font-bold tracking-widest uppercase disabled:opacity-50 hover:bg-purple-600 shadow-lg shadow-purple-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {isGeneratingMusic ? <Sparkles size={20} className="animate-spin" /> : <Music size={20} />}
              {isGeneratingMusic ? 'Composing...' : 'Generate Melody'}
            </button>

            {musicNotes.length > 0 && (
                <button 
                  onClick={playMusic}
                  disabled={isPlayingMusic}
                  className="w-full py-4 rounded-2xl bg-white border border-purple-200 text-purple-600 font-bold tracking-widest uppercase disabled:opacity-50 hover:bg-purple-50 shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                   {isPlayingMusic ? <Square size={20} className="animate-pulse" /> : <Play size={20} />}
                   {isPlayingMusic ? 'Playing Audio...' : 'Play Result'}
                </button>
            )}
          </div>
        )}

        {activeMode === 'video' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 shadow-xl border border-white space-y-5">
             <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><Video size={16} className="text-orange-500"/> Image to Video Animation</h3>
             
             <label className="border-2 border-dashed border-orange-200 bg-orange-50/50 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 transition-colors group relative overflow-hidden">
                <input type="file" accept="image/*" className="hidden" onChange={handleVideoImageUpload} />
                {videoImage ? (
                  <img src={videoImage} className="max-h-32 object-contain rounded-xl shadow-md border border-white" alt="Video src" />
                ) : (
                   <div className="flex flex-col items-center text-orange-400">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                      </div>
                      <span className="font-bold text-sm">Upload Image</span>
                   </div>
                )}
             </label>

             <button 
                onClick={generateVideo}
                disabled={!videoImage || isGeneratingVideo}
                className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold tracking-widest uppercase disabled:opacity-50 hover:bg-orange-600 shadow-lg shadow-orange-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {isGeneratingVideo ? <Sparkles size={20} className="animate-spin" /> : <Video size={20} />}
                {isGeneratingVideo ? 'Rendering Video...' : 'Animate'}
              </button>

              <canvas ref={canvasRef} className="hidden" />

              {videoUrl && (
                  <div className="mt-4 rounded-3xl overflow-hidden shadow-xl border-4 border-white relative bg-black">
                     <video src={videoUrl} controls autoPlay loop className="w-full" />
                     <a href={videoUrl} download="pivindu-animation.webm" className="absolute top-4 right-4 bg-white/90 p-3 rounded-2xl text-orange-500 shadow-lg backdrop-blur-sm hover:scale-105 transition-transform">
                        <Download size={20} />
                     </a>
                  </div>
              )}
          </div>
        )}

      </div>
    </div>
  );
}

