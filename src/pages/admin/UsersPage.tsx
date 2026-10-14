import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, type AdminUserItem } from '@/features/admin';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Search, MoreVertical, Filter, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: () => adminApi.getUsers({ q: searchTerm.trim() || undefined, limit: 50 }),
  });

  const users = data?.items || [];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">View and manage all platform users</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="bg-white">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button>Add User</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white"
              placeholder="Search by name, email..."
            />
          </div>
          <Button variant="outline" className="bg-white">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => <AdminUserRow key={u.id} user={u} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
          <span>Showing {users.length} users</span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!data?.hasMore}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

function AdminUserRow({ user }: { user: AdminUserItem }) {
  const isSuspended = user.status === 'DISABLED' || user.status === 'BANNED';
  const isAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';
  const name = user.displayName || user.username;
  const initials = name.substring(0, 2).toUpperCase();
  const joinedDate = user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—';

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs overflow-hidden">
            {user.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <div className="font-medium text-slate-900 group-hover:text-primary transition-colors cursor-pointer">
              {name}
            </div>
            <div className="text-xs text-slate-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center space-x-1.5 ${
            isSuspended ? 'text-red-600' : 'text-green-600'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-red-600' : 'bg-green-600'}`}
          ></span>
          <span>{user.status}</span>
        </span>
      </td>
      <td className="px-6 py-4">{joinedDate}</td>
      <td className="px-6 py-4 text-right">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
}
