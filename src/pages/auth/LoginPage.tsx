import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  MessageSquare,
  Loader2,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { formatApiError } from '@/shared/api/api-error';
import {
  authApi,
  loginSchema,
  type LoginFormValues,
  authSession,
  useSession,
} from '@/features/auth';

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (credentials: LoginFormValues) => {
      const data = await authApi.login(credentials);
      if (data.accessToken) {
        useSession.getState().setAccessToken(data.accessToken);
      }
      let user = data.user;
      // If backend only returns token, fetch user profile to complete session using explicit Bearer token
      if (!user) {
        user = await authApi.getMe(data.accessToken);
      }
      return { accessToken: data.accessToken, user };
    },
    onSuccess: (data) => {
      authSession.markActive();
      useSession
        .getState()
        .setSession(
          data.accessToken,
          data.user as import('@/features/auth/store/session.store').CurrentUser,
        );

      toast.success('Successfully logged in!', { duration: 3000 });

      const searchParams = new URLSearchParams(location.search);
      const redirectQuery = searchParams.get('redirect');
      const sessionRedirect = sessionStorage.getItem('leochat_post_auth_redirect');
      const stateFrom = (location.state as { from?: { pathname: string; search?: string } } | null)
        ?.from;
      const stateFromUrl = stateFrom ? `${stateFrom.pathname}${stateFrom.search || ''}` : null;

      const destination = redirectQuery || sessionRedirect || stateFromUrl || '/app';
      sessionStorage.removeItem('leochat_post_auth_redirect');

      navigate(destination, { replace: true });
    },
    onError: (error) => {
      toast.error(formatApiError(error, 'Invalid username or password.'));
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    mutation.mutate(data);
  };

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:flex-row min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* ── Left Side - Brand Showcase ── */}
      <div className="hidden lg:flex flex-col justify-between w-full lg:w-[48%] bg-gradient-to-br from-slate-950 via-slate-900 to-[hsl(var(--primary)/0.22)] dark:from-black dark:via-slate-950 dark:to-[hsl(var(--primary)/0.18)] border-r border-border/40 p-12 lg:p-16 relative overflow-hidden text-white shrink-0">
        {/* Ambient lighting blooms */}
        <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-[hsl(var(--primary-gradient-to,var(--primary)))]/15 rounded-full blur-[140px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 group" title="Return to LeoChat Home">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" fill="currentColor" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
              LeoChat
            </span>
          </Link>
        </div>

        {/* Product summary */}
        <div className="relative z-10 my-auto py-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 backdrop-blur-md border border-white/15 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Team messenger
          </div>

          <p className="text-2xl lg:text-3xl font-bold leading-snug tracking-tight text-white/95">
            Direct and group chats, voice and video calls, and an AI assistant in one place.
          </p>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 text-xs text-white/60 pt-6 border-t border-white/10">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            Encrypted in transit (HTTPS)
          </span>
          <span>•</span>
          <span>Real-time messaging</span>
        </div>
      </div>

      {/* ── Right Side - Form ── */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-16 relative bg-background">
        {/* Top bar with Theme Switcher & Signup Link */}
        <div className="flex items-center justify-between w-full mb-8 lg:mb-0">
          {/* Mobile Brand Logo */}
          <Link to="/" className="lg:hidden flex items-center space-x-2.5 font-bold text-xl">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] text-primary-foreground flex items-center justify-center shadow-md shadow-primary/25">
              <MessageSquare className="w-4 h-4" fill="currentColor" />
            </div>
            <span className="text-foreground tracking-tight font-extrabold">LeoChat</span>
          </Link>

          <div className="flex items-center gap-3 ml-auto text-sm">
            {/* Quick Theme Toggle */}
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

            <span className="hidden sm:inline text-muted-foreground">New to LeoChat?</span>
            <Button variant="outline" size="sm" asChild className="rounded-xl">
              <Link to={{ pathname: '/register', search: location.search }}>Create account</Link>
            </Button>
          </div>
        </div>

        {/* Center Form Card */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
              <Lock className="w-3 h-3" /> Secure Access
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in to continue your conversations and active channels.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-semibold text-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="john_doe"
                className="h-11 rounded-xl bg-card border-border text-foreground transition-all"
                autoComplete="username"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-xs text-destructive font-medium">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="h-11 pr-10 rounded-xl bg-card border-border text-foreground transition-all"
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
              )}
            </div>

            <Button
              variant="gradient"
              className="w-full h-11 mt-4 rounded-xl font-semibold shadow-md shadow-primary/20"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign in <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Encryption Assurance */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/40 border border-border/60 py-2.5 px-4 rounded-xl">
            <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Encrypted via TLS 1.3 with JWT authentication</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-x-6 pt-6 border-t border-border/40">
          <Link to="/" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link to="/" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link to="/" className="hover:text-foreground transition-colors">
            Help Center
          </Link>
        </div>
      </div>
    </div>
  );
};
