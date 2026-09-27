export type ProcessStatus = 'queued' | 'processing' | 'completed' | 'error';

export interface ImageItem {
  id: string;
  file?: File;
  name: string;
  originalUrl: string;
  resultUrl?: string;
  resultBlob?: Blob;
  width: number;
  height: number;
  originalSize: number;
  resultSize?: number;
  status: ProcessStatus;
  progress: number;
  progressStage?: string;
  error?: string;
  processingTimeMs?: number;
}

export type BackgroundType = 'transparent' | 'color' | 'gradient' | 'blur' | 'custom';

export interface BackgroundSettings {
  type: BackgroundType;
  color: string;
  gradient: string;
  blurAmount: number;
  customImageUrl?: string;
}

export type ModelQuality = 'isnet_quint8' | 'isnet_fp16' | 'isnet';

export interface EngineSettings {
  modelQuality: ModelQuality;
  device: 'cpu' | 'gpu';
  enableFallback: boolean;
}
