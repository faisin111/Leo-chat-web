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
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Avatar } from '@/shared/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserById, usePresence } from '@/features/users';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
  fallbackName?: string;
  fallbackAvatar?: string | null;
}

export const UserProfileModal = ({
  isOpen,
  onClose,
  userId,
  fallbackName,
  fallbackAvatar,
}: UserProfileModalProps) => {
  const { data: user, isLoading } = useUserById(isOpen ? userId : null);
  const { isOnline, getLastSeenText } = usePresence([userId]);
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    if (!userId) return;
    navigator.clipboard.writeText(userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const displayName = user?.displayName || user?.username || fallbackName || 'User';
  const initials = displayName.substring(0, 2).toUpperCase();
  const avatarUrl = fallbackAvatar || user?.profilePictureUrl;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="bg-card rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-border max-h-[90vh] flex flex-col"
          >
            {/* Top decorative banner */}
            <div className="h-28 bg-gradient-to-r from-primary/30 via-primary/15 to-primary/5 relative shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-3 right-3 rounded-full bg-card/80 backdrop-blur hover:bg-card text-muted-foreground hover:text-foreground h-8 w-8 shadow-sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Profile Content */}
            <div className="px-6 pb-6 pt-0 overflow-y-auto flex-1">
              {/* Avatar overlapping banner */}
              <div className="relative -mt-14 mb-4 flex items-end justify-between">
                <div className="relative">
                  <Avatar
                    src={avatarUrl}
                    alt={displayName}
                    className="w-24 h-24 border-4 border-card bg-primary/10 text-primary font-bold text-2xl shadow-md"
                    fallback={
                      isLoading ? <Skeleton className="w-full h-full rounded-full" /> : initials
                    }
                  />
                  {userId && isOnline(userId) && (
                    <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-card rounded-full ring-2 ring-emerald-500/20" />
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-end mb-2">
                  {userId && (
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isOnline(userId)
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {getLastSeenText(userId)}
                    </span>
                  )}
                  {user?.role && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
                      <Shield className="w-3 h-3 mr-1 text-muted-foreground" />
                      {user.role}
                    </span>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48 rounded-md" />
                    <Skeleton className="h-4 w-32 rounded-md" />
                  </div>
                  <Skeleton className="h-16 w-full rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Name & Handle */}
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
                    {user?.username && (
                      <p className="text-sm font-medium text-muted-foreground">@{user.username}</p>
                    )}
                  </div>

                  {/* Bio */}
                  {user?.bio && (
                    <div className="p-3.5 bg-muted/50 rounded-2xl border border-border">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Bio
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {user.bio}
                      </p>
                    </div>
                  )}

                  {/* Details Card */}
                  <div className="space-y-2.5 bg-muted/40 p-4 rounded-2xl border border-border text-sm">
                    {/* Email */}
                    {user?.email && (
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center space-x-2.5 text-foreground min-w-0 pr-2">
                          <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.emailVerified !== undefined && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              user.emailVerified
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
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
                      <div className="flex items-center justify-between py-1 border-t border-border pt-2">
                        <div className="flex items-center space-x-2.5 text-foreground">
                          <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span>{user.phoneNumber}</span>
                        </div>
                      </div>
                    )}

                    {/* Region */}
                    {user?.region && (
                      <div className="flex items-center justify-between py-1 border-t border-border pt-2">
                        <div className="flex items-center space-x-2.5 text-foreground">
                          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span>{user.region}</span>
                        </div>
                      </div>
                    )}

                    {/* Age */}
                    {user?.age !== undefined && user?.age !== null && user?.age > 0 && (
                      <div className="flex items-center justify-between py-1 border-t border-border pt-2">
                        <div className="flex items-center space-x-2.5 text-foreground">
                          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span>{user.age} years old</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User ID copy row */}
                  {user?.id && (
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-100/60 rounded-xl text-xs text-slate-500">
                      <span className="truncate font-mono text-[11px] max-w-[280px]">
                        ID: {user.id}
                      </span>
                      <button
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

                  {/* Footer button */}
                  <div className="pt-2">
                    <Button onClick={onClose} variant="outline" className="w-full rounded-xl">
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
