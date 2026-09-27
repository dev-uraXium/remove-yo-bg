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
  Layers,
} from 'lucide-react';
import { ImageItem } from '../types';
import { formatBytes, formatDuration } from '../utils/formatters';

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
  const processingCount = items.filter((i) => i.status === 'processing').length;

  return (
    <div className="space-y-3">
      {/* Queue Header & Status Summary */}
      <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-200">Processing Queue</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{items.length} total</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-emerald-400">
            {completedCount} completed
          </span>
          {queuedCount > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-amber-400">
                {queuedCount} queued
              </span>
            </>
          )}
        </div>
        <div className="text-[11px] text-neutral-500">
          Sequential in-browser processing
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-2">
        {items.map((item) => {
          const isSelected = item.id === selectedItemId;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.status === 'completed') {
                  onSelectItem(item.id);
                }
              }}
              className={`group border rounded-xl p-3 transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-500/70 bg-neutral-900/90 shadow-md ring-1 ring-emerald-500/30'
                  : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/70'
              }`}
            >
              <div className="flex items-center gap-3.5">
                {/* Thumbnail */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 shrink-0 flex items-center justify-center">
                  {item.status === 'completed' && item.resultUrl ? (
                    <>
                      <div className="absolute inset-0 bg-checkered" />
                      <img
                        src={item.resultUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="relative z-10 w-full h-full object-contain"
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

                {/* Info & Status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-xs text-neutral-200 group-hover:text-white truncate">
                      {item.name}
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5 shrink-0 text-xs">
                      {item.status === 'completed' && (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Ready</span>
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span className="flex items-center gap-1 text-amber-400 font-medium">
                          <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                          <span className="font-mono tabular-nums">{item.progress}%</span>
                        </span>
                      )}
                      {item.status === 'queued' && (
                        <span className="flex items-center gap-1 text-neutral-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>In Queue</span>
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="flex items-center gap-1 text-rose-400 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Error</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5 font-mono tabular-nums">
                    <span>
                      {item.width} × {item.height}px
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatBytes(item.originalSize)}</span>
                    {item.resultSize && (
                      <>
                        <span>→</span>
                        <span className="text-emerald-400 font-medium">
                          {formatBytes(item.resultSize)}
                        </span>
                      </>
                    )}
                    {item.processingTimeMs && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-neutral-400 font-sans">
                          {formatDuration(item.processingTimeMs)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Processing Progress Bar & Detailed Sub-stage */}
                  {item.status === 'processing' && (
                    <div className="mt-2 space-y-1">
                      <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full transition-all duration-200"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      {item.progressStage && (
                        <div className="text-[10px] text-amber-300/80 truncate">
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

                {/* Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  {item.status === 'completed' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(item.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                        }`}
                        title="Open in Comparison Studio"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadItem(item);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Download Transparent PNG"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {item.status === 'queued' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onProcessItem(item.id);
                      }}
                      disabled={isProcessing}
                      className="p-1.5 text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-40"
                      title="Process this image immediately"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}

                  {item.status === 'error' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onProcessItem(item.id);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Retry processing"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(item.id);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
