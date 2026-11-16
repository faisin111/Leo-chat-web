import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, ShieldCheck, Mic, MicOff } from 'lucide-react';
import { useCallStore } from '../store/call.store';
import { Avatar } from '@/shared/ui/avatar';

export const IncomingCallDialog = () => {
  const { status, targetUserName, targetAvatarUrl, callType, acceptCall, rejectCall } =
    useCallStore();

  const [answerMuted, setAnswerMuted] = useState(false);

  if (status !== 'incoming') return null;

  const initials = (targetUserName || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleAccept = async (withVideo: boolean) => {
    await acceptCall(withVideo);
    if (answerMuted) {
      useCallStore.getState().toggleMute();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xl animate-in fade-in duration-300">
        {/* Ambient Animated Gradient Aura */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.25, 0.45, 0.25],
              rotate: [0, 45, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-emerald-500/30 via-primary/25 to-violet-600/30 rounded-full blur-3xl"
          />
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl" />
        </div>

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-sm bg-slate-900/90 dark:bg-slate-950/90 border border-white/15 text-white rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col items-center text-center relative overflow-hidden backdrop-blur-2xl"
        >
          {/* Top Subtle Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-slate-300 mb-6 shadow-inner">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Encrypted</span>
          </div>

          {/* Radar Ringing Visualizer & Avatar */}
          <div className="relative mb-6 flex items-center justify-center">
            {/* Concentric Expanding Radar Waves */}
            {[0, 0.6, 1.2].map((delay, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: [0.95, 1.45, 2.0], opacity: [0.7, 0.3, 0] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay,
                  ease: 'easeOut',
                }}
                className={`absolute w-28 h-28 rounded-full border pointer-events-none ${
                  callType === 'video'
                    ? 'border-violet-500/40 bg-violet-500/10'
                    : 'border-emerald-500/40 bg-emerald-500/10'
                }`}
              />
            ))}

            {/* Glowing Avatar Container */}
            <div className="relative z-10">
              <Avatar
                src={targetAvatarUrl}
                alt={targetUserName || 'Caller'}
                className="w-28 h-28 border-2 border-white/20 shadow-[0_0_35px_rgba(16,185,129,0.35)] relative"
                fallback={
                  <span className="bg-gradient-to-tr from-primary via-violet-600 to-indigo-600 text-white font-bold text-3xl w-full h-full flex items-center justify-center shadow-inner">
                    {initials}
                  </span>
                }
              />

              {/* Call Type Corner Badge */}
              <div
                className={`absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg ${
                  callType === 'video'
                    ? 'bg-gradient-to-tr from-violet-600 to-indigo-500 text-white'
                    : 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white'
                }`}
              >
                {callType === 'video' ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>

          {/* Caller Name */}
          <h3 className="text-2xl font-bold tracking-tight text-white mb-1.5 px-2 truncate max-w-full">
            {targetUserName}
          </h3>

          {/* Ringing Status with Waveform Equalizer */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1 h-3.5 px-1">
              {[0.4, 0.9, 0.5, 1, 0.7, 0.4].map((h, i) => (
                <motion.span
                  key={i}
                  animate={{
                    scaleY: [0.3, h, 0.2, h * 0.85, 0.3],
                  }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    delay: i * 0.14,
                    ease: 'easeInOut',
                  }}
                  className={`w-1 rounded-full ${
                    callType === 'video' ? 'bg-violet-400' : 'bg-emerald-400'
                  }`}
                  style={{ height: '100%', transformOrigin: 'center' }}
                />
              ))}
            </div>

            <p className="text-xs font-semibold text-slate-300 tracking-wide">
              Incoming {callType === 'video' ? 'Video' : 'Voice'} Call…
            </p>
          </div>

          {/* Quick Pre-Answer Controls (Mute Mic Before Answering) */}
          <div className="flex items-center justify-center gap-2 mb-7">
            <button
              type="button"
              onClick={() => setAnswerMuted((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                answerMuted
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15 border border-white/10'
              }`}
              title={
                answerMuted ? 'Microphone will be muted upon answering' : 'Microphone is unmuted'
              }
            >
              {answerMuted ? (
                <MicOff className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{answerMuted ? 'Start Muted' : 'Mic Active'}</span>
            </button>
          </div>

          {/* Call Actions Bar */}
          <div className="flex items-center justify-center gap-6 w-full pt-1">
            {/* Decline Button */}
            <button
              type="button"
              onClick={rejectCall}
              className="flex flex-col items-center gap-2 group cursor-pointer"
              title="Decline call"
            >
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white flex items-center justify-center shadow-[0_10px_25px_rgba(225,29,72,0.45)] transition-all"
              >
                <PhoneOff className="w-7 h-7" />
              </motion.div>
              <span className="text-xs text-slate-300 group-hover:text-rose-400 font-semibold tracking-wide transition-colors">
                Decline
              </span>
            </button>

            {/* Answer Audio Button */}
            <button
              type="button"
              onClick={() => handleAccept(false)}
              className="flex flex-col items-center gap-2 group cursor-pointer"
              title="Answer voice call"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 10px 25px rgba(16,185,129,0.4)',
                    '0 10px 35px rgba(16,185,129,0.7)',
                    '0 10px 25px rgba(16,185,129,0.4)',
                  ],
                }}
                transition={{ duration: 1.8, repeat: Infinity }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white flex items-center justify-center shadow-[0_10px_25px_rgba(16,185,129,0.5)] transition-all relative overflow-hidden"
              >
                {/* Subtle shine sweep */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent w-full skew-x-12"
                />
                <Phone className="w-7 h-7 relative z-10" />
              </motion.div>
              <span className="text-xs text-slate-300 group-hover:text-emerald-400 font-semibold tracking-wide transition-colors">
                Answer
              </span>
            </button>

            {/* Accept Video Button (if incoming call is video) */}
            {callType === 'video' && (
              <button
                type="button"
                onClick={() => handleAccept(true)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
                title="Answer with video"
              >
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 via-primary to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-[0_10px_25px_rgba(139,92,246,0.45)] transition-all"
                >
                  <Video className="w-7 h-7" />
                </motion.div>
                <span className="text-xs text-slate-300 group-hover:text-violet-400 font-semibold tracking-wide transition-colors">
                  Join Video
                </span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
