import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Trash2,
  Play,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { ImageItem } from '../types';
import { formatBytes, formatDuration } from '../utils/formatters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface BatchQueueProps {
  items: ImageItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onProcessItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onDownloadItem: (item: ImageItem) => void;
  isProcessing: boolean;
}

export const BatchQueue: React.FC<BatchQueueProps> = ({
  items,
  selectedItemId,
  onSelectItem,
  onProcessItem,
  onRemoveItem,
  onDownloadItem,
  isProcessing,
}) => {
  if (items.length === 0) return null;

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const queuedCount = items.filter((i) => i.status === 'queued').length;

  return (
    <div className="space-y-3">
      {/* Queue Header & Status Summary */}
      <div className="flex items-center justify-between text-xs text-[#a89f94] px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#fff4d8]">Processing Queue</span>
          <span aria-hidden="true" className="text-[#a89f94]/40">·</span>
          <Badge variant="outline" className="font-mono tabular-nums text-[#fff4d8] border-[#a89f94]/30 bg-[#222222]/50 text-[10px]">
            {items.length} items
          </Badge>
          <span aria-hidden="true" className="text-[#a89f94]/40">·</span>
          <span className="font-mono tabular-nums text-[#F6DFA6] font-semibold">
            {completedCount} ready
          </span>
          {queuedCount > 0 && (
            <>
              <span aria-hidden="true" className="text-[#a89f94]/40">·</span>
              <span className="font-mono tabular-nums text-[#c9833b] font-semibold">
                {queuedCount} pending
              </span>
            </>
          )}
        </div>
        <div className="text-[11px] text-[#a89f94] font-mono">
          Sequential WASM pipeline
        </div>
      </div>

      {/* Queue List using shadcn Card with custom aesthetics */}
      <div className="space-y-2.5">
        {items.map((item) => {
          const isSelected = item.id === selectedItemId;

          return (
            <Card
              key={item.id}
              onClick={() => {
                if (item.status === 'completed') {
                  onSelectItem(item.id);
                }
              }}
              className={`group border rounded-2xl p-3.5 transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#F6DFA6] bg-[#222222]/90 shadow-xl glow-gold ring-1 ring-[#F6DFA6]/40'
                  : 'border-[#a89f94]/20 bg-[#222222]/50 hover:border-[#a89f94]/40 hover:bg-[#222222]/80'
              }`}
            >
              <div className="flex items-center gap-3.5">
                {/* Thumbnail Preview */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#a89f94]/25 bg-[#171717] shrink-0 flex items-center justify-center shadow-inner">
                  {item.status === 'completed' && item.resultUrl ? (
                    <>
                      <div className="absolute inset-0 bg-checkered" />
                      <img
                        src={item.resultUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="relative z-10 w-full h-full object-contain p-0.5"
                      />
                    </>
                  ) : (
                    <img
                      src={item.originalUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Info & Progress Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-xs text-[#fff4d8] group-hover:text-[#F6DFA6] truncate transition-colors">
                      {item.name}
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-1.5 shrink-0 text-xs">
                      {item.status === 'completed' && (
                        <Badge variant="outline" className="flex items-center gap-1 text-[#F6DFA6] border-[#F6DFA6]/30 bg-[#F6DFA6]/10 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-[#F6DFA6]" />
                          <span>Isolated</span>
                        </Badge>
                      )}
                      {item.status === 'processing' && (
                        <Badge variant="outline" className="flex items-center gap-1 text-[#c9833b] border-[#c9833b]/40 bg-[#c9833b]/10 text-[10px] font-semibold">
                          <div className="w-2.5 h-2.5 border-2 border-[#c9833b] border-t-transparent rounded-full animate-spin" />
                          <span className="font-mono tabular-nums">{item.progress}%</span>
                        </Badge>
                      )}
                      {item.status === 'queued' && (
                        <Badge variant="outline" className="flex items-center gap-1 text-[#a89f94] border-[#a89f94]/30 bg-[#171717] text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>Queued</span>
                        </Badge>
                      )}
                      {item.status === 'error' && (
                        <Badge variant="destructive" className="flex items-center gap-1 text-[10px]">
                          <AlertCircle className="w-3 h-3" />
                          <span>Error</span>
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-2 text-[11px] text-[#a89f94] mt-0.5 font-mono tabular-nums">
                    <span>
                      {item.width} × {item.height}px
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatBytes(item.originalSize)}</span>
                    {item.resultSize && (
                      <>
                        <span className="text-[#a89f94]/60">→</span>
                        <span className="text-[#F6DFA6] font-semibold">
                          {formatBytes(item.resultSize)}
                        </span>
                      </>
                    )}
                    {item.processingTimeMs && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#fff4d8]">
                          {formatDuration(item.processingTimeMs)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Processing Progress Bar with warm gradient */}
                  {item.status === 'processing' && (
                    <div className="mt-2 space-y-1">
                      <div className="w-full bg-[#171717] rounded-full h-1.5 overflow-hidden border border-[#a89f94]/20">
                        <div
                          className="bg-gradient-to-r from-[#c9833b] via-[#F6DFA6] to-[#fff4d8] h-full rounded-full transition-all duration-300 shadow-sm"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      {item.progressStage && (
                        <div className="text-[10px] text-[#F6DFA6]/90 truncate font-mono">
                          {item.progressStage}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {item.status === 'error' && item.error && (
                    <div className="mt-1 text-[11px] text-rose-400/90 truncate">
                      {item.error}
                    </div>
                  )}
                </div>

                {/* Actions with shadcn Tooltip & Button */}
                <div className="flex items-center gap-1 shrink-0">
                  {item.status === 'completed' && (
                    <>
                      <Tooltip>
                        <TooltipTrigger render={
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectItem(item.id);
                            }}
                            className={`rounded-lg cursor-pointer ${
                              isSelected
                                ? 'bg-[#F6DFA6]/20 text-[#F6DFA6] border border-[#F6DFA6]/40'
                                : 'text-[#a89f94] hover:text-[#fff4d8] hover:bg-[#2a2a2a]'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        } />
                        <TooltipContent className="bg-[#222222] text-[#fff4d8] border-[#a89f94]/30 text-xs">
                          Inspect in comparison viewer
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger render={
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDownloadItem(item);
                            }}
                            className="rounded-lg text-[#a89f94] hover:text-[#F6DFA6] hover:bg-[#2a2a2a] cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        } />
                        <TooltipContent className="bg-[#222222] text-[#fff4d8] border-[#a89f94]/30 text-xs">
                          Download transparent PNG
                        </TooltipContent>
                      </Tooltip>
                    </>
                  )}

                  {item.status === 'queued' && (
                    <Tooltip>
                      <TooltipTrigger render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onProcessItem(item.id);
                          }}
                          disabled={isProcessing}
                          className="rounded-lg text-[#a89f94] hover:text-[#F6DFA6] hover:bg-[#2a2a2a] cursor-pointer disabled:opacity-40"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                      } />
                      <TooltipContent className="bg-[#222222] text-[#fff4d8] border-[#a89f94]/30 text-xs">
                        Process this image
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {item.status === 'error' && (
                    <Tooltip>
                      <TooltipTrigger render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onProcessItem(item.id);
                          }}
                          className="rounded-lg text-[#a89f94] hover:text-[#c9833b] hover:bg-[#2a2a2a] cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                      } />
                      <TooltipContent className="bg-[#222222] text-[#fff4d8] border-[#a89f94]/30 text-xs">
                        Retry processing
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveItem(item.id);
                        }}
                        className="rounded-lg text-[#a89f94] hover:text-rose-400 hover:bg-[#2a2a2a] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    } />
                    <TooltipContent className="bg-[#222222] text-[#fff4d8] border-[#a89f94]/30 text-xs">
                      Remove from queue
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
