import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, Mail, Lock, Eye, Zap, Users, Shield, RefreshCw } from 'lucide-react'
import { APP_STRINGS, AUTH_CONTENT } from '../constants/strings'

export default function Register() {
  const navigate = useNavigate();
  const icons = [Zap, Users, Shield, RefreshCw];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-8 bg-surface-white relative min-h-screen lg:min-h-0">
        
        {/* Mobile Logo */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <div className="bg-brand-500 p-1.5 rounded-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-text-main hidden sm:inline">{APP_STRINGS.appName}</span>
        </div>
        
        <div className="absolute top-6 right-6 flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <span className="text-text-muted hidden sm:inline">Already have an account?</span>
          <Link to="/login" className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg font-medium text-text-main hover:bg-surface-light transition-colors">
            {APP_STRINGS.signIn}
          </Link>
        </div>
        
        <div className="w-full max-w-md mt-16 lg:mt-0">
          <h1 className="text-2xl sm:text-3xl font-semibold text-text-main mb-2">{APP_STRINGS.createAccount}</h1>
          <p className="text-text-muted mb-8 text-sm sm:text-base">{APP_STRINGS.createAccountSubtitle}</p>
          
          <button onClick={() => navigate('/app')} className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-200 rounded-lg hover:bg-surface-light transition-colors mb-6 font-medium text-text-main text-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-text-light font-medium uppercase tracking-wide">or use your email</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">First name</label>
                <input type="text" placeholder="Alex" className="block w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Last name</label>
                <input type="text" placeholder="Rivera" className="block w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-text-light" />
                </div>
                <input type="email" placeholder="alex@northstar.design" className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-text-light" />
                </div>
                <input type="password" placeholder="At least 8 characters" className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow" />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                  <Eye className="h-4 w-4 text-text-light hover:text-text-muted transition-colors" />
                </div>
              </div>
              <div className="flex gap-1 mt-2">
                <div className="h-1 flex-1 bg-emerald-500 rounded-full"></div>
                <div className="h-1 flex-1 bg-emerald-500 rounded-full"></div>
                <div className="h-1 flex-1 bg-emerald-500 rounded-full"></div>
                <div className="h-1 flex-1 bg-gray-200 rounded-full"></div>
              </div>
              <p className="text-xs text-emerald-600 mt-1">Strong password - Mix of letters, numbers and symbols</p>
            </div>
            
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 accent-brand-600 shrink-0" defaultChecked />
                <span className="text-sm text-text-muted leading-snug">
                  I agree to {APP_STRINGS.appName}'s Terms of Service and Privacy Policy, and confirm I'm at least 16 years old.
                </span>
              </label>
            </div>
            
            <button type="button" onClick={() => navigate('/app')} className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-lg font-medium transition-colors mt-2 text-sm flex items-center justify-center gap-2 shadow-sm">
              <span>&rarr;</span> {APP_STRINGS.createAccount}
            </button>
          </form>
        </div>
        
        <div className="mt-12 lg:absolute lg:bottom-6 text-xs text-text-light flex gap-4">
          <Link to="#" className="hover:text-text-muted transition-colors">Privacy</Link>
          <Link to="#" className="hover:text-text-muted transition-colors">Terms</Link>
          <Link to="#" className="hover:text-text-muted transition-colors">Help center</Link>
        </div>
      </div>

      {/* Right Panel - Features (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-dark text-white p-16 flex-col justify-between">
        <div>
          <div className="inline-block px-3 py-1 bg-brand-500/20 text-brand-400 rounded-full text-xs font-semibold tracking-wide mb-6 uppercase border border-brand-500/20">
            Built for momentum
          </div>
          <h2 className="text-4xl font-semibold leading-tight mb-12">
            {AUTH_CONTENT.featuresTitle}
          </h2>
          
          <div className="space-y-4 max-w-md">
            {AUTH_CONTENT.features.map((feature, idx) => {
              const Icon = icons[idx];
              return (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                  <div className="bg-brand-500/20 p-2 rounded-lg text-brand-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-200 mb-1">{feature.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            <div className="w-8 h-8 rounded-full border-2 border-surface-dark bg-purple-500 flex items-center justify-center text-xs font-medium">MC</div>
            <div className="w-8 h-8 rounded-full border-2 border-surface-dark bg-emerald-500 flex items-center justify-center text-xs font-medium">JL</div>
            <div className="w-8 h-8 rounded-full border-2 border-surface-dark bg-amber-500 flex items-center justify-center text-xs font-medium">NK</div>
          </div>
          <span className="text-sm text-gray-400">Join 12,000+ focused teams</span>
        </div>
      </div>
    </div>
  )
}
