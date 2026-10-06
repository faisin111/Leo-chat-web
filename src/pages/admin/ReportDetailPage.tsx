import { Button } from '@/shared/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export const ReportDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 h-full">
      <div className="mb-8 flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild className="text-slate-500">
          <Link to="/app/admin/reports"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Report Details</h1>
          <p className="text-sm text-slate-500">Report ID: {id || 'RP-8910'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Report Not Found or Resolved</h3>
        <p className="text-slate-500 max-w-sm">This report has either been completely resolved or the content has been deleted by the user.</p>
        <Button className="mt-6" asChild>
          <Link to="/app/admin/reports">Return to Reports</Link>
        </Button>
      </div>
    </div>
  );
};
