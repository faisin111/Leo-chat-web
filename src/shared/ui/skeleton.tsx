import * as React from 'react';
import { cn } from '@/shared/lib/cn';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('shimmer rounded-xl', className)} {...props} />;
}

export function UserTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100/80 animate-pulse">
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
          </td>
          <td className="px-5 py-4">
            <Skeleton className="h-5 w-16 rounded-md" />
          </td>
          <td className="px-5 py-4">
            <Skeleton className="h-5 w-20 rounded-full" />
          </td>
          <td className="px-5 py-4">
            <Skeleton className="h-4 w-28" />
          </td>
          <td className="px-5 py-4 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export function ConversationTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100/80 animate-pulse">
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </td>
          <td className="px-5 py-4">
            <Skeleton className="h-5 w-16 rounded-md" />
          </td>
          <td className="px-5 py-4">
            <Skeleton className="h-5 w-20 rounded-full" />
          </td>
          <td className="px-5 py-4">
            <Skeleton className="h-4 w-12" />
          </td>
          <td className="px-5 py-4">
            <Skeleton className="h-4 w-24" />
          </td>
          <td className="px-5 py-4 text-right">
            <Skeleton className="w-8 h-8 rounded-lg ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function ReportTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100/80 animate-pulse">
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </td>
          <td className="px-5 py-4">
            <Skeleton className="h-4 w-24" />
          </td>
          <td className="px-5 py-4">
            <Skeleton className="h-5 w-20 rounded-full" />
          </td>
          <td className="px-5 py-4">
            <Skeleton className="h-4 w-28" />
          </td>
          <td className="px-5 py-4">
            <Skeleton className="h-4 w-24" />
          </td>
          <td className="px-5 py-4 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export function AuditLogTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100/80 animate-pulse">
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </td>
          <td className="px-5 py-4">
            <Skeleton className="h-4 w-32" />
          </td>
          <td className="px-5 py-4">
            <Skeleton className="h-4 w-24" />
          </td>
          <td className="px-5 py-4">
            <Skeleton className="h-4 w-24" />
          </td>
          <td className="px-5 py-4 text-right">
            <Skeleton className="w-8 h-8 rounded-lg ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function ChatThreadSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
      {/* Incoming message */}
      <div className="flex items-end gap-2 max-w-md">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-12 w-64 rounded-2xl rounded-bl-sm" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>

      {/* Outgoing message */}
      <div className="flex items-end justify-end gap-2 ml-auto max-w-md">
        <div className="space-y-1.5 items-end flex flex-col">
          <Skeleton className="h-16 w-72 rounded-2xl rounded-br-sm" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>

      {/* Incoming message */}
      <div className="flex items-end gap-2 max-w-md">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-20 w-80 rounded-2xl rounded-bl-sm" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>

      {/* Outgoing message */}
      <div className="flex items-end justify-end gap-2 ml-auto max-w-md">
        <div className="space-y-1.5 items-end flex flex-col">
          <Skeleton className="h-10 w-48 rounded-2xl rounded-br-sm" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function UserDetailSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60 h-full animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-40 rounded-lg" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col items-center text-center">
            <Skeleton className="w-24 h-24 rounded-full mb-4" />
            <Skeleton className="h-5 w-36 rounded-md mb-2" />
            <Skeleton className="h-3.5 w-24 rounded-md mb-4" />
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="w-full space-y-2 pt-4 border-t border-slate-100">
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <Skeleton className="h-4 w-32 rounded-md" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info & Audit Trail */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <Skeleton className="h-5 w-40 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportDetailSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60 h-full animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-36 rounded-lg" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-48 rounded-md" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Report Details & Message Context */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <Skeleton className="h-5 w-36 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        </div>

        {/* Right Column: Moderation Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <Skeleton className="h-5 w-40 rounded-md" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Skeleton };
