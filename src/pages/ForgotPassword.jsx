import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, Mail, Lock, Eye, ArrowLeft, ShieldCheck } from 'lucide-react'
import { APP_STRINGS } from '../constants/strings'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerifyAccount = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(formData.email);
      // Assume the API returns { token: "..." }
      if (response && response.token) {
        setResetToken(response.token);
      }
      setStep(2);
      toast.success('Check successful! Please create a new password.');
    } catch (error) {
      toast.error(error.message || 'Failed to verify email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setIsLoading(true);
    try {
      // Pass the token we received in step 1
      await authService.resetPassword(resetToken, formData.newPassword);
      toast.success('Password successfully reset! You can now log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Image/Quote */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-dark text-white relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 to-gray-900 z-0">
          <img src="https://images.unsplash.com/photo-1614064641913-a538a20de9a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" alt="Security" className="w-full h-full object-cover opacity-20 mix-blend-overlay" />
        </div>
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-lg">
            <MessageSquare className="w-5 h-5 text-surface-dark" />
          </div>
          <span className="text-xl font-semibold">{APP_STRINGS.appName}</span>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center mb-6 border border-brand-500/30">
            <ShieldCheck className="w-6 h-6 text-brand-400" />
          </div>
          <h2 className="text-3xl font-medium leading-tight mb-4">
            Secure your account
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Get back to your workspace quickly and securely. We ensure your data remains completely private throughout the recovery process.
          </p>
        </div>
        
        <div className="relative z-10 text-xs text-white/50">
          Private by design • Synced everywhere
        </div>
      </div>
      
      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-8 bg-surface-white relative min-h-screen lg:min-h-0">
        
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="bg-brand-500 p-1.5 rounded-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-text-main">{APP_STRINGS.appName}</span>
        </div>

        <div className="absolute top-6 right-6">
          <Link to="/login" className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg font-medium text-text-main hover:bg-surface-light transition-colors text-xs sm:text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </div>
        
        <div className="w-full max-w-md mt-16 lg:mt-0">
          <h1 className="text-2xl sm:text-3xl font-semibold text-text-main mb-2">
            {step === 1 ? 'Reset your password' : 'Create new password'}
          </h1>
          <p className="text-text-muted mb-8 text-sm sm:text-base">
            {step === 1 
              ? "Enter your email address and we'll help you securely reset your password." 
              : "Please enter your new password below. Make sure it's at least 8 characters."}
          </p>
          
          {step === 1 ? (
            <form className="space-y-4" onSubmit={handleVerifyAccount}>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-text-light" />
                  </div>
                  <input required name="email" value={formData.email} onChange={handleChange} type="email" placeholder="alex@northstar.design" autoComplete="email" autoCapitalize="none" autoCorrect="off" className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow" />
                </div>
              </div>
              
              <button type="submit" disabled={isLoading} className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-all duration-300 mt-4 text-sm shadow-sm flex justify-center items-center gap-2">
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          ) : (
            <form className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-text-light" />
                  </div>
                  <input required name="newPassword" value={formData.newPassword} onChange={handleChange} type={showPassword ? "text" : "password"} placeholder="At least 8 characters" minLength={8} autoComplete="new-password" className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow" />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                    <Eye className={`h-4 w-4 transition-colors ${showPassword ? 'text-brand-500' : 'text-text-light hover:text-text-muted'}`} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-text-light" />
                  </div>
                  <input required name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type={showPassword ? "text" : "password"} placeholder="Type password again" minLength={8} autoComplete="new-password" className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow" />
                </div>
              </div>
              
              <button type="submit" disabled={isLoading} className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-all duration-300 mt-4 text-sm shadow-sm flex justify-center items-center gap-2">
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
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
