import { useState, useRef, useEffect, useCallback } from 'react';
import { Trash2, Send, Loader2, Square, Play, Pause } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { toast } from 'sonner';

interface VoiceRecorderBarProps {
  onCancel: () => void;
  onSendVoice: (audioFile: File, durationSeconds?: number) => Promise<void>;
  isSending?: boolean;
}

const formatTimer = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const VoiceRecorderBar = ({
  onCancel,
  onSendVoice,
  isSending = false,
}: VoiceRecorderBarProps) => {
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(16).fill(15));
  const [isInitializing, setIsInitializing] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cleanup all streams, contexts and intervals
  const cleanupRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
  }, []);

  // Start recording on mount
  useEffect(() => {
    let isMounted = true;

    async function startRecording() {
      try {
        setIsInitializing(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        audioStreamRef.current = stream;

        // Setup real-time Web Audio Analyser for live visualizer
        try {
          const AudioContextClass =
            window.AudioContext ||
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVisualizer = () => {
              if (!audioStreamRef.current) return;
              analyser.getByteFrequencyData(dataArray);

              // Sample 16 bars from frequency data
              const levels: number[] = [];
              const step = Math.floor(bufferLength / 16) || 1;
              for (let i = 0; i < 16; i++) {
                const val = dataArray[i * step] || 0;
                // Scale height between 15% and 100%
                levels.push(Math.max(15, Math.min(100, Math.round((val / 255) * 100))));
              }
              setAudioLevels(levels);
              animationFrameRef.current = requestAnimationFrame(updateVisualizer);
            };

            animationFrameRef.current = requestAnimationFrame(updateVisualizer);
          }
        } catch {
          // If AudioContext fails, continue recording without live waveform
        }

        // Determine best supported audio mime type
        let mimeType = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/ogg;codecs=opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = '';
            }
          }
        }

        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const mime = recorder.mimeType || 'audio/webm';
          const blob = new Blob(audioChunksRef.current, { type: mime });
          setAudioBlob(blob);
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        };

        recorder.start(100); // 100ms slice
        setIsInitializing(false);

        // Timer
        timerIntervalRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } catch (err: unknown) {
        // eslint-disable-next-line no-console
        console.error('Microphone error:', err);
        toast.error('Microphone access was denied or is not supported');
        onCancel();
      }
    }

    startRecording();

    return () => {
      isMounted = false;
      cleanupRecording();
    };
  }, [cleanupRecording, onCancel]);

  // Clean up preview object url
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Stop recording to enter preview mode
  const handleStopAndPreview = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    cleanupRecording();
  };

  // Toggle preview playback
  const handleTogglePreviewPlay = () => {
    if (!previewUrl) return;

    if (!previewAudioRef.current) {
      const audio = new Audio(previewUrl);
      previewAudioRef.current = audio;
      audio.onended = () => setIsPreviewPlaying(false);
    }

    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current
        .play()
        .then(() => setIsPreviewPlaying(true))
        .catch(() => setIsPreviewPlaying(false));
    }
  };

  // Discard and reset
  const handleDiscard = () => {
    cleanupRecording();
    onCancel();
  };

  // Final Send
  const handleSend = async () => {
    let finalBlob = audioBlob;
    let finalDuration = recordingSeconds;

    if (!finalBlob) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        const recorder = mediaRecorderRef.current;
        const recordedPromise = new Promise<Blob>((resolve) => {
          recorder.onstop = () => {
            const mime = recorder.mimeType || 'audio/webm';
            const blob = new Blob(audioChunksRef.current, { type: mime });
            resolve(blob);
          };
        });
        recorder.stop();
        cleanupRecording();
        finalBlob = await recordedPromise;
      }
    }

    if (!finalBlob || finalBlob.size === 0) {
      toast.error('Voice recording is empty');
      return;
    }

    if (finalDuration === 0) {
      finalDuration = 1;
    }

    // Determine extension based on blob mimeType
    const ext = finalBlob.type.includes('ogg') ? 'ogg' : 'webm';
    const audioFile = new File([finalBlob], `voice-message-${Date.now()}.${ext}`, {
      type: finalBlob.type || 'audio/webm',
    });

    await onSendVoice(audioFile, finalDuration);
  };

  const isPreviewMode = !!audioBlob && !audioStreamRef.current;

  return (
    <div className="flex-1 flex items-center justify-between bg-primary/5 border border-primary/25 rounded-2xl p-1.5 px-3 sm:px-4 py-2 transition-all animate-in fade-in slide-in-from-bottom-1">
      {/* Left: Recording status or preview player */}
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        {!isPreviewMode ? (
          <>
            {/* Pulsing Recording Indicator */}
            <div className="flex items-center space-x-2 shrink-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span className="text-xs font-bold text-slate-800 tabular-nums">
                {formatTimer(recordingSeconds)}
              </span>
            </div>

            {/* Live Audio Visualizer Waveform */}
            <div className="flex items-center gap-[3px] h-6 flex-1 max-w-[140px] sm:max-w-[200px] px-2">
              {audioLevels.map((lvl, idx) => (
                <div
                  key={idx}
                  style={{ height: `${lvl}%` }}
                  className="w-1 bg-primary/80 rounded-full transition-all duration-75"
                />
              ))}
            </div>
          </>
        ) : (
          /* Preview Mode with Play / Pause */
          <div className="flex items-center space-x-2.5 flex-1 min-w-0">
            <button
              type="button"
              onClick={handleTogglePreviewPlay}
              className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary/90 transition-transform active:scale-95 shadow-2xs cursor-pointer"
              title={isPreviewPlaying ? 'Pause preview' : 'Play preview'}
            >
              {isPreviewPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-800 block">Voice note preview</span>
              <span className="text-[10px] text-slate-500 tabular-nums">
                {formatTimer(recordingSeconds)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right Controls: Discard, Stop/Preview, Send */}
      <div className="flex items-center space-x-1.5 shrink-0 pl-2">
        {/* Discard button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleDiscard}
          disabled={isSending}
          className="rounded-full h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
          title="Discard recording"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        {/* Stop & Listen button (only when recording) */}
        {!isPreviewMode && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleStopAndPreview}
            disabled={isSending || isInitializing}
            className="rounded-full h-8 w-8 text-slate-600 hover:text-primary hover:bg-primary/10 cursor-pointer"
            title="Stop & preview"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </Button>
        )}

        {/* Send voice message button */}
        <Button
          type="button"
          onClick={handleSend}
          disabled={isSending || (recordingSeconds === 0 && !audioBlob)}
          className="rounded-full h-8 px-3.5 bg-primary text-white hover:bg-primary/90 font-semibold shadow-xs cursor-pointer gap-1.5 text-xs"
          title="Send voice message"
        >
          {isSending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Send</span>
        </Button>
      </div>
    </div>
  );
};
