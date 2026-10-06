import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Search, UserPlus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NewChatPage = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <header className="h-16 border-b border-slate-100 flex items-center px-4 shrink-0 bg-white">
        <Button variant="ghost" size="icon" asChild className="mr-4 text-slate-500">
          <Link to="/app"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <h2 className="font-semibold text-base">New Direct Message</h2>
      </header>

      <div className="p-6 shrink-0 border-b border-slate-100 bg-slate-50/50">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input className="pl-10 h-12 bg-white text-base rounded-xl border-slate-200" placeholder="Search by name or email..." />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Suggestions</p>
        
        <UserRow name="Alex Johnson" handle="@alexj" status="ONLINE" initials="AJ" color="bg-blue-100 text-blue-700" />
        <UserRow name="Maria Garcia" handle="@mgarcia" status="OFFLINE" initials="MG" color="bg-pink-100 text-pink-700" />
        <UserRow name="David Smith" handle="@dsmith" status="IN CALL" initials="DS" color="bg-yellow-100 text-yellow-700" />
      </div>
    </div>
  );
};

function UserRow({ name, handle, status, initials, color }: any) {
  const isOnline = status === 'ONLINE';
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${color}`}>
            {initials}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{name}</h3>
          <p className="text-sm text-slate-500">{handle}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
        <UserPlus className="w-5 h-5 text-primary" />
      </Button>
    </div>
  );
}
