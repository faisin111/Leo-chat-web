import { Button } from '@/shared/ui/button';
import { Laptop, Smartphone, AlertTriangle } from 'lucide-react';

export const SessionsPage = () => {
  return (
    <div className="max-w-3xl w-full mx-auto p-8 overflow-y-auto">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Sessions & Devices</h1>
          <p className="text-slate-500">Manage the devices that are currently logged into your account.</p>
        </div>
        <Button variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none">
          Sign out all other devices
        </Button>
      </div>

      <div className="space-y-4">
        {/* Current Session */}
        <div className="p-6 bg-white rounded-2xl border border-primary/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 flex items-center">
                  Mac OS • Chrome
                  <span className="ml-3 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Current</span>
                </h3>
                <p className="text-sm text-slate-500 mt-1">San Francisco, CA • Active now</p>
                <p className="text-xs text-slate-400 mt-1">IP: 192.168.1.1</p>
              </div>
            </div>
          </div>
        </div>

        {/* Other Sessions */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">iOS • Safari</h3>
                <p className="text-sm text-slate-500 mt-1">San Francisco, CA • Last active 2 hours ago</p>
                <p className="text-xs text-slate-400 mt-1">IP: 104.28.10.12</p>
              </div>
            </div>
            <Button variant="outline" className="text-slate-600">Sign out</Button>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Windows • Edge</h3>
                <p className="text-sm text-slate-500 mt-1">New York, NY • Last active yesterday</p>
                <p className="text-xs text-slate-400 mt-1">IP: 66.249.65.10</p>
              </div>
            </div>
            <Button variant="outline" className="text-slate-600">Sign out</Button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start space-x-3 text-orange-800">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-orange-600" />
        <p className="text-sm">If you see a device you don't recognize, sign out immediately and change your password to secure your account.</p>
      </div>
    </div>
  );
};
