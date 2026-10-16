import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminUserStatus } from '@/features/admin';
import { Button } from '@/shared/ui/button';
import {
  ArrowLeft,
  Mail,
  Shield,
  Clock,
  Ban,
  UserX,
  LogOut,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  X,
  FileText,
  UserCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { showApiError } from '@/shared/api/api-error';

export const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [copied, setCopied] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<AdminUserStatus>('ACTIVE');
  const [statusReason, setStatusReason] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => adminApi.getUser(id!),
    enabled: Boolean(id),
  });

  const { data: userAuditLogs } = useQuery({
    queryKey: ['admin-user-audit', id],
    queryFn: () => adminApi.getAuditLogs({ actor: id }),
    enabled: Boolean(id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, reason }: { status: AdminUserStatus; reason: string }) =>
      adminApi.updateUserStatus(id!, { status, reason }),
    onSuccess: (res) => {
      toast.success(res?.message || 'User status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsStatusModalOpen(false);
      setStatusReason('');
    },
    onError: (err: unknown) => {
      showApiError(err, 'Failed to update user status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteUser(id!),
    onSuccess: (res) => {
      toast.success(res?.message || 'User deleted and anonymized');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      navigate('/app/admin/users');
    },
    onError: (err: unknown) => {
      showApiError(err, 'Failed to delete user');
    },
  });

  const forceLogoutMutation = useMutation({
    mutationFn: () => adminApi.forceLogoutUser(id!),
    onSuccess: () => {
      toast.success('Force logout command dispatched');
    },
    onError: (err: unknown) => {
      showApiError(err, 'Stateless JWT tokens cannot be revoked server-side');
    },
  });

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('User ID copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/60 h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/60 h-full text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-1">User Not Found</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">
          The requested user account does not exist or may have been deleted.
        </p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/app/admin/users">Return to Users</Link>
        </Button>
      </div>
    );
  }

  const isAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';
  const displayName = user.displayName || user.username;
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60 h-full">
      {/* Header with Back button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-xl text-slate-500 hover:text-slate-900"
          >
            <Link to="/app/admin/users">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Profile</h1>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span>{user.id}</span>
              <button onClick={handleCopyId} className="hover:text-slate-600 transition-colors">
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewStatus((user.status as AdminUserStatus) || 'ACTIVE');
                  setIsStatusModalOpen(true);
                }}
                className="rounded-xl"
              >
                <Ban className="w-4 h-4 mr-1.5 text-amber-600" />
                Change Status
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
              >
                <UserX className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-2xl mx-auto mb-4 overflow-hidden border-2 border-slate-200/80">
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-0.5">{displayName}</h2>
            <p className="text-xs text-slate-400 font-mono mb-4">@{user.username}</p>

            <div className="flex items-center justify-center gap-2 mb-6">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isAdmin
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {isAdmin ? 'ADMIN' : 'USER'}
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : user.status === 'BANNED'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    user.status === 'ACTIVE'
                      ? 'bg-emerald-500'
                      : user.status === 'BANNED'
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                  }`}
                />
                {user.status}
              </span>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => forceLogoutMutation.mutate()}
                disabled={forceLogoutMutation.isPending}
                className="w-full rounded-xl text-xs text-slate-600 hover:text-slate-900"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Force Stateless Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Account Specifications & Audit Log */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Account Attributes
            </h3>

            <div className="divide-y divide-slate-100 text-sm">
              <div className="flex items-center justify-between py-3">
                <span className="text-slate-500 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-slate-400" /> Email
                </span>
                <span className="font-semibold text-slate-900">{user.email}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-slate-500 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-slate-400" /> System Role
                </span>
                <span className="font-mono text-xs font-semibold">{user.role}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-slate-500 flex items-center">
                  <UserCheck className="w-4 h-4 mr-2 text-slate-400" /> Account Status
                </span>
                <span className="font-medium text-slate-900">{user.status}</span>
              </div>

              {user.createdAt && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-slate-400" /> Member Since
                  </span>
                  <span className="text-slate-700">
                    {format(new Date(user.createdAt), 'PPP p')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* User Audit Log History */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Audit Trail for User
              </h3>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {userAuditLogs?.items && userAuditLogs.items.length > 0 ? (
                userAuditLogs.items.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 font-mono">{log.action}</p>
                      <p className="text-slate-400 text-[11px]">
                        Target: {log.targetType || 'USER'} · IP: {log.ipAddress || '—'}
                      </p>
                    </div>
                    <span className="text-slate-400">
                      {log.createdAt ? format(new Date(log.createdAt), 'MMM d, HH:mm') : '—'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">
                  No recorded audit trail events for this user.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Modify Account Status</h3>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reason for Status Change (Required)
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Enter policy violation reason or account review rationale..."
                  rows={3}
                  maxLength={500}
                  className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
                <span className="text-[10px] text-slate-400">{statusReason.length}/500 chars</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStatusModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!statusReason.trim() || updateStatusMutation.isPending}
                onClick={() =>
                  updateStatusMutation.mutate({
                    status: newStatus,
                    reason: statusReason.trim(),
                  })
                }
                className="rounded-xl"
              >
                {updateStatusMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : null}
                Update Status
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
                <p className="text-xs text-slate-500">Soft delete and sanitize user records.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to permanently delete and anonymize user{' '}
              <strong className="text-slate-900">@{user.username}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteMutation.isPending}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
                className="rounded-xl bg-red-600 hover:bg-red-700"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : null}
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
