
import React, { useState } from 'react';
import { User } from '../types';

interface AuthModalProps {
  onLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || email.split('@')[0],
      email: email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };
    onLogin(user);
  };

  const handleGoogleLogin = () => {
    // Mocking Google OAuth flow
    const googleUser: User = {
      id: 'google_' + Math.random().toString(36).substr(2, 9),
      name: 'Google User',
      email: 'user@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google'
    };
    onLogin(googleUser);
  };

  const handleSkip = () => {
    const guestUser: User = {
      id: 'guest',
      name: 'Guest Explorer',
      email: 'guest@silk.ai',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
    };
    onLogin(guestUser);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md transition-all duration-500">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 silk-gradient rounded-2xl flex items-center justify-center shadow-xl animate-float">
              <i className="fa-solid fa-feather-pointed text-white text-2xl"></i>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2 dark:text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join Silk Intelligence'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-8 text-sm font-medium">
            Step into the next generation of AI engineering.
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3.5 rounded-2xl font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98] shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">or use email</span>
              <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-silk-500/20 focus:border-silk-500 transition-all dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-silk-500/20 focus:border-silk-500 transition-all dark:text-white"
                  placeholder="silk@intelligence.ai"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-silk-500/20 focus:border-silk-500 transition-all dark:text-white"
                  placeholder="••••••••"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full silk-gradient text-white font-bold py-4 rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all mt-4"
              >
                {isLogin ? 'Sign In' : 'Get Started'}
              </button>
            </form>
          </div>
          
          <div className="mt-8 flex flex-col items-center gap-4">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-silk-500 font-bold hover:underline tracking-tight"
            >
              {isLogin ? "New here? Create an account" : "Already registered? Log In"}
            </button>
            
            <button 
              onClick={handleSkip}
              className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors py-2"
            >
              Skip and explore as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
