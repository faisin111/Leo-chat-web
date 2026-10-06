import { AnimatedOutlet } from './AnimatedOutlet';
import { Search, PenSquare, Hash } from 'lucide-react';
import { Input } from '@/shared/ui/input';

export default function ChatLayout() {
  return (
    <div className="flex h-full w-full bg-slate-50">
      {/* Messages Sidebar */}
      <aside className="w-[340px] border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Messages</h2>
              <p className="text-xs text-green-600 font-medium">● 8 people online</p>
            </div>
            <button className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
              <PenSquare className="w-4 h-4" />
            </button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9 bg-slate-100/50 border-none rounded-full h-10" placeholder="Search conversations" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-slate-400 text-[10px] font-bold">
              <span className="px-1.5 py-0.5 rounded bg-slate-200">⌘</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200">K</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-6 text-xs font-semibold">
            <button className="px-4 py-1.5 rounded-full bg-slate-900 text-white">All 12</button>
            <button className="px-4 py-1.5 rounded-full text-slate-500 hover:bg-slate-100">Unread 7</button>
            <button className="px-4 py-1.5 rounded-full text-slate-500 hover:bg-slate-100">Groups</button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Pinned</p>
              <div className="space-y-1">
                <ChatItem 
                  initials="PR" 
                  name="Product room" 
                  message="Maya: Updated the launch checklist" 
                  time="10:45" 
                  badge="3"
                  active 
                  color="bg-purple-100 text-purple-700" 
                />
                <ChatItem 
                  initials="MC" 
                  name="Maya Chen" 
                  message="Typing..." 
                  time="10:44" 
                  color="bg-green-100 text-green-700" 
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Recent</p>
              <div className="space-y-1">
                <ChatItem 
                  initials="JL" 
                  name="Jamie Lee" 
                  message="Shared: research-notes.pdf" 
                  time="9:28" 
                  badge="1"
                  color="bg-yellow-100 text-yellow-700" 
                />
                <ChatItem 
                  initials="DE" 
                  name="Design critique" 
                  message="Nina: Love the quieter hierarchy" 
                  time="Yesterday" 
                  badge="3"
                  color="bg-indigo-100 text-indigo-700" 
                />
                <ChatItem 
                  initials="NK" 
                  name="Nina Kapoor" 
                  message="You: Let's sync tomorrow" 
                  time="Yesterday" 
                  color="bg-pink-100 text-pink-700" 
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button className="flex items-center text-xs text-slate-500 hover:text-slate-900 font-medium w-full">
              <Hash className="w-4 h-4 mr-2" />
              Archived conversations (4)
            </button>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 bg-white relative flex flex-col">
        <AnimatedOutlet />
      </main>
    </div>
  );
}

function ChatItem({ initials, name, message, time, badge, active = false, color = 'bg-slate-100 text-slate-700' }: any) {
  return (
    <button className={`w-full flex items-start text-left p-3 rounded-2xl transition-colors ${active ? 'bg-primary/5' : 'hover:bg-slate-50'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mr-3 ${color}`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="font-semibold text-sm truncate pr-2">{name}</p>
          <span className={`text-[10px] whitespace-nowrap ${active ? 'text-primary font-bold' : 'text-slate-400'}`}>{time}</span>
        </div>
        <p className={`text-xs truncate ${active ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>{message}</p>
      </div>
      {badge && (
        <div className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0 mt-3">
          {badge}
        </div>
      )}
    </button>
  );
}
