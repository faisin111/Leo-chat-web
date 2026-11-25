import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Users,
  Ban,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Avatar } from '@/shared/ui/avatar';
import { formatLastMessagePreview, type LastMessage } from '@/features/chat';
import { useSession } from '@/features/auth';
import type { AiActionCardData } from '../types/ai.types';
import { useAiStore } from '../store/ai.store';

interface AiActionCardProps {
  card: AiActionCardData;
}

export function AiActionCard({ card }: AiActionCardProps) {
  const navigate = useNavigate();
  const currentUserId = useSession((s) => s.user?.id);
  const confirmAction = useAiStore((s) => s.confirmAction);
  const cancelAction = useAiStore((s) => s.cancelAction);

  const getInitials = (name?: string | null) => (name || 'User').substring(0, 2).toUpperCase();

  // 1. Pending Confirmation State
  if (card.status === 'pending_confirmation') {
    return (
      <div className="my-3 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/5 via-card to-card p-4 sm:p-5 shadow-sm max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            {card.action === 'SEND_MESSAGE' ? (
              <MessageSquare className="w-4 h-4" />
            ) : (
              <PhoneCall className="w-4 h-4" />
            )}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-foreground">
              {card.action === 'SEND_MESSAGE' ? 'Confirm Sending Message' : 'Confirm Starting Call'}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {card.confirmationMessage ||
                'Please review and confirm this action before execution.'}
            </p>
          </div>
        </div>

        {/* Target Details */}
        {card.targetUser && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/60 border border-border/60 mb-3">
            <Avatar
              src={card.targetUser.avatarUrl}
              fallback={getInitials(card.targetUser.displayName || card.targetUser.username)}
              className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {card.targetUser.displayName || card.targetUser.username}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono truncate">
                @{card.targetUser.username}
              </p>
            </div>
          </div>
        )}

        {/* Message Preview */}
        {card.messageText && (
          <div className="mb-4">
            <p className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
              Message Content:
            </p>
            <div className="p-3 rounded-xl bg-card border border-border/80 text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              &ldquo;{card.messageText}&rdquo;
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            onClick={() => confirmAction(card.id)}
            className="rounded-xl text-xs gap-1.5 shadow-sm shadow-primary/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{card.action === 'SEND_MESSAGE' ? 'Confirm & Send' : 'Confirm & Call'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cancelAction(card.id)}
            className="rounded-xl text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // 2. Executing State
  if (card.status === 'executing') {
    return (
      <div className="my-3 rounded-2xl border border-border bg-card p-4 max-w-lg flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
        <div className="text-left">
          <p className="text-xs font-semibold text-foreground">Executing action...</p>
          <p className="text-[11px] text-muted-foreground">
            {card.action === 'SEND_MESSAGE'
              ? 'Sending your message now...'
              : 'Connecting call session...'}
          </p>
        </div>
      </div>
    );
  }

  // 3. Cancelled State
  if (card.status === 'cancelled') {
    return (
      <div className="my-2.5 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2.5 max-w-lg flex items-center gap-2 text-muted-foreground text-xs">
        <XCircle className="w-4 h-4 shrink-0 text-zinc-400" />
        <span>Action cancelled. No changes were made.</span>
      </div>
    );
  }

  // 4. Failed State
  if (card.status === 'failed') {
    return (
      <div className="my-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 max-w-lg text-left space-y-2">
        <div className="flex items-center gap-2 text-rose-500 text-xs font-bold">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>Action Failed</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {card.errorMessage || 'An error occurred while executing this action.'}
        </p>
      </div>
    );
  }

  // 5. Executed State - Custom views per action
  if (card.status === 'executed') {
    // A. SEND_MESSAGE Executed
    if (card.action === 'SEND_MESSAGE') {
      return (
        <div className="my-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-950/10 p-4 max-w-lg text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Message Sent Successfully</span>
            </div>
            {card.conversationId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/app/c/${card.conversationId}`)}
                className="rounded-xl text-[11px] h-7 gap-1"
              >
                <span>Open Chat</span>
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>

          {card.targetUser && (
            <div className="flex items-center gap-2 text-xs text-foreground">
              <span className="text-muted-foreground">Sent to:</span>
              <strong className="font-semibold">
                {card.targetUser.displayName || card.targetUser.username}
              </strong>
              <span className="text-muted-foreground font-mono text-[11px]">
                (@{card.targetUser.username})
              </span>
            </div>
          )}

          {card.messageText && (
            <div className="p-2.5 rounded-xl bg-card border border-border/70 text-xs text-foreground/90 whitespace-pre-wrap">
              &ldquo;{card.messageText}&rdquo;
            </div>
          )}
        </div>
      );
    }

    // B. START_CALL Executed
    if (card.action === 'START_CALL') {
      return (
        <div className="my-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-950/10 p-4 max-w-lg text-left space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <PhoneCall className="w-4 h-4" />
            <span>Call Connected</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Call invitation dispatched to{' '}
            <strong>{card.targetUser?.displayName || card.targetUser?.username || 'user'}</strong>.
            The call modal is now active.
          </p>
        </div>
      );
    }

    // C. GET_MY_PROFILE Executed
    if (card.action === 'GET_MY_PROFILE') {
      const data = card.resultData as Record<string, unknown> | undefined;
      if (!data) return null;

      return (
        <div className="my-3 rounded-2xl border border-border bg-card p-4 sm:p-5 max-w-lg text-left shadow-sm space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <Avatar
                src={(data.profilePictureUrl as string) || undefined}
                fallback={getInitials((data.displayName as string) || (data.username as string))}
                className="w-12 h-12 rounded-full border-2 border-primary/20 text-sm font-bold bg-primary/10 text-primary"
              />
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <span>{(data.displayName as string) || (data.username as string)}</span>
                  {Boolean(data.emailVerified) && (
                    <span
                      title="Verified Account"
                      className="inline-flex items-center text-emerald-500"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground font-mono">
                  @{data.username as string}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app/settings/profile')}
              className="rounded-xl text-xs h-8"
            >
              Edit Profile
            </Button>
          </div>

          {/* Safe Fields Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Email
              </span>
              <span className="text-foreground font-medium truncate block">
                {(data.email as string) || 'Not set'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Account Role
              </span>
              <span className="inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase">
                {(data.role as string) || 'USER'}
              </span>
            </div>
            {Boolean(data.region) && (
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Region
                </span>
                <span className="text-foreground">{data.region as string}</span>
              </div>
            )}
            {Boolean(data.phoneNumber) && (
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Phone
                </span>
                <span className="text-foreground">{data.phoneNumber as string}</span>
              </div>
            )}
          </div>

          {Boolean(data.bio) && (
            <div className="pt-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Bio
              </span>
              <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/50">
                {data.bio as string}
              </p>
            </div>
          )}

          {/* Privacy & Security Guarantee Banner */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 border border-border/60 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Passwords, session tokens, and security credentials are kept strictly private and
              never exposed.
            </span>
          </div>
        </div>
      );
    }

    // D. LIST_CONVERSATIONS Executed
    if (card.action === 'LIST_CONVERSATIONS') {
      const data = card.resultData as { items?: Array<Record<string, unknown>> } | undefined;
      const items = data?.items || (Array.isArray(data) ? data : []);

      return (
        <div className="my-3 rounded-2xl border border-border bg-card p-4 max-w-lg text-left shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>Your Conversations ({items.length})</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app')}
              className="text-[11px] h-7 text-primary hover:underline"
            >
              All Chats
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              No active conversations found. You can start a new chat with anyone!
            </p>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {items.slice(0, 5).map((conv, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => navigate(`/app/c/${conv.id}`)}
                  className="w-full text-left flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 transition-colors cursor-pointer border border-transparent hover:border-border/60"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      src={(conv.targetAvatarUrl as string) || (conv.avatarUrl as string)}
                      fallback={getInitials(
                        (conv.title as string) || (conv.targetDisplayName as string),
                      )}
                      className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold"
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {(conv.targetDisplayName as string) ||
                          (conv.title as string) ||
                          (conv.targetUsername as string) ||
                          'Chat'}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {
                          formatLastMessagePreview(
                            {
                              type: (conv.type as string) || 'DIRECT',
                              lastMessage: (conv.lastMessage as LastMessage | null) ?? null,
                            },
                            currentUserId,
                          ).text
                        }
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-primary font-medium px-2 py-1 rounded-lg bg-primary/10 shrink-0">
                    Open
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // E. SEARCH_USERS Executed
    if (card.action === 'SEARCH_USERS') {
      const users = (card.resultData as Array<Record<string, unknown>>) || [];

      return (
        <div className="my-3 rounded-2xl border border-border bg-card p-4 max-w-lg text-left shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60 text-xs font-bold text-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>Users Found ({users.length})</span>
          </div>

          {users.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              No users found matching &ldquo;{card.query}&rdquo;.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {users.slice(0, 5).map((u, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      src={(u.profilePictureUrl as string) || undefined}
                      fallback={getInitials((u.displayName as string) || (u.username as string))}
                      className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold"
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {(u.displayName as string) || (u.username as string)}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        @{u.username as string}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/app/connect?user=${u.id}`)}
                      className="h-7 text-[11px] px-2.5 rounded-lg"
                    >
                      Chat
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // F. GET_BLOCKED_USERS Executed
    if (card.action === 'GET_BLOCKED_USERS') {
      const blocked = (card.resultData as Array<Record<string, unknown>>) || [];

      return (
        <div className="my-3 rounded-2xl border border-border bg-card p-4 max-w-lg text-left shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Ban className="w-4 h-4 text-rose-500" />
              <span>Blocked Users ({blocked.length})</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app/settings/blocked')}
              className="text-[11px] h-7"
            >
              Manage
            </Button>
          </div>

          {blocked.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              You haven&apos;t blocked any users.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              You currently have {blocked.length} blocked user{blocked.length === 1 ? '' : 's'}. You
              can unblock them anytime in Settings.
            </p>
          )}
        </div>
      );
    }
  }

  return null;
}
export default AiActionCard;
