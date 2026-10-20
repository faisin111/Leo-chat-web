import { Phone, PhoneOff, Video } from 'lucide-react';
import { useCallStore } from '../store/call.store';
import { Avatar } from '@/shared/ui/avatar';

export const IncomingCallDialog = () => {
  const { status, targetUserName, targetAvatarUrl, callType, acceptCall, rejectCall } =
    useCallStore();

  if (status !== 'incoming') return null;

  const initials = (targetUserName || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Animated glowing backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Pulsing Avatar */}
        <div className="relative mb-6">
          <span className="absolute -inset-3 rounded-full bg-primary/20 animate-ping opacity-75" />
          <span className="absolute -inset-1.5 rounded-full bg-primary/40 animate-pulse" />
          <Avatar
            src={targetAvatarUrl}
            alt={targetUserName || 'Caller'}
            className="w-24 h-24 border-2 border-primary/50 relative shadow-xl"
            fallback={
              <span className="bg-gradient-to-tr from-primary to-orange-400 text-white font-bold text-2xl w-full h-full flex items-center justify-center">
                {initials}
              </span>
            }
          />
        </div>

        {/* Caller Info */}
        <h3 className="text-xl font-bold tracking-tight text-white mb-1">{targetUserName}</h3>
        <p className="text-xs font-medium text-slate-400 mb-8 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Incoming {callType === 'video' ? 'Video' : 'Voice'} Call…
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-5 w-full">
          {/* Decline Button */}
          <button
            type="button"
            onClick={rejectCall}
            className="flex flex-col items-center gap-2 group cursor-pointer"
            title="Decline"
          >
            <div className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 group-hover:scale-105">
              <PhoneOff className="w-6 h-6" />
            </div>
            <span className="text-xs text-slate-400 group-hover:text-red-400 font-medium">
              Decline
            </span>
          </button>

          {/* Accept Audio */}
          <button
            type="button"
            onClick={() => acceptCall(false)}
            className="flex flex-col items-center gap-2 group cursor-pointer"
            title="Accept with Audio"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 group-hover:scale-105">
              <Phone className="w-6 h-6" />
            </div>
            <span className="text-xs text-slate-400 group-hover:text-emerald-400 font-medium">
              Answer
            </span>
          </button>

          {/* Accept Video (if incoming call has video) */}
          {callType === 'video' && (
            <button
              type="button"
              onClick={() => acceptCall(true)}
              className="flex flex-col items-center gap-2 group cursor-pointer"
              title="Accept with Video"
            >
              <div className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 group-hover:scale-105">
                <Video className="w-6 h-6" />
              </div>
              <span className="text-xs text-slate-400 group-hover:text-primary font-medium">
                Video
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
