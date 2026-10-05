import { User, MonitorSmartphone, Bell, Shield, Ban, Palette, MessageSquare, ChevronRight, Upload, Laptop, Smartphone, Monitor, MoreHorizontal, AtSign, MapPin, Mail } from 'lucide-react'
import { APP_STRINGS } from '../constants/strings'

export default function Settings() {
  return (
    <div className="flex-1 flex h-full">
      {/* Settings Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col bg-white">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-sm">AR</div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Alex Rivera</h3>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">alex@northstar.design</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium transition-colors">
              <User className="w-4 h-4" />
              Profile & account
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
              <div className="flex items-center gap-3">
                <MonitorSmartphone className="w-4 h-4 text-gray-400" />
                Sessions & devices
              </div>
              <span className="text-xs font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">3</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
              <Bell className="w-4 h-4 text-gray-400" />
              Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
              <Shield className="w-4 h-4 text-gray-400" />
              Security & privacy
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
              <Ban className="w-4 h-4 text-gray-400" />
              Blocked users
            </button>
            <div className="h-px bg-gray-100 my-2 mx-3"></div>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
              <Palette className="w-4 h-4 text-gray-400" />
              Appearance
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              Messaging
            </button>
          </nav>
        </div>
        
        <div className="p-6 pt-0 mt-auto">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              </div>
              <h4 className="text-xs font-bold text-emerald-700 tracking-wide uppercase">Account Active</h4>
            </div>
            <p className="text-xs text-emerald-800/70 ml-6">Member since March 18, 2024.</p>
          </div>
        </div>
      </div>

      {/* Main Settings Area */}
      <div className="flex-1 flex flex-col bg-gray-50/50">
        <div className="h-24 border-b border-gray-100 flex items-center justify-between px-10 shrink-0 bg-white shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile & account</h1>
            <p className="text-sm text-gray-500">Manage your identity, privacy and sign-in preferences.</p>
          </div>
          <button className="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors shadow-sm">
            Save changes
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 flex gap-8">
          <div className="flex-1 max-w-2xl space-y-6">
            
            {/* Public Profile Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Public profile</h3>
                  <p className="text-xs text-gray-500">This information is visible to people who can find you.</p>
                </div>
                <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm transition-colors">
                  Preview
                </button>
              </div>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-2xl relative">
                  AR
                  <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-2">
                    <Upload className="w-4 h-4" />
                    Upload new photo
                  </button>
                  <p className="text-xs text-gray-400">JPG or PNG • 4 MB max</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Display name</label>
                  <input type="text" defaultValue="Alex Rivera" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Username</label>
                  <input type="text" defaultValue="@alexr" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-700 mb-2">Bio</label>
                <input type="text" defaultValue="Product designer helping teams make clearer decisions." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" defaultValue="San Francisco, CA" className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Time zone</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" defaultValue="Pacific Time (UTC-8)" className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sessions & Devices Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Sessions & devices</h3>
                  <p className="text-xs text-gray-500">You're signed in on 3 devices. Review anything you don't recognize.</p>
                </div>
                <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm transition-colors">
                  Sign out others
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <Laptop className="w-6 h-6 text-gray-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">MacBook Pro • Chrome</h4>
                      <p className="text-xs text-gray-500">San Francisco, CA • Current session</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded tracking-widest uppercase">CURRENT</span>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-4">
                    <Smartphone className="w-6 h-6 text-gray-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">iPhone 16 Pro • iOS</h4>
                      <p className="text-xs text-gray-500">San Francisco, CA • Active 8m ago</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded tracking-widest uppercase">TRUSTED</span>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-4">
                    <Monitor className="w-6 h-6 text-gray-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Windows PC • Edge</h4>
                      <p className="text-xs text-gray-500">Oakland, CA • Active yesterday</p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
            
          </div>
          
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* Notifications */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-1">Notifications</h3>
              <p className="text-xs text-gray-500 mb-6">Choose how {APP_STRINGS?.appName || 'ChatApp'} gets your attention.</p>
              
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Direct messages</h4>
                      <p className="text-xs text-gray-500">Notify for every new direct message</p>
                    </div>
                  </div>
                  <div className="w-8 h-5 bg-brand-500 rounded-full relative shrink-0 cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <AtSign className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Mentions and replies</h4>
                      <p className="text-xs text-gray-500">Notify when someone needs your attention</p>
                    </div>
                  </div>
                  <div className="w-8 h-5 bg-brand-500 rounded-full relative shrink-0 cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <Users className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Group messages</h4>
                      <p className="text-xs text-gray-500">Only mentions and replies</p>
                    </div>
                  </div>
                  <div className="w-8 h-5 bg-gray-200 rounded-full relative shrink-0 cursor-pointer border border-gray-300">
                    <div className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email digest</h4>
                      <p className="text-xs text-gray-500">Daily summary of missed activity</p>
                    </div>
                  </div>
                  <div className="w-8 h-5 bg-brand-500 rounded-full relative shrink-0 cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Security</h3>
                  <p className="text-xs text-gray-500">Keep control of account access.</p>
                </div>
                <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm">
                  Manage
                </button>
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Two-factor authentication</h4>
                    <p className="text-xs text-gray-500">Authenticator app enabled</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">ON</span>
                </div>
                <div className="h-px bg-gray-100"></div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Password</h4>
                    <p className="text-xs text-gray-500">Updated 42 days ago</p>
                  </div>
                  <button className="text-xs font-medium text-brand-600 hover:text-brand-700">Change</button>
                </div>
                <div className="h-px bg-gray-100"></div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">New sign-in alerts</h4>
                      <p className="text-xs text-gray-500">Email me when a new device signs in</p>
                    </div>
                  </div>
                  <div className="w-8 h-5 bg-brand-500 rounded-full relative shrink-0 cursor-pointer mt-1">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Blocked Users */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Blocked users</h3>
                  <p className="text-xs text-gray-500">Blocked people can't message or find you.</p>
                </div>
                <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm">
                  View all
                </button>
              </div>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">RB</div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Riley Brooks</h4>
                      <p className="text-[10px] text-gray-500">Blocked Aug 18</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 shadow-sm">Unblock</button>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">KM</div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Kai Monroe</h4>
                      <p className="text-[10px] text-gray-500">Blocked Jul 02</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 shadow-sm">Unblock</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
// Note: We need some imports for AtSign, MapPin, Mail that weren't in the initial import list above. I will ensure they are properly added.
