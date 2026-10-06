import { LayoutGrid, Users, Flag, MessageSquare, FileText, Settings, Download, Calendar, Search, SlidersHorizontal, MoreHorizontal, ShieldAlert, TrendingUp, Activity, AlertOctagon } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Admin() {
  return (
    <div className="flex-1 flex h-full">
      {/* Admin Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col bg-surface-dark/90 text-gray-400 border-r border-surface-dark">
        <div className="p-6 pb-2">
          <h2 className="text-xl font-semibold text-white mb-1">Admin console</h2>
          <p className="text-xs text-gray-400">Platform owner workspace</p>
        </div>
        
        <div className="p-4 flex-1">
          <nav className="space-y-1">
            <button className="w-full flex items-center justify-between px-3 py-2.5 bg-white/10 text-white rounded-lg text-sm font-medium transition-colors">
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4" />
                Overview
              </div>
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-lg text-sm font-medium transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                Users
              </div>
              <span className="text-xs font-medium bg-white/10 px-1.5 py-0.5 rounded">248</span>
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-lg text-sm font-medium transition-colors">
              <div className="flex items-center gap-3">
                <Flag className="w-4 h-4" />
                Moderation
              </div>
              <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">6</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-lg text-sm font-medium transition-colors">
              <MessageSquare className="w-4 h-4" />
              Conversations
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-lg text-sm font-medium transition-colors">
              <FileText className="w-4 h-4" />
              Audit logs
            </button>
            <Link to="/app/admin/settings" className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-lg text-sm font-medium transition-colors">
              <Settings className="w-4 h-4" />
              Platform settings
            </Link>
          </nav>
        </div>
        
        <div className="p-4">
          <div className="bg-surface-dark rounded-xl p-4 border border-white/5">
            <ShieldAlert className="w-5 h-5 text-indigo-400 mb-2" />
            <h4 className="text-sm font-semibold text-white mb-1">Privacy boundary</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Private messages are not readable by administrators. Only content attached to a user report may be reviewed.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-50/50 overflow-y-auto">
        <div className="p-8 pb-0 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">Platform overview</h1>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded tracking-widest uppercase">Owner Only</span>
              </div>
              <p className="text-sm text-gray-500">Operational health and trust signals for LeoChat.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors shadow-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                Last 30 days
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors shadow-sm">
                <Download className="w-4 h-4 text-gray-400" />
                Export report
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">Total Users</h3>
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 relative z-10">12,842</h2>
              <p className="text-xs font-medium text-brand-600 flex items-center gap-1 relative z-10">
                <TrendingUp className="w-3 h-3" /> &uarr; 8.4% this month
              </p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">Active Today</h3>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 relative z-10">8,916</h2>
              <p className="text-xs font-medium text-emerald-600 relative z-10">
                69.4% of users
              </p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">Messages Today</h3>
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 relative z-10">184.2k</h2>
              <p className="text-xs font-medium text-brand-600 flex items-center gap-1 relative z-10">
                <TrendingUp className="w-3 h-3" /> &uarr; 12.1% vs yesterday
              </p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">Open Reports</h3>
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <Flag className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 relative z-10">6</h2>
              <p className="text-xs font-medium text-red-500 relative z-10">
                2 high priority
              </p>
            </div>
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Platform activity</h3>
              <p className="text-xs text-gray-500 mb-8">Daily active users and messages</p>
              
              <div className="flex-1 flex items-end gap-3 px-2 h-40">
                {[40, 30, 45, 55, 60, 65, 75, 80, 70, 85, 90, 100, 95].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-1 group relative">
                    <div className="w-full bg-brand-100/50 rounded-sm" style={{ height: `${h * 0.7}%` }}></div>
                    <div className="w-full bg-brand-500 rounded-sm" style={{ height: `${h}%` }}></div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-6">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div> Active users
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                  <div className="w-2 h-2 rounded-full bg-brand-100"></div> Messages / 20
                </div>
              </div>
            </div>
            
            <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Account health</h3>
                <p className="text-xs text-gray-500 mb-6">Current user status mix</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded tracking-widest">ACTIVE</span>
                    <span className="text-sm font-semibold text-gray-900">12,614</span>
                    <span className="text-xs text-gray-400 font-medium">98.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded tracking-widest">DISABLED</span>
                    <span className="text-sm font-semibold text-gray-900">84</span>
                    <span className="text-xs text-gray-400 font-medium">0.7%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded tracking-widest">BANNED</span>
                    <span className="text-sm font-semibold text-gray-900">31</span>
                    <span className="text-xs text-gray-400 font-medium">0.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded tracking-widest">DELETED</span>
                    <span className="text-sm font-semibold text-gray-900">113</span>
                    <span className="text-xs text-gray-400 font-medium">0.9%</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">USER 12,841</span>
                <span className="text-xs font-bold text-purple-600">ADMIN 1</span>
              </div>
            </div>
          </div>
          
          {/* User Management Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-12">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">User management</h3>
                <p className="text-xs text-gray-500">Roles, status and recent activity</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search users" 
                    className="w-64 bg-gray-50 border border-transparent focus:bg-white focus:border-brand-500 rounded-lg pl-9 pr-10 py-2 text-sm outline-none transition-all shadow-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">⌘K</div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors shadow-sm">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-gray-400 uppercase tracking-widest bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Last Active</th>
                    <th className="px-6 py-4 font-semibold">Joined</th>
                    <th className="px-6 py-4 font-semibold text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Row 1 */}
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs relative">
                          MC
                          <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Maya Chen</p>
                          <p className="text-[11px] text-gray-500">maya@northstar.design</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">USER</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded tracking-widest uppercase">Active</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">2m ago</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">Mar 18, 2024</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs relative">
                          JL
                          <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Jamie Lee</p>
                          <p className="text-[11px] text-gray-500">jamie@fieldwork.co</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">USER</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded tracking-widest uppercase">Active</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">14m ago</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">Apr 02, 2024</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs relative">
                          EV
                          <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Elena Voss</p>
                          <p className="text-[11px] text-gray-500">owner@leochat.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded tracking-widest uppercase">Admin</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded tracking-widest uppercase">Active</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">Now</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">Jan 01, 2024</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs relative">
                          RB
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Riley Brooks</p>
                          <p className="text-[11px] text-gray-500">riley@archived.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">USER</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded tracking-widest uppercase">Disabled</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">12d ago</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">May 22, 2024</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  
                  {/* Row 5 */}
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs relative">
                          KM
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Kai Monroe</p>
                          <p className="text-[11px] text-gray-500">kai@northloop.io</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">USER</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded tracking-widest uppercase">Banned</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">28d ago</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">Jun 08, 2024</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-medium">Showing 5 of 12,842 users</span>
              <div className="flex items-center gap-1 text-[11px] font-medium">
                <button className="w-6 h-6 flex items-center justify-center text-brand-600 bg-brand-50 rounded">1</button>
                <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded">2</button>
                <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded">3</button>
                <span className="px-1 text-gray-400">...</span>
                <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded">257</button>
                <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded ml-1">&gt;</button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
