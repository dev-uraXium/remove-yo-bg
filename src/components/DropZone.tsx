import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Plus, Copy } from 'lucide-react';
import { SAMPLE_IMAGES, SampleImageItem } from '../data/sampleImages';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  onSampleSelected: (sample: SampleImageItem) => void;
  compact?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  onSampleSelected,
  compact = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pastedRecently, setPastedRecently] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global paste handler to paste images from clipboard (Ctrl+V or Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }

      if (files.length > 0) {
        setPastedRecently(true);
        setTimeout(() => setPastedRecently(false), 2000);
        onFilesSelected(files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imageFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const imageFiles = Array.from(e.target.files);
      onFilesSelected(imageFiles);
      e.target.value = '';
    }
  };

  if (compact) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-neutral-300">
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add More Images</span>
          <span className="text-neutral-500 text-[11px]">(Drop or Ctrl+V)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Drop Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10 scale-[1.005]'
            : 'border-neutral-800 bg-neutral-900/30 hover:border-neutral-700 hover:bg-neutral-900/60 shadow-xl'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/avif, image/bmp"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-white tracking-tight">
              Drag & drop images to remove background
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Supports single or bulk batch uploads (PNG, JPEG, WebP).
              <span className="block mt-0.5 text-neutral-500">
                You can also press <kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-neutral-800 text-neutral-300 rounded border border-neutral-700">Ctrl+V</kbd> to paste directly from clipboard.
              </span>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors"
            >
              Browse Files
            </button>
          </div>

          {pastedRecently && (
            <div className="pt-2 text-xs text-emerald-400 font-medium flex items-center justify-center gap-1.5 animate-pulse">
              <Copy className="w-3.5 h-3.5" />
              <span>Image captured from clipboard!</span>
            </div>
          )}
        </div>
      </div>

      {/* Instant Test Sample Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
          <span className="font-medium text-neutral-300">Or try a sample image:</span>
          <span className="hidden sm:inline text-neutral-500 text-[11px]">Click to load & process</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSampleSelected(sample)}
              className="group text-left border border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800/60 rounded-xl p-2.5 transition-all text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-neutral-950 mb-2 border border-neutral-800/80 relative">
                <img
                  src={sample.url}
                  alt={sample.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-neutral-950/20 group-hover:opacity-0 transition-opacity" />
              </div>
              <div className="font-medium text-neutral-200 group-hover:text-white truncate">
                {sample.title}
              </div>
              <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                {sample.category}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
