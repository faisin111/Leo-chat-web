import { Button } from '@/shared/ui/button';
import { Users, Activity, MessageSquare, Flag, MoreHorizontal, Filter, Search } from 'lucide-react';
import { Input } from '@/shared/ui/input';

export const DashboardPage = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-semibold">Platform overview</h1>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Owner only</span>
          </div>
          <p className="text-slate-500 text-sm">Operational health and trust signals for LeoChat.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="rounded-full bg-white shadow-sm">Last 30 days</Button>
          <Button className="rounded-full shadow-sm">Export report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value="12,842" subtitle="↑ 5.4% this month" icon={<Users className="w-4 h-4 text-primary" />} />
        <StatCard title="Active Today" value="8,916" subtitle="69.4% of users" icon={<Activity className="w-4 h-4 text-green-600" />} />
        <StatCard title="Messages Today" value="184.2k" subtitle="↑ 12.1% vs yesterday" icon={<MessageSquare className="w-4 h-4 text-blue-600" />} />
        <StatCard title="Open Reports" value="6" subtitle="2 high priority" icon={<Flag className="w-4 h-4 text-red-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="font-semibold mb-1">Platform activity</h3>
            <p className="text-xs text-slate-500">Daily active users and messages</p>
          </div>
          <div className="flex-1 min-h-[200px] flex items-end space-x-4">
            {/* Fake chart bars */}
            {[40, 50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end space-y-1">
                <div className="w-full bg-primary/20 rounded-t-sm" style={{ height: `${h * 0.4}%` }}></div>
                <div className="w-full bg-primary rounded-t-sm" style={{ height: `${h}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-4 mt-6 text-[10px] text-slate-500 font-medium">
            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-primary mr-1"></div> Active users</div>
            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-primary/20 mr-1"></div> Messages / 20</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="font-semibold mb-1">Account health</h3>
            <p className="text-xs text-slate-500">Current user status mix</p>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <HealthRow label="ACTIVE" value="12,614" percent="98.2%" color="bg-green-500" textColor="text-green-600" />
            <HealthRow label="DISABLED" value="84" percent="0.7%" color="bg-orange-500" textColor="text-orange-600" />
            <HealthRow label="BANNED" value="31" percent="0.2%" color="bg-red-500" textColor="text-red-600" />
            <HealthRow label="DELETED" value="113" percent="0.9%" color="bg-slate-500" textColor="text-slate-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">User management</h3>
            <p className="text-xs text-slate-500">Roles, status and recent activity</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input className="pl-9 h-9 w-64 bg-slate-50 rounded-full border-slate-200" placeholder="Search users" />
            </div>
            <Button variant="outline" size="sm" className="h-9 rounded-full px-4"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Last Active</th>
                <th className="px-6 py-4 font-bold">Joined</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <UserRow initials="MC" name="Maya Chen" email="maya@northstar.design" role="USER" status="ACTIVE" statusColor="text-green-600 bg-green-50" active="2m ago" joined="Mar 18, 2024" />
              <UserRow initials="JL" name="Jamie Lee" email="jamie@fieldwork.co" role="USER" status="ACTIVE" statusColor="text-green-600 bg-green-50" active="14m ago" joined="Apr 02, 2024" />
              <UserRow initials="EV" name="Elena Vova" email="elena@leochat.app" role="ADMIN" status="ACTIVE" statusColor="text-green-600 bg-green-50" active="Now" joined="Jan 01, 2024" />
              <UserRow initials="RB" name="Riley Brooks" email="riley@northstar.design" role="USER" status="DISABLED" statusColor="text-orange-600 bg-orange-50" active="12d ago" joined="May 22, 2024" />
              <UserRow initials="KM" name="Kai Monroe" email="kai@monroe.io" role="USER" status="BANNED" statusColor="text-red-600 bg-red-50" active="28d ago" joined="Jun 08, 2024" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function StatCard({ title, value, subtitle, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
        <div className="p-2 rounded-lg bg-slate-50">{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs text-slate-500 font-medium">{subtitle}</div>
    </div>
  );
}

function HealthRow({ label, value, percent, color, textColor }: any) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${color.replace('bg-', 'bg-opacity-20 bg-')} ${textColor}`}>
        {label}
      </div>
      <div className="flex-1 flex justify-end items-center space-x-6">
        <span className="font-semibold">{value}</span>
        <span className="text-slate-400 text-xs w-8 text-right">{percent}</span>
      </div>
    </div>
  );
}

function UserRow({ initials, name, email, role, status, statusColor, active, joined }: any) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
            {initials}
          </div>
          <div>
            <div className="font-semibold">{name}</div>
            <div className="text-[10px] text-slate-500">{email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 font-medium text-xs text-slate-600">{role}</td>
      <td className="px-6 py-4">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${statusColor}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-xs text-slate-500">{active}</td>
      <td className="px-6 py-4 text-xs text-slate-500">{joined}</td>
      <td className="px-6 py-4 text-right">
        <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
