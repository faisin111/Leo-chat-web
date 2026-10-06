import { Button } from '@/shared/ui/button';
import { Search, MessageSquare, Filter } from 'lucide-react';
import { Input } from '@/shared/ui/input';

export const ConversationsPage = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Conversations</h1>
          <p className="text-sm text-slate-500">Metadata and moderation limits for active chats</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9 bg-white" placeholder="Search by ID or tags..." />
          </div>
          <Button variant="outline" className="bg-white"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
        </div>
        
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No active conversations found</h3>
          <p className="text-slate-500 max-w-sm">Adjust your filters or wait for users to start chatting.</p>
        </div>
      </div>
    </div>
  );
};
