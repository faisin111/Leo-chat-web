import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { MessageSquare, CheckCircle2, Shield, Zap, Users, RefreshCcw } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 max-w-7xl w-full mx-auto">
        <div className="flex items-center space-x-2 font-bold text-xl text-primary">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <MessageSquare className="w-4 h-4" fill="currentColor" />
          </div>
          <span>LeoChat</span>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#security" className="hover:text-foreground transition-colors">
            Security
          </a>
          <a href="#teams" className="hover:text-foreground transition-colors">
            For Teams
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
            Log in
          </Link>
          <Button asChild>
            <Link to="/register">Start chatting</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 lg:px-12 py-20 lg:py-32 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 overflow-hidden">
          <div className="flex-1 text-center lg:text-left z-10">
            <div className="inline-block px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              Real-Time. Private. Yours.
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              The calm place for conversations that move work forward.
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              LeoChat brings direct messages, focused groups, presence, replies and files into one
              secure workspace—instantly synced on every device.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
              <Button size="lg" className="w-full sm:w-auto text-base" asChild>
                <Link to="/register">Create your account</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                See how it works
              </Button>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Secure authentication
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Ready in 2 minutes
              </span>
            </div>
          </div>
          <div className="flex-1 w-full max-w-2xl relative z-10 lg:translate-x-12">
            <div className="bg-card border border-border shadow-2xl rounded-2xl p-4 lg:p-6 w-full transform rotate-1 hover:rotate-0 transition-transform duration-500">
              {/* Mockup UI */}
              <div className="flex border-b border-border pb-4 mb-4 items-center justify-between">
                <div className="font-bold">Design Systems</div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center font-bold text-xs">
                    MC
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-sm">Maya Chen</span>
                      <span className="text-xs text-muted-foreground">10:42</span>
                    </div>
                    <div className="text-sm text-foreground">
                      The new handoff flow is ready. I kept the focus states quiet and consistent.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-bold text-xs">
                    AR
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-sm">Alex Rivera</span>
                      <span className="text-xs text-muted-foreground">10:42</span>
                    </div>
                    <div className="text-sm text-foreground">
                      Great. Let&apos;s ship the review build before stand-up.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/10 to-accent rounded-full blur-3xl -z-10"></div>
          </div>
        </section>

        {/* Feature Banner */}
        <section className="bg-secondary py-12 px-6 lg:px-12 border-y border-border">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-8">
            <div className="flex items-center gap-3 text-sm font-semibold">
              <Zap className="text-primary w-5 h-5" /> Instant delivery
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold">
              <Shield className="text-primary w-5 h-5" /> Secure by default
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold">
              <Users className="text-primary w-5 h-5" /> Built for groups
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold">
              <RefreshCcw className="text-primary w-5 h-5" /> Synced everywhere
            </div>
          </div>
        </section>

        {/* Features details */}
        <section id="features" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              Everything in flow
            </div>
            <h2 className="text-4xl font-bold mb-4">Messaging that stays out of your way.</h2>
            <p className="text-muted-foreground text-lg">
              Fast enough for a live decision, structured enough to find it again next week.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time messaging</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Replies, reactions, typing cues, delivery states and ordered history keep every
                exchange clear.
              </p>
            </div>
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Groups with focus</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Create groups, assign OWNER, ADMIN and MEMBER roles, and keep context where it
                belongs.
              </p>
            </div>
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <RefreshCcw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Seamless sync</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Continue exactly where you left off across desktop and mobile, with presence that
                stays current.
              </p>
            </div>
          </div>
        </section>

        {/* Security / CTA */}
        <section id="security" className="py-24 px-6 lg:px-12 bg-secondary border-t border-border">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-block px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                Secure Authentication
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Trust your workspace, from sign-in to sign-out.
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Review active sessions, manage devices, block unwanted contact and control exactly
                which notifications reach you. Privacy is a product rule, not an afterthought.
              </p>
              <Button variant="outline" size="lg" className="gap-2">
                Explore security <Shield className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 w-full bg-card border border-border p-8 lg:p-12 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-bl-full -z-0"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Privacy is a product rule.</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Private messages stay private. Platform administration can inspect metadata—not
                  conversation bodies—except content explicitly submitted in a moderation report.
                </p>
                <ul className="space-y-3 text-sm font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Secure session management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Blocked-user controls
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Auditable ownership safeguards
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 px-6 lg:px-12 max-w-5xl mx-auto">
          <div className="bg-primary text-primary-foreground rounded-3xl p-12 text-center shadow-xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-2xl"></div>

            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Start a better conversation today.
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto">
                Create your LeoChat account and bring your people together in minutes.
              </p>
              <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                <Link to="/register">Sign up free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-6 lg:px-12 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center space-x-2 font-bold text-lg text-primary mb-4">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                <MessageSquare className="w-3 h-3" fill="currentColor" />
              </div>
              <span>LeoChat</span>
            </div>
            <p className="text-muted-foreground max-w-xs">
              Clearer conversations, wherever work happens.
            </p>
            <p className="text-muted-foreground mt-4">
              &copy; {new Date().getFullYear()} LeoChat, Inc.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="/" className="hover:text-primary">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/" className="hover:text-primary">
                    Security
                  </a>
                </li>
                <li>
                  <a href="/" className="hover:text-primary">
                    Download
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="/" className="hover:text-primary">
                    About
                  </a>
                </li>
                <li>
                  <a href="/" className="hover:text-primary">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="/" className="hover:text-primary">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="/" className="hover:text-primary">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="/" className="hover:text-primary">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="/" className="hover:text-primary">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
