
import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-silk-600 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600 blur-[150px] rounded-full"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 silk-gradient rounded-[2rem] flex items-center justify-center shadow-2xl mb-8 animate-float">
          <i className="fa-solid fa-feather-pointed text-white text-4xl"></i>
        </div>
        <div className="overflow-hidden">
          <h1 className="text-4xl font-bold tracking-tighter text-white logo-reveal">
            SILK <span className="text-silk-400">AI</span>
          </h1>
        </div>
        <p className="mt-4 text-slate-500 font-medium tracking-[0.3em] uppercase text-[10px] logo-reveal" style={{ animationDelay: '0.4s' }}>
          Intelligent Nexus
        </p>
      </div>
      
      <div className="absolute bottom-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-silk-500 animate-[loading_2s_ease-in-out_infinite]"></div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 40%; transform: translateX(100%); }
          100% { width: 0%; transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
