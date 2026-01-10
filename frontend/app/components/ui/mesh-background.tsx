
import { useEffect, useRef } from 'react';
import Worker from '../../workers/mesh-render.worker?worker';

export function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const isTransferedRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || isTransferedRef.current) return;

    // Initialize Worker
    workerRef.current = new Worker();

    const canvas = canvasRef.current;
    
    // Check if OffscreenCanvas is supported
    if (!canvas.transferControlToOffscreen) {
        console.warn("OffscreenCanvas not supported on this browser. Fallback or error.");
        return;
    }

    const offscreen = canvas.transferControlToOffscreen();
    isTransferedRef.current = true;

    workerRef.current.postMessage({
      type: 'init',
      payload: {
        canvas: offscreen,
        width: window.innerWidth,
        height: window.innerHeight,
      },
    }, [offscreen]);

    const handleResize = () => {
      workerRef.current?.postMessage({
        type: 'resize',
        payload: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    };

    const handleVisibilityChange = () => {
        workerRef.current?.postMessage({
            type: 'visibility',
            payload: {
                visible: !document.hidden
            }
        });
    }

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      workerRef.current?.terminate();
      workerRef.current = null;
      // Note: We cannot reset isTransferedRef.current to false because the canvas control 
      // is permanently transferred. Creating a new canvas on re-mount would simplify, 
      // but React might reuse the DOM node.
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] w-full h-full pointer-events-none"
      style={{ opacity: 1 }}
    />
  );
}
