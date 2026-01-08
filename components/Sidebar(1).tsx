
import React, { useState } from 'react';
import { ChatSession, User } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onCallAI: () => void;
  isOpen: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onNewChat, 
  onSelectChat, 
  onCallAI,
  isOpen,
  onToggle,
  isDarkMode,
  onToggleTheme,
  user,
  onLogout
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter(session => {
    const query = searchQuery.toLowerCase();
    const titleMatch = session.title.toLowerCase().includes(query);
    const contentMatch = session.messages.some(msg => 
      msg.text.toLowerCase().includes(query)
    );
    return titleMatch || contentMatch;
  });

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
      <div className="flex flex-col h-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 silk-gradient rounded-xl flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-feather-pointed text-white"></i>
            </div>
            <span className="text-xl font-bold tracking-tight dark:text-white">SILK AI</span>
          </div>
          <button onClick={onToggle} className="lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2 mb-4">
          <button 
            onClick={onToggleTheme}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors py-3 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
          >
            {isDarkMode ? (
              <><i className="fa-solid fa-sun text-amber-400"></i> Light</>
            ) : (
              <><i className="fa-solid fa-moon text-indigo-400"></i> Dark</>
            )}
          </button>
          <button 
            onClick={onLogout}
            className="w-12 h-12 flex items-center justify-center bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 rounded-2xl transition-colors border border-red-200 dark:border-red-500/20"
            title="Log out"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>

        {/* Primary Actions */}
        <button 
          onClick={onNewChat}
          className="w-full flex items-center gap-3 bg-slate-900 dark:bg-silk-600 text-white hover:opacity-90 transition-opacity p-4 rounded-2xl mb-4 font-bold shadow-lg shadow-silk-500/10"
        >
          <i className="fa-solid fa-plus"></i>
          New Chat
        </button>

        <button 
          onClick={onCallAI}
          className="w-full flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-silk-400 dark:hover:border-silk-500 transition-all p-4 rounded-2xl mb-6 font-bold dark:text-white group"
        >
          <i className="fa-solid fa-phone-volume text-silk-500 group-hover:animate-pulse"></i>
          Voice Link
        </button>

        {/* Search Bar */}
        <div className="mb-6 px-1">
          <div className="relative group">
            <i className={`fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs transition-colors ${searchQuery ? 'text-silk-500' : 'text-slate-400 group-focus-within:text-silk-500'}`}></i>
            <input 
              type="text" 
              placeholder="Filter sessions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-silk-500/30 transition-all placeholder:text-slate-500 dark:text-white"
            />
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2 flex justify-between">
            <span>{searchQuery ? 'Results' : 'History'}</span>
            <span className="opacity-50">{filteredSessions.length}</span>
          </h3>
          
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectChat(session.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 group flex items-center gap-3 ${
                  currentSessionId === session.id 
                    ? 'bg-silk-50 dark:bg-silk-500/10 text-silk-700 dark:text-silk-400 font-bold' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-all ${currentSessionId === session.id ? 'bg-silk-500' : 'bg-transparent group-hover:bg-slate-300'}`}></div>
                <span className="truncate flex-1 text-sm">{session.title}</span>
              </button>
            ))
          ) : (
            <div className="text-center py-12 px-4 opacity-30">
              <i className="fa-solid fa-inbox text-3xl mb-3 block"></i>
              <p className="text-xs font-medium">Clear as silk</p>
            </div>
          )}
        </div>

        {/* Footer User Info */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-900 mt-4">
          <div className="flex items-center gap-4 p-2 bg-slate-50 dark:bg-slate-900 rounded-2xl">
            <img src={user?.avatar || "https://picsum.photos/40/40"} alt="Avatar" className="w-10 h-10 rounded-xl border-2 border-white dark:border-slate-800 shadow-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate dark:text-white">{user?.name || 'Guest User'}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-silk-500"></span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Professional</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-silk-500 p-2">
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
