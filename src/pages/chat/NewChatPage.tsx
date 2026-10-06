import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Search, UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useStartDirectMessage } from '@/features/chat/api/use-start-direct-message';

export const NewChatPage = () => {
  const [targetUserId, setTargetUserId] = useState('');
  const startDm = useStartDirectMessage();

  const handleStartChat = (id: string) => {
    if (!id.trim()) return;
    startDm.mutate(id);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <header className="h-16 border-b border-slate-100 flex items-center px-4 shrink-0 bg-white">
        <Button variant="ghost" size="icon" asChild className="mr-4 text-slate-500">
          <Link to="/app"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <h2 className="font-semibold text-base">New Direct Message</h2>
      </header>

      <div className="p-6 shrink-0 border-b border-slate-100 bg-slate-50/50">
        <form 
          className="relative flex items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleStartChat(targetUserId);
          }}
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              className="pl-10 h-12 bg-white text-base rounded-xl border-slate-200" 
              placeholder="Enter User ID (UUID) to start a chat..." 
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!targetUserId.trim() || startDm.isPending}
            className="h-12 px-6 rounded-xl"
          >
            {startDm.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Chat'}
          </Button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Suggestions (Demo only)</p>
        
        <UserRow name="Alex Johnson" handle="@alexj" status="ONLINE" initials="AJ" color="bg-blue-100 text-blue-700" onClick={() => handleStartChat('dummy-uuid-alex')} isPending={startDm.isPending && startDm.variables === 'dummy-uuid-alex'} />
        <UserRow name="Maria Garcia" handle="@mgarcia" status="OFFLINE" initials="MG" color="bg-pink-100 text-pink-700" onClick={() => handleStartChat('dummy-uuid-maria')} isPending={startDm.isPending && startDm.variables === 'dummy-uuid-maria'} />
      </div>
    </div>
  );
};

function UserRow({ name, handle, status, initials, color, onClick, isPending }: any) {
  const isOnline = status === 'ONLINE';
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
    >
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
        {isPending ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
      </Button>
    </div>
  );
}
