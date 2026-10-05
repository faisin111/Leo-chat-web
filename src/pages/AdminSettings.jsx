import { LayoutGrid, Users, Flag, MessageSquare, FileText, Settings, ShieldAlert, Save, RefreshCw, Upload, Lock, Shield, Mail, Trash2 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function AdminSettings() {
  const location = useLocation();

  return (
    <div className="flex-1 flex h-full">
      {/* Admin Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col bg-[#1c2233] text-gray-400 border-r border-[#111827]">
        <div className="p-6 pb-2">
          <h2 className="text-xl font-semibold text-white mb-1">Admin console</h2>
          <p className="text-xs text-gray-400">Platform owner workspace</p>
        </div>
        
        <div className="p-4 flex-1">
          <nav className="space-y-1">
            <Link to="/app/admin" className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-lg text-sm font-medium transition-colors">
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4" />
                Overview
              </div>
            </Link>
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
            <Link to="/app/admin/settings" className="w-full flex items-center gap-3 px-3 py-2.5 bg-white/10 text-white rounded-lg text-sm font-medium transition-colors">
              <Settings className="w-4 h-4" />
              Platform settings
            </Link>
          </nav>
        </div>
        
        <div className="p-4">
          <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
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
        <div className="h-24 border-b border-gray-100 flex items-center justify-between px-10 shrink-0 bg-white shadow-sm z-10 sticky top-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded tracking-widest uppercase">Admin</span>
            </div>
            <p className="text-sm text-gray-500">Configure global workspace preferences and security policies.</p>
          </div>
          <button className="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors shadow-sm flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>

        <div className="p-10 max-w-5xl space-y-8">
          
          {/* General Configuration */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-400" /> General Configuration
            </h3>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Workspace Name</label>
                <input type="text" defaultValue="Northstar Studio" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-gray-50 focus:bg-white transition-colors" />
                <p className="text-xs text-gray-500 mt-2">This is the name displayed to all users.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Workspace URL</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 sm:text-sm">
                    chatapp.com/
                  </span>
                  <input type="text" defaultValue="northstar" className="flex-1 block w-full rounded-none rounded-r-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-gray-50 focus:bg-white transition-colors" />
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-8"></div>

            <h4 className="text-sm font-semibold text-gray-900 mb-4">Workspace Branding</h4>
            <div className="flex gap-8 items-center">
              <div className="w-24 h-24 rounded-2xl bg-brand-50 border-2 border-dashed border-brand-200 flex flex-col items-center justify-center text-brand-500 cursor-pointer hover:bg-brand-100 transition-colors">
                <Upload className="w-6 h-6 mb-2" />
                <span className="text-xs font-medium">Logo</span>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Brand Color</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#6366f1] shadow-inner border border-black/10"></div>
                  <input type="text" defaultValue="#6366f1" className="w-32 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 font-mono focus:outline-none focus:border-brand-500" />
                </div>
                <p className="text-xs text-gray-500 mt-3">Used for buttons, active states, and highlights across the platform.</p>
              </div>
            </div>
          </div>

          {/* Security & Access */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-400" /> Security & Access Policies
            </h3>

            <div className="space-y-6">
              <div className="flex items-start justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <div className="flex gap-4">
                  <Lock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Require Two-Factor Authentication (2FA)</h4>
                    <p className="text-xs text-gray-500 mt-1">Force all users in this workspace to set up 2FA before they can log in.</p>
                  </div>
                </div>
                <div className="w-10 h-6 bg-brand-500 rounded-full relative shrink-0 cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>

              <div className="flex items-start justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <div className="flex gap-4">
                  <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">Allowed Email Domains</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-3">Only users with these email domains can join the workspace.</p>
                    <input type="text" defaultValue="@northstar.design, @northstar.dev" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <div className="flex gap-4">
                  <RefreshCw className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">Session Timeout</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-3">Automatically log users out after a period of inactivity.</p>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand-500">
                      <option>14 days (Default)</option>
                      <option>7 days</option>
                      <option>24 hours</option>
                      <option>Never</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Retention (Danger Zone) */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <h3 className="text-lg font-bold text-red-600 mb-6 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Data Retention Policies
            </h3>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Message History</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500">
                  <option>Keep everything forever</option>
                  <option>Delete after 1 year</option>
                  <option>Delete after 90 days</option>
                  <option>Delete after 30 days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">File Uploads</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500">
                  <option>Keep everything forever</option>
                  <option>Delete files larger than 50MB after 1 year</option>
                  <option>Delete all files after 90 days</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
