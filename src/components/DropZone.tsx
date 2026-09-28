import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Plus, Copy, Sparkles, Wand2 } from 'lucide-react';
import { SAMPLE_IMAGES, SampleImageItem } from '../data/sampleImages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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

  // Global paste handler to paste images from clipboard
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
      const validFiles: File[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file.type.startsWith('image/')) {
          validFiles.push(file);
        }
      }
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      e.target.value = '';
    }
  };

  // Compact state used when queue has active items
  if (compact) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group border border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-[#F6DFA6] bg-[#F6DFA6]/10 glow-gold'
            : 'border-[#a89f94]/30 hover:border-[#F6DFA6]/60 bg-[#222222]/40 hover:bg-[#222222]/70'
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
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#fff4d8]">
          <div className="w-5 h-5 rounded-lg bg-[#c9833b]/20 flex items-center justify-center text-[#F6DFA6]">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span>Add More Images</span>
          <span className="text-[#a89f94] text-[11px] font-normal">(Drop or Ctrl+V)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Drop Card with Spline / Peachweb Aesthetic and shadcn Card */}
      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group border rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 overflow-hidden ${
          isDragging
            ? 'border-[#F6DFA6] bg-[#F6DFA6]/10 glow-gold scale-[1.01]'
            : 'border-[#a89f94]/25 bg-gradient-to-b from-[#222222]/70 via-[#171717]/90 to-[#171717] hover:border-[#F6DFA6]/50 shadow-2xl glass-card'
        }`}
      >
        {/* Subtle decorative background ambient glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#c9833b]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#F6DFA6]/20 transition-all duration-500" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#F6DFA6]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#c9833b]/20 transition-all duration-500" />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/avif, image/bmp"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="relative max-w-md mx-auto space-y-5">
          {/* Animated Icon Avatar */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#F6DFA6] via-[#fff4d8] to-[#c9833b] p-[1.5px] shadow-lg group-hover:scale-105 group-hover:rotate-2 transition-all duration-300">
            <div className="w-full h-full rounded-[14px] bg-[#171717] flex items-center justify-center text-[#F6DFA6]">
              <UploadCloud className="w-8 h-8 group-hover:text-[#fff4d8] transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#fff4d8] tracking-tight group-hover:text-[#F6DFA6] transition-colors">
              Drag & drop images to isolate subjects
            </h2>
            <p className="text-xs text-[#a89f94] leading-relaxed">
              Processes completely in your browser with high-fidelity alpha matting.
              <span className="block mt-1 text-[#a89f94]/80">
                Supports bulk drops or paste instantly using{' '}
                <kbd className="px-2 py-0.5 text-[11px] font-mono bg-[#222222] text-[#F6DFA6] rounded-md border border-[#a89f94]/30 shadow-sm">
                  Ctrl+V
                </kbd>
              </span>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              type="button"
              className="px-6 py-2.5 text-xs font-bold text-[#171717] bg-gradient-to-r from-[#F6DFA6] to-[#c9833b] hover:brightness-110 rounded-full shadow-md transition-all glow-gold cursor-pointer"
            >
              Browse Image Files
            </Button>
          </div>

          {pastedRecently && (
            <div className="pt-2 text-xs text-[#F6DFA6] font-semibold flex items-center justify-center gap-1.5 animate-pulse">
              <Copy className="w-3.5 h-3.5" />
              <span>Image captured from clipboard!</span>
            </div>
          )}
        </div>
      </Card>

      {/* Instant Test Sample Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#a89f94] px-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#fff4d8]">Quick Test Samples</span>
            <span className="text-[#a89f94]/50">·</span>
            <span className="text-[11px]">Click any sample to test foreground extraction</span>
          </div>
          <Badge variant="outline" className="border-[#F6DFA6]/30 text-[#F6DFA6] text-[10px] uppercase font-mono">
            4 Samples
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSampleSelected(sample)}
              className="group text-left border border-[#a89f94]/20 hover:border-[#F6DFA6]/60 bg-[#222222]/50 hover:bg-[#222222] rounded-2xl p-2.5 transition-all text-xs focus:outline-none focus:ring-1 focus:ring-[#F6DFA6] glass-card-hover cursor-pointer"
            >
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#171717] mb-2 border border-[#a89f94]/20 relative">
                <img
                  src={sample.url}
                  alt={sample.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-[#171717]/25 group-hover:opacity-0 transition-opacity" />
              </div>
              <div className="font-semibold text-[#fff4d8] group-hover:text-[#F6DFA6] truncate">
                {sample.title}
              </div>
              <div className="text-[11px] text-[#a89f94] truncate mt-0.5">
                {sample.category}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
