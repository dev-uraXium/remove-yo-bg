import React from 'react';
import { Layers, Settings2, Download, Play, Trash2 } from 'lucide-react';

interface TopBarProps {
  onOpenSettings: () => void;
  onProcessAll: () => void;
  onDownloadAllZip: () => void;
  onClearQueue: () => void;
  isProcessing: boolean;
  queuedCount: number;
  completedCount: number;
  totalCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSettings,
  onProcessAll,
  onDownloadAllZip,
  onClearQueue,
  isProcessing,
  queuedCount,
  completedCount,
  totalCount,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <span>BG Remover</span>
        </div>
      </div>

      {/* Primary Actions & Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSettings}
          className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800"
          title="Configure AI model precision"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Settings</span>
        </button>

        {completedCount > 0 && (
          <button
            onClick={onDownloadAllZip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-700/80 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors whitespace-nowrap"
            title="Download all processed images as ZIP archive"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All ({completedCount})</span>
          </button>
        )}

        {totalCount > 0 && (
          <button
            onClick={onClearQueue}
            disabled={isProcessing}
            className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-40"
            title="Clear Queue"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {queuedCount > 0 ? (
          <button
            onClick={onProcessAll}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-3 h-3 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Process All ({queuedCount})</span>
              </>
            )}
          </button>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400 px-3 py-1 bg-neutral-900/60 rounded-lg border border-neutral-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>WASM On-Device</span>
          </div>
        )}
      </div>
    </header>
  );
};
