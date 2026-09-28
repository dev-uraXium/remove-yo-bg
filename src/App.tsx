import React, { useState, useEffect, useCallback, useRef } from 'react';
import JSZip from 'jszip';
import { TopBar } from './components/TopBar';
import { Footer } from './components/Footer';
import { DropZone } from './components/DropZone';
import { BatchQueue } from './components/BatchQueue';
import { ComparisonViewer } from './components/ComparisonViewer';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsAndConditions } from './components/TermsAndConditions';
import { EngineSettingsModal } from './components/EngineSettingsModal';
import { InteractiveCanvas3D } from './components/InteractiveCanvas3D';
import { ImageItem, EngineSettings } from './types';
import { SampleImageItem } from './data/sampleImages';
import { removeImageBackground } from './services/remover';
import { downloadBlob } from './utils/formatters';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Cpu, ShieldCheck, Sparkles, Layers, Box, Wand2 } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'workspace' | 'privacy' | 'terms'>('workspace');
  const [items, setItems] = useState<ImageItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [engineSettings, setEngineSettings] = useState<EngineSettings>({
    modelQuality: 'isnet_quint8',
    device: 'cpu',
    enableFallback: true,
  });

  const processingRef = useRef<boolean>(false);
  const itemsRef = useRef<ImageItem[]>(items);
  itemsRef.current = items;

  // Add new files to the queue
  const handleFilesSelected = useCallback((files: File[]) => {
    const newItems: ImageItem[] = [];

    files.forEach((file) => {
      const id = 'img_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      const originalUrl = URL.createObjectURL(file);

      const img = new Image();
      img.onload = () => {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  width: img.naturalWidth || img.width,
                  height: img.naturalHeight || img.height,
                }
              : item
          )
        );
      };
      img.src = originalUrl;

      newItems.push({
        id,
        file,
        name: file.name,
        originalUrl,
        width: 0,
        height: 0,
        originalSize: file.size,
        status: 'queued',
        progress: 0,
      });
    });

    setItems((prev) => [...prev, ...newItems]);
    setCurrentPage('workspace');
  }, []);

  // Add sample image
  const handleSampleSelected = useCallback(async (sample: SampleImageItem) => {
    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const file = new File([blob], `${sample.id}.jpg`, { type: 'image/jpeg' });

      const id = 'sample_' + Math.random().toString(36).substring(2, 9);
      const originalUrl = URL.createObjectURL(file);

      const newItem: ImageItem = {
        id,
        file,
        name: `${sample.title}.jpg`,
        originalUrl,
        width: sample.width,
        height: sample.height,
        originalSize: blob.size,
        status: 'queued',
        progress: 0,
      };

      setItems((prev) => [newItem, ...prev]);
      setCurrentPage('workspace');
    } catch (err) {
      console.error('Failed to load sample image:', err);
    }
  }, []);

  // Process a single item
  const processItem = useCallback(
    async (id: string) => {
      const currentItem = itemsRef.current.find((i) => i.id === id);
      if (!currentItem || (!currentItem.file && !currentItem.originalUrl)) return;

      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, status: 'processing', progress: 5, progressStage: 'Preparing image...' }
            : i
        )
      );

      const startTime = performance.now();

      try {
        const source = currentItem.file || currentItem.originalUrl;
        const resultBlob = await removeImageBackground(
          source,
          engineSettings.modelQuality,
          (percent, stage) => {
            setItems((prev) =>
              prev.map((i) =>
                i.id === id ? { ...i, progress: percent, progressStage: stage } : i
              )
            );
          }
        );

        const duration = Math.round(performance.now() - startTime);
        const resultUrl = URL.createObjectURL(resultBlob);

        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: 'completed',
                  progress: 100,
                  progressStage: 'Completed',
                  resultBlob,
                  resultUrl,
                  resultSize: resultBlob.size,
                  processingTimeMs: duration,
                }
              : i
          )
        );

        setSelectedItemId((current) => current || id);
      } catch (err) {
        console.error('Failed to remove background for item:', id, err);
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: 'error',
                  progress: 0,
                  error: err instanceof Error ? err.message : 'Processing failed',
                }
              : i
          )
        );
      }
    },
    [engineSettings.modelQuality]
  );

  // Sequential batch queue runner
  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);

    try {
      while (true) {
        const nextItem = itemsRef.current.find((i) => i.status === 'queued');
        if (!nextItem) break;
        await processItem(nextItem.id);
      }
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [processItem]);

  // Trigger processing when new queued items arrive
  useEffect(() => {
    const hasQueued = items.some((i) => i.status === 'queued');
    if (hasQueued && !processingRef.current) {
      processQueue();
    }
  }, [items, processQueue]);

  // Remove single item
  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) {
        if (target.originalUrl) URL.revokeObjectURL(target.originalUrl);
        if (target.resultUrl) URL.revokeObjectURL(target.resultUrl);
      }
      return prev.filter((i) => i.id !== id);
    });

    setSelectedItemId((current) => (current === id ? null : current));
  }, []);

  // Clear all items
  const handleClearQueue = useCallback(() => {
    items.forEach((item) => {
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    });
    setItems([]);
    setSelectedItemId(null);
  }, [items]);

  // Download single item PNG
  const handleDownloadItem = useCallback((item: ImageItem) => {
    if (!item.resultBlob) return;
    const cleanName = item.name.replace(/\.[^/.]+$/, '');
    downloadBlob(item.resultBlob, `${cleanName}_nobg.png`);
  }, []);

  // Download All as ZIP
  const handleDownloadAllZip = useCallback(async () => {
    const completedItems = items.filter((i) => i.status === 'completed' && i.resultBlob);
    if (completedItems.length === 0) return;

    const zip = new JSZip();
    completedItems.forEach((item) => {
      const cleanName = item.name.replace(/\.[^/.]+$/, '');
      zip.file(`${cleanName}_transparent.png`, item.resultBlob!);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `bg_remover_batch_${Date.now()}.zip`);
  }, [items]);

  const selectedItem = items.find((i) => i.id === selectedItemId);
  const completedCount = items.filter((i) => i.status === 'completed').length;
  const queuedCount = items.filter((i) => i.status === 'queued').length;

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-[#171717] text-[#fff4d8] relative overflow-hidden">
        {/* Top Bar with Uraxium organic wave header */}
        <TopBar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onProcessAll={processQueue}
          onDownloadAllZip={handleDownloadAllZip}
          onClearQueue={handleClearQueue}
          isProcessing={isProcessing}
          queuedCount={queuedCount}
          completedCount={completedCount}
          totalCount={items.length}
        />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {currentPage === 'privacy' && (
          <PrivacyPolicy onBack={() => setCurrentPage('workspace')} />
        )}

        {currentPage === 'terms' && (
          <TermsAndConditions onBack={() => setCurrentPage('workspace')} />
        )}

        {currentPage === 'workspace' && (
          <div className="space-y-8">
            {/* Peachweb / Spline style Hero Section with Interactive 3D Canvas */}
            <div className="relative rounded-3xl overflow-hidden border border-[#a89f94]/25 bg-gradient-to-r from-[#222222]/90 via-[#171717] to-[#222222]/90 shadow-2xl glass-card">
              {/* Radial background glows */}
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F6DFA6]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#c9833b]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[220px]">
                {/* Hero Text */}
                <div className="lg:col-span-7 p-6 sm:p-10 space-y-3 z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F6DFA6]/10 border border-[#F6DFA6]/30 text-[#F6DFA6] text-xs font-semibold tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-[#F6DFA6]" />
                    <span>Neural In-Browser Foreground Matting</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#fff4d8] leading-tight">
                    Instant AI Background Removal{' '}
                    <span className="bg-gradient-to-r from-[#F6DFA6] via-[#fff4d8] to-[#c9833b] bg-clip-text text-transparent">
                      In Your Browser
                    </span>
                  </h1>

                  <p className="text-xs sm:text-sm text-[#a89f94] max-w-xl leading-relaxed">
                    Zero server uploads, zero API tokens, 100% on-device privacy. Drop high-resolution portraits, product photography, or pet fur for instant transparent PNGs.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <span className="flex items-center gap-1.5 text-[#fff4d8] font-mono text-[11px] bg-[#171717]/80 border border-[#a89f94]/30 px-3 py-1 rounded-xl shadow-sm">
                      <Cpu className="w-3.5 h-3.5 text-[#F6DFA6]" />
                      <span>ONNX Web WASM</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-[#fff4d8] font-mono text-[11px] bg-[#171717]/80 border border-[#a89f94]/30 px-3 py-1 rounded-xl shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#F6DFA6]" />
                      <span>Lossless Alpha Matte</span>
                    </span>
                  </div>
                </div>

                {/* 3D Spline / Peachweb Interactive Viewport */}
                <div className="lg:col-span-5 h-[220px] sm:h-[260px] relative overflow-hidden flex items-center justify-center border-t lg:border-t-0 lg:border-l border-[#a89f94]/20">
                  <InteractiveCanvas3D />
                </div>
              </div>
            </div>

            {/* Active Studio Inspector (when a completed image is active) */}
            {selectedItem && selectedItem.status === 'completed' && selectedItem.resultUrl && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#a89f94] px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#fff4d8]">Comparison Studio</span>
                    <span className="text-[#a89f94]/50">·</span>
                    <span className="text-[#F6DFA6] font-mono">Drag divider to inspect edge accuracy</span>
                  </div>
                  <button
                    onClick={() => setSelectedItemId(null)}
                    className="text-[11px] text-[#a89f94] hover:text-[#fff4d8] transition-colors"
                  >
                    Close Preview
                  </button>
                </div>

                <ComparisonViewer
                  item={selectedItem}
                  onClose={() => setSelectedItemId(null)}
                  onDownloadItem={handleDownloadItem}
                />
              </div>
            )}

            {/* Layout Grid: Drop Zone + Batch Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Drop & Upload Area */}
              <div className={`${items.length > 0 ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
                <DropZone
                  onFilesSelected={handleFilesSelected}
                  onSampleSelected={handleSampleSelected}
                  compact={items.length > 0}
                />
              </div>

              {/* Right Column: Batch Queue */}
              {items.length > 0 && (
                <div className="lg:col-span-7 space-y-4">
                  <BatchQueue
                    items={items}
                    selectedItemId={selectedItemId}
                    onSelectItem={setSelectedItemId}
                    onProcessItem={processItem}
                    onRemoveItem={handleRemoveItem}
                    onDownloadItem={handleDownloadItem}
                    isProcessing={isProcessing}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer with Legal Links and Palette Styling */}
      <Footer onNavigate={setCurrentPage} />

      {/* WASM Engine Diagnostics & Settings Modal */}
      <EngineSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={engineSettings}
        onUpdateSettings={setEngineSettings}
      />
    </div>
    </TooltipProvider>
  );
}
