import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminReportItem } from '@/features/admin';
import { Button } from '@/shared/ui/button';
import {
  Flag,
  CheckCircle2,
  Loader2,
  Trash2,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { showApiError } from '@/shared/api/api-error';

export const ReportsPage = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED'
  >('OPEN');
  const [cursor, setCursor] = useState<number>(0);
  const [cursorHistory, setCursorHistory] = useState<number[]>([0]);

  // Quick Resolve modal
  const [selectedReport, setSelectedReport] = useState<AdminReportItem | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [actionChoice, setActionChoice] = useState('NONE');

  // Delete message modal
  const [messageToDelete, setMessageToDelete] = useState<{ id: string; reportId: string } | null>(
    null,
  );
  const [deleteReason, setDeleteReason] = useState('Violation of platform guidelines');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', statusFilter, cursor],
    queryFn: () =>
      adminApi.getReports({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        cursor,
      }),
  });

  const reports = data?.items || [];

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolution, action }: { id: string; resolution: string; action?: string }) =>
      adminApi.resolveReport(id, { resolution, action }),
    onSuccess: (res) => {
      toast.success(res?.message || 'Report resolved successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setSelectedReport(null);
      setResolutionText('');
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
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      setMessageToDelete(null);
    },
    onError: (err: unknown) => {
      showApiError(err, 'Failed to delete message');
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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60 h-full">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Moderation Queue</h1>
          <p className="text-sm text-slate-500">
            Investigate reported messages, enforce guidelines, and resolve complaints.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium overflow-x-auto hide-scrollbar">
          {(['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED', 'ALL'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCursor(0);
                setCursorHistory([0]);
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Target</th>
                <th className="px-5 py-3.5">Reason</th>
                <th className="px-5 py-3.5">Details</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Fetching moderation reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-slate-800 mb-1">Queue is clear!</h3>
                    <p className="text-xs text-slate-400">
                      No reports found for status &quot;{statusFilter}&quot;.
                    </p>
                  </td>
                </tr>
              ) : (
                reports.map((report) => {
                  const isResolved = report.status === 'RESOLVED' || report.status === 'DISMISSED';

                  return (
                    <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            {report.targetType === 'MESSAGE' ? (
                              <MessageSquare className="w-3.5 h-3.5" />
                            ) : (
                              <Flag className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-900 uppercase">
                              {report.targetType}
                            </span>
                            <p className="text-[11px] text-slate-400 font-mono truncate max-w-[120px]">
                              {report.targetId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          {report.reason}
                        </span>
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-xs text-slate-600 truncate">
                          {report.details || (
                            <span className="text-slate-400 italic">No details provided</span>
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.status === 'RESOLVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : report.status === 'DISMISSED'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              report.status === 'RESOLVED'
                                ? 'bg-emerald-500'
                                : report.status === 'DISMISSED'
                                  ? 'bg-slate-400'
                                  : 'bg-red-500'
                            }`}
                          />
                          {report.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                        {report.createdAt
                          ? format(new Date(report.createdAt), 'MMM d, HH:mm')
                          : '—'}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-slate-500 hover:text-primary"
                          >
                            <Link to={`/app/admin/reports/${report.id}`} title="Inspect Report">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>

                          {!isResolved && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedReport(report);
                                  setResolutionText('');
                                  setActionChoice('NONE');
                                }}
                                className="h-8 px-2 text-slate-500 hover:text-emerald-600"
                                title="Resolve Report"
                              >
                                <Check className="w-4 h-4" />
                              </Button>

                              {report.targetType === 'MESSAGE' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setMessageToDelete({
                                      id: report.targetId,
                                      reportId: report.id,
                                    })
                                  }
                                  className="h-8 px-2 text-slate-500 hover:text-red-600"
                                  title="Delete Message"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
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
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {reports.length} reports</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={cursorHistory.length <= 1}
              className="rounded-xl h-8 px-3"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!data?.hasMore}
              className="rounded-xl h-8 px-3"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Resolve Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Resolve Moderation Report</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Reason: <span className="font-semibold text-slate-800">{selectedReport.reason}</span>{' '}
              ({selectedReport.targetType})
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Resolution Decision (Required)
                </label>
                <textarea
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Document resolution outcome (e.g. Warning issued, message removed, report rejected as spam)..."
                  rows={3}
                  maxLength={2000}
                  className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Administrative Action
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
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReport(null)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!resolutionText.trim() || resolveMutation.isPending}
                onClick={() =>
                  resolveMutation.mutate({
                    id: selectedReport.id,
                    resolution: resolutionText.trim(),
                    action: actionChoice,
                  })
                }
                className="rounded-xl"
              >
                {resolveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : null}
                Submit Resolution
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Message Confirmation Modal */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Reported Message</h3>
                <p className="text-xs text-slate-500">Remove content from chat channels.</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Audit Reason (1–500 chars)
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                maxLength={500}
                className="w-full text-sm rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessageToDelete(null)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={!deleteReason.trim() || deleteMessageMutation.isPending}
                onClick={() =>
                  deleteMessageMutation.mutate({
                    messageId: messageToDelete.id,
                    reason: deleteReason.trim(),
                  })
                }
                className="rounded-xl bg-red-600 hover:bg-red-700"
              >
                {deleteMessageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : null}
                Confirm Removal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
