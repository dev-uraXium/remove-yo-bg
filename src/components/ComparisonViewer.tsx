import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Palette,
  Split,
  Sparkles,
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
  const [viewMode, setViewMode] = useState<'split' | 'side' | 'result-only'>('split');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [compositing, setCompositing] = useState<boolean>(false);

  // Background replacement state
  const [bgSettings, setBgSettings] = useState<BackgroundSettings>({
    type: 'transparent',
    color: '#F6DFA6',
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

  const getBackgroundStyle = (): React.CSSProperties => {
    if (bgSettings.type === 'color') {
      return { backgroundColor: bgSettings.color };
    }
    if (bgSettings.type === 'gradient') {
      if (bgSettings.gradient === 'warm-glow') {
        return { background: 'linear-gradient(135deg, #F6DFA6 0%, #c9833b 100%)' };
      }
      if (bgSettings.gradient === 'sunset') {
        return { background: 'linear-gradient(135deg, #c9833b 0%, #171717 100%)' };
      }
      if (bgSettings.gradient === 'cream-sand') {
        return { background: 'linear-gradient(135deg, #fff4d8 0%, #F6DFA6 100%)' };
      }
      if (bgSettings.gradient === 'deep-dark') {
        return { background: 'linear-gradient(135deg, #222222 0%, #171717 100%)' };
      }
      return { background: 'linear-gradient(135deg, #F6DFA6 0%, #c9833b 100%)' };
    }
    if (bgSettings.type === 'blur') {
      return {
        backgroundImage: `url(${item.originalUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: `blur(${bgSettings.blurAmount}px)`,
        transform: 'scale(1.1)',
      };
    }
    if (bgSettings.type === 'custom' && bgSettings.customImageUrl) {
      return {
        backgroundImage: `url(${bgSettings.customImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {};
  };

  return (
    <div className="bg-[#171717] border border-[#a89f94]/30 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Top Header of Viewer */}
      <div className="px-5 py-4 border-b border-[#a89f94]/20 flex flex-wrap items-center justify-between gap-3 bg-[#222222]/80">
        <div className="flex items-center gap-3">
          <div className="font-bold text-sm text-[#fff4d8] truncate max-w-xs sm:max-w-md">
            {item.name}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#a89f94] font-mono tabular-nums">
            <span>{item.width} × {item.height}px</span>
            <span>·</span>
            <span>{formatBytes(item.resultSize || item.originalSize)}</span>
            {item.processingTimeMs && (
              <>
                <span>·</span>
                <span className="text-[#F6DFA6] font-semibold">
                  {formatDuration(item.processingTimeMs)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-[#171717] border border-[#a89f94]/25 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'split' ? 'bg-[#F6DFA6] text-[#171717] font-bold shadow-sm' : 'text-[#a89f94] hover:text-[#fff4d8]'
              }`}
            >
              Split Slider
            </button>
            <button
              onClick={() => setViewMode('side')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'side' ? 'bg-[#F6DFA6] text-[#171717] font-bold shadow-sm' : 'text-[#a89f94] hover:text-[#fff4d8]'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('result-only')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'result-only' ? 'bg-[#F6DFA6] text-[#171717] font-bold shadow-sm' : 'text-[#a89f94] hover:text-[#fff4d8]'
              }`}
            >
              Cutout
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-[#171717] border border-[#a89f94]/25 rounded-xl p-0.5 text-xs text-[#a89f94]">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
              className="p-1 hover:text-[#fff4d8] transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] tabular-nums text-[#fff4d8]">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
              className="p-1 hover:text-[#fff4d8] transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel !== 1 && (
              <button
                onClick={() => setZoomLevel(1)}
                className="px-1.5 py-0.5 hover:text-[#F6DFA6] text-[11px] font-mono"
                title="Reset zoom"
              >
                1:1
              </button>
            )}
          </div>

          {/* Copy to clipboard */}
          <button
            onClick={handleCopyClipboard}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#fff4d8] bg-[#171717] border border-[#a89f94]/30 rounded-xl hover:bg-[#222222] transition-colors"
            title="Copy cutout image directly to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#F6DFA6]" />
                <span className="text-[#F6DFA6]">Copied!</span>
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
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-[#171717] bg-gradient-to-r from-[#F6DFA6] to-[#c9833b] hover:brightness-110 rounded-xl shadow-md transition-all glow-gold"
          >
            {compositing ? (
              <div className="w-3.5 h-3.5 border-2 border-[#171717] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>
              {bgSettings.type === 'transparent' ? 'Export PNG' : 'Export Image'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Preview Canvas Area */}
      <div className="p-4 sm:p-6 bg-[#171717]">
        <div
          ref={containerRef}
          className="relative mx-auto rounded-2xl overflow-hidden border border-[#a89f94]/30 select-none shadow-2xl flex items-center justify-center min-h-[360px] max-h-[580px] bg-[#171717]"
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
                {/* Original Image */}
                <img
                  src={item.originalUrl}
                  alt="Original"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />

                {/* Cutout foreground with custom background layer */}
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
                      width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                      maxWidth: 'none',
                    }}
                  />

                  {/* Quiet label */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#171717]/85 backdrop-blur-md rounded-lg text-[11px] font-semibold text-[#F6DFA6] border border-[#a89f94]/30 pointer-events-none shadow-sm">
                    Isolated Subject
                  </div>
                </div>

                {/* Original quiet label */}
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#171717]/85 backdrop-blur-md rounded-lg text-[11px] font-semibold text-[#a89f94] border border-[#a89f94]/30 pointer-events-none shadow-sm">
                  Original Image
                </div>

                {/* Draggable Divider Handle with custom peach/amber theme */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#F6DFA6] via-[#fff4d8] to-[#c9833b] shadow-2xl cursor-ew-resize z-20"
                  style={{ left: `${sliderPosition}%` }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#171717] text-[#F6DFA6] shadow-2xl border-2 border-[#F6DFA6] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform glow-gold">
                    <Split className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            {/* View Mode: Side by Side */}
            {viewMode === 'side' && (
              <div className="grid grid-cols-2 w-full h-full gap-3 p-3">
                <div className="relative rounded-xl overflow-hidden border border-[#a89f94]/25 bg-[#171717] flex items-center justify-center">
                  <img
                    src={item.originalUrl}
                    alt="Original"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute top-2 left-2 text-[10px] uppercase font-mono px-2 py-0.5 bg-[#171717]/80 text-[#a89f94] rounded border border-[#a89f94]/25">
                    Original
                  </span>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-[#a89f94]/25 flex items-center justify-center">
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
                  <span className="absolute top-2 left-2 text-[10px] uppercase font-mono px-2 py-0.5 bg-[#171717]/85 text-[#F6DFA6] rounded border border-[#F6DFA6]/40 z-20">
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

      {/* Backdrop Studio Toolbar using the new Palette */}
      <div className="px-5 py-4 border-t border-[#a89f94]/20 bg-[#222222]/80 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#fff4d8]">
            <Palette className="w-3.5 h-3.5 text-[#F6DFA6]" />
            <span>Interactive Backdrop Studio:</span>
          </div>

          <div className="text-[11px] text-[#a89f94] font-mono">
            Preview & export against solid, gradient, or custom backdrops
          </div>
        </div>

        {/* Backdrop Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Transparent Checkered */}
          <button
            onClick={() => setBgSettings((s) => ({ ...s, type: 'transparent' }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              bgSettings.type === 'transparent'
                ? 'bg-[#171717] border-[#F6DFA6] text-[#F6DFA6] shadow-sm glow-gold'
                : 'bg-[#171717]/60 border-[#a89f94]/25 text-[#a89f94] hover:text-[#fff4d8] hover:border-[#a89f94]/50'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded border border-[#a89f94]/40 bg-checkered shrink-0" />
            <span>Transparent (PNG)</span>
          </button>

          {/* Warm Sand #F6DFA6 */}
          <button
            onClick={() => setBgSettings((s) => ({ ...s, type: 'color', color: '#F6DFA6' }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              bgSettings.type === 'color' && bgSettings.color === '#F6DFA6'
                ? 'bg-[#171717] border-[#F6DFA6] text-[#F6DFA6] shadow-sm glow-gold'
                : 'bg-[#171717]/60 border-[#a89f94]/25 text-[#a89f94] hover:text-[#fff4d8] hover:border-[#a89f94]/50'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded bg-[#F6DFA6] border border-[#a89f94]/40 shrink-0" />
            <span>Warm Sand</span>
          </button>

          {/* Soft Cream #fff4d8 */}
          <button
            onClick={() => setBgSettings((s) => ({ ...s, type: 'color', color: '#fff4d8' }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              bgSettings.type === 'color' && bgSettings.color === '#fff4d8'
                ? 'bg-[#171717] border-[#F6DFA6] text-[#F6DFA6] shadow-sm glow-gold'
                : 'bg-[#171717]/60 border-[#a89f94]/25 text-[#a89f94] hover:text-[#fff4d8] hover:border-[#a89f94]/50'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded bg-[#fff4d8] border border-[#a89f94]/40 shrink-0" />
            <span>Soft Cream</span>
          </button>

          {/* Studio Charcoal #171717 */}
          <button
            onClick={() => setBgSettings((s) => ({ ...s, type: 'color', color: '#171717' }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              bgSettings.type === 'color' && bgSettings.color === '#171717'
                ? 'bg-[#171717] border-[#F6DFA6] text-[#F6DFA6] shadow-sm glow-gold'
                : 'bg-[#171717]/60 border-[#a89f94]/25 text-[#a89f94] hover:text-[#fff4d8] hover:border-[#a89f94]/50'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded bg-[#171717] border border-[#a89f94]/40 shrink-0" />
            <span>Charcoal</span>
          </button>

          {/* Amber Accent #c9833b */}
          <button
            onClick={() => setBgSettings((s) => ({ ...s, type: 'color', color: '#c9833b' }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              bgSettings.type === 'color' && bgSettings.color === '#c9833b'
                ? 'bg-[#171717] border-[#F6DFA6] text-[#F6DFA6] shadow-sm glow-gold'
                : 'bg-[#171717]/60 border-[#a89f94]/25 text-[#a89f94] hover:text-[#fff4d8] hover:border-[#a89f94]/50'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded bg-[#c9833b] border border-[#a89f94]/40 shrink-0" />
            <span>Warm Amber</span>
          </button>

          {/* Palette Gradients */}
          <button
            onClick={() => setBgSettings((s) => ({ ...s, type: 'gradient', gradient: 'warm-glow' }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              bgSettings.type === 'gradient' && bgSettings.gradient === 'warm-glow'
                ? 'bg-[#171717] border-[#F6DFA6] text-[#F6DFA6] shadow-sm glow-gold'
                : 'bg-[#171717]/60 border-[#a89f94]/25 text-[#a89f94] hover:text-[#fff4d8] hover:border-[#a89f94]/50'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded bg-gradient-to-r from-[#F6DFA6] to-[#c9833b] shrink-0" />
            <span>Sand & Amber</span>
          </button>

          {/* Custom Color Input */}
          <label
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-all ${
              bgSettings.type === 'color' &&
              !['#F6DFA6', '#fff4d8', '#171717', '#c9833b'].includes(bgSettings.color)
                ? 'bg-[#171717] border-[#F6DFA6] text-[#F6DFA6]'
                : 'bg-[#171717]/60 border-[#a89f94]/25 text-[#a89f94] hover:text-[#fff4d8] hover:border-[#a89f94]/50'
            }`}
          >
            <input
              type="color"
              value={bgSettings.color}
              onChange={(e) => setBgSettings((s) => ({ ...s, type: 'color', color: e.target.value }))}
              className="w-3.5 h-3.5 rounded cursor-pointer border-0 p-0 bg-transparent"
            />
            <span>Custom Picker</span>
          </label>

          {/* Blur Background */}
          <button
            onClick={() => setBgSettings((s) => ({ ...s, type: 'blur' }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              bgSettings.type === 'blur'
                ? 'bg-[#171717] border-[#F6DFA6] text-[#F6DFA6] shadow-sm glow-gold'
                : 'bg-[#171717]/60 border-[#a89f94]/25 text-[#a89f94] hover:text-[#fff4d8] hover:border-[#a89f94]/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F6DFA6]" />
            <span>Blur Original</span>
          </button>

          {/* Custom Backdrop Upload */}
          <input
            ref={customBgInputRef}
            type="file"
            accept="image/*"
            onChange={handleCustomBgFile}
            className="hidden"
          />
          <button
            onClick={() => customBgInputRef.current?.click()}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              bgSettings.type === 'custom'
                ? 'bg-[#171717] border-[#F6DFA6] text-[#F6DFA6] shadow-sm glow-gold'
                : 'bg-[#171717]/60 border-[#a89f94]/25 text-[#a89f94] hover:text-[#fff4d8] hover:border-[#a89f94]/50'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-[#c9833b]" />
            <span>Custom Backdrop Image</span>
          </button>
        </div>

        {/* Blur slider if blur is chosen */}
        {bgSettings.type === 'blur' && (
          <div className="pt-2 flex items-center gap-3 text-xs text-[#a89f94] max-w-sm">
            <span className="whitespace-nowrap">Blur Radius:</span>
            <input
              type="range"
              min="4"
              max="40"
              value={bgSettings.blurAmount}
              onChange={(e) =>
                setBgSettings((s) => ({ ...s, blurAmount: parseInt(e.target.value) }))
              }
              className="w-full accent-[#F6DFA6]"
            />
            <span className="font-mono text-[11px] tabular-nums text-[#fff4d8]">{bgSettings.blurAmount}px</span>
          </div>
        )}
      </div>
    </div>
  );
};
