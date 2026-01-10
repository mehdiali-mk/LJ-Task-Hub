/**
 * Image Processor Web Worker
 * 
 * Offloads all image operations to a background thread for 165Hz performance.
 * Uses OffscreenCanvas for lag-free processing.
 * 
 * Operations:
 * - Circular crop with antialiasing
 * - WebP compression
 * - Resize optimization
 */

// Message types
interface ProcessImageMessage {
  type: 'PROCESS_IMAGE';
  id: string;
  imageData: ImageBitmap;
  options: {
    size: number;
    quality: number;
    circular: boolean;
  };
}

interface ProcessResultMessage {
  type: 'PROCESS_RESULT';
  id: string;
  blob: Blob;
  width: number;
  height: number;
}

interface ProcessErrorMessage {
  type: 'PROCESS_ERROR';
  id: string;
  error: string;
}

self.onmessage = async (event: MessageEvent<ProcessImageMessage>) => {
  const { type, id, imageData, options } = event.data;

  if (type !== 'PROCESS_IMAGE') return;

  try {
    const { size, quality, circular } = options;

    // Create OffscreenCanvas
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }

    // Calculate source dimensions (center crop)
    const srcSize = Math.min(imageData.width, imageData.height);
    const sx = (imageData.width - srcSize) / 2;
    const sy = (imageData.height - srcSize) / 2;

    if (circular) {
      // Draw circular crop
      ctx.save();
      
      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw image
      ctx.drawImage(
        imageData,
        sx, sy, srcSize, srcSize,  // Source
        0, 0, size, size           // Destination
      );

      ctx.restore();

      // Apply antialiasing to edges
      applyCircularAntialiasing(ctx, size);
    } else {
      // Simple square crop
      ctx.drawImage(
        imageData,
        sx, sy, srcSize, srcSize,
        0, 0, size, size
      );
    }

    // Convert to WebP blob
    const blob = await canvas.convertToBlob({
      type: 'image/webp',
      quality,
    });

    // Send result back
    const result: ProcessResultMessage = {
      type: 'PROCESS_RESULT',
      id,
      blob,
      width: size,
      height: size,
    };

    self.postMessage(result);

  } catch (error) {
    const errorMessage: ProcessErrorMessage = {
      type: 'PROCESS_ERROR',
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    self.postMessage(errorMessage);
  }
};

/**
 * Apply antialiasing to circular edges
 * Uses feathered alpha for smooth edges
 */
function applyCircularAntialiasing(
  ctx: OffscreenCanvasRenderingContext2D,
  size: number
): void {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  const center = size / 2;
  const radius = size / 2;
  const featherWidth = 1.5; // Antialiasing width in pixels

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate alpha based on distance from edge
      if (distance > radius - featherWidth && distance <= radius) {
        const idx = (y * size + x) * 4;
        const alpha = 1 - (distance - (radius - featherWidth)) / featherWidth;
        data[idx + 3] = Math.round(data[idx + 3] * Math.max(0, alpha));
      } else if (distance > radius) {
        const idx = (y * size + x) * 4;
        data[idx + 3] = 0;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// Export empty for TypeScript
export {};
