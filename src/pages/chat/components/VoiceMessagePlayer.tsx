import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { MouseEvent } from 'react';
import { Play, Pause, Loader2, Mic } from 'lucide-react';

// Global reference to currently playing audio element across all messages
let activeGlobalAudio: HTMLAudioElement | null = null;
let stopActiveGlobalAudio: (() => void) | null = null;

interface VoiceMessagePlayerProps {
  audioUrl: string;
  isOwn: boolean;
  caption?: string | null;
}

const formatAudioTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Generate deterministic pseudo-random waveform bar heights (32 bars) based on url string
const generateWaveformBars = (seed: string, count = 32): number[] => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    const pseudo = Math.abs(Math.sin(hash + i * 1.8));
    // scale between 20% and 100% height
    bars.push(Math.round(20 + pseudo * 80));
  }
  return bars;
};

export const VoiceMessagePlayer = ({ audioUrl, isOwn, caption }: VoiceMessagePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

  const waveformBars = useMemo(() => generateWaveformBars(audioUrl, 32), [audioUrl]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.preload = 'metadata';

    const onLoadedMetadata = () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (!duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (activeGlobalAudio === audio) {
        activeGlobalAudio = null;
        stopActiveGlobalAudio = null;
      }
    };

    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      if (activeGlobalAudio === audio) {
        activeGlobalAudio = null;
        stopActiveGlobalAudio = null;
      }
    };
  }, [audioUrl, duration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (activeGlobalAudio === audio) {
        activeGlobalAudio = null;
        stopActiveGlobalAudio = null;
      }
    } else {
      // Pause any other voice message that might currently be playing
      if (activeGlobalAudio && stopActiveGlobalAudio && activeGlobalAudio !== audio) {
        stopActiveGlobalAudio();
      }

      activeGlobalAudio = audio;
      stopActiveGlobalAudio = handleStop;
      audio.playbackRate = playbackRate;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleWaveformClick = (e: MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const waveform = waveformRef.current;
    if (!audio || !waveform || !duration) return;

    const rect = waveform.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const togglePlaybackRate = (e: MouseEvent) => {
    e.stopPropagation();
    const nextRate: 1 | 1.5 | 2 = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-64 sm:w-72 select-none py-1">
      <div className="flex items-center space-x-3">
        {/* Play / Pause circular action button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-xs cursor-pointer ${
            isOwn
              ? 'bg-white text-primary hover:bg-white/95'
              : 'bg-primary text-white hover:bg-primary/95'
          }`}
          title={isPlaying ? 'Pause voice message' : 'Play voice message'}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Waveform & Progress area */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          {/* Interactive Waveform container */}
          <div
            ref={waveformRef}
            role="slider"
            tabIndex={0}
            aria-label="Seek voice message audio"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration || 100)}
            aria-valuenow={Math.round(currentTime)}
            onClick={handleWaveformClick}
            onKeyDown={(e) => {
              if (!audioRef.current) return;
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault();
                audioRef.current.currentTime = Math.min(
                  audioRef.current.duration || 0,
                  audioRef.current.currentTime + 5,
                );
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault();
                audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
              }
            }}
            className="flex items-center gap-[2.5px] h-8 cursor-pointer py-1 group focus:outline-hidden"
            title="Click or drag to seek"
          >
            {waveformBars.map((heightPercent, index) => {
              const barPercentage = (index / (waveformBars.length - 1)) * 100;
              const isPlayed = barPercentage <= progressPercentage;

              return (
                <div
                  key={index}
                  style={{ height: `${heightPercent}%` }}
                  className={`flex-1 rounded-full transition-all duration-75 group-hover:opacity-90 ${
                    isOwn
                      ? isPlayed
                        ? 'bg-white'
                        : 'bg-white/40'
                      : isPlayed
                        ? 'bg-primary'
                        : 'bg-slate-300'
                  }`}
                />
              );
            })}
          </div>

          {/* Time & Speed Controls */}
          <div className="flex items-center justify-between text-[11px] font-medium pt-1">
            <span className={`tabular-nums ${isOwn ? 'text-white/80' : 'text-slate-500'}`}>
              {formatAudioTime(currentTime > 0 ? currentTime : duration)}
            </span>

            <div className="flex items-center space-x-2">
              <span
                className={`flex items-center gap-0.5 text-[10px] ${
                  isOwn ? 'text-white/70' : 'text-slate-400'
                }`}
              >
                <Mic className="w-3 h-3 opacity-80" />
                Voice
              </span>

              {/* Playback speed toggle */}
              <button
                type="button"
                onClick={togglePlaybackRate}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  isOwn
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                }`}
                title="Change playback speed"
              >
                {playbackRate}x
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Caption */}
      {caption && (
        <p
          className={`text-xs pt-2 px-1 break-words ${isOwn ? 'text-white/95' : 'text-slate-700'}`}
        >
          {caption}
        </p>
      )}
    </div>
  );
};
