import { useState } from 'react'
import { User, MonitorSmartphone, Bell, Shield, Ban, Palette, MessageSquare, Upload, Laptop, Smartphone, Monitor, AtSign, MapPin, Mail, Moon, Sun, MonitorDot, Volume2, Fingerprint, Lock, Key, LogOut, CheckCircle2 } from 'lucide-react'
import { APP_STRINGS } from '../constants/strings'
import { useThemeStore } from '../store/themeStore'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, setTheme } = useThemeStore();
  
  // Helper for the sleek toggle switch
  const Toggle = ({ active }) => (
    <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ease-in-out ${active ? 'bg-brand-500' : 'bg-gray-200 border border-gray-300'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${active ? 'left-6' : 'left-1'}`}></div>
    </div>
  );

  return (
    <div className="flex-1 flex h-full bg-white">
      {/* New Sleek Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col bg-gray-50/30">
        <div className="p-8 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h2>
        </div>
        
        <div className="px-4 flex-1 overflow-y-auto pb-8">
          <div className="space-y-1 mb-8">
            <div className="px-4 py-2 mb-2">
              <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Account</span>
            </div>
            
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-white text-brand-700 shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-gray-100/80 border border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-brand-500' : 'text-gray-400'}`} />
                My Profile
              </div>
            </button>
            
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'security' ? 'bg-white text-brand-700 shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-gray-100/80 border border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <Shield className={`w-4 h-4 ${activeTab === 'security' ? 'text-brand-500' : 'text-gray-400'}`} />
                Security & Access
              </div>
            </button>
          </div>

          <div className="space-y-1">
            <div className="px-4 py-2 mb-2">
              <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Preferences</span>
            </div>
            
            <button 
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'appearance' ? 'bg-white text-brand-700 shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-gray-100/80 border border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <Palette className={`w-4 h-4 ${activeTab === 'appearance' ? 'text-brand-500' : 'text-gray-400'}`} />
                Appearance
              </div>
            </button>
            
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'notifications' ? 'bg-white text-brand-700 shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-gray-100/80 border border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <Bell className={`w-4 h-4 ${activeTab === 'notifications' ? 'text-brand-500' : 'text-gray-400'}`} />
                Notifications
              </div>
            </button>
            
            <button 
              onClick={() => setActiveTab('messaging')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'messaging' ? 'bg-white text-brand-700 shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-gray-100/80 border border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className={`w-4 h-4 ${activeTab === 'messaging' ? 'text-brand-500' : 'text-gray-400'}`} />
                Chat Behavior
              </div>
            </button>
          </div>
        </div>
        
        {/* User Mini Profile at bottom */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-sm shrink-0">AR</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">Alex Rivera</h3>
              <p className="text-xs text-emerald-600 font-medium">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Area (Unified List Layout) */}
      <div className="flex-1 overflow-y-auto bg-gray-50/30">
        <div className="max-w-3xl mx-auto py-12 px-8">
          
          {/* Header */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                {activeTab === 'profile' && 'My Profile'}
                {activeTab === 'security' && 'Security & Access'}
                {activeTab === 'appearance' && 'Appearance'}
                {activeTab === 'notifications' && 'Notifications'}
                {activeTab === 'messaging' && 'Chat Behavior'}
              </h1>
              <p className="text-gray-500 text-sm">
                {activeTab === 'profile' && 'Manage your personal information and how others see you.'}
                {activeTab === 'security' && 'Protect your account and manage active sessions.'}
                {activeTab === 'appearance' && 'Customize the look and feel of your workspace.'}
                {activeTab === 'notifications' && 'Control when and how you are alerted.'}
                {activeTab === 'messaging' && 'Fine-tune your messaging and composition experience.'}
              </p>
            </div>
          </div>
          
          {/* CONTENT: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-500 to-gray-400 text-white flex items-center justify-center font-bold text-3xl shadow-md">
                  AR
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Profile Picture</h3>
                  <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 5MB. This will be shown on your profile.</p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-brand-50 text-brand-700 hover:bg-brand-100 text-sm font-medium rounded-xl transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Upload New
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b border-gray-200">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Personal Information</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="p-6 grid grid-cols-3 gap-4 items-center hover:bg-gray-50/30 transition-colors">
                    <div className="col-span-1">
                      <label className="text-sm font-semibold text-gray-700">Display Name</label>
                    </div>
                    <div className="col-span-2">
                      <input type="text" defaultValue="Alex Rivera" className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-shadow" />
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-3 gap-4 items-center hover:bg-gray-50/30 transition-colors">
                    <div className="col-span-1">
                      <label className="text-sm font-semibold text-gray-700">Username</label>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center max-w-sm relative">
                        <AtSign className="w-4 h-4 absolute left-3 text-gray-400" />
                        <input type="text" defaultValue="alexr" className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-shadow" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-3 gap-4 items-start hover:bg-gray-50/30 transition-colors">
                    <div className="col-span-1 pt-2">
                      <label className="text-sm font-semibold text-gray-700">Bio</label>
                      <p className="text-xs text-gray-400 mt-1">Brief description for your profile.</p>
                    </div>
                    <div className="col-span-2">
                      <textarea rows="3" defaultValue="Product designer helping teams make clearer decisions." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-shadow resize-none"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b border-gray-200">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Authentication</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="p-6 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Account Password</h4>
                        <p className="text-xs text-gray-500 mt-1">Last changed 42 days ago.</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors">
                      Change Password
                    </button>
                  </div>
                  <div className="p-6 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Fingerprint className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-xs text-gray-500 mt-1">Authenticator app is currently enabled.</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-sm font-medium rounded-xl transition-colors border border-emerald-200">
                      Manage 2FA
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Sessions</h3>
                  <button className="text-xs font-medium text-red-600 hover:text-red-700">Sign out of all other devices</button>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Laptop className="w-8 h-8 text-brand-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900">MacBook Pro (Chrome)</h4>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded tracking-widest uppercase">Current</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">San Francisco, CA • Active now</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex items-center justify-between hover:bg-gray-50/30 group">
                    <div className="flex items-center gap-4">
                      <Smartphone className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">iPhone 16 Pro (iOS App)</h4>
                        <p className="text-xs text-gray-500 mt-0.5">San Francisco, CA • Active 8m ago</p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-3 gap-6">
                <button 
                  onClick={() => setTheme('light')}
                  className={`bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-sm relative overflow-hidden group transition-colors ${theme === 'light' ? 'border-2 border-brand-500 hover:bg-brand-50' : 'border border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <div className={`absolute top-3 right-3 ${theme === 'light' ? 'text-brand-500' : 'text-transparent'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-brand-500' : 'border-2 border-gray-300'}`}>
                      {theme === 'light' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                  </div>
                  <Sun className={`w-10 h-10 ${theme === 'light' ? 'text-brand-500' : 'text-gray-400'}`} />
                  <span className="font-bold text-gray-900">Light Mode</span>
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-sm relative overflow-hidden group transition-colors ${theme === 'dark' ? 'border-2 border-brand-500 hover:bg-brand-50' : 'border border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <div className={`absolute top-3 right-3 ${theme === 'dark' ? 'text-brand-500' : 'text-transparent'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-brand-500' : 'border-2 border-gray-300'}`}>
                      {theme === 'dark' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                  </div>
                  <Moon className={`w-10 h-10 ${theme === 'dark' ? 'text-brand-500' : 'text-gray-400'}`} />
                  <span className="font-bold text-gray-900">Dark Mode</span>
                </button>
                <button 
                  onClick={() => setTheme('system')}
                  className={`bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-sm relative overflow-hidden group transition-colors ${theme === 'system' ? 'border-2 border-brand-500 hover:bg-brand-50' : 'border border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <div className={`absolute top-3 right-3 ${theme === 'system' ? 'text-brand-500' : 'text-transparent'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${theme === 'system' ? 'bg-brand-500' : 'border-2 border-gray-300'}`}>
                      {theme === 'system' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                  </div>
                  <MonitorDot className={`w-10 h-10 ${theme === 'system' ? 'text-brand-500' : 'text-gray-400'}`} />
                  <span className="font-bold text-gray-900">System Match</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b border-gray-200">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Interface Settings</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="p-6 flex items-center justify-between hover:bg-gray-50/30 transition-colors cursor-pointer">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Compact Layout</h4>
                      <p className="text-xs text-gray-500 mt-1">Reduce spacing to fit more content on the screen.</p>
                    </div>
                    <Toggle active={false} />
                  </div>
                  <div className="p-6 flex items-center justify-between hover:bg-gray-50/30 transition-colors cursor-pointer">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Show Avatars in Chat</h4>
                      <p className="text-xs text-gray-500 mt-1">Display user profile pictures next to their messages.</p>
                    </div>
                    <Toggle active={true} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b border-gray-200">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Push Notifications</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="p-6 flex items-center justify-between hover:bg-gray-50/30 transition-colors cursor-pointer">
                    <div className="flex gap-4">
                      <AtSign className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Mentions & Replies</h4>
                        <p className="text-xs text-gray-500 mt-1">Notify me when someone uses @alex or replies to me.</p>
                      </div>
                    </div>
                    <Toggle active={true} />
                  </div>
                  <div className="p-6 flex items-center justify-between hover:bg-gray-50/30 transition-colors cursor-pointer">
                    <div className="flex gap-4">
                      <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Direct Messages</h4>
                        <p className="text-xs text-gray-500 mt-1">Notify me for every new direct message.</p>
                      </div>
                    </div>
                    <Toggle active={true} />
                  </div>
                  <div className="p-6 flex items-center justify-between hover:bg-gray-50/30 transition-colors cursor-pointer">
                    <div className="flex gap-4">
                      <Volume2 className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">In-App Sounds</h4>
                        <p className="text-xs text-gray-500 mt-1">Play a sound when a new message arrives while app is open.</p>
                      </div>
                    </div>
                    <Toggle active={false} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* CONTENT: MESSAGING */}
          {activeTab === 'messaging' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b border-gray-200">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Composing & Reading</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="p-6 flex items-center justify-between hover:bg-gray-50/30 transition-colors cursor-pointer">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Send on Enter</h4>
                      <p className="text-xs text-gray-500 mt-1">Pressing Enter will send the message instead of a new line.</p>
                    </div>
                    <Toggle active={true} />
                  </div>
                  <div className="p-6 flex items-center justify-between hover:bg-gray-50/30 transition-colors cursor-pointer">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Read Receipts</h4>
                      <p className="text-xs text-gray-500 mt-1">Let others know when you have read their messages.</p>
                    </div>
                    <Toggle active={true} />
                  </div>
                  <div className="p-6 flex items-center justify-between hover:bg-gray-50/30 transition-colors cursor-pointer">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Link Previews</h4>
                      <p className="text-xs text-gray-500 mt-1">Automatically show rich visual previews for URLs.</p>
                    </div>
                    <Toggle active={true} />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
