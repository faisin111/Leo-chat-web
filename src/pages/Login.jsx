import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, Mail, Lock, Eye, User } from 'lucide-react'
import { APP_STRINGS, AUTH_CONTENT } from '../constants/strings'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const navigate = useNavigate();

  const { login, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(formData);
    if (success) {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Image/Quote (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-dark text-white relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 z-0">
          <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80" alt="Team meeting" className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
        </div>
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-lg">
            <MessageSquare className="w-5 h-5 text-surface-dark" />
          </div>
          <span className="text-xl font-semibold">{APP_STRINGS.appName}</span>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <div className="text-4xl text-white/40 font-serif mb-4">"</div>
          <h2 className="text-3xl font-medium leading-tight mb-6">
            {AUTH_CONTENT.quote}
          </h2>
          <div>
            <p className="font-semibold text-sm">{AUTH_CONTENT.quoteAuthor}</p>
            <p className="text-white/60 text-xs">{AUTH_CONTENT.quoteRole}</p>
          </div>
        </div>
        
        <div className="relative z-10 text-xs text-white/50">
          Private by design • Synced everywhere
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-8 bg-surface-white relative min-h-screen lg:min-h-0">
        
        {/* Mobile Logo (Visible only on mobile) */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="bg-brand-500 p-1.5 rounded-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-text-main">{APP_STRINGS.appName}</span>
        </div>

        <div className="absolute top-6 right-6 flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <span className="text-text-muted hidden sm:inline">New to {APP_STRINGS.appName}?</span>
          <Link to="/register" className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg font-medium text-text-main hover:bg-surface-light transition-colors">
            {APP_STRINGS.createAccount}
          </Link>
        </div>
        
        <div className="w-full max-w-md mt-16 lg:mt-0">
          <h1 className="text-2xl sm:text-3xl font-semibold text-text-main mb-2">{APP_STRINGS.welcomeBack}</h1>
          <p className="text-text-muted mb-8 text-sm sm:text-base">{APP_STRINGS.signInSubtitle}</p>
          
          <button type="button" className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-200 rounded-lg hover:bg-surface-light transition-colors mb-6 font-medium text-text-main text-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-text-light font-medium uppercase tracking-wide">or continue with username</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-text-light" />
                </div>
                <input required name="username" value={formData.username} onChange={handleChange} type="text" placeholder="alex_dev" autoComplete="username" autoCapitalize="none" autoCorrect="off" className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-text-light" />
                </div>
                <input required name="password" value={formData.password} onChange={handleChange} type={showPassword ? "text" : "password"} placeholder="Enter your password" minLength={8} autoComplete="current-password" className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow" />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                  <Eye className={`h-4 w-4 transition-colors ${showPassword ? 'text-brand-500' : 'text-text-light hover:text-text-muted'}`} />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 accent-brand-600" defaultChecked />
                <span className="text-sm text-text-muted">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">Forgot password?</Link>
            </div>
            
            <button type="submit" disabled={isLoading} className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-70 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors mt-2 text-sm shadow-sm flex justify-center items-center gap-2">
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                APP_STRINGS.signIn
              )}
            </button>
          </form>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-light">
            <Lock className="w-3 h-3" />
            <span>Your session is encrypted and protected.</span>
          </div>
        </div>
        
        <div className="absolute bottom-6 text-xs text-text-light flex gap-4">
          <Link to="#" className="hover:text-text-muted transition-colors">Privacy</Link>
          <Link to="#" className="hover:text-text-muted transition-colors">Terms</Link>
          <Link to="#" className="hover:text-text-muted transition-colors">Help center</Link>
        </div>
      </div>
    </div>
  )
}
