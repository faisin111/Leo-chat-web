import { Link } from 'react-router-dom'
import { CheckCircle2, MessageSquare, Users, Cloud, Shield, Zap, Lock, RefreshCw } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-semibold tracking-wide mb-6 uppercase">
            Real-Time. Private. Yours.
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            The calm place for conversations that move work forward.
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
            LeoChat brings direct messages, focused groups, presence, replies and files into one secure workspace—instantly synced on every device.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <Link to="/register" className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
              <span>&rarr;</span> Create your account
            </Link>
            <Link to="#" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              See how it works
            </Link>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Secure authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Ready in 2 minutes</span>
            </div>
          </div>
        </div>
        
        {/* Mock UI Graphic */}
        <div className="relative">
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-100 p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">
                  DS
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Design systems</h3>
                  <p className="text-xs text-emerald-500">4 members online</p>
                </div>
              </div>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex text-xs text-gray-400 justify-center">
                <span>TODAY</span>
              </div>
              
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-medium shrink-0">
                  MC
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-medium text-sm">Maya Chen</span>
                    <span className="text-xs text-gray-400">10:42</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    The new handoff flow is ready. I kept the focus states quiet and consistent.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-medium shrink-0">
                  AR
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-medium text-sm">Alex Rivera</span>
                    <span className="text-xs text-gray-400">10:42</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Great. Let's ship the review build before stand-up.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-brand-500 mb-1 font-medium">Replying to Maya</p>
                    <p className="text-sm text-gray-600 mb-2">I've added the updated specs and edge cases.</p>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-0.5 text-xs">
                        ✅ 3
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-0.5 text-xs">
                        🔥 2
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
              <div className="text-xs text-gray-400 italic flex-1">Maya is typing...</div>
              <div className="bg-brand-500 text-white p-2 rounded-lg">
                <Zap className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dark Features Band */}
      <section className="bg-surface-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">Instant delivery</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">Secure by default</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">Built for groups</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">Synced everywhere</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <div className="inline-block px-3 py-1 bg-brand-100 text-brand-900 rounded-full text-xs font-semibold tracking-wide mb-4 uppercase">
              Everything in flow
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Messaging that stays out of your way.
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl">
              Fast enough for a live decision, structured enough to find it again next week.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500 mb-6">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="inline-block px-2 py-1 bg-brand-50 text-brand-600 rounded text-xs font-semibold tracking-wide mb-3 uppercase">
                Live
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time messaging</h3>
              <p className="text-gray-500 leading-relaxed">
                Replies, reactions, typing cues, delivery states and ordered history keep every exchange clear.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <div className="inline-block px-2 py-1 bg-brand-50 text-brand-600 rounded text-xs font-semibold tracking-wide mb-3 uppercase">
                Organized
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Groups with focus</h3>
              <p className="text-gray-500 leading-relaxed">
                Create groups, assign OWNER, ADMIN and MEMBER roles, and keep context where it belongs.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500 mb-6">
                <Cloud className="w-6 h-6" />
              </div>
              <div className="inline-block px-2 py-1 bg-brand-50 text-brand-600 rounded text-xs font-semibold tracking-wide mb-3 uppercase">
                Every device
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Seamless sync</h3>
              <p className="text-gray-500 leading-relaxed">
                Continue exactly where you left off across desktop and mobile, with presence that stays current.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="bg-surface-dark text-white p-12 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 border border-white/20 rounded-xl flex items-center justify-center mb-8">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Privacy is a product rule.</h2>
              <p className="text-gray-400 mb-8 leading-relaxed text-sm">
                Private messages stay private. Platform administration can inspect metadata—not conversation bodies—except content explicitly submitted in a moderation report.
              </p>
              
              <ul className="space-y-4 text-sm text-gray-300">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Secure session management
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Blocked-user controls
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Auditable ownership safeguards
                </li>
              </ul>
            </div>
          </div>
          
          <div>
            <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold tracking-wide mb-6 uppercase">
              Secure Authentication
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Trust your workspace, from sign-in to sign-out.
            </h2>
            <p className="text-lg text-gray-500 mb-8">
              Review active sessions, manage devices, block unwanted contact and control exactly which notifications reach you.
            </p>
            <Link to="#" className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <span>&nearr;</span> Explore security
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-8">
          <div className="bg-brand-500 text-white rounded-3xl p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Start a better conversation today.</h2>
              <p className="text-brand-100 text-lg">Create your LeoChat account and bring your people together in minutes.</p>
            </div>
            <Link to="/register" className="shrink-0 bg-white text-brand-600 px-8 py-4 rounded-xl font-semibold hover:bg-brand-50 transition-colors flex items-center gap-2">
              <span>&rarr;</span> Sign up free
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
