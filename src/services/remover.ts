import { Config } from '@imgly/background-removal';
import { ModelQuality } from '../types';

export type ProgressCallback = (percent: number, stage: string) => void;

/**
 * Remove background using @imgly/background-removal WASM AI model.
 * Falls back to local smart canvas segmentation if external model weights cannot be fetched.
 */
export async function removeImageBackground(
  imageSource: File | Blob | string,
  modelQuality: ModelQuality = 'isnet_quint8',
  onProgress?: ProgressCallback
): Promise<Blob> {
  const startTime = performance.now();

  try {
    onProgress?.(5, 'Loading AI segmentation model...');

    // Dynamically import to ensure clean execution and isolate any worker issues
    const { removeBackground } = await import('@imgly/background-removal');

    const config: Config = {
      model: modelQuality,
      device: 'cpu', // CPU is broadly compatible across all WebAssembly browsers
      proxyToWorker: false, // Run in direct context for high reliability in iframes
      progress: (key: string, current: number, total: number) => {
        let percent = 10;
        let stageName = 'Initializing model...';

        if (total > 0) {
          const ratio = Math.min(1, Math.max(0, current / total));
          if (key.includes('fetch')) {
            stageName = `Downloading WASM weights (${Math.round(ratio * 100)}%)`;
            percent = 10 + Math.round(ratio * 50);
          } else if (key.includes('compute') || key.includes('inference')) {
            stageName = `Running neural segmentation (${Math.round(ratio * 100)}%)`;
            percent = 60 + Math.round(ratio * 35);
          } else {
            stageName = `Processing tensor (${Math.round(ratio * 100)}%)`;
            percent = 50 + Math.round(ratio * 40);
          }
        }
        onProgress?.(Math.min(95, percent), stageName);
      },
      output: {
        format: 'image/png',
        quality: 1.0,
      },
    };

    onProgress?.(15, 'Starting neural network inference...');
    const resultBlob = await removeBackground(imageSource, config);
    onProgress?.(100, 'Background removed successfully');
    return resultBlob;
  } catch (error) {
    console.warn(
      'Primary WASM AI model encountered an error or network limitation. Engaging smart local canvas segmenter:',
      error
    );
    onProgress?.(40, 'Switching to high-res local segmentation engine...');
    return await fallbackCanvasSegmentation(imageSource, onProgress);
  }
}

/**
 * High-performance client-side fallback foreground segmenter.
 * Uses color distribution sampling, border background estimation, and edge-preserving matting.
 */
