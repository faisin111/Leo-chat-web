import { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Video,
  PhoneCall,
  Bell,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
// eslint-disable-next-line no-restricted-imports
import { useUserById } from '@/features/users/api/use-user-by-id';

interface UserProfileSidebarProps {
  onClose: () => void;
  userId?: string | null;
  fallbackName?: string;
  fallbackUsername?: string;
  fallbackAvatar?: string | null;
  isGroup?: boolean;
}

export const UserProfileSidebar = ({
  onClose,
  userId,
  fallbackName,
  fallbackUsername,
  fallbackAvatar,
  isGroup,
}: UserProfileSidebarProps) => {
  const { data: user, isLoading } = useUserById(userId);
  const [copiedId, setCopiedId] = useState(false);
  const targetId = user?.id || userId;

  const handleCopyId = () => {
    if (!targetId) return;
    navigator.clipboard.writeText(targetId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const displayName = isGroup
    ? fallbackName || 'Group Conversation'
    : user?.displayName || user?.username || fallbackName || 'User';
  const username = user?.username || fallbackUsername;
  const initials = (displayName || 'U').substring(0, 2).toUpperCase();
  const avatarUrl = user?.profilePictureUrl || fallbackAvatar;

  return (
    <aside className="w-full h-full border-l border-slate-200 bg-white flex flex-col shrink-0 shadow-2xl lg:shadow-none animate-in slide-in-from-right duration-200">
      {/* Top Header with Close Icon */}
      <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
        <h3 className="font-semibold text-base text-slate-900">
          {isGroup ? 'Group Details' : 'User Details'}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 h-9 w-9"
          title="Close details"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Avatar & Main Info */}
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full border-4 border-slate-50 bg-slate-100 text-slate-700 font-bold text-2xl flex items-center justify-center overflow-hidden shadow-sm relative mb-4">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-full" />
            ) : avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2 flex flex-col items-center w-full">
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-3.5 w-24 rounded-md" />
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900">{displayName}</h2>
              {username && <p className="text-xs font-medium text-slate-500 mt-0.5">@{username}</p>}
              {isGroup ? (
                <span className="mt-2.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Group Conversation
                </span>
              ) : user?.role ? (
                <span className="mt-2.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <Shield className="w-3 h-3 mr-1" />
                  {user.role}
                </span>
              ) : null}
            </>
          )}
        </div>

        {/* Quick Actions (Call, Video, Mute) */}
        <div className="grid grid-cols-3 gap-2 pt-2 pb-2 border-y border-slate-100">
          <button className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-primary transition-colors text-xs font-medium space-y-1">
            <PhoneCall className="w-4 h-4 text-slate-500" />
            <span>Audio</span>
          </button>
          <button className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-primary transition-colors text-xs font-medium space-y-1">
            <Video className="w-4 h-4 text-slate-500" />
            <span>Video</span>
          </button>
          <button className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-primary transition-colors text-xs font-medium space-y-1">
            <Bell className="w-4 h-4 text-slate-500" />
            <span>Mute</span>
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : isGroup ? (
          <div className="space-y-4">
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Group Information
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Group conversations allow team collaboration with multiple participants.
              </p>
            </div>
            {targetId && (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-100/70 rounded-xl text-xs text-slate-500">
                <span className="truncate font-mono text-[11px] max-w-[240px]">ID: {targetId}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="text-slate-500 hover:text-slate-800 p-1 rounded transition-colors ml-2"
                  title="Copy ID"
                >
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Bio */}
            {user?.bio && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1 text-primary" /> Bio
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {user.bio}
                </p>
              </div>
            )}

            {/* Information List */}
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                User Details
              </h4>

              {user?.email ||
              user?.phoneNumber ||
              user?.region ||
              (user?.age !== undefined && user?.age !== null && user.age > 0) ? (
                <>
                  {/* Email */}
                  {user?.email && (
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center space-x-2.5 text-slate-700 min-w-0 pr-2">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate text-xs">{user.email}</span>
                      </div>
                      {user.emailVerified !== undefined && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            user.emailVerified
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {user.emailVerified ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Unverified
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Phone */}
                  {user?.phoneNumber && (
                    <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-2.5">
                      <div className="flex items-center space-x-2.5 text-slate-700 text-xs">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{user.phoneNumber}</span>
                      </div>
                    </div>
                  )}

                  {/* Region */}
                  {user?.region && (
                    <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-2.5">
                      <div className="flex items-center space-x-2.5 text-slate-700 text-xs">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{user.region}</span>
                      </div>
                    </div>
                  )}

                  {/* Age */}
                  {user?.age !== undefined && user?.age !== null && user?.age > 0 && (
                    <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-2.5">
                      <div className="flex items-center space-x-2.5 text-slate-700 text-xs">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{user.age} years old</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-500 py-1">
                  {targetId
                    ? 'No additional contact details provided.'
                    : 'Direct message with user.'}
                </p>
              )}
            </div>

            {/* User ID with copy button */}
            {targetId && (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-100/70 rounded-xl text-xs text-slate-500">
                <span className="truncate font-mono text-[11px] max-w-[240px]">ID: {targetId}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="text-slate-500 hover:text-slate-800 p-1 rounded transition-colors ml-2"
                  title="Copy User ID"
                >
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
