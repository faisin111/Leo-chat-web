import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Search, Plus, UserPlus, Clock, Users, Ban } from 'lucide-react';

export const PeoplePage = () => {
  return (
    <div className="flex h-full w-full bg-slate-50">
      {/* People Sidebar */}
      <aside className="w-[300px] border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-6">People</h2>
          
          <Button variant="outline" className="w-full justify-start text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 mb-6">
            <Plus className="w-4 h-4 mr-2" /> New conversation
          </Button>

          <nav className="flex flex-col space-y-1">
            <PeopleNavItem icon={<Users className="w-4 h-4" />} label="All people" count="248" active />
            <PeopleNavItem icon={<Clock className="w-4 h-4" />} label="Recent" />
            <PeopleNavItem icon={<UserPlus className="w-4 h-4" />} label="Connections" />
            <PeopleNavItem icon={<Ban className="w-4 h-4" />} label="Blocked" />
          </nav>

          <div className="mt-8 p-4 rounded-xl bg-slate-900 text-white shadow-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-slate-400" />
              <h4 className="text-sm font-semibold text-white">Start a group</h4>
            </div>
            <p className="text-xs text-slate-400 mb-3">Bring several people into one focused conversation.</p>
            <button className="text-xs font-semibold text-primary hover:text-white transition-colors">Create group →</button>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto flex">
          <div className="flex-1 pr-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold">Start a conversation</h1>
              <Button variant="outline" className="rounded-full bg-white shadow-sm">
                <Users className="w-4 h-4 mr-2" /> Create a group
              </Button>
            </div>
            <p className="text-slate-500 text-sm mb-6">Find people by name, email or @username.</p>
            
            <div className="flex space-x-3 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input className="pl-9 h-12 bg-white rounded-xl shadow-sm border-slate-200" placeholder="Search for Maya, @maya or maya@northstar.design" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-slate-400 text-[10px] font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100">⌘</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100">K</span>
                </div>
              </div>
              <Button className="h-12 px-6 rounded-xl shadow-sm">Search</Button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500">5 people matching "ma"</span>
              <span className="text-xs text-slate-400">Sort: <strong className="text-slate-600">Most relevant ⌄</strong></span>
            </div>

            <div className="space-y-3">
              {/* Active selection */}
              <div className="flex items-center p-3 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm mr-4 relative">
                  MC
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-sm text-slate-900">Maya Chen <span className="text-slate-500 font-normal">@mayac</span></p>
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">ONLINE</span>
                  </div>
                  <p className="text-xs text-slate-500">Design systems · Available</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                  ✓
                </div>
              </div>

              {/* Other results */}
              <PeopleResult initials="MA" name="Marco Alvarez" handle="@marcoa" status="ONLINE" subtitle="Engineering · In a meeting" color="bg-indigo-100 text-indigo-700" />
              <PeopleResult initials="MS" name="Mara Singh" handle="@marasingh" subtitle="Research · Active 12m ago" color="bg-purple-100 text-purple-700" />
              <PeopleResult initials="MM" name="Malik Morgan" handle="@malikm" subtitle="Customer success · Active yesterday" color="bg-yellow-100 text-yellow-700" />
              <PeopleResult initials="AM" name="Amelia Moss" handle="@ameliam" subtitle="Operations · Active yesterday" color="bg-blue-100 text-blue-700" />
            </div>
          </div>

          {/* Right Preview Panel */}
          <div className="w-[320px] shrink-0">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-8 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-3xl mb-4 relative shadow-sm">
                MC
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></span>
              </div>
              <h3 className="text-xl font-bold mb-1">Maya Chen</h3>
              <p className="text-xs text-slate-500 mb-2">@mayac · maya@northstar.design</p>
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider bg-green-50 px-3 py-1 rounded-full mb-6">ACTIVE</span>

              <p className="text-sm text-slate-600 mb-8 px-4 leading-relaxed">
                Design systems lead. Turning complex product surfaces into calm, useful patterns.
              </p>

              <div className="w-full space-y-4 text-xs text-left mb-8">
                <div className="flex items-center text-slate-500"><span className="w-4 mr-3 text-center">📍</span> San Francisco, CA</div>
                <div className="flex items-center text-slate-500"><span className="w-4 mr-3 text-center">🕒</span> Local time 10:48</div>
                <div className="flex items-center text-slate-500"><span className="w-4 mr-3 text-center">👥</span> 4 shared groups</div>
                <div className="flex items-center text-slate-500"><span className="w-4 mr-3 text-center">📅</span> Joined Mar 2024</div>
              </div>

              <div className="w-full">
                <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider text-left">Shared groups</p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">PR</div>
                    <span className="font-medium text-slate-700">Product room</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">DC</div>
                    <span className="font-medium text-slate-700">Design critique</span>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-2 mt-auto">
                <Button className="w-full rounded-xl h-10 shadow-sm text-sm">Message Maya</Button>
                <Button variant="outline" className="w-full rounded-xl h-10 shadow-sm text-sm border-slate-200">View full profile</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

function PeopleNavItem({ icon, label, active = false, count }: any) {
  return (
    <button className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors font-medium ${active ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
      <div className="flex items-center space-x-3">
        {icon}
        <span>{label}</span>
      </div>
      {count && <span className="text-xs text-slate-400 font-bold">{count}</span>}
    </button>
  );
}

function PeopleResult({ initials, name, handle, status, subtitle, color }: any) {
  return (
    <div className="flex items-center p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors cursor-pointer shadow-sm">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-4 relative ${color}`}>
        {initials}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <p className="font-semibold text-sm text-slate-900">{name} <span className="text-slate-500 font-normal">{handle}</span></p>
          {status && <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">{status}</span>}
        </div>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <Button variant="outline" size="sm" className="rounded-full shadow-sm text-xs h-8 px-4 border-slate-200">Message</Button>
    </div>
  );
}
