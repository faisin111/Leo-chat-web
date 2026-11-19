import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminUserItem, type AdminUserStatus } from '@/features/admin';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Avatar } from '@/shared/ui/avatar';
import { UserTableSkeleton } from '@/shared/ui/skeleton';
import {
  Search,
  Loader2,
  Ban,
  UserX,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { showApiError } from '@/shared/api/api-error';

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED' | 'BANNED'>('ALL');
  const [cursor, setCursor] = useState<number>(0);
  const [cursorHistory, setCursorHistory] = useState<number[]>([0]);

  // Modals state
  const [selectedUserForStatus, setSelectedUserForStatus] = useState<AdminUserItem | null>(null);
  const [newStatus, setNewStatus] = useState<AdminUserStatus>('ACTIVE');
  const [statusReason, setStatusReason] = useState('');

  const [selectedUserForDelete, setSelectedUserForDelete] = useState<AdminUserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCursor(0);
      setCursorHistory([0]);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', debouncedSearch, statusFilter, cursor],
    queryFn: () =>
      adminApi.getUsers({
        q: debouncedSearch.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        cursor,
        limit: 25,
      }),
  });

  const users = data?.items || [];

  // Status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: AdminUserStatus; reason: string }) =>
      adminApi.updateUserStatus(id, { status, reason }),
    onSuccess: (res) => {
      toast.success(res?.message || 'User status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setSelectedUserForStatus(null);
      setStatusReason('');
    },
    onError: (err: unknown) => {
      showApiError(err, 'Failed to update user status');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: (res) => {
      toast.success(res?.message || 'User anonymized and soft-deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setSelectedUserForDelete(null);
    },
    onError: (err: unknown) => {
      showApiError(err, 'Failed to delete user');
    },
    onSettled: () => setIsDeleting(false),
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">
            View profiles, moderate account statuses, and oversee platform members.
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
              placeholder="Search by username, display name, email..."
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl text-xs font-medium overflow-x-auto hide-scrollbar">
            {(['ALL', 'ACTIVE', 'DISABLED', 'BANNED'] as const).map((st) => (
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

      {/* Users Table */}
      <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Joined</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <UserTableSkeleton rows={6} />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    <UserX className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-60" />
                    No users match your criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isAdmin = u.role === 'ADMIN' || u.role === 'ROLE_ADMIN';
                  const name = u.displayName || u.username;
                  const initials = name.substring(0, 2).toUpperCase();

                  return (
                    <tr key={u.id} className="hover:bg-muted/40 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={u.profilePictureUrl}
                            alt={name}
                            className="w-9 h-9 bg-muted text-foreground border border-border font-bold text-xs shrink-0"
                            fallback={initials}
                          />
                          <div className="min-w-0">
                            <Link
                              to={`/app/admin/users/${u.id}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5 truncate"
                            >
                              {name}
                              {isAdmin && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-primary/10 text-primary">
                                  ADMIN
                                </span>
                              )}
                            </Link>
                            <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isAdmin
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isAdmin ? 'ADMIN' : 'USER'}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : u.status === 'BANNED'
                                ? 'bg-destructive/15 text-destructive border border-destructive/30'
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-500'
                                : u.status === 'BANNED'
                                  ? 'bg-destructive'
                                  : 'bg-amber-500'
                            }`}
                          />
                          {u.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-xs text-muted-foreground">
                        {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground hover:text-primary"
                          >
                            <Link to={`/app/admin/users/${u.id}`} title="View Details">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>

                          {!isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUserForStatus(u);
                                  setNewStatus((u.status as AdminUserStatus) || 'ACTIVE');
                                  setStatusReason('');
                                }}
                                className="h-8 px-2 text-muted-foreground hover:text-amber-500"
                                title="Change Status"
                              >
                                <Ban className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedUserForDelete(u)}
                                className="h-8 px-2 text-muted-foreground hover:text-destructive"
                                title="Anonymize / Delete"
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
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
          <span>Showing {users.length} accounts</span>
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
      {selectedUserForStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Change Account Status</h3>
              <button
                onClick={() => setSelectedUserForStatus(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Updating status for{' '}
              <span className="font-semibold text-foreground">
                @{selectedUserForStatus.username}
              </span>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Select Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ACTIVE', 'DISABLED', 'BANNED'] as const).map((st) => (
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
                  Reason for Status Change (Required)
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="e.g. Terms violation, spam reports, or account restoration..."
                  rows={3}
                  maxLength={500}
                  className="w-full text-sm rounded-xl border border-border bg-muted/20 text-foreground p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none placeholder:text-muted-foreground"
                />
                <span className="text-[10px] text-muted-foreground">
                  {statusReason.length}/500 chars
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserForStatus(null)}
                className="rounded-xl border-border hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!statusReason.trim() || updateStatusMutation.isPending}
                onClick={() =>
                  updateStatusMutation.mutate({
                    id: selectedUserForStatus.id,
                    status: newStatus,
                    reason: statusReason.trim(),
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

      {/* Delete / Anonymize Modal */}
      {selectedUserForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-destructive">
              <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Soft Delete User</h3>
                <p className="text-xs text-muted-foreground">
                  This action will anonymize account data.
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Are you sure you want to delete and anonymize user{' '}
              <strong className="text-foreground">@{selectedUserForDelete.username}</strong>?
              Messages and account references will be sanitized in compliance with platform
              retention policies.
            </p>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserForDelete(null)}
                disabled={isDeleting}
                className="rounded-xl border-border hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={() => {
                  setIsDeleting(true);
                  deleteMutation.mutate(selectedUserForDelete.id);
                }}
                className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
                Confirm Deletion
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
