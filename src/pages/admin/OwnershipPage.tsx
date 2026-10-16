import { useState } from 'react';
import { useSession, authSession } from '@/features/auth';
import { adminApi } from '@/features/admin';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { KeyRound, Shield, AlertTriangle, Loader2, User, Search, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export const OwnershipPage = () => {
  const currentUser = useSession((s) => s.user);

  const [targetUserId, setTargetUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Search non-admin users for convenient selection
  const [userSearch, setUserSearch] = useState('');
  const { data: usersData } = useQuery({
    queryKey: ['admin-transfer-candidates', userSearch],
    queryFn: () => adminApi.getUsers({ q: userSearch.trim() || undefined, limit: 10 }),
    enabled: userSearch.length >= 2,
  });

  const transferMutation = useMutation({
    mutationFn: () =>
      adminApi.transferOwnership({
        targetUserId: targetUserId.trim(),
        password,
      }),
    onSuccess: (res) => {
      toast.success(res?.message || 'Platform ownership successfully transferred.');
      setIsConfirmOpen(false);
      // Since current user is now demoted to ROLE_USER, refresh session or redirect
      setTimeout(() => {
        authSession.refresh().catch(() => {});
        window.location.href = '/app';
      }, 1500);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Ownership transfer rejected. Verify your current password and target user eligibility.';
      toast.error(msg);
      setIsConfirmOpen(false);
    },
  });

  const candidateUsers = (usersData?.items || []).filter(
    (u) =>
      u.id !== currentUser?.id &&
      u.role !== 'ADMIN' &&
      u.role !== 'ROLE_ADMIN' &&
      u.status === 'ACTIVE',
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60 h-full">
      {/* Title */}
      <div className="max-w-3xl mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
          Platform Ownership Transfer
        </h1>
        <p className="text-sm text-slate-500">
          Transfer master administrative privileges and root console access to another active user.
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Current Owner Profile */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Current Platform Owner</h2>
              <p className="text-xs text-slate-400">Authenticated Root Administrator</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Username</span>
              <span className="font-semibold text-slate-900 font-mono">
                @{currentUser?.username}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Email</span>
              <span className="font-semibold text-slate-900">{currentUser?.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">System Role</span>
              <span className="font-semibold text-purple-700 font-mono">{currentUser?.role}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Admin UUID</span>
              <span className="font-mono text-slate-700 truncate block">{currentUser?.id}</span>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <p className="font-bold">Important Single-Admin Security Policy</p>
            <p className="leading-relaxed">
              LeoChat enforces an exclusive single-admin security policy. Once transferred, your
              account will immediately be demoted to{' '}
              <span className="font-mono font-bold">ROLE_USER</span>, and you will lose access to
              the administration console. This action is irreversible.
            </p>
          </div>
        </div>

        {/* Transfer Form */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            Designate New Owner
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target User UUID
              </label>
              <Input
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="Paste destination user UUID (e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6)"
                className="font-mono text-xs h-10 rounded-xl"
              />
            </div>

            {/* Candidate Search Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Or Search Candidate Users
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Type name or username to search active users..."
                  className="pl-9 h-10 rounded-xl text-xs bg-slate-50/50"
                />
              </div>

              {candidateUsers.length > 0 && (
                <div className="mt-2 border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-40 overflow-y-auto bg-white">
                  {candidateUsers.map((cand) => (
                    <button
                      key={cand.id}
                      type="button"
                      onClick={() => {
                        setTargetUserId(cand.id);
                        setUserSearch('');
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-900">
                          {cand.displayName || cand.username}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          @{cand.username}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-primary font-semibold">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm Current Admin Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your current password to authorize transfer"
                  className="pr-10 h-10 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              disabled={!targetUserId.trim() || !password || transferMutation.isPending}
              onClick={() => setIsConfirmOpen(true)}
              className="rounded-xl w-full sm:w-auto"
            >
              Transfer Ownership
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Authorize Transfer</h3>
                <p className="text-xs text-slate-500">Irreversible ownership handover.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to transfer full admin ownership to user{' '}
              <span className="font-mono font-bold text-slate-900">{targetUserId}</span>? Your
              account will be demoted and you will immediately be redirected.
            </p>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmOpen(false)}
                disabled={transferMutation.isPending}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={transferMutation.isPending}
                onClick={() => transferMutation.mutate()}
                className="rounded-xl bg-red-600 hover:bg-red-700"
              >
                {transferMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : null}
                Confirm & Handover
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
