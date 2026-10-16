import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin';
import { Button } from '@/shared/ui/button';
import {
  ArrowLeft,
  Flag,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  Clock,
  Shield,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { showApiError } from '@/shared/api/api-error';

export const ReportDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [resolutionText, setResolutionText] = useState('');
  const [actionChoice, setActionChoice] = useState('NONE');
  const [deleteReason, setDeleteReason] = useState('Policy violation');

  const {
    data: report,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-report', id],
    queryFn: () => adminApi.getReport(id!),
    enabled: Boolean(id),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ resolution, action }: { resolution: string; action?: string }) =>
      adminApi.resolveReport(id!, { resolution, action }),
    onSuccess: (res) => {
      toast.success(res?.message || 'Report resolved successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-report', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
    onError: (err: unknown) => {
      showApiError(err, 'Failed to resolve report');
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: ({ messageId, reason }: { messageId: string; reason: string }) =>
      adminApi.deleteMessage(messageId, reason),
    onSuccess: (res) => {
      toast.success(res?.message || 'Reported message deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-report', id] });
    },
    onError: (err: unknown) => {
      showApiError(err, 'Failed to delete message');
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/60 h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/60 h-full text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-1">Report Not Found</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">
          The requested moderation report does not exist or may have been deleted.
        </p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/app/admin/reports">Return to Reports</Link>
        </Button>
      </div>
    );
  }

  const isResolved = report.status === 'RESOLVED' || report.status === 'DISMISSED';

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-xl text-slate-500 hover:text-slate-900"
          >
            <Link to="/app/admin/reports">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Report Review</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  report.status === 'RESOLVED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : report.status === 'DISMISSED'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {report.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {report.id}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Report Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Flag className="w-4 h-4 text-red-500" />
              Report Particulars
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Violation Reason</span>
                  <span className="font-bold text-slate-900 text-sm">{report.reason}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Target Entity</span>
                  <span className="font-bold text-slate-900 text-sm">{report.targetType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Reporter UUID</span>
                  <span className="font-mono text-slate-700 truncate block">
                    {report.reporterId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Target UUID</span>
                  <span className="font-mono text-slate-700 truncate block">{report.targetId}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-700 mb-1.5">Submitted Details</h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed">
                  {report.details || (
                    <span className="text-slate-400 italic">
                      No additional explanation provided by reporter.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                <Clock className="w-3.5 h-3.5" />
                Submitted on {report.createdAt ? format(new Date(report.createdAt), 'PPP p') : '—'}
              </div>
            </div>
          </div>

          {/* If already resolved banner */}
          {isResolved && (
            <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200/80 p-6">
              <div className="flex items-center gap-2.5 mb-3 text-emerald-800 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Resolved by Administration
              </div>
              <p className="text-sm text-emerald-950 mb-3 leading-relaxed">
                {report.resolution || 'Report reviewed and marked resolved.'}
              </p>
              <div className="text-xs text-emerald-700/80 flex items-center gap-4">
                {report.resolvedBy && <span>Resolver: {report.resolvedBy}</span>}
                {report.resolvedAt && (
                  <span>Completed: {format(new Date(report.resolvedAt), 'MMM d, yyyy HH:mm')}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Moderation Workbench */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Action Workbench
            </h3>

            {!isResolved ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Resolution Note (Required)
                  </label>
                  <textarea
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="Document your findings and reason for resolution..."
                    rows={4}
                    maxLength={2000}
                    className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    {resolutionText.length}/2000 chars
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Moderator Action
                  </label>
                  <select
                    value={actionChoice}
                    onChange={(e) => setActionChoice(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="NONE">No Action (Mark Reviewed)</option>
                    <option value="DELETE_MESSAGE">DELETE_MESSAGE</option>
                    <option value="WARN_USER">WARN_USER</option>
                    <option value="SUSPEND_USER">SUSPEND_USER</option>
                    <option value="BAN_USER">BAN_USER</option>
                  </select>
                </div>

                <Button
                  className="w-full rounded-xl"
                  disabled={!resolutionText.trim() || resolveMutation.isPending}
                  onClick={() =>
                    resolveMutation.mutate({
                      resolution: resolutionText.trim(),
                      action: actionChoice,
                    })
                  }
                >
                  {resolveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : null}
                  Resolve Report
                </Button>

                {report.targetType === 'MESSAGE' && (
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Delete Reported Message
                    </label>
                    <input
                      type="text"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="Deletion audit reason..."
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 mb-2 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deleteMessageMutation.isPending || !deleteReason.trim()}
                      onClick={() =>
                        deleteMessageMutation.mutate({
                          messageId: report.targetId,
                          reason: deleteReason.trim(),
                        })
                      }
                      className="w-full rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Remove Reported Message
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                This report is marked complete. No further administrative action is pending.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
