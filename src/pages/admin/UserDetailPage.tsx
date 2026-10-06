import { Button } from '@/shared/ui/button';
import { ArrowLeft, User, Shield, Mail, Ban, LogOut } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export const UserDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 h-full">
      <div className="mb-8 flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild className="text-slate-500">
          <Link to="/app/admin/users"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
          <p className="text-sm text-slate-500">ID: {id || '1092'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
            <div className="w-24 h-24 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-3xl mx-auto mb-4">
              AF
            </div>
            <h2 className="text-xl font-bold text-slate-900">Alice Freeman</h2>
            <p className="text-slate-500 mb-6">@alicef</p>
            
            <div className="flex flex-col space-y-2">
              <Button variant="outline" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"><Ban className="w-4 h-4 mr-2" /> Suspend User</Button>
              <Button variant="outline" className="w-full"><LogOut className="w-4 h-4 mr-2" /> Force Logout</Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 flex items-center"><Mail className="w-4 h-4 mr-2" /> Email</span>
                <span className="font-medium text-slate-900">alice@example.com</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 flex items-center"><Shield className="w-4 h-4 mr-2" /> Role</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">ADMIN</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 flex items-center"><User className="w-4 h-4 mr-2" /> Status</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
