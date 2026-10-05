import { Users, Clock, Link as LinkIcon, Slash, Search, MessageSquare, MapPin, Calendar, ChevronDown, Check, UserPlus } from 'lucide-react'

export default function People() {
  return (
    <div className="flex-1 flex h-full">
      {/* People Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-gray-100 flex flex-col bg-white">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">People</h2>
          <button className="p-2 text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors">
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4">
          <button className="w-full mb-6 flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-lg text-sm font-medium transition-colors border border-brand-100">
            <MessageSquare className="w-4 h-4" />
            New conversation
          </button>
          
          <nav className="space-y-1 mb-8">
            <button className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 text-gray-900 rounded-lg text-sm font-medium">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-gray-500" />
                All people
              </div>
              <span className="text-xs font-bold text-gray-500">248</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
              <Clock className="w-4 h-4 text-gray-400" />
              Recent
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
              <LinkIcon className="w-4 h-4 text-gray-400" />
              Connections
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
              <Slash className="w-4 h-4 text-gray-400" />
              Blocked
            </button>
          </nav>
          
          <div className="bg-surface-dark text-white p-5 rounded-2xl relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 group-hover:bg-brand-500/30 transition-colors"></div>
            <div className="relative z-10">
              <div className="bg-white/10 w-8 h-8 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Start a group</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Bring several people into one focused conversation.
              </p>
              <span className="text-xs font-medium text-white flex items-center gap-1 hover:gap-2 transition-all">
                Create group &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Directory Area */}
      <div className="flex-1 flex flex-col bg-gray-50/50">
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Start a conversation</h1>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors shadow-sm">
              <Users className="w-4 h-4" />
              Create a group
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-8">Find people by name, email or @username.</p>
          
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                defaultValue="ma"
                placeholder="Search for Maya, @maya or maya@northstar.design" 
                className="w-full bg-white border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl pl-10 pr-12 py-3 text-sm outline-none transition-all shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">⌘K</div>
            </div>
            <button className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2">
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
          
          <div className="flex items-center justify-between mb-4 text-xs">
            <span className="text-gray-500 font-medium">5 people matching "ma"</span>
            <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium">
              Sort: Most relevant <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Person 1 (Selected) */}
            <div className="bg-brand-50 border border-brand-200 p-4 rounded-xl flex items-center justify-between shadow-sm cursor-pointer relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500"></div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0 relative border-2 border-white shadow-sm">
                  MC
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-gray-900">Maya Chen</h3>
                    <span className="text-xs text-gray-500">@mayac</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded tracking-wider">ONLINE</span>
                  </div>
                  <p className="text-sm text-gray-600">Design systems • Available</p>
                  <p className="text-xs text-gray-400 mt-1">4 shared groups</p>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-sm">
                <Check className="w-4 h-4" />
              </div>
            </div>

            {/* Person 2 */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:border-brand-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0 relative">
                  MA
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-gray-900">Marco Alvarez</h3>
                    <span className="text-xs text-gray-500">@marcoa</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded tracking-wider">ONLINE</span>
                  </div>
                  <p className="text-sm text-gray-600">Engineering • In a meeting</p>
                  <p className="text-xs text-gray-400 mt-1">2 shared groups</p>
                </div>
              </div>
              <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm">
                Message
              </button>
            </div>

            {/* Person 3 */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:border-brand-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg shrink-0 relative">
                  MS
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-gray-900">Mara Singh</h3>
                    <span className="text-xs text-gray-500">@marasingh</span>
                  </div>
                  <p className="text-sm text-gray-600">Research • Active 12m ago</p>
                  <p className="text-xs text-gray-400 mt-1">1 shared group</p>
                </div>
              </div>
              <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm">
                Message
              </button>
            </div>
            
            {/* Person 4 */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:border-brand-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg shrink-0 relative">
                  MM
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-gray-900">Malik Morgan</h3>
                    <span className="text-xs text-gray-500">@malikm</span>
                  </div>
                  <p className="text-sm text-gray-600">Customer success • Active yesterday</p>
                  <p className="text-xs text-gray-400 mt-1">No shared groups</p>
                </div>
              </div>
              <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm">
                Message
              </button>
            </div>

            {/* Person 5 */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:border-brand-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0 relative">
                  AM
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-gray-900">Amelia Moss</h3>
                    <span className="text-xs text-gray-500">@ameliam</span>
                  </div>
                  <p className="text-sm text-gray-600">Operations • Active yesterday</p>
                  <p className="text-xs text-gray-400 mt-1">3 shared groups</p>
                </div>
              </div>
              <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm">
                Message
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Right Profile Pane */}
      <div className="w-[340px] flex-shrink-0 border-l border-gray-100 bg-white overflow-y-auto">
        <div className="p-8 flex flex-col items-center text-center border-b border-gray-100">
          <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-3xl mb-4 relative shadow-sm border-4 border-white">
            MC
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Maya Chen</h2>
          <p className="text-sm text-gray-500 mb-3">@mayac • maya@northstar.design</p>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded tracking-widest uppercase mb-6">Active</span>
          
          <p className="text-sm text-gray-700 leading-relaxed max-w-[260px]">
            Design systems lead. Turning complex product surfaces into calm, useful patterns.
          </p>
        </div>
        
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <span>San Francisco, CA</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            <span>Local time 10:48</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Users className="w-4 h-4 text-gray-400 shrink-0" />
            <span>4 shared groups</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span>Joined Mar 2024</span>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Shared groups</h3>
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">PR</div>
              <span className="text-sm font-medium text-gray-900">Product room</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">DC</div>
              <span className="text-sm font-medium text-gray-900">Design critique</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">LC</div>
              <span className="text-sm font-medium text-gray-900">Launch crew</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-colors shadow-sm">
              <MessageSquare className="w-4 h-4" />
              Message Maya
            </button>
            <button className="w-full flex items-center justify-center py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg font-medium transition-colors shadow-sm">
              View full profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
