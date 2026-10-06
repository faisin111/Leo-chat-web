import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Zap, Users, Shield, RefreshCcw } from 'lucide-react';

export const RegisterPage = () => {
  return (
    <div className="flex w-full flex-col lg:flex-row min-h-screen">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col p-8 lg:p-12 relative overflow-y-auto">
        <div className="flex items-center justify-between w-full mb-12 lg:mb-24">
          <div className="flex items-center space-x-2 font-bold text-xl text-primary">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              L
            </div>
            <span>LeoChat</span>
          </div>
          <div className="text-sm hidden sm:block">
            <span className="text-muted-foreground mr-2">Already have an account?</span>
            <Button variant="outline" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        <div className="w-full max-w-[440px] mx-auto flex-1">
          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">A calmer workspace is a few details away.</p>

          <Button variant="outline" className="w-full mb-6 font-medium h-12">
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </Button>

          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase">
              or use your email
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <form className="space-y-5">
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" placeholder="Alex" required className="h-12" />
              </div>
              <div className="space-y-2 flex-1">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" placeholder="Rivera" required className="h-12" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@northstar.design"
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                required
                className="h-12"
              />

              {/* Password strength indicator mock */}
              <div className="flex gap-1 mt-2">
                <div className="h-1 flex-1 bg-green-500 rounded-full"></div>
                <div className="h-1 flex-1 bg-green-500 rounded-full"></div>
                <div className="h-1 flex-1 bg-green-500 rounded-full"></div>
                <div className="h-1 flex-1 bg-border rounded-full"></div>
              </div>
              <p className="text-xs text-green-600 font-medium mt-1">
                Strong password - Mix of letters, numbers and symbols
              </p>
            </div>

            <div className="flex items-start mt-6 pt-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 rounded border-input text-primary focus:ring-primary h-4 w-4"
                required
              />
              <Label
                htmlFor="terms"
                className="ml-2 font-normal cursor-pointer text-sm text-muted-foreground leading-relaxed"
              >
                I agree to LeoChat&apos;s Terms of Service and Privacy Policy, and confirm I&apos;m
                at least 16 years old.
              </Label>
            </div>

            <Button className="w-full h-12 mt-6" type="submit">
              Create account
            </Button>
          </form>

          <div className="mt-12 text-center text-xs text-muted-foreground space-x-4">
            <a href="/" className="hover:text-foreground">
              Privacy
            </a>
            <a href="/" className="hover:text-foreground">
              Terms
            </a>
            <a href="/" className="hover:text-foreground">
              Help center
            </a>
          </div>
        </div>
      </div>

      {/* Right side - Features Panel */}
      <div className="hidden lg:flex flex-col justify-center w-[45%] bg-slate-900 text-white p-12 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>

        <div className="relative z-10 max-w-md mx-auto">
          <div className="inline-block px-2 py-1 bg-white/10 rounded text-[10px] font-bold uppercase tracking-widest mb-6 text-primary-foreground">
            Built for momentum
          </div>
          <h2 className="text-4xl font-bold mb-12 leading-tight">
            One workspace. Every conversation in context.
          </h2>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Real-time by default</h3>
                <p className="text-sm text-white/60">
                  Messages, presence and typing updates arrive instantly.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Groups that stay clear</h3>
                <p className="text-sm text-white/60">
                  Keep roles, people and decisions easy to understand.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Privacy you can see</h3>
                <p className="text-sm text-white/60">
                  Private content remains private—even from platform admins.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <RefreshCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Always in sync</h3>
                <p className="text-sm text-white/60">
                  Pick up any conversation from any signed-in device.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                MC
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                JL
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                NK
              </div>
            </div>
            <span className="text-sm text-white/60 font-medium">Join 12,000+ focused teams</span>
          </div>
        </div>
      </div>
    </div>
  );
};
