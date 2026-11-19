import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminApi,
  type AdminConversationItem,
  type AdminConversationStatus,
} from '@/features/admin';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ConversationTableSkeleton } from '@/shared/ui/skeleton';
import {
  MessageSquare,
  Search,
  Loader2,
  Archive,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { showApiError } from '@/shared/api/api-error';

export const ConversationsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED' | 'DELETED'>(
    'ALL',
  );
  const [cursor, setCursor] = useState<number>(0);
  const [cursorHistory, setCursorHistory] = useState<number[]>([0]);

  // Status modal
  const [selectedConv, setSelectedConv] = useState<AdminConversationItem | null>(null);
  const [newStatus, setNewStatus] = useState<AdminConversationStatus>('ACTIVE');
  const [statusReason, setStatusReason] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCursor(0);
      setCursorHistory([0]);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-conversations', debouncedSearch, statusFilter, cursor],
    queryFn: () =>
      adminApi.getConversations({
        q: debouncedSearch.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        cursor,
      }),
  });

  const conversations = data?.items || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: AdminConversationStatus;
      reason: string;
    }) => adminApi.updateConversationStatus(id, { status, reason }),
    onSuccess: (res) => {
      toast.success(res?.message || 'Conversation status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setSelectedConv(null);
      setStatusReason('');
    },
    onError: (err: unknown) => {
      showApiError(err, 'Failed to update conversation status');
    },
  });

  const handleNextPage = () => {
    if (data?.hasMore && data.nextCursor) {
      const next = Number(data.nextCursor) || cursor + 1;
      setCursorHistory((prev) => [...prev, next]);
      setCursor(next);
    }
  };

  const handlePrevPage = () => {
    if (cursorHistory.length > 1) {
      const nextHist = [...cursorHistory];
      nextHist.pop();
      const prevCursor = nextHist[nextHist.length - 1] ?? 0;
      setCursorHistory(nextHist);
      setCursor(prevCursor);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background text-foreground h-full transition-colors duration-200">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Conversations Oversight
          </h1>
          <p className="text-sm text-muted-foreground">
            Audit channel sequences, moderation states, and conversation lifecycles.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-xs p-4 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-muted/40 border-border text-foreground placeholder:text-muted-foreground rounded-xl text-sm"
              placeholder="Search by title, participant name, username, or ID..."
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl text-xs font-medium overflow-x-auto hide-scrollbar">
            {(['ALL', 'ACTIVE', 'ARCHIVED', 'DELETED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCursor(0);
                  setCursorHistory([0]);
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conversations Table */}
      <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Conversation</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Seq</th>
                <th className="px-5 py-3.5">Last Active</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <ConversationTableSkeleton rows={6} />
              ) : conversations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-60" />
                    No conversations found.
                  </td>
                </tr>
              ) : (
                conversations.map((c) => {
                  const title =
                    c.title || (c.type === 'DIRECT' ? 'Direct Message' : 'Group Channel');

                  return (
                    <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{title}</p>
                            <p className="text-[11px] font-mono text-muted-foreground truncate max-w-[140px]">
                              {c.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-muted text-muted-foreground">
                          {c.type}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            c.status === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : c.status === 'ARCHIVED'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-destructive/15 text-destructive border border-destructive/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              c.status === 'ACTIVE'
                                ? 'bg-emerald-500'
                                : c.status === 'ARCHIVED'
                                  ? 'bg-amber-500'
                                  : 'bg-destructive'
                            }`}
                          />
                          {c.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-muted-foreground">
                        #{c.lastSeq ?? 0}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-xs text-muted-foreground">
                        {c.lastMessageAt
                          ? format(new Date(c.lastMessageAt), 'MMM d, HH:mm')
                          : 'New'}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedConv(c);
                            setNewStatus((c.status as AdminConversationStatus) || 'ACTIVE');
                            setStatusReason('');
                          }}
                          className="h-8 px-2 text-muted-foreground hover:text-amber-500"
                          title="Change Moderation Status"
                        >
                          <Archive className="w-4 h-4 mr-1" />
                          Moderate
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {conversations.length} conversations</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={cursorHistory.length <= 1}
              className="rounded-xl h-8 px-3 border-border hover:bg-muted"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!data?.hasMore}
              className="rounded-xl h-8 px-3 border-border hover:bg-muted"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Change Status Modal */}
      {selectedConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Moderate Conversation</h3>
              <button
                onClick={() => setSelectedConv(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Conversation ID: <span className="font-mono text-foreground">{selectedConv.id}</span>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Select Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ACTIVE', 'ARCHIVED', 'DELETED'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        newStatus === st
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Reason for Moderation Action
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="e.g. Inactive channel archived or spam group deleted..."
                  rows={3}
                  maxLength={500}
                  className="w-full text-sm rounded-xl border border-border bg-muted/20 text-foreground p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedConv(null)}
                className="rounded-xl border-border hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={updateStatusMutation.isPending}
                onClick={() =>
                  updateStatusMutation.mutate({
                    id: selectedConv.id,
                    status: newStatus,
                    reason: statusReason.trim() || 'Moderation action',
                  })
                }
                className="rounded-xl"
              >
                {updateStatusMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : null}
                Save Status
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
