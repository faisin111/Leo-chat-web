import { MessageSquare } from 'lucide-react';

export const ChatHomePage = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-white h-full text-slate-400">
    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
      <MessageSquare className="w-8 h-8 text-slate-300" />
    </div>
    <h3 className="text-lg font-medium text-slate-600 mb-1">Your messages</h3>
    <p className="text-sm">Select a conversation or start a new one</p>
  </div>
);
