import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, type AdminAuditLogItem } from '@/features/admin';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { AuditLogTableSkeleton } from '@/shared/ui/skeleton';
import { Search, Download, ChevronLeft, ChevronRight, User, Code, X, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const AuditLogsPage = () => {
  const [actorSearch, setActorSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [cursor, setCursor] = useState<number>(0);
  const [cursorHistory, setCursorHistory] = useState<number[]>([0]);

  // JSON detail modal
  const [selectedLog, setSelectedLog] = useState<AdminAuditLogItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', actorSearch, actionFilter, cursor],
    queryFn: () =>
      adminApi.getAuditLogs({
        actor: actorSearch.trim() || undefined,
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
        cursor,
      }),
  });

  const logs = data?.items || [];

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

  const handleExportCSV = () => {
    if (!logs.length) {
      toast.error('No log records available to export');
      return;
    }
    const headers = [
      'Timestamp',
      'Actor',
      'Action',
      'TargetType',
      'TargetId',
      'IPAddress',
      'Details',
    ];
    const rows = logs.map((l) => [
      l.createdAt || '',
      l.actorId || l.actor || '',
      l.action || '',
      l.targetType || '',
      l.targetId || '',
      l.ipAddress || '',
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit logs exported to CSV');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60 h-full">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Audit Logs</h1>
          <p className="text-sm text-slate-500">
            Immutable record of all administrative modifications, bans, and security operations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="rounded-xl bg-white shadow-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={actorSearch}
            onChange={(e) => {
              setActorSearch(e.target.value);
              setCursor(0);
              setCursorHistory([0]);
            }}
            className="pl-9 h-10 bg-slate-50/50 border-slate-200 rounded-xl text-sm"
            placeholder="Filter by Actor UUID..."
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium overflow-x-auto hide-scrollbar">
          {(
            [
              'ALL',
              'USER_STATUS_CHANGED',
              'REPORT_RESOLVED',
              'MESSAGE_DELETED',
              'OWNERSHIP_TRANSFERRED',
            ] as const
          ).map((act) => (
            <button
              key={act}
              onClick={() => {
                setActionFilter(act);
                setCursor(0);
                setCursorHistory([0]);
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                actionFilter === act
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {act === 'ALL' ? 'All Actions' : act.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Target</th>
                <th className="px-5 py-3.5">IP Address</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <AuditLogTableSkeleton rows={6} />
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const actor = log.actorId || log.actor || 'System';
                  const isUserStatus = log.action.includes('USER') || log.action.includes('BANNED');
                  const isReport = log.action.includes('REPORT');

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                        {log.createdAt
                          ? format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')
                          : '—'}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-900">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[140px]">{actor}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono ${
                            isUserStatus
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : isReport
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600">
                        <div className="font-mono">
                          <span className="text-[10px] text-slate-400 font-bold block">
                            {log.targetType || 'ENTITY'}
                          </span>
                          <span className="truncate max-w-[120px] block">
                            {log.targetId || '—'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                        {log.ipAddress || '—'}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="h-8 px-2 text-slate-500 hover:text-primary text-xs"
                        >
                          <Code className="w-3.5 h-3.5 mr-1" />
                          Inspect
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
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {logs.length} audit records</span>
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

      {/* Inspect Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Audit Log Details
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Record ID</span>
                <span className="font-mono text-slate-800">{selectedLog.id}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Action</span>
                <span className="font-mono font-bold text-slate-800">{selectedLog.action}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Actor</span>
                <span className="font-mono text-slate-800">
                  {selectedLog.actorId || selectedLog.actor || 'System'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">IP Address</span>
                <span className="font-mono text-slate-800">{selectedLog.ipAddress || '—'}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Raw Event Payload
              </label>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-48 leading-relaxed">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(selectedLog.details || '{}'), null, 2);
                  } catch {
                    return selectedLog.details || 'No payload attached';
                  }
                })()}
              </pre>
            </div>

            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
