import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Minimize2,
  Maximize2,
  ShieldCheck,
  Maximize,
  Minimize,
  Radio,
  LayoutGrid,
} from 'lucide-react';
import { useCallStore } from '../store/call.store';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';

const formatDuration = (totalSecs: number): string => {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const ActiveCallModal = () => {
  const {
    status,
    targetUserName,
    targetAvatarUrl,
    callType,
    isMuted,
    isCameraOff,
    isScreenSharing,
    isMinimized,
    durationSeconds,
    localStream,
    remoteStream,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    toggleMinimize,
    endCall,
  } = useCallStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid');
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Monitor live remote video tracks dynamically
  useEffect(() => {
    const checkTracks = () => {
      const hasLiveVideo =
        !!remoteStream &&
        remoteStream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live');
      setHasRemoteVideo(hasLiveVideo);
    };

    checkTracks();

    if (remoteStream) {
      remoteStream.addEventListener('addtrack', checkTracks);
      remoteStream.addEventListener('removetrack', checkTracks);
      const tracks = remoteStream.getVideoTracks();
      tracks.forEach((t) => {
        t.addEventListener('unmute', checkTracks);
        t.addEventListener('mute', checkTracks);
        t.addEventListener('ended', checkTracks);
      });

      return () => {
        remoteStream.removeEventListener('addtrack', checkTracks);
        remoteStream.removeEventListener('removetrack', checkTracks);
        tracks.forEach((t) => {
          t.removeEventListener('unmute', checkTracks);
          t.removeEventListener('mute', checkTracks);
          t.removeEventListener('ended', checkTracks);
        });
      };
    }
  }, [remoteStream]);

  // Attach remote stream to remote video element
  useEffect(() => {
    const el = remoteVideoRef.current;
    if (el && remoteStream) {
      if (el.srcObject !== remoteStream) {
        el.srcObject = remoteStream;
      }
      el.play().catch(() => {});
    }
  }, [remoteStream, hasRemoteVideo, viewMode]);

  // Attach local stream to local preview
  useEffect(() => {
    const el = localVideoRef.current;
    if (el && localStream) {
      if (el.srcObject !== localStream) {
        el.srcObject = localStream;
      }
      el.play().catch(() => {});
    }
  }, [localStream, isCameraOff, viewMode]);

  if (status === 'idle' || status === 'incoming') {
    return null;
  }

  const initials = (targetUserName || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isConnected = status === 'connected';
  const isOutgoing = status === 'outgoing';
  const isConnecting = status === 'connecting';

  // Minimized Picture-in-Picture Floating Pill
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-2xl border border-white/15 p-2.5 px-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-white"
      >
        <div className="relative shrink-0">
          <Avatar
            src={targetAvatarUrl}
            alt={targetUserName || 'User'}
            className="w-10 h-10 border border-primary/50 shadow-md"
            fallback={
              <span className="bg-gradient-to-tr from-primary to-violet-600 text-white text-xs font-bold w-full h-full flex items-center justify-center">
                {initials}
              </span>
            }
          />
          {isConnected && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
          )}
          {isOutgoing && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-sky-400 border-2 border-slate-900 animate-ping" />
          )}
        </div>

        <div className="min-w-0 pr-1">
          <p className="text-xs font-semibold truncate max-w-[130px] text-white">
            {targetUserName}
          </p>
          <div className="flex items-center gap-1.5 pt-0.5">
            {isConnected ? (
              <span className="text-[11px] text-emerald-400 font-mono font-medium tabular-nums">
                {formatDuration(durationSeconds)}
              </span>
            ) : isOutgoing ? (
              <span className="text-[11px] text-sky-400 font-medium">Ringing…</span>
            ) : (
              <span className="text-[11px] text-amber-400 font-medium">Connecting…</span>
            )}
          </div>
        </div>

        {/* Quick controls in PIP */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-white/10">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={toggleMute}
            className={`w-8 h-8 rounded-full cursor-pointer transition-colors ${
              isMuted
                ? 'text-rose-400 bg-rose-500/20 border border-rose-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={toggleMinimize}
            className="w-8 h-8 rounded-full text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
            title="Expand call modal"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            size="icon"
            onClick={endCall}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white cursor-pointer shadow-md"
            title="End call"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Full Screen or Centered Modal View
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-300">
      {/* Dynamic Animated Ambient Background Aura */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: isOutgoing ? [1, 1.3, 1] : [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] ${
            isOutgoing
              ? 'bg-gradient-to-tr from-sky-500/25 via-primary/20 to-indigo-600/25'
              : callType === 'video'
                ? 'bg-gradient-to-tr from-violet-600/25 via-primary/20 to-teal-500/20'
                : 'bg-gradient-to-tr from-emerald-500/25 via-primary/20 to-indigo-600/25'
          }`}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        className={`w-full bg-slate-900/90 dark:bg-slate-950/90 border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col relative overflow-hidden text-white backdrop-blur-2xl transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none z-50'
            : 'max-w-5xl h-[90vh] max-h-[760px] rounded-3xl'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 z-20 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent">
          {/* User Info & Connection Badge */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar
                src={targetAvatarUrl}
                alt={targetUserName || 'User'}
                className="w-10 h-10 border border-white/20 shadow-md"
                fallback={
                  <span className="bg-gradient-to-tr from-primary to-indigo-600 text-white font-bold text-xs w-full h-full flex items-center justify-center">
                    {initials}
                  </span>
                }
              />
              {isConnected && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base leading-tight text-white">
                  {targetUserName}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Encrypted</span>
                </span>
              </div>

              {/* Status and Timer */}
              <div className="flex items-center gap-2 pt-0.5">
                {isConnected ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="tabular-nums">{formatDuration(durationSeconds)}</span>
                  </span>
                ) : isOutgoing ? (
                  <span className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    <span>Ringing…</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Securing connection…</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Window Action Controls */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher for Video Calls (Grid vs Spotlight) */}
            {callType === 'video' && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setViewMode((prev) => (prev === 'grid' ? 'speaker' : 'grid'))}
                className="rounded-full w-9 h-9 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                title={
                  viewMode === 'grid' ? 'Switch to Spotlight View' : 'Switch to Dual Grid View'
                }
              >
                {viewMode === 'grid' ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <LayoutGrid className="w-4 h-4" />
                )}
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="rounded-full w-9 h-9 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              title={isFullscreen ? 'Exit full screen' : 'Full screen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleMinimize}
              className="rounded-full w-9 h-9 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Minimize to Picture-in-Picture"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Central Media Canvas */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-950/70 min-h-0">
          {/* VIDEO CALL LAYOUT: DUAL FRAMES (Calling User & Me) */}
          {callType === 'video' ? (
            viewMode === 'grid' ? (
              /* DUAL GRID VIEW: Both users set side-by-side (desktop) / stacked (mobile) */
              <div className="w-full h-full p-3 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 overflow-hidden">
                {/* 1. Calling User (Remote Video Frame) */}
                <div className="relative w-full h-full min-h-[200px] rounded-2xl overflow-hidden bg-slate-900 border border-white/15 flex items-center justify-center shadow-2xl">
                  <video
                    id="remoteVideo"
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      hasRemoteVideo ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
                    }`}
                  >
                    <track kind="captions" />
                  </video>

                  {/* Remote fallback avatar when video stream is pending */}
                  {!hasRemoteVideo && (
                    <div className="flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in duration-200">
                      <div className="relative mb-4 flex items-center justify-center">
                        {isOutgoing && (
                          <motion.div
                            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.15, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                            className="absolute -inset-4 rounded-full border border-sky-400/40 bg-sky-400/10 pointer-events-none"
                          />
                        )}
                        <Avatar
                          src={targetAvatarUrl}
                          alt={targetUserName || 'Participant'}
                          className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-white/20 shadow-xl"
                          fallback={
                            <span className="bg-gradient-to-tr from-primary via-violet-600 to-indigo-600 text-white font-bold text-3xl w-full h-full flex items-center justify-center">
                              {initials}
                            </span>
                          }
                        />
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white mb-1">
                        {targetUserName}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {isOutgoing
                          ? 'Ringing participant…'
                          : isConnecting
                            ? 'Connecting video stream…'
                            : 'Waiting for camera stream…'}
                      </p>
                    </div>
                  )}

                  {/* Remote Frame Identification Badge */}
                  <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-xs font-medium text-white border border-white/10 shadow-md">
                    <span className="truncate max-w-[140px]">{targetUserName}</span>
                    {isConnected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                </div>

                {/* 2. Me / Calling User (Local Video Frame) */}
                <div className="relative w-full h-full min-h-[200px] rounded-2xl overflow-hidden bg-slate-900 border border-white/15 flex items-center justify-center shadow-2xl">
                  <video
                    id="localVideo"
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                      !isCameraOff ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
                    }`}
                  >
                    <track kind="captions" />
                  </video>

                  {/* Local camera off fallback */}
                  {isCameraOff && (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 z-10 animate-in fade-in duration-200">
                      <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/15 flex items-center justify-center mb-3 shadow-inner">
                        <VideoOff className="w-7 h-7 text-slate-400" />
                      </div>
                      <span className="text-sm font-semibold text-slate-200">
                        Your camera is off
                      </span>
                      <span className="text-xs text-slate-400 mt-0.5">
                        Click the video icon below to turn on
                      </span>
                    </div>
                  )}

                  {/* Local Frame Identification Badge */}
                  <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-xs font-medium text-white border border-white/10 shadow-md">
                    <span>You (Me)</span>
                    {isMuted ? (
                      <MicOff className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* SPOTLIGHT VIEW: Remote video full frame with local floating preview */
              <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                {/* Remote Video Canvas */}
                <div className="relative w-full h-full flex items-center justify-center bg-slate-950/70">
                  <video
                    id="remoteVideo"
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-contain transition-opacity duration-300 ${
                      hasRemoteVideo ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
                    }`}
                  >
                    <track kind="captions" />
                  </video>

                  {!hasRemoteVideo && (
                    <div className="flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in duration-200">
                      <Avatar
                        src={targetAvatarUrl}
                        alt={targetUserName || 'Participant'}
                        className="w-28 h-28 sm:w-36 sm:h-36 border-2 border-white/20 mb-4 shadow-xl"
                        fallback={
                          <span className="bg-gradient-to-tr from-primary via-violet-600 to-indigo-600 text-white font-bold text-4xl w-full h-full flex items-center justify-center">
                            {initials}
                          </span>
                        }
                      />
                      <h4 className="text-xl font-bold text-white mb-1">{targetUserName}</h4>
                      <p className="text-xs text-slate-400">
                        {isOutgoing ? 'Calling…' : 'Waiting for video…'}
                      </p>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-xs font-medium text-white border border-white/10 shadow-md">
                    <span className="truncate max-w-[160px]">{targetUserName}</span>
                    {isConnected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Floating Local User Preview PiP */}
                <motion.div
                  drag
                  dragConstraints={{ left: -120, right: 120, top: -120, bottom: 120 }}
                  className="absolute top-4 right-4 z-30 w-36 sm:w-52 aspect-video bg-slate-900/90 border border-white/20 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md cursor-grab active:cursor-grabbing group"
                >
                  <video
                    id="localVideo"
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover scale-x-[-1] ${
                      isCameraOff ? 'hidden' : 'block'
                    }`}
                  >
                    <track kind="captions" />
                  </video>

                  {isCameraOff && (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-[11px] p-2">
                      <VideoOff className="w-5 h-5 mb-1 text-slate-500" />
                      <span>Camera off</span>
                    </div>
                  )}

                  <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-medium text-white/90 flex items-center gap-1">
                    <span>You (Me)</span>
                    {isMuted && <MicOff className="w-3 h-3 text-rose-400" />}
                  </div>
                </motion.div>
              </div>
            )
          ) : (
            /* AUDIO-ONLY CALL CANVAS: Radar Rings & Participant Avatar */
            <div className="flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in zoom-in-95 duration-200">
              {/* Keep video elements in DOM for fast camera enablement */}
              <video
                id="remoteVideo"
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted
                className="opacity-0 pointer-events-none absolute w-1 h-1"
              >
                <track kind="captions" />
              </video>
              <video
                id="localVideo"
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="opacity-0 pointer-events-none absolute w-1 h-1"
              >
                <track kind="captions" />
              </video>

              {/* Central Avatar with Animated Ringing Radar Waves */}
              <div className="relative mb-8 flex items-center justify-center">
                {isOutgoing && (
                  <>
                    {[0, 0.7, 1.4].map((delay, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0.9, opacity: 0.8 }}
                        animate={{ scale: [0.95, 1.5, 2.1], opacity: [0.7, 0.25, 0] }}
                        transition={{
                          duration: 2.4,
                          repeat: Infinity,
                          delay,
                          ease: 'easeOut',
                        }}
                        className="absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-sky-400/40 bg-sky-400/10 pointer-events-none"
                      />
                    ))}
                  </>
                )}

                {isConnected && (
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.5, 0.25] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -inset-6 rounded-full bg-gradient-to-tr from-emerald-500/20 to-primary/20 blur-xl pointer-events-none"
                  />
                )}

                <Avatar
                  src={targetAvatarUrl}
                  alt={targetUserName || 'Participant'}
                  className="w-32 h-32 sm:w-40 sm:h-40 border-2 border-white/20 relative shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
                  fallback={
                    <span className="bg-gradient-to-tr from-primary via-violet-600 to-indigo-600 text-white font-bold text-4xl sm:text-5xl w-full h-full flex items-center justify-center">
                      {initials}
                    </span>
                  }
                />
              </div>

              {/* Participant Name */}
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-white">
                {targetUserName}
              </h2>

              {/* Status Indicator & Animated Sound Waves */}
              <div className="flex flex-col items-center gap-2">
                {isOutgoing ? (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-semibold shadow-sm">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-sky-400" />
                    <span>Calling {targetUserName}…</span>
                  </div>
                ) : isConnecting ? (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Connecting WebRTC peer…</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                    <div className="flex items-center gap-1 h-3.5 px-0.5">
                      {[0.3, 0.9, 0.5, 1, 0.7, 0.4, 0.8].map((h, i) => (
                        <motion.span
                          key={i}
                          animate={{
                            scaleY: [0.25, h, 0.2, h * 0.9, 0.25],
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.12,
                            ease: 'easeInOut',
                          }}
                          className="w-1 bg-emerald-400 rounded-full"
                          style={{ height: '100%', transformOrigin: 'center' }}
                        />
                      ))}
                    </div>
                    <span className="font-medium">Voice Call Active</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Floating Control Dock */}
        <div className="p-4 sm:p-6 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent flex items-center justify-center z-20">
          <div className="flex items-center gap-3 sm:gap-5 px-5 py-3 rounded-full bg-slate-900/80 backdrop-blur-2xl border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
            {/* Mute Microphone Button */}
            <button
              type="button"
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:bg-rose-500/30'
                  : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Camera Toggle Button */}
            <button
              type="button"
              onClick={toggleCamera}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isCameraOff
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:bg-rose-500/30'
                  : callType === 'video'
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:bg-violet-500/30'
                    : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
              }`}
              title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
            >
              {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            {/* Screen Share Button */}
            <button
              type="button"
              onClick={toggleScreenShare}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isScreenSharing
                  ? 'bg-gradient-to-tr from-primary to-violet-600 text-white border border-primary/50 shadow-[0_0_20px_rgba(244,63,94,0.45)]'
                  : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
              }`}
              title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
            >
              <ScreenShare className="w-5 h-5" />
            </button>

            {/* End Call Button */}
            <button
              type="button"
              onClick={endCall}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white flex items-center justify-center shadow-[0_10px_30px_rgba(225,29,72,0.55)] transition-all active:scale-95 cursor-pointer ml-1 sm:ml-2"
              title="End call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
