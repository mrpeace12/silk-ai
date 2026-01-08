
import React from 'react';
import { Message, Role } from '../types';
import { downloadAsFile, downloadAsDoc, downloadAsZip, generateDocTitle } from '../services/fileService';
import ProjectCreationTracker from './ProjectCreationTracker';

interface MessageItemProps {
  message: Message;
  groundingMetadata?: any;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, groundingMetadata }) => {
  const isUser = message.role === Role.USER;

  const handleDownloadDoc = () => {
    const title = generateDocTitle(message.text);
    downloadAsDoc(message.text, `${title}.doc`);
  };

  const handleDownloadZip = () => {
    const title = generateDocTitle(message.text);
    downloadAsZip(message.text, `${title}_project`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    alert('Copied to clipboard!');
  };

  // Check if the content contains triple backticks signifying code blocks
  const hasCodeBlocks = /```[\s\S]*?```/.test(message.text);
  
  // Clean up any stray asterisks that might slip through the system prompt
  const cleanText = (text: string) => {
    return text.replace(/\*\*/g, '').replace(/\*/g, '');
  };

  const textContent = message.text;
  const groundingChunks = groundingMetadata?.groundingChunks;

  // Render a subtle skeleton when the message is initialized but has no text yet
  const renderContent = () => {
    if (!isUser && !textContent && message.isStreaming) {
      return (
        <div className="space-y-3 py-1">
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-[90%] animate-pulse"></div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-[70%] animate-pulse delay-75"></div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-[85%] animate-pulse delay-150"></div>
          <p className="text-[10px] font-bold text-silk-500/50 uppercase tracking-widest mt-4">
            Initializing Intelligence Stream...
          </p>
        </div>
      );
    }

    return (
      <div className="whitespace-pre-wrap leading-[1.8] text-[15px] tracking-tight font-medium">
        {cleanText(textContent)}
        {message.isStreaming && <span className="inline-block w-1.5 h-4 bg-silk-400 ml-1.5 animate-pulse align-middle rounded-full"></span>}
      </div>
    );
  };

  return (
    <div className={`flex w-full mb-10 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
      <div className={`max-w-[95%] lg:max-w-[85%] flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-all ${
          isUser ? 'bg-slate-900 dark:bg-silk-600' : 'silk-gradient'
        }`}>
          {isUser ? <i className="fa-solid fa-user text-xs"></i> : <i className="fa-solid fa-feather-pointed text-xs"></i>}
        </div>
        
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <div className={`p-6 rounded-[2rem] shadow-sm border transition-all duration-300 ${
            isUser 
              ? 'bg-slate-900 dark:bg-silk-600 text-white border-slate-800 dark:border-silk-500 rounded-tr-none' 
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-100 dark:border-slate-800 rounded-tl-none hover:shadow-md'
          }`}>
            {renderContent()}

            {!isUser && (
              <ProjectCreationTracker content={message.text} isStreaming={!!message.isStreaming} />
            )}

            {!isUser && groundingChunks && groundingChunks.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                <div className="flex flex-wrap gap-2">
                  {groundingChunks.map((chunk: any, i: number) => (
                    chunk.web && (
                      <a 
                        key={i} 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-1.5 text-[10px] font-bold text-silk-600 dark:text-silk-400 hover:border-silk-500 transition-all"
                      >
                        <i className="fa-solid fa-link text-[8px] opacity-40"></i>
                        <span className="max-w-[140px] truncate">{chunk.web.title || 'Source'}</span>
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isUser && !message.isStreaming && textContent && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-2">
              <button onClick={handleCopy} className="text-slate-400 dark:text-slate-600 hover:text-silk-500 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <i className="fa-regular fa-copy"></i> Copy
              </button>
              <button onClick={handleDownloadDoc} className="text-slate-400 dark:text-slate-600 hover:text-silk-500 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <i className="fa-regular fa-file-word"></i> Export Doc
              </button>
              {hasCodeBlocks && (
                <button onClick={handleDownloadZip} className="text-slate-400 dark:text-slate-600 hover:text-silk-500 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <i className="fa-regular fa-file-zipper"></i> Download Code as ZIP
                </button>
              )}
              <span className="text-[9px] text-slate-300 dark:text-slate-700 ml-auto font-medium">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
