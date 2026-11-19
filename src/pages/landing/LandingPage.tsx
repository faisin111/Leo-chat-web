import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import {
  MessageSquare,
  CheckCircle2,
  Shield,
  Zap,
  Users,
  RefreshCcw,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Lock,
} from 'lucide-react';
import { useTheme } from 'next-themes';

export const LandingPage = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* ── Sticky Glassmorphic Header ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/60 px-6 lg:px-12 py-3.5 transition-colors">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5 font-bold text-xl group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" fill="currentColor" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-foreground">LeoChat</span>
          </Link>

          <nav className="hidden md:flex space-x-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#security" className="hover:text-foreground transition-colors">
              Security & Privacy
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            <Link
              to="/login"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-2"
            >
              Sign in
            </Link>
            <Button
              variant="gradient"
              size="sm"
              asChild
              className="rounded-xl font-semibold shadow-sm shadow-primary/20"
            >
              <Link to="/register">
                Start chatting <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="relative px-6 lg:px-12 pt-16 pb-24 lg:pt-24 lg:pb-32 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-14 overflow-hidden">
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[hsl(var(--primary-gradient-to,var(--primary)))]/10 rounded-full blur-[150px] pointer-events-none -z-10" />

          {/* Left Text Column */}
          <div className="flex-1 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Real-Time • Encrypted • High Performance
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.08] text-foreground">
              The calm place for conversations that{' '}
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] bg-clip-text text-transparent">
                move work forward.
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              LeoChat combines ultra-fast direct messages, focused group channels, live presence,
              voice notes, and encrypted files into one modern workspace — synced instantly on all
              your devices.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
              <Button
                size="lg"
                variant="gradient"
                className="w-full sm:w-auto text-base rounded-xl h-12 px-8 font-semibold shadow-md shadow-primary/25"
                asChild
              >
                <Link to="/register">
                  Create your free account <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base rounded-xl h-12 px-6"
                asChild
              >
                <Link to="/login">Sign in with existing account</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Direct &amp; group
                chats
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Voice &amp; video
                calls
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> AI assistant
              </span>
            </div>
          </div>
        </section>

        {/* ── Feature Highlights Strip ── */}
        <section className="bg-card/60 backdrop-blur-md py-10 px-6 lg:px-12 border-y border-border">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Instant Delivery</h4>
                <p className="text-xs text-muted-foreground">Real-time WebSocket sync</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Strict Privacy</h4>
                <p className="text-xs text-muted-foreground">Encrypted in transit</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Group Channels</h4>
                <p className="text-xs text-muted-foreground">Role management & tools</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 border border-sky-500/20">
                <RefreshCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Multi-Device</h4>
                <p className="text-xs text-muted-foreground">Always in seamless sync</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature Cards Section ── */}
        <section id="features" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Engineered for Speed
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
              Messaging that stays completely out of your way.
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Fast enough for instant team decisions, organized enough to find conversations weeks
              later.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-card border border-border p-8 rounded-3xl shadow-xs hover:border-primary/40 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-primary/20">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Real-Time Messaging</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Replies, rich reactions, typing cues, voice messages, delivery states, and ordered
                history keep every conversation clear and context-rich.
              </p>
            </div>

            <div className="bg-card border border-border p-8 rounded-3xl shadow-xs hover:border-primary/40 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-purple-500/20">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Focused Group Channels</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Create team rooms, assign OWNER, ADMIN, and MEMBER roles, and manage permissions
                with ease to keep decisions structured and transparent.
              </p>
            </div>

            <div className="bg-card border border-border p-8 rounded-3xl shadow-xs hover:border-primary/40 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-emerald-500/20">
                <RefreshCcw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Seamless Synchronicity</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Pick up any conversation right where you left off on desktop or phone, with live
                presence tracking and zero lost context.
              </p>
            </div>
          </div>
        </section>

        {/* ── Security & Privacy Section ── */}
        <section id="security" className="py-20 px-6 lg:px-12 bg-card/40 border-t border-border">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-500/20">
                <Lock className="w-3.5 h-3.5" /> Privacy First Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-6">
                Trust your workspace from sign-in to sign-out.
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-8 leading-relaxed">
                Review active device sessions, revoke access in one click, block unsolicited
                contacts, and maintain total control over your notifications. Private conversations
                stay private.
              </p>
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl gap-2 font-semibold"
                asChild
              >
                <Link to="/register">
                  Explore security features <Shield className="w-4 h-4 text-primary" />
                </Link>
              </Button>
            </div>

            <div className="flex-1 w-full bg-card border border-border p-8 lg:p-10 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-bl-full pointer-events-none -z-0" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-primary/15 text-primary rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  Privacy is a fundamental rule.
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
                  Direct message contents are private. Platform administrators can inspect aggregate
                  health metadata — never conversation text or attachments.
                </p>
                <ul className="space-y-3.5 text-xs sm:text-sm font-medium">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Real-time active session and device management</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>User reporting and admin moderation tools</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Auditable ownership transfers and administrator safeguards</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom Call To Action ── */}
        <section className="py-20 px-6 lg:px-12 max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] text-primary-foreground rounded-3xl p-10 sm:p-14 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
                Start a better conversation today.
              </h2>
              <p className="text-primary-foreground/90 text-sm sm:text-base mb-8 leading-relaxed">
                Create your LeoChat account in seconds and experience fast, beautiful team
                messaging.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="text-base font-bold px-8 h-12 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                asChild
              >
                <Link to="/register">Sign up free — no credit card needed</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-card border-t border-border py-12 px-6 lg:px-12 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center space-x-2.5 font-bold text-lg text-foreground mb-3">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] flex items-center justify-center text-primary-foreground text-xs shadow-sm">
                <MessageSquare className="w-3.5 h-3.5" fill="currentColor" />
              </div>
              <span className="tracking-tight font-extrabold">LeoChat</span>
            </div>
            <p className="text-muted-foreground text-xs max-w-xs leading-relaxed">
              Clear, modern, and calibrated conversations wherever work happens.
            </p>
            <p className="text-muted-foreground text-xs mt-3">
              &copy; {new Date().getFullYear()} LeoChat, Inc. All rights reserved.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 text-xs">
            <div>
              <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-[11px]">
                Product
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#security" className="hover:text-foreground transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <Link to="/app" className="hover:text-foreground transition-colors">
                    Web App
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-[11px]">
                Account
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link to="/login" className="hover:text-foreground transition-colors">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-foreground transition-colors">
                    Create account
                  </Link>
                </li>
                <li>
                  <Link to="/forgot-password" className="hover:text-foreground transition-colors">
                    Reset password
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-[11px]">
                Legal
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link to="/" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-foreground transition-colors">
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
