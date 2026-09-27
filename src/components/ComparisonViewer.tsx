import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Palette,
  SlidersHorizontal,
  Split,
  Eye,
  Sparkles,
  Layers,
  Upload,
} from 'lucide-react';
import { ImageItem, BackgroundSettings } from '../types';
import { formatBytes, formatDuration, downloadBlob, copyBlobToClipboard } from '../utils/formatters';
import { compositeImage } from '../services/remover';

interface ComparisonViewerProps {
  item: ImageItem;
  onClose?: () => void;
  onDownloadItem: (item: ImageItem) => void;
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  item,
  onClose,
  onDownloadItem,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'side' | 'result-only' | 'original-only'>('split');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [compositing, setCompositing] = useState<boolean>(false);

  // Background replacement state
  const [bgSettings, setBgSettings] = useState<BackgroundSettings>({
    type: 'transparent',
    color: '#ffffff',
    gradient: 'sunset',
    blurAmount: 16,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const customBgInputRef = useRef<HTMLInputElement>(null);

  // Drag handler for split slider
  const handleMouseDown = () => setIsDragging(true);
  const handleTouchStart = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !containerRef.current || e.touches.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging]);

  const handleCopyClipboard = async () => {
    if (!item.resultBlob) return;
    const success = await copyBlobToClipboard(item.resultBlob);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadComposited = async () => {
    if (!item.resultBlob && !item.resultUrl) return;
    setCompositing(true);
    try {
      const source = item.resultBlob || item.resultUrl!;
      const compositedBlob = await compositeImage(
        source,
        item.originalUrl,
        item.width,
        item.height,
        bgSettings.type,
        {
          color: bgSettings.color,
          gradient: bgSettings.gradient,
          blurAmount: bgSettings.blurAmount,
          customImageUrl: bgSettings.customImageUrl,
        }
      );
      const ext = bgSettings.type === 'transparent' ? 'png' : 'jpg';
      const cleanName = item.name.replace(/\.[^/.]+$/, '');
      downloadBlob(compositedBlob, `${cleanName}_nobg_${bgSettings.type}.png`);
    } catch (err) {
      console.error('Composite download error:', err);
    } finally {
      setCompositing(false);
    }
  };

  const handleCustomBgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBgSettings((prev) => ({
        ...prev,
        type: 'custom',
        customImageUrl: url,
      }));
    }
  };

  // Compute CSS background style for container based on selected background
  const getBackgroundStyle = (): React.CSSProperties => {
    if (bgSettings.type === 'color') {
      return { backgroundColor: bgSettings.color };
    }
    if (bgSettings.type === 'gradient') {
      if (bgSettings.gradient === 'sunset') {
        return { background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' };
      }
      if (bgSettings.gradient === 'ocean') {
        return { background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' };
      }
      if (bgSettings.gradient === 'studio') {
        return { background: 'linear-gradient(135deg, #334155 0%, #0f172a 100%)' };
      }
      if (bgSettings.gradient === 'cyber') {
        return { background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' };
      }
      return { background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)' };
    }
    if (bgSettings.type === 'blur') {
      return {
        backgroundImage: `url(${item.originalUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: `blur(${bgSettings.blurAmount}px)`,
        transform: 'scale(1.1)', // hide blur edges
      };
    }
    if (bgSettings.type === 'custom' && bgSettings.customImageUrl) {
      return {
        backgroundImage: `url(${bgSettings.customImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    // Transparent checkerboard default
    return {};
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Top Header of Viewer */}
      <div className="px-5 py-3.5 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-950/60">
        <div className="flex items-center gap-3">
          <div className="font-semibold text-sm text-white truncate max-w-xs sm:max-w-md">
            {item.name}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-mono tabular-nums">
            <span>{item.width} × {item.height}px</span>
            <span>·</span>
            <span>{formatBytes(item.resultSize || item.originalSize)}</span>
            {item.processingTimeMs && (
              <>
                <span>·</span>
                <span className="text-emerald-400 font-medium">
                  {formatDuration(item.processingTimeMs)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* View mode buttons */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'split' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
              title="Split comparison slider"
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('side')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'side' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
              title="Side by side"
            >
              Side
            </button>
            <button
              onClick={() => setViewMode('result-only')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'result-only' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
              title="Cutout only"
            >
              Cutout
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs text-neutral-400">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
              className="p-1 hover:text-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] tabular-nums">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
              className="p-1 hover:text-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel !== 1 && (
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 hover:text-white text-[11px]"
                title="Reset zoom"
              >
                1:1
              </button>
            )}
          </div>

          {/* Copy to clipboard */}
          <button
            onClick={handleCopyClipboard}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-700/80 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
            title="Copy cutout image directly to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Download button */}
          <button
            onClick={handleDownloadComposited}
            disabled={compositing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors"
          >
            {compositing ? (
              <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>
              {bgSettings.type === 'transparent' ? 'Download PNG' : 'Export Image'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Preview Canvas Area */}
      <div className="p-4 sm:p-6 bg-neutral-950/40">
        <div
          ref={containerRef}
          className="relative mx-auto rounded-xl overflow-hidden border border-neutral-800/80 select-none shadow-2xl flex items-center justify-center min-h-[360px] max-h-[580px] bg-neutral-950"
          style={{
            maxWidth: '1000px',
            aspectRatio: item.width && item.height ? `${item.width} / ${item.height}` : '4/3',
          }}
        >
          {/* Zoom Wrapper */}
          <div
            className="w-full h-full relative flex items-center justify-center overflow-hidden transition-transform duration-100 ease-out"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* View Mode: Split Slider */}
            {viewMode === 'split' && (
              <div className="relative w-full h-full">
                {/* 1. Original Image (Full width background) */}
                <img
                  src={item.originalUrl}
                  alt="Original"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />

                {/* 2. Cutout foreground with custom background layer (clipped to slider position) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  {/* Backdrop layer */}
                  {bgSettings.type !== 'transparent' && (
                    <div
                      className="absolute inset-0 w-full h-full overflow-hidden"
                      style={getBackgroundStyle()}
                    />
                  )}

                  {/* Checkerboard when transparent */}
                  {bgSettings.type === 'transparent' && (
                    <div className="absolute inset-0 w-full h-full bg-checkered" />
                  )}

                  {/* Cutout Image */}
                  <img
                    src={item.resultUrl}
                    alt="Removed Background"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    style={{
                      // Ensure cutout aligns exactly with original regardless of clipping width
                      width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                      maxWidth: 'none',
                    }}
                  />

                  {/* "Removed" water-quiet label */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-neutral-950/70 backdrop-blur-md rounded text-[11px] font-medium text-emerald-400 border border-neutral-800 pointer-events-none">
                    No Background
                  </div>
                </div>

                {/* "Original" quiet label */}
                <div className="absolute top-3 right-3 px-2 py-1 bg-neutral-950/70 backdrop-blur-md rounded text-[11px] font-medium text-neutral-400 border border-neutral-800 pointer-events-none">
                  Original
                </div>

                {/* Draggable Divider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-lg cursor-ew-resize z-20"
                  style={{ left: `${sliderPosition}%` }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-neutral-900 shadow-xl border border-neutral-300 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
                    <Split className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            {/* View Mode: Side by Side */}
            {viewMode === 'side' && (
              <div className="grid grid-cols-2 w-full h-full gap-2 p-2">
                <div className="relative rounded-lg overflow-hidden border border-neutral-800/80 bg-neutral-950 flex items-center justify-center">
                  <img
                    src={item.originalUrl}
                    alt="Original"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute top-2 left-2 text-[10px] uppercase font-mono px-2 py-0.5 bg-neutral-950/80 text-neutral-300 rounded border border-neutral-800">
                    Original
                  </span>
                </div>

                <div className="relative rounded-lg overflow-hidden border border-neutral-800/80 flex items-center justify-center">
                  {bgSettings.type === 'transparent' ? (
                    <div className="absolute inset-0 bg-checkered" />
                  ) : (
                    <div className="absolute inset-0" style={getBackgroundStyle()} />
                  )}
                  <img
                    src={item.resultUrl}
                    alt="Removed"
                    referrerPolicy="no-referrer"
                    className="relative w-full h-full object-contain z-10"
                  />
                  <span className="absolute top-2 left-2 text-[10px] uppercase font-mono px-2 py-0.5 bg-neutral-950/80 text-emerald-400 rounded border border-neutral-800 z-20">
                    Isolated Cutout
                  </span>
                </div>
              </div>
            )}

            {/* View Mode: Result Only */}
            {viewMode === 'result-only' && (
              <div className="relative w-full h-full flex items-center justify-center">
                {bgSettings.type === 'transparent' ? (
                  <div className="absolute inset-0 bg-checkered" />
                ) : (
                  <div className="absolute inset-0" style={getBackgroundStyle()} />
                )}
                <img
                  src={item.resultUrl}
                  alt="Result Cutout"
                  referrerPolicy="no-referrer"
                  className="relative w-full h-full object-contain z-10"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Custom Background & Replacement Studio Toolbar */}
      <div className="px-5 py-4 border-t border-neutral-800 bg-neutral-950/90 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
            <Palette className="w-3.5 h-3.5 text-emerald-400" />
            <span>Background Replacement Studio:</span>
          </div>

          <div className="text-[11px] text-neutral-400">
            Click any backdrop below to preview & export
          </div>
        </div>

        {/* Backdrop Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Transparent Checkered */}
          <button
            onClick={() => setBgSettings((s) => ({ ...s, type: 'transparent' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              bgSettings.type === 'transparent'
                ? 'bg-neutral-800 border-emerald-500 text-white shadow-sm'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded border border-neutral-600 bg-checkered shrink-0" />
            <span>Transparent (PNG)</span>
          </button>

          {/* Solid White */}
          <button
            onClick={() => setBgSettings((s) => ({ ...s, type: 'color', color: '#ffffff' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              bgSettings.type === 'color' && bgSettings.color === '#ffffff'
                ? 'bg-neutral-800 border-emerald-500 text-white'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded bg-white border border-neutral-400 shrink-0" />
            <span>Pure White</span>
          </button>

          {/* Solid Studio Black */}
          <button
            onClick={() => setBgSettings((s) => ({ ...s, type: 'color', color: '#0f172a' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              bgSettings.type === 'color' && bgSettings.color === '#0f172a'
                ? 'bg-neutral-800 border-emerald-500 text-white'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-700 shrink-0" />
            <span>Studio Dark</span>
          </button>

          {/* Solid Soft Gray */}
          <button
            onClick={() => setBgSettings((s) => ({ ...s, type: 'color', color: '#e2e8f0' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              bgSettings.type === 'color' && bgSettings.color === '#e2e8f0'
                ? 'bg-neutral-800 border-emerald-500 text-white'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-400 shrink-0" />
            <span>Soft Gray</span>
          </button>

          {/* Custom Color Input */}
          <label
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-all ${
              bgSettings.type === 'color' &&
              !['#ffffff', '#0f172a', '#e2e8f0'].includes(bgSettings.color)
                ? 'bg-neutral-800 border-emerald-500 text-white'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <input
              type="color"
              value={bgSettings.color}
              onChange={(e) => setBgSettings((s) => ({ ...s, type: 'color', color: e.target.value }))}
              className="w-3.5 h-3.5 rounded cursor-pointer border-0 p-0 bg-transparent"
            />
            <span>Custom Color</span>
          </label>

          {/* Gradients */}
          <button
            onClick={() => setBgSettings((s) => ({ ...s, type: 'gradient', gradient: 'sunset' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              bgSettings.type === 'gradient' && bgSettings.gradient === 'sunset'
                ? 'bg-neutral-800 border-emerald-500 text-white'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded bg-gradient-to-r from-orange-500 to-pink-500 shrink-0" />
            <span>Sunset Gradient</span>
          </button>

          <button
            onClick={() => setBgSettings((s) => ({ ...s, type: 'gradient', gradient: 'ocean' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              bgSettings.type === 'gradient' && bgSettings.gradient === 'ocean'
                ? 'bg-neutral-800 border-emerald-500 text-white'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded bg-gradient-to-r from-cyan-500 to-blue-500 shrink-0" />
            <span>Ocean Gradient</span>
          </button>

          {/* Blur Background */}
          <button
            onClick={() => setBgSettings((s) => ({ ...s, type: 'blur' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              bgSettings.type === 'blur'
                ? 'bg-neutral-800 border-emerald-500 text-white'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Blur Original</span>
          </button>

          {/* Custom Uploaded Background */}
          <input
            ref={customBgInputRef}
            type="file"
            accept="image/*"
            onChange={handleCustomBgFile}
            className="hidden"
          />
          <button
            onClick={() => customBgInputRef.current?.click()}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              bgSettings.type === 'custom'
                ? 'bg-neutral-800 border-emerald-500 text-white'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Custom Backdrop Image</span>
          </button>
        </div>

        {/* Blur slider if blur is chosen */}
        {bgSettings.type === 'blur' && (
          <div className="pt-2 flex items-center gap-3 text-xs text-neutral-400 max-w-sm">
            <span className="whitespace-nowrap">Blur Radius:</span>
            <input
              type="range"
              min="4"
              max="40"
              value={bgSettings.blurAmount}
              onChange={(e) =>
                setBgSettings((s) => ({ ...s, blurAmount: parseInt(e.target.value) }))
              }
              className="w-full accent-emerald-500"
            />
            <span className="font-mono text-[11px] tabular-nums">{bgSettings.blurAmount}px</span>
          </div>
        )}
      </div>
    </div>
  );
};
