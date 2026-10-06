import { Button } from '@/shared/ui/button';
import { Search, Filter, Download } from 'lucide-react';
import { Input } from '@/shared/ui/input';

export const AuditLogsPage = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Audit Logs</h1>
          <p className="text-sm text-slate-500">Track all administrative and security actions</p>
        </div>
        <Button variant="outline" className="bg-white"><Download className="w-4 h-4 mr-2" /> Download CSV</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9 bg-white" placeholder="Search by actor or action..." />
          </div>
          <Button variant="outline" className="bg-white"><Filter className="w-4 h-4 mr-2" /> Range: Last 7 Days</Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Actor</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Target</th>
                <th className="px-6 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AuditRow time="Today, 10:42 AM" actor="alice@admin" action="USER_SUSPENDED" target="user_id_1092" ip="192.168.1.1" color="text-red-600 bg-red-50" />
              <AuditRow time="Today, 09:15 AM" actor="SYSTEM" action="CRON_MAINTENANCE" target="database" ip="10.0.0.4" color="text-slate-600 bg-slate-100" />
              <AuditRow time="Yesterday, 04:22 PM" actor="bob@admin" action="ROLE_GRANTED" target="user_id_2410" ip="192.168.1.42" color="text-purple-600 bg-purple-50" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function AuditRow({ time, actor, action, target, ip, color }: any) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{time}</td>
      <td className="px-6 py-4 font-medium text-slate-900">{actor}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
          {action}
        </span>
      </td>
      <td className="px-6 py-4 font-mono text-xs text-slate-500">{target}</td>
      <td className="px-6 py-4 font-mono text-xs text-slate-400">{ip}</td>
    </tr>
  );
}
