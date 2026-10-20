import { useEffect, useRef } from 'react';
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

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Attach remote stream to remote video/audio element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  // Attach local stream to local preview
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream]);

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
  const hasRemoteVideo =
    callType === 'video' &&
    remoteStream &&
    remoteStream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live');

  // Minimized Picture-in-Picture Floating Pill
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/60 p-2.5 px-4 rounded-2xl shadow-2xl text-white animate-in slide-in-from-bottom-3 duration-200">
        <Avatar
          src={targetAvatarUrl}
          alt={targetUserName || 'User'}
          className="w-9 h-9 border border-primary/40 shrink-0"
          fallback={
            <span className="bg-primary text-white text-xs font-bold w-full h-full flex items-center justify-center">
              {initials}
            </span>
          }
        />

        <div className="min-w-0 pr-1">
          <p className="text-xs font-semibold truncate max-w-[120px]">{targetUserName}</p>
          <p className="text-[10px] text-slate-400 font-mono tabular-nums">
            {isConnected
              ? formatDuration(durationSeconds)
              : status === 'outgoing'
                ? 'Ringing…'
                : 'Connecting…'}
          </p>
        </div>

        {/* Quick controls in PIP */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={toggleMute}
            className={`w-7 h-7 rounded-full cursor-pointer ${
              isMuted ? 'text-red-400 bg-red-500/10' : 'text-slate-300 hover:text-white'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={toggleMinimize}
            className="w-7 h-7 rounded-full text-slate-300 hover:text-white cursor-pointer"
            title="Expand call"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            size="icon"
            onClick={endCall}
            className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white cursor-pointer ml-1"
            title="End call"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  // Full Screen / Modal View
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[88vh] max-h-[720px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden text-white">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 z-20 bg-gradient-to-b from-slate-950/70 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">{targetUserName}</h3>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 pt-0.5">
                {isConnected ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{formatDuration(durationSeconds)}</span>
                  </>
                ) : status === 'outgoing' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Calling…</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span>Connecting…</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleMinimize}
              className="rounded-full w-9 h-9 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Minimize call"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Central Media Canvas */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-950">
          {/* Always render remote video element so audio/video tracks play */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-contain transition-opacity duration-300 ${
              hasRemoteVideo ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'
            }`}
          >
            <track kind="captions" />
          </video>

          {/* Fallback Audio / Non-video avatar display */}
          {!hasRemoteVideo && (
            <div className="flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in zoom-in-95 duration-200">
              <div className="relative mb-6">
                {/* Audio Wave Visualizer Ripples */}
                {isConnected && (
                  <>
                    <span className="absolute -inset-6 rounded-full bg-primary/10 animate-ping opacity-40 duration-1000" />
                    <span className="absolute -inset-3 rounded-full bg-primary/20 animate-pulse duration-700" />
                  </>
                )}
                {status === 'outgoing' && (
                  <span className="absolute -inset-4 rounded-full bg-amber-400/20 animate-ping opacity-50" />
                )}
                <Avatar
                  src={targetAvatarUrl}
                  alt={targetUserName || 'Participant'}
                  className="w-28 h-28 sm:w-32 sm:h-32 border-2 border-primary/40 relative shadow-2xl"
                  fallback={
                    <span className="bg-gradient-to-tr from-primary to-orange-500 text-white font-bold text-3xl w-full h-full flex items-center justify-center">
                      {initials}
                    </span>
                  }
                />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold mb-1 text-white">{targetUserName}</h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                {isConnected
                  ? 'Voice Call Connected'
                  : status === 'outgoing'
                    ? 'Calling…'
                    : 'Setting up secure connection…'}
              </p>
            </div>
          )}

          {/* Local User Preview PiP (for video calls) */}
          {callType === 'video' && localStream && (
            <div className="absolute top-4 right-4 z-30 w-28 sm:w-36 aspect-video bg-slate-900 border border-white/20 rounded-2xl overflow-hidden shadow-2xl group">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] ${
                  isCameraOff ? 'hidden' : 'block'
                }`}
              >
                <track kind="captions" />
              </video>
              {isCameraOff && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 text-[10px]">
                  <VideoOff className="w-4 h-4 mb-1" />
                  <span>Camera off</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 sm:p-6 bg-gradient-to-t from-slate-950/90 to-slate-950/30 flex items-center justify-center gap-3 sm:gap-5 z-20">
          {/* Mute Button */}
          <button
            type="button"
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isMuted
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Camera Button */}
          <button
            type="button"
            onClick={toggleCamera}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isCameraOff
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
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
                ? 'bg-primary text-white border border-primary shadow-lg shadow-primary/25'
                : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
            }`}
            title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/30 transition-transform active:scale-95 cursor-pointer ml-2"
            title="End call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
