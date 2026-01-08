
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface VoiceInterfaceProps {
  onClose: () => void;
}

type ErrorType = 'permission' | 'not_found' | 'connection' | 'unknown' | null;

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onClose }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<{ type: ErrorType; message: string } | null>(null);
  const [modelTranscription, setModelTranscription] = useState<string>('');
  const [userTranscription, setUserTranscription] = useState<string>('');
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0);
  
  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Timer logic
  useEffect(() => {
    let interval: number;
    if (isActive) {
      interval = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const startVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let offset = 0;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      offset += 0.05;

      const getVolume = (analyser: AnalyserNode | null) => {
        if (!analyser) return 0;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        return sum / bufferLength / 255;
      };

      const userVol = getVolume(inputAnalyserRef.current);
      const aiVol = getVolume(outputAnalyserRef.current);
      const combinedVol = Math.max(userVol, aiVol);
      
      setVolume(combinedVol);

      const drawFluidWave = (color: string, alpha: number, freq: number, amp: number, phase: number) => {
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();

        const adjustedAmp = amp * (combinedVol * 150 + 5);

        for (let x = 0; x <= width; x += 5) {
          const y = height / 2 + Math.sin(x * freq + phase + offset) * adjustedAmp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.stroke();
      };

      // Background subtle waves
      drawFluidWave('#4f46e5', 0.1, 0.005, 1.2, 0);
      drawFluidWave('#9333ea', 0.1, 0.007, 1.1, 1.5);
      
      // Main reactive waves
      if (aiVol > 0.01) {
        drawFluidWave('#a855f7', 0.8, 0.015, aiVol * 0.8, 0);
        drawFluidWave('#d946ef', 0.5, 0.02, aiVol * 0.5, 2);
      } else if (userVol > 0.01) {
        drawFluidWave('#6366f1', 0.8, 0.01, userVol * 0.8, 0);
        drawFluidWave('#818cf8', 0.5, 0.015, userVol * 0.5, 1);
      } else {
        // Idle breathing wave
        drawFluidWave('#475569', 0.2, 0.01, 1, offset * 0.1);
      }
    };

    draw();
  }, []);

  const startSession = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    setDuration(0);
    
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          throw { type: 'permission' as ErrorType, message: 'Microphone access denied. Please enable it in your browser settings.' };
        } else {
          throw { type: 'unknown' as ErrorType, message: 'Could not access microphone.' };
        }
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;

      // Setup analysers
      const inputAnalyser = inputCtx.createAnalyser();
      inputAnalyser.fftSize = 512;
      inputAnalyserRef.current = inputAnalyser;

      const outputAnalyser = outputCtx.createAnalyser();
      outputAnalyser.fftSize = 512;
      outputAnalyserRef.current = outputAnalyser;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            source.connect(inputAnalyser);

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            startVisualizer();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
               setModelTranscription(prev => (prev + ' ' + message.serverContent?.outputTranscription?.text).slice(-500));
            }
            if (message.serverContent?.inputTranscription) {
               setUserTranscription(prev => (prev + ' ' + message.serverContent?.inputTranscription?.text).slice(-500));
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const outputCtx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              
              source.connect(outputAnalyser);
              source.connect(outputCtx.destination);
              
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            setError({ type: 'connection', message: 'The voice link was interrupted.' });
            setIsActive(false);
          },
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: 'You are SILK AI. You are in a real-time voice call. Be professional and brief. Use standard capitalization.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setIsConnecting(false);
      setError(err.type ? err : { type: 'unknown', message: err.message || 'Unexpected error.' });
    }
  }, [startVisualizer]);

  useEffect(() => {
    startSession();
    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (inputAudioContextRef.current) inputAudioContextRef.current.close();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [startSession]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>

      {/* Header Info */}
      <div className="absolute top-8 left-8 flex items-center gap-4">
        <div className="w-12 h-12 silk-gradient rounded-2xl flex items-center justify-center shadow-2xl">
          <i className="fa-solid fa-feather-pointed text-white text-xl"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">SILK AI</h1>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : error ? 'bg-red-500' : 'bg-slate-600'}`}></span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              {isActive ? formatDuration(duration) : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <button 
        onClick={onClose}
        className="absolute top-8 right-8 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 group z-20"
      >
        <i className="fa-solid fa-xmark text-xl group-hover:scale-110"></i>
      </button>

      {/* Main Content Area */}
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl relative z-10">
        
        {/* Visualizer and Mic Icon */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          <canvas 
            ref={canvasRef} 
            width={500} 
            height={500} 
            className="absolute inset-0 w-full h-full opacity-60 scale-125"
          />
          
          {/* Concentric Pulsing Rings */}
          {isActive && (
            <>
              <div 
                className="absolute w-48 h-48 rounded-full border-2 border-indigo-500/30 animate-ping" 
                style={{ animationDuration: '3s' }}
              ></div>
              <div 
                className="absolute w-56 h-56 rounded-full border border-purple-500/20 animate-pulse" 
                style={{ animationDuration: '2s' }}
              ></div>
              <div 
                className="absolute w-64 h-64 rounded-full border border-indigo-500/10"
                style={{ 
                  transform: `scale(${1 + volume * 0.5})`,
                  transition: 'transform 0.1s ease-out',
                  opacity: volume * 0.5 + 0.1
                }}
              ></div>
            </>
          )}
          
          <div 
            className={`w-48 h-48 rounded-full bg-slate-900/40 backdrop-blur-3xl flex items-center justify-center relative z-10 border border-white/10 shadow-[0_0_100px_rgba(99,102,241,0.15)] transition-all duration-300 ${isActive ? 'scale-105 shadow-indigo-500/30' : 'scale-100'}`}
            style={{ 
              boxShadow: isActive ? `0 0 ${40 + volume * 100}px rgba(99, 102, 241, ${0.2 + volume})` : ''
            }}
          >
             <i 
               className={`fa-solid ${error ? 'fa-microphone-slash' : 'fa-microphone'} text-6xl transition-all duration-300 ${isActive ? 'text-indigo-400' : error ? 'text-red-400' : 'text-slate-500'}`}
               style={{ transform: isActive ? `scale(${1 + volume * 0.2})` : 'scale(1)' }}
             ></i>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            {isConnecting ? 'Establishing Link' : isActive ? 'Silk AI is Listening' : error ? 'Link Failed' : 'Call Ended'}
          </h2>
          <p className="text-slate-400 text-lg max-w-sm mx-auto opacity-75">
            {isActive ? 'Encrypted real-time voice channel' : error ? error.message : 'Press reconnect to try again.'}
          </p>
        </div>

        {/* Live Transcriptions */}
        <div className="w-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-36">
             <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 overflow-hidden flex flex-col border border-white/5">
               <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-bold mb-2">User</span>
               <div className="flex-1 overflow-y-auto text-[13px] text-slate-300 italic scrollbar-hide leading-relaxed">
                 {userTranscription || "Waiting for audio..."}
               </div>
             </div>
             <div className="bg-indigo-600/5 backdrop-blur-xl rounded-2xl p-4 overflow-hidden flex flex-col border border-indigo-500/10">
               <span className="text-[9px] uppercase tracking-widest text-purple-400 font-bold mb-2">Silk AI</span>
               <div className="flex-1 overflow-y-auto text-[13px] text-slate-200 leading-relaxed scrollbar-hide">
                 {modelTranscription || "Connecting intelligence..."}
               </div>
             </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8 mt-4">
          {error && (
            <button 
              onClick={startSession}
              className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-indigo-400"
              title="Reconnect"
            >
              <i className="fa-solid fa-rotate-right text-xl"></i>
            </button>
          )}
          
          <button 
            onClick={onClose}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all group ${error ? 'bg-slate-800' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20 hover:scale-105'}`}
          >
            <i className={`fa-solid ${error ? 'fa-xmark' : 'fa-phone-slash'} text-2xl`}></i>
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-2">
        <i className="fa-solid fa-shield-halved text-indigo-500"></i>
        End-to-End Secure
      </div>
    </div>
  );
};

export default VoiceInterface;
