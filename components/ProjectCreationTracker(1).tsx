
import React, { useMemo } from 'react';

interface FileProgress {
  name: string;
  status: 'pending' | 'writing' | 'completed';
  progress: number;
}

interface ProjectCreationTrackerProps {
  content: string;
  isStreaming: boolean;
}

/**
 * ProjectCreationTracker visualizes the model's progress in "writing" project files.
 * It parses the message content for "File: path/to/file" patterns to simulate 
 * a build console experience.
 */
const ProjectCreationTracker: React.FC<ProjectCreationTrackerProps> = ({ content, isStreaming }) => {
  const projectFiles = useMemo(() => {
    const trackedFiles: FileProgress[] = [];
    
    // This regex looks for the "File: " prefix followed by a valid file path string.
    // It captures the path in a group for extraction.
    const fileMarkerRegex = /File:\s*([a-zA-Z0-9_\-\.\/]+)/gi;
    const allFileMarkers = Array.from(content.matchAll(fileMarkerRegex));
    
    allFileMarkers.forEach((regexMatch, index) => {
      const filePath = regexMatch[1];
      // We assume the very last file found in a streaming message is currently being processed.
      const isMostRecentFile = index === allFileMarkers.length - 1;
      
      // If the model is still streaming and this is the last file mentioned, 
      // we show it as "writing" with partial progress.
      const isCurrentlyWriting = isStreaming && isMostRecentFile;
      
      trackedFiles.push({
        name: filePath,
        status: isCurrentlyWriting ? 'writing' : 'completed',
        progress: isCurrentlyWriting ? 75 : 100
      });
    });

    return trackedFiles;
  }, [content, isStreaming]);

  // Don't render anything if no file markers are detected in the text
  if (projectFiles.length === 0) return null;

  return (
    <div className="mt-4 mb-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-900 text-white overflow-hidden shadow-lg max-w-lg animate-in fade-in zoom-in-95 duration-500">
      {/* Console Header */}
      <div className="bg-slate-800 px-3 py-1.5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/80"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/80"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            SILK Build Console
          </span>
        </div>
        <div className="text-[9px] text-indigo-400 font-mono">
          <i className={`fa-solid ${isStreaming ? 'fa-spinner fa-spin' : 'fa-check'} mr-1.5`}></i>
          {isStreaming ? 'BUILDING' : 'READY'}
        </div>
      </div>

      {/* File List */}
      <div className="p-3 space-y-2 font-mono">
        {/* We only show the 4 most recent files to keep the UI compact and "medium" sized */}
        {projectFiles.slice(-4).map((file, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px]">
              {/* Clickable file entry */}
              <button 
                onClick={() => console.log(`File Action Triggered - Name: ${file.name}, Current Status: ${file.status}`)}
                className="flex items-center gap-2 truncate pr-4 text-left hover:opacity-80 active:scale-[0.98] transition-all group/file outline-none"
                title={`Click to view status: ${file.name}`}
              >
                <i className={`fa-regular ${file.name.includes('.') ? 'fa-file-code' : 'fa-folder'} ${file.status === 'writing' ? 'text-indigo-400' : 'text-emerald-400'}`}></i>
                <span className={`${file.status === 'writing' ? 'text-white' : 'text-slate-500'} group-hover/file:underline decoration-silk-500/50 underline-offset-4`}>
                  {file.name}
                </span>
              </button>
              
              <span className="text-[8px] text-slate-500 shrink-0 font-tabular-nums">
                {file.progress}%
              </span>
            </div>
            {/* Progress Bar with smooth transition */}
            <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-in-out ${
                  file.status === 'writing' ? 'bg-indigo-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${file.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
        
        {/* Indicator for additional files not shown in the compact view */}
        {projectFiles.length > 4 && (
          <div className="text-[8px] text-slate-600 italic px-1 pt-1">
            + {projectFiles.length - 4} additional files processed...
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCreationTracker;
