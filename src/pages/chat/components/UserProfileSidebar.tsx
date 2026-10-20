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
  BellOff,
  Pin,
  Archive,
  Sparkles,
  Users,
  UserPlus,
  LogOut,
  Edit3,
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Avatar } from '@/shared/ui/avatar';
import { useUserById, usePresence } from '@/features/users';
import {
  useConversationMembers,
  useRemoveMember,
  useChangeMemberRole,
  useMuteConversation,
  usePinConversation,
  useArchiveConversation,
  type ConversationMember,
} from '@/features/chat';
import { useSession } from '@/features/auth';
import { EditGroupModal } from './EditGroupModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCallStore } from '@/features/calls';

interface UserProfileSidebarProps {
  onClose: () => void;
  conversationId?: string | null;
  userId?: string | null;
  fallbackName?: string;
  fallbackUsername?: string;
  fallbackAvatar?: string | null;
  isGroup?: boolean;
  onOpenAddMembers?: () => void;
}

export const UserProfileSidebar = ({
  onClose,
  conversationId,
  userId,
  fallbackName,
  fallbackUsername,
  fallbackAvatar,
  isGroup,
  onOpenAddMembers,
}: UserProfileSidebarProps) => {
  const currentUser = useSession((s) => s.user);
  const navigate = useNavigate();
  const { data: user, isLoading: isUserLoading } = useUserById(userId);
  const { isOnline, getLastSeenText } = usePresence([userId]);
  const [copiedId, setCopiedId] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

  // Conversation members query (for groups)
  const { data: members, isLoading: isMembersLoading } = useConversationMembers(
    isGroup ? conversationId : null,
  );

  // Conversation action hooks
  const { mute, unmute, isLoading: isMuteLoading } = useMuteConversation();
  const { pin, unpin, isLoading: isPinLoading } = usePinConversation();
  const { archive, unarchive, isLoading: isArchiveLoading } = useArchiveConversation();
  const removeMember = useRemoveMember();

  const targetId = user?.id || userId;

  const currentMember = members?.find((m) => m.userId === currentUser?.id);
  const currentUserRole = isGroup ? currentMember?.role : undefined;

  // Check pin/mute/archive state from current user's membership
  const isPinned = currentMember?.pinnedAt != null;
  const isMuted =
    currentMember?.mutedUntil != null && new Date(currentMember.mutedUntil) > new Date();
  const isArchived = currentMember?.archivedAt != null;

  const handleCopyId = () => {
    const idToCopy = isGroup ? conversationId : targetId;
    if (!idToCopy) return;
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleTogglePin = () => {
    if (!conversationId) return;
    if (isPinned) {
      unpin(conversationId);
    } else {
      pin(conversationId);
    }
  };

  const handleToggleMute = () => {
    if (!conversationId) return;
    if (isMuted) {
      unmute(conversationId);
    } else {
      // Mute for 8 hours by default
      const eightHours = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
      mute({ id: conversationId, mutedUntil: eightHours });
    }
  };

  const handleToggleArchive = () => {
    if (!conversationId) return;
    if (isArchived) {
      unarchive(conversationId);
    } else {
      archive(conversationId);
    }
  };

  const handleLeaveGroup = () => {
    if (!conversationId || !currentUser?.id) return;
    removeMember.mutate(
      {
        conversationId,
        userId: currentUser.id,
        isLeaving: true,
      },
      {
        onSuccess: () => {
          onClose();
          navigate('/app');
        },
      },
    );
  };

  const displayName = isGroup
    ? fallbackName || 'Group Conversation'
    : user?.displayName || user?.username || fallbackName || 'User';
  const username = user?.username || fallbackUsername;
  const initials = (displayName || 'U').substring(0, 2).toUpperCase();
  const avatarUrl = fallbackAvatar || user?.profilePictureUrl;

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
          className="rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 h-9 w-9 cursor-pointer"
          title="Close details"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Avatar & Main Info */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <Avatar
              src={avatarUrl}
              alt={displayName}
              className="w-24 h-24 border-4 border-slate-50 bg-slate-100 text-slate-700 font-bold text-2xl shadow-sm"
              fallback={
                isGroup && !avatarUrl ? (
                  <Users className="w-10 h-10 text-slate-400" />
                ) : isUserLoading && !avatarUrl ? (
                  <Skeleton className="w-full h-full rounded-full" />
                ) : (
                  initials
                )
              }
            />
            {!isGroup && userId && isOnline(userId) && (
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full ring-2 ring-emerald-500/20" />
            )}
          </div>

          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">{displayName}</h2>
            {isGroup && (currentUserRole === 'OWNER' || currentUserRole === 'ADMIN') && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="p-1 rounded-full text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors cursor-pointer"
                title="Edit group title and avatar"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>

          {username && <p className="text-xs font-medium text-slate-500 mt-0.5">@{username}</p>}

          <div className="flex items-center gap-1.5 flex-wrap justify-center mt-2.5">
            {isGroup ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Users className="w-3 h-3 mr-1" />
                {members?.length || 0} Members
              </span>
            ) : (
              <>
                {userId && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      isOnline(userId)
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {getLastSeenText(userId)}
                  </span>
                )}
                {user?.role && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    <Shield className="w-3 h-3 mr-1" />
                    {user.role}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quick Actions (Call, Video, Pin, Mute, Archive) */}
        <div className="grid grid-cols-4 gap-1.5 pt-3 pb-3 border-y border-slate-100">
          <button
            type="button"
            onClick={() => {
              if (isGroup) {
                toast.info('Calling is currently supported for direct 1-on-1 conversations');
                return;
              }
              if (!conversationId || !targetId) {
                toast.error('Unable to initiate call: user not found');
                return;
              }
              useCallStore
                .getState()
                .startCall(conversationId, targetId, displayName, avatarUrl, false);
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-primary transition-colors text-xs font-medium space-y-1 cursor-pointer"
            title="Start voice call"
          >
            <PhoneCall className="w-4 h-4 text-slate-500" />
            <span className="text-[11px]">Audio</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (isGroup) {
                toast.info('Calling is currently supported for direct 1-on-1 conversations');
                return;
              }
              if (!conversationId || !targetId) {
                toast.error('Unable to initiate call: user not found');
                return;
              }
              useCallStore
                .getState()
                .startCall(conversationId, targetId, displayName, avatarUrl, true);
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-primary transition-colors text-xs font-medium space-y-1 cursor-pointer"
            title="Start video call"
          >
            <Video className="w-4 h-4 text-slate-500" />
            <span className="text-[11px]">Video</span>
          </button>
          <button
            type="button"
            onClick={handleTogglePin}
            disabled={isPinLoading}
            className={`flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 transition-colors text-xs font-medium space-y-1 cursor-pointer ${
              isPinned ? 'text-primary bg-primary/5' : 'text-slate-600 hover:text-primary'
            }`}
            title={isPinned ? 'Unpin conversation' : 'Pin conversation'}
          >
            <Pin
              className={`w-4 h-4 ${isPinned ? 'fill-primary text-primary' : 'text-slate-500'}`}
            />
            <span className="text-[11px]">{isPinned ? 'Pinned' : 'Pin'}</span>
          </button>
          <button
            type="button"
            onClick={handleToggleMute}
            disabled={isMuteLoading}
            className={`flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 transition-colors text-xs font-medium space-y-1 cursor-pointer ${
              isMuted ? 'text-amber-600 bg-amber-50' : 'text-slate-600 hover:text-primary'
            }`}
            title={isMuted ? 'Unmute conversation' : 'Mute conversation'}
          >
            {isMuted ? (
              <BellOff className="w-4 h-4 text-amber-600" />
            ) : (
              <Bell className="w-4 h-4 text-slate-500" />
            )}
            <span className="text-[11px]">{isMuted ? 'Muted' : 'Mute'}</span>
          </button>
        </div>

        {/* Group Members Section */}
        {isGroup ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Group Members ({members?.length || 0})
              </h4>
              {(currentUserRole === 'OWNER' || currentUserRole === 'ADMIN') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenAddMembers}
                  className="h-7 text-xs text-primary hover:bg-primary/5 rounded-lg px-2 font-semibold gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add
                </Button>
              )}
            </div>

            {isMembersLoading ? (
              <MembersListSkeleton />
            ) : (
              <div className="space-y-2">
                {members?.map((member) => (
                  <MemberRow
                    key={member.userId}
                    member={member}
                    currentUserId={currentUser?.id}
                    currentUserRole={currentUserRole}
                    conversationId={conversationId || ''}
                  />
                ))}
              </div>
            )}

            {/* Leave Group Action */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLeaveConfirmOpen(true)}
                disabled={removeMember.isPending}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                {removeMember.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                Leave Group
              </button>
            </div>
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

            {/* Archive Direct Conversation Option */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleToggleArchive}
                disabled={isArchiveLoading}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Archive className="w-4 h-4 text-slate-500" />
                {isArchived ? 'Unarchive Conversation' : 'Archive Conversation'}
              </button>
            </div>
          </div>
        )}

        {/* Copy Conversation or User ID */}
        {(conversationId || targetId) && (
          <div className="flex items-center justify-between px-3 py-2 bg-slate-100/70 rounded-xl text-xs text-slate-500">
            <span className="truncate font-mono text-[11px] max-w-[240px]">
              ID: {isGroup ? conversationId : targetId}
            </span>
            <button
              type="button"
              onClick={handleCopyId}
              className="text-slate-500 hover:text-slate-800 p-1 rounded transition-colors ml-2 cursor-pointer"
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

      {/* Edit Group Modal */}
      {isGroup && conversationId && (
        <EditGroupModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          conversationId={conversationId}
          initialTitle={fallbackName || ''}
          initialAvatarUrl={fallbackAvatar || ''}
        />
      )}

      {/* Leave Group Confirmation Modal */}
      {isLeaveConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-slate-900 mb-1">
              Leave this group?
            </h3>
            <p className="text-xs text-center text-slate-500 mb-6">
              You won&apos;t receive any more messages from this group unless you are added back.
            </p>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                onClick={() => setIsLeaveConfirmOpen(false)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setIsLeaveConfirmOpen(false);
                  handleLeaveGroup();
                }}
                disabled={removeMember.isPending}
                className="flex-1 rounded-xl"
              >
                {removeMember.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Leave'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

interface MemberRowProps {
  member: ConversationMember;
  currentUserId?: string;
  currentUserRole?: string;
  conversationId: string;
}

function MemberRow({ member, currentUserId, currentUserRole, conversationId }: MemberRowProps) {
  const { data: memberUser, isLoading } = useUserById(member.userId);
  const changeRole = useChangeMemberRole();
  const removeMember = useRemoveMember();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isSelf = member.userId === currentUserId;
  const isOwner = member.role === 'OWNER';
  const isAdmin = member.role === 'ADMIN';

  const canPromoteDemote = currentUserRole === 'OWNER' && !isSelf && !isOwner;
  const canRemove =
    !isSelf &&
    !isOwner &&
    (currentUserRole === 'OWNER' || (currentUserRole === 'ADMIN' && member.role === 'MEMBER'));

  const memberName =
    memberUser?.displayName || memberUser?.username || `User ${member.userId.substring(0, 6)}`;
  const memberInitials = (memberName || 'U').substring(0, 2).toUpperCase();

  const handleToggleAdmin = () => {
    setIsMenuOpen(false);
    const newRole = isAdmin ? 'MEMBER' : 'ADMIN';
    changeRole.mutate({
      conversationId,
      userId: member.userId,
      role: newRole,
    });
  };

  const handleRemove = () => {
    setIsMenuOpen(false);
    removeMember.mutate({
      conversationId,
      userId: member.userId,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-2 rounded-xl">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="w-24 h-3.5 rounded-md" />
            <Skeleton className="w-16 h-2.5 rounded-md" />
          </div>
        </div>
        <Skeleton className="w-12 h-4 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group relative">
      <div className="flex items-center space-x-3 min-w-0 pr-2">
        <Avatar
          src={memberUser?.profilePictureUrl}
          alt={memberName}
          className="w-8 h-8 bg-slate-100 text-slate-700 font-bold text-xs shrink-0"
          fallback={memberInitials}
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-900 truncate flex items-center gap-1">
            <span>{memberName}</span>
            {isSelf && <span className="text-[10px] text-slate-400 font-normal">(You)</span>}
          </p>
          {memberUser?.username && (
            <p className="text-[10px] text-slate-400 truncate">@{memberUser.username}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-1.5 shrink-0">
        {/* Role Pill */}
        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            isOwner
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : isAdmin
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-slate-100 text-slate-500'
          }`}
        >
          {member.role}
        </span>

        {/* Action dropdown button */}
        {(canPromoteDemote || canRemove) && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Manage member"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-40 animate-in fade-in zoom-in-95">
                  {canPromoteDemote && (
                    <button
                      type="button"
                      onClick={handleToggleAdmin}
                      disabled={changeRole.isPending}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      {isAdmin ? (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                          <span>Demote Member</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                          <span>Make Admin</span>
                        </>
                      )}
                    </button>
                  )}
                  {canRemove && (
                    <button
                      type="button"
                      onClick={handleRemove}
                      disabled={removeMember.isPending}
                      className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MembersListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-2 rounded-xl">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className={`h-3.5 ${i % 2 === 0 ? 'w-24' : 'w-32'} rounded-md`} />
              <Skeleton className="h-2.5 w-16 rounded-md" />
            </div>
          </div>
          <Skeleton className="w-12 h-4 rounded-full" />
        </div>
      ))}
    </div>
  );
}
