import React, { useRef, useState, useCallback, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose?: () => void;
  aspectRatio?: number;
  className?: string;
}

/**
 * Camera Capture Component
 * 
 * Features:
 * - ImageCapture API for Chrome
 * - Glassmorphic circular lens overlay
 * - GPU-accelerated preview
 * - Privacy-conscious with clear indicator
 */
export function CameraCapture({
  onCapture,
  onClose,
  aspectRatio = 1,
  className = '',
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Initialize camera
  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (mounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.onloadedmetadata = () => setIsReady(true);
          }
        }
      } catch (err) {
        if (mounted) {
          setError('Camera access denied. Please allow camera permissions.');
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
      // Cleanup: stop all tracks
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !stream) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size to match video
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;

    // Calculate crop area (center square)
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;

    // Draw cropped video frame
    ctx.save();
    
    // Mirror horizontally (selfie mode)
    ctx.scale(-1, 1);
    ctx.drawImage(
      video,
      sx, sy, size, size,  // Source
      -size, 0, size, size // Destination (negative for mirror)
    );
    ctx.restore();

    // Apply circular mask
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Get preview
    const previewUrl = canvas.toDataURL('image/png');
    setCapturedImage(previewUrl);
    setIsCaptured(true);

  }, [stream]);

  const handleConfirm = useCallback(async () => {
    if (!canvasRef.current) return;

    // Convert to WebP blob and send to worker
    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          onCapture(blob);
        }
      },
      'image/webp',
      0.9
    );
  }, [onCapture]);

  const handleRetake = useCallback(() => {
    setIsCaptured(false);
    setCapturedImage(null);
  }, []);

  const handleClose = useCallback(() => {
    stream?.getTracks().forEach(track => track.stop());
    onClose?.();
  }, [stream, onClose]);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 deep-glass rounded-2xl ${className}`}>
        <svg className="w-16 h-16 text-rose-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <p className="text-glass-primary text-center mb-4">{error}</p>
        <button
          onClick={handleClose}
          className="px-6 py-2 btn-glass rounded-xl"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden deep-glass rounded-2xl ${className}`}>
      {/* Privacy indicator */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 deep-glass-sm rounded-full">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <span className="text-xs text-glass-secondary">Camera Active</span>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center deep-glass-sm rounded-full hover:bg-white/10 transition-colors"
      >
        <svg className="w-4 h-4 text-glass-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Video preview */}
      <div className="relative w-80 h-80 mx-auto my-8">
        {/* Glassmorphic lens overlay */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none z-10"
          style={{
            boxShadow: `
              inset 0 0 60px rgba(0, 0, 0, 0.5),
              0 0 0 4px rgba(255, 255, 255, 0.1),
              0 0 30px rgba(0, 0, 0, 0.3)
            `,
          }}
        />

        {/* Corner guides */}
        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="guideGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
            </linearGradient>
          </defs>
          <circle 
            cx="50" cy="50" r="48" 
            fill="none" 
            stroke="url(#guideGradient)" 
            strokeWidth="0.5"
            strokeDasharray="4 8"
          />
        </svg>

        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`
            w-full h-full object-cover rounded-full
            ${isCaptured ? 'hidden' : ''}
          `}
          style={{
            transform: 'scaleX(-1)', // Mirror for selfie mode
            willChange: 'transform',
          }}
        />

        {/* Captured preview */}
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover rounded-full"
          />
        )}

        {/* Loading state */}
        {!isReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <svg className="w-8 h-8 kinetic-loader text-white" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
            </svg>
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Action buttons */}
      <div className="flex justify-center gap-4 pb-6 px-6">
        {!isCaptured ? (
          <button
            onClick={handleCapture}
            disabled={!isReady}
            className={`
              w-16 h-16 rounded-full
              flex items-center justify-center
              transition-all duration-200
              ${isReady 
                ? 'bg-white hover:scale-105 active:scale-95' 
                : 'bg-white/20 cursor-not-allowed'
              }
            `}
            style={{
              boxShadow: '0 0 0 4px rgba(255,255,255,0.2), 0 8px 24px rgba(0,0,0,0.2)',
            }}
          >
            <div className="w-12 h-12 rounded-full border-4 border-gray-800" />
          </button>
        ) : (
          <>
            <button
              onClick={handleRetake}
              className="px-6 py-3 btn-glass rounded-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
              </svg>
              Retake
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-3 btn-glass-primary rounded-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Use Photo
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Camera Modal Wrapper
 * Provides a modal overlay for the camera capture
 */
interface CameraModalProps extends CameraCaptureProps {
  isOpen: boolean;
}

export function CameraModal({ isOpen, onClose, ...props }: CameraModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative z-10 animate-in zoom-in-95 fade-in duration-200">
        <CameraCapture {...props} onClose={onClose} />
      </div>
    </div>
  );
}
