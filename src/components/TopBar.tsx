import React from 'react';
import { Layers, Settings2, Download, Play, Trash2 } from 'lucide-react';
import { UraxiumTopWave } from './WaveGraphics';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface TopBarProps {
  currentPage: 'workspace' | 'privacy' | 'terms';
  onNavigate: (page: 'workspace' | 'privacy' | 'terms') => void;
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
  currentPage,
  onNavigate,
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
    <header className="relative w-full z-40 select-none">
      {/* Absolute top fluid wave SVG background, exactly like uraxium.vercel.app */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden pointer-events-none z-0">
        <UraxiumTopWave className="w-full h-24 sm:h-28 md:h-32 lg:h-36 block drop-shadow-lg" />
      </div>

      {/* Navigation Bar content matching Uraxium styling with clean typography */}
      <nav className="relative z-10 flex justify-between items-center px-4 sm:px-8 md:px-10 pt-3 sm:pt-4 pb-10 sm:pb-12 text-xs sm:text-sm tracking-wide gap-3 sm:gap-6 text-[#fff4d8]">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            onClick={() => onNavigate('workspace')}
            className="group flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F6DFA6] to-[#c9833b] p-[1.5px] shadow-md transition-transform duration-200 group-hover:scale-105">
              <div className="w-full h-full rounded-[10px] bg-[#171717] flex items-center justify-center">
                <Layers className="w-4 h-4 text-[#F6DFA6]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-[#fff4d8] group-hover:text-[#F6DFA6] transition-colors">
                IsolateBG
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] uppercase font-mono tracking-wider border-[#F6DFA6]/40 text-[#F6DFA6] bg-[#F6DFA6]/10 px-2 py-0.5 rounded-full">
                WASM AI
              </Badge>
            </div>
          </button>

          {/* Navigation Links with shadcn styling */}
          <div className="hidden sm:flex items-center gap-1.5">
            <Button
              variant={currentPage === 'workspace' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('workspace')}
              className={`rounded-full uppercase tracking-wider text-xs font-semibold px-4 cursor-pointer transition-all ${
                currentPage === 'workspace'
                  ? 'bg-[#F6DFA6]/20 text-[#F6DFA6] border border-[#F6DFA6]/40 shadow-sm hover:bg-[#F6DFA6]/30'
                  : 'text-[#a89f94] hover:text-[#fff4d8] hover:bg-white/5'
              }`}
            >
              Studio
            </Button>
            <Button
              variant={currentPage === 'privacy' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('privacy')}
              className={`rounded-full uppercase tracking-wider text-xs font-semibold px-4 cursor-pointer transition-all ${
                currentPage === 'privacy'
                  ? 'bg-[#F6DFA6]/20 text-[#F6DFA6] border border-[#F6DFA6]/40 shadow-sm hover:bg-[#F6DFA6]/30'
                  : 'text-[#a89f94] hover:text-[#fff4d8] hover:bg-white/5'
              }`}
            >
              Privacy
            </Button>
            <Button
              variant={currentPage === 'terms' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('terms')}
              className={`rounded-full uppercase tracking-wider text-xs font-semibold px-4 cursor-pointer transition-all ${
                currentPage === 'terms'
                  ? 'bg-[#F6DFA6]/20 text-[#F6DFA6] border border-[#F6DFA6]/40 shadow-sm hover:bg-[#F6DFA6]/30'
                  : 'text-[#a89f94] hover:text-[#fff4d8] hover:bg-white/5'
              }`}
            >
              Terms
            </Button>
          </div>
        </div>

        {/* Action Controls using shadcn Button & Tooltip */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger render={
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenSettings}
                className="rounded-full text-xs text-[#fff4d8] bg-[#171717]/80 hover:bg-[#222222] border-[#a89f94]/30 shadow-sm font-medium gap-1.5 cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5 text-[#F6DFA6]" />
                <span className="hidden md:inline">Settings</span>
              </Button>
            } />
            <TooltipContent className="bg-[#222222] text-[#fff4d8] border-[#a89f94]/30 text-xs">
              Configure ONNX precision and execution device
            </TooltipContent>
          </Tooltip>

          {currentPage === 'workspace' && completedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadAllZip}
              className="rounded-full text-xs font-semibold text-[#fff4d8] bg-[#171717]/90 border-[#a89f94]/40 hover:border-[#F6DFA6] hover:bg-[#222222] shadow-sm gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-[#F6DFA6]" />
              <span>Download All ({completedCount})</span>
            </Button>
          )}

          {currentPage === 'workspace' && totalCount > 0 && (
            <Tooltip>
              <TooltipTrigger render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClearQueue}
                  disabled={isProcessing}
                  className="rounded-full text-[#fff4d8]/75 hover:text-rose-400 hover:bg-rose-500/20 bg-[#171717]/80 border border-[#a89f94]/30 cursor-pointer disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              } />
              <TooltipContent className="bg-[#222222] text-[#fff4d8] border-[#a89f94]/30 text-xs">
                Clear all images from queue
              </TooltipContent>
            </Tooltip>
          )}

          {currentPage === 'workspace' && queuedCount > 0 && (
            <Button
              size="sm"
              onClick={onProcessAll}
              disabled={isProcessing}
              className="rounded-full text-xs font-bold text-[#171717] bg-gradient-to-r from-[#F6DFA6] via-[#fff4d8] to-[#c9833b] hover:brightness-105 shadow-lg transition-all gap-1.5 px-4 cursor-pointer disabled:opacity-50 glow-gold"
            >
              {isProcessing ? (
                <>
                  <div className="w-3 h-3 border-2 border-[#171717] border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Process All ({queuedCount})</span>
                </>
              )}
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};
