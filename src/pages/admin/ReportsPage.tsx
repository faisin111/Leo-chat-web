import { Button } from '@/shared/ui/button';
import { CheckCircle, Search } from 'lucide-react';
import { Input } from '@/shared/ui/input';

export const ReportsPage = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Moderation Reports</h1>
          <p className="text-sm text-slate-500">Review and action user-reported content</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9 bg-white" placeholder="Search reports..." />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="bg-white">Pending</Button>
            <Button variant="ghost" size="sm">Resolved</Button>
          </div>
        </div>
        
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">All caught up!</h3>
          <p className="text-slate-500 max-w-sm">There are currently no pending moderation reports requiring your attention.</p>
        </div>
      </div>
    </div>
  );
};
