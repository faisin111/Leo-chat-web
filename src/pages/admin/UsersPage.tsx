import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Search, MoreVertical, Filter, Download } from 'lucide-react';

export const UsersPage = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">View and manage all platform users</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="bg-white"><Download className="w-4 h-4 mr-2" /> Export</Button>
          <Button>Add User</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9 bg-white" placeholder="Search by name, email..." />
          </div>
          <Button variant="outline" className="bg-white"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AdminUserRow name="Alice Freeman" email="alice@example.com" role="ADMIN" status="Active" date="Oct 12, 2025" />
              <AdminUserRow name="Bob Smith" email="bob@example.com" role="USER" status="Active" date="Nov 2, 2025" />
              <AdminUserRow name="Charlie Davis" email="charlie@example.com" role="USER" status="Suspended" date="Dec 15, 2025" />
              <AdminUserRow name="Diana Ross" email="diana@example.com" role="USER" status="Active" date="Jan 5, 2026" />
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
          <span>Showing 1 to 10 of 2,492 users</span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

function AdminUserRow({ name, email, role, status, date }: any) {
  const isSuspended = status === 'Suspended';
  const isAdmin = role === 'ADMIN';

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
            {name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-slate-900 group-hover:text-primary transition-colors cursor-pointer">{name}</div>
            <div className="text-xs text-slate-500">{email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
          {role}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center space-x-1.5 ${isSuspended ? 'text-red-600' : 'text-green-600'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-red-600' : 'bg-green-600'}`}></span>
          <span>{status}</span>
        </span>
      </td>
      <td className="px-6 py-4">{date}</td>
      <td className="px-6 py-4 text-right">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
}