export async function fallbackCanvasSegmentation(
  imageSource: File | Blob | string,
  onProgress?: ProgressCallback
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      onProgress?.(50, 'Analyzing image spatial color distribution...');

      let srcUrl: string;
      let shouldRevoke = false;
      if (typeof imageSource === 'string') {
        srcUrl = imageSource;
      } else {
        srcUrl = URL.createObjectURL(imageSource);
        shouldRevoke = true;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          if (!ctx) {
            throw new Error('Could not initialize 2D canvas context');
          }

          ctx.drawImage(img, 0, 0);
          onProgress?.(65, 'Extracting foreground alpha mask...');

          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;

          // 1. Sample border pixels to determine background color profile
          const samplePoints: number[][] = [];
          const stepX = Math.max(1, Math.floor(width / 40));
          const stepY = Math.max(1, Math.floor(height / 40));

          // Top & Bottom edges
          for (let x = 0; x < width; x += stepX) {
            const topIdx = (0 * width + x) * 4;
            const botIdx = ((height - 1) * width + x) * 4;
            samplePoints.push([data[topIdx], data[topIdx + 1], data[topIdx + 2]]);
            samplePoints.push([data[botIdx], data[botIdx + 1], data[botIdx + 2]]);
          }

          // Left & Right edges
          for (let y = 0; y < height; y += stepY) {
            const leftIdx = (y * width + 0) * 4;
            const rightIdx = (y * width + (width - 1)) * 4;
            samplePoints.push([data[leftIdx], data[leftIdx + 1], data[leftIdx + 2]]);
            samplePoints.push([data[rightIdx], data[rightIdx + 1], data[rightIdx + 2]]);
          }

          // Calculate mean background color
          let bgR = 0, bgG = 0, bgB = 0;
          for (const [r, g, b] of samplePoints) {
            bgR += r;
            bgG += g;
            bgB += b;
          }
          const count = samplePoints.length || 1;
          bgR /= count;
          bgG /= count;
          bgB /= count;

          // Calculate standard deviation / tolerance
          let variance = 0;
          for (const [r, g, b] of samplePoints) {
            const dr = r - bgR;
            const dg = g - bgG;
            const db = b - bgB;
            variance += (dr * dr + dg * dg + db * db);
          }
          const stdDev = Math.sqrt(variance / count);
          const baseThreshold = Math.max(38, Math.min(95, stdDev * 2.2));
          const featherWidth = 28;

          onProgress?.(80, 'Applying edge feathering & alpha channel...');

          // 2. Compute pixel distance and apply alpha matte
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Weighted Euclidean distance (human eye sensitivity)
            const rDiff = r - bgR;
            const gDiff = g - bgG;
            const bDiff = b - bgB;
            const dist = Math.sqrt(
              2 * rDiff * rDiff + 4 * gDiff * gDiff + 3 * bDiff * bDiff
            );

            if (dist < baseThreshold) {
              data[i + 3] = 0; // Completely transparent
            } else if (dist < baseThreshold + featherWidth) {
              const factor = (dist - baseThreshold) / featherWidth;
              // Smooth step
              const smoothFactor = factor * factor * (3 - 2 * factor);
              data[i + 3] = Math.round(smoothFactor * 255);
            }
          }

          ctx.putImageData(imgData, 0, 0);

          onProgress?.(95, 'Encoding lossless PNG...');
          canvas.toBlob(
            (blob) => {
              if (shouldRevoke) URL.revokeObjectURL(srcUrl);
              if (blob) {
                onProgress?.(100, 'Complete');
                resolve(blob);
              } else {
                reject(new Error('Failed to encode result to PNG blob'));
              }
            },
            'image/png'
          );
        } catch (err) {
          if (shouldRevoke) URL.revokeObjectURL(srcUrl);
          reject(err);
        }
      };

      img.onerror = () => {
        if (shouldRevoke) URL.revokeObjectURL(srcUrl);
        reject(new Error('Failed to load image for processing'));
      };

      img.src = srcUrl;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Composite a cut-out image onto a custom background (solid, gradient, blurred original, or custom image).
 */
export async function compositeImage(
  cutoutBlobOrUrl: Blob | string,
  originalUrl: string,
  width: number,
  height: number,
  bgType: 'transparent' | 'color' | 'gradient' | 'blur' | 'custom',
  options: {
    color?: string;
    gradient?: string;
    blurAmount?: number;
    customImageUrl?: string;
  }
): Promise<Blob> {
  if (bgType === 'transparent') {
    if (cutoutBlobOrUrl instanceof Blob) return cutoutBlobOrUrl;
    const res = await fetch(cutoutBlobOrUrl);
    return await res.blob();
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  // Draw background layer
  if (bgType === 'color') {
    ctx.fillStyle = options.color || '#ffffff';
    ctx.fillRect(0, 0, width, height);
  } else if (bgType === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (options.gradient === 'sunset') {
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(1, '#ec4899');
    } else if (options.gradient === 'ocean') {
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(1, '#3b82f6');
    } else if (options.gradient === 'studio') {
      grad.addColorStop(0, '#334155');
      grad.addColorStop(1, '#0f172a');
    } else if (options.gradient === 'cyber') {
      grad.addColorStop(0, '#8b5cf6');
      grad.addColorStop(1, '#06b6d4');
    } else {
      grad.addColorStop(0, '#e2e8f0');
      grad.addColorStop(1, '#94a3b8');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (bgType === 'blur') {
    const origImg = await loadImage(originalUrl);
    ctx.save();
    ctx.filter = `blur(${options.blurAmount || 16}px)`;
    // Scale slightly to hide blurred border edges
    ctx.drawImage(origImg, -20, -20, width + 40, height + 40);
    ctx.restore();
  } else if (bgType === 'custom' && options.customImageUrl) {
    const customImg = await loadImage(options.customImageUrl);
    ctx.drawImage(customImg, 0, 0, width, height);
  }

  // Draw foreground cutout
  const cutoutSrc = cutoutBlobOrUrl instanceof Blob ? URL.createObjectURL(cutoutBlobOrUrl) : cutoutBlobOrUrl;
  const cutoutImg = await loadImage(cutoutSrc);
  ctx.drawImage(cutoutImg, 0, 0, width, height);

  if (cutoutBlobOrUrl instanceof Blob) {
    URL.revokeObjectURL(cutoutSrc);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to composite image'));
    }, 'image/png');
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image: ' + src));
    img.src = src;
  });
}
