import React, { useState, useEffect, useCallback, useRef } from 'react';
import JSZip from 'jszip';
import { TopBar } from './components/TopBar';
import { DropZone } from './components/DropZone';
import { BatchQueue } from './components/BatchQueue';
import { ComparisonViewer } from './components/ComparisonViewer';
import { EngineSettingsModal } from './components/EngineSettingsModal';
import { ImageItem, EngineSettings } from './types';
import { SampleImageItem } from './data/sampleImages';
import { removeImageBackground } from './services/remover';
import { downloadBlob } from './utils/formatters';

export default function App() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [engineSettings, setEngineSettings] = useState<EngineSettings>({
    modelQuality: 'isnet_quint8',
    device: 'cpu',
    enableFallback: true,
  });

  // Track processing queue state with a ref to prevent race conditions during async loop
  const processingRef = useRef<boolean>(false);
  const itemsRef = useRef<ImageItem[]>(items);
  itemsRef.current = items;

  // Add new files to the queue
  const handleFilesSelected = useCallback((files: File[]) => {
    const newItems: ImageItem[] = [];

    files.forEach((file) => {
      const id = 'img_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      const originalUrl = URL.createObjectURL(file);

      // Create an image object to determine natural resolution
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
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      {/* Top Bar */}
      <TopBar
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          {/* Active Studio Inspector (when a completed image is active) */}
          {selectedItem && selectedItem.status === 'completed' && selectedItem.resultUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                <span className="font-semibold text-white">Preview & Comparison</span>
                <button
                  onClick={() => setSelectedItemId(null)}
                  className="text-[11px] text-neutral-400 hover:text-white"
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
      </main>

      {/* WASM Engine Diagnostics & Settings Modal */}
      <EngineSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={engineSettings}
        onUpdateSettings={setEngineSettings}
      />
    </div>
  );
}
