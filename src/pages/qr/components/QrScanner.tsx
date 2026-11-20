import { useEffect, useRef, useState, useCallback, type ChangeEvent } from 'react';
import jsQR from 'jsqr';
import { Button } from '@/shared/ui/button';
import { Camera, FlipHorizontal, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  isProcessing?: boolean;
}

export function QrScanner({ onScan, isProcessing = false }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const stopCamera = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const handleScanSuccess = useCallback(
    (codeData: string) => {
      setHasScanned(true);
      stopCamera();
      // Provide subtle audio / haptic cue
      if (typeof navigator.vibrate === 'function') {
        navigator.vibrate(100);
      }
      onScan(codeData);
    },
    [onScan, stopCamera],
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setHasScanned(false);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access is not supported by your current browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('Camera access denied or failed:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraError(
          'Camera permission was denied. Please allow camera access in your browser settings.',
        );
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraError('No camera was found on your device.');
      } else {
        setCameraError(
          'Unable to start camera preview. You can also upload a photo of a QR code below.',
        );
      }
      setIsCameraActive(false);
    }
  }, [facingMode, stopCamera]);

  // Scan loop using requestAnimationFrame and jsQR
  useEffect(() => {
    if (!isCameraActive || hasScanned || isProcessing) return;

    const scanFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameIdRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        animationFrameIdRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data && code.data.trim().length > 0) {
        handleScanSuccess(code.data.trim());
        return;
      }

      animationFrameIdRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameIdRef.current = requestAnimationFrame(scanFrame);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isCameraActive, hasScanned, isProcessing, handleScanSuccess]);

  // Start camera on mount, stop on unmount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Switch between front and rear cameras
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Decode QR code from an uploaded image
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        toast.error('Could not process image');
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      URL.revokeObjectURL(objectUrl);

      if (code && code.data) {
        toast.success('QR Code detected!');
        handleScanSuccess(code.data.trim());
      } else {
        toast.error('No QR code detected in this image. Please try a clearer picture.');
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast.error('Failed to load image file');
    };

    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {/* Scanner Viewport */}
      <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-black border-2 border-border shadow-2xl flex items-center justify-center">
        {/* Hidden processing canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Live video */}
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          muted
        />

        {/* Loading / Processing Indicator */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-xs font-semibold">Connecting to user...</p>
          </div>
        )}

        {/* Scanning Box / Viewfinder Overlay */}
        {isCameraActive && !cameraError && !isProcessing && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
            <div className="relative w-4/5 h-4/5 max-w-[240px] max-h-[240px] border-2 border-white/40 rounded-2xl">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />

              {/* Animated laser scan bar */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse shadow-[0_0_8px_#3b82f6] top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* Camera Error Message */}
        {cameraError && (
          <div className="p-6 text-center text-white space-y-3 z-10">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-xs text-zinc-300 leading-relaxed">{cameraError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={startCamera}
              className="rounded-xl text-xs bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Floating Camera Flip Button */}
        {isCameraActive && (
          <button
            type="button"
            onClick={toggleFacingMode}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md transition-all active:scale-95"
            title="Switch camera"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center px-4">
        Position the QR code within the frame to automatically scan and open the chat.
      </p>

      {/* Alternative: Image Upload Button */}
      <div className="mt-4 flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl text-xs gap-1.5 shadow-2xs"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Scan from Photo
        </Button>

        {hasScanned && (
          <Button
            variant="default"
            size="sm"
            onClick={startCamera}
            className="rounded-xl text-xs gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            Scan Again
          </Button>
        )}
      </div>
    </div>
  );
}
