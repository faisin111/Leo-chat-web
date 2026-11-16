import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  MessageSquare,
  Zap,
  Users,
  Shield,
  RefreshCcw,
  Loader2,
  AtSign,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { formatApiError } from '@/shared/api/api-error';
import {
  authApi,
  registerSchema,
  type RegisterFormValues,
  authSession,
  useSession,
  type CurrentUser,
} from '@/features/auth';

const getPasswordStrength = (pass: string) => {
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  return score;
};

const strengthConfig = [
  { label: '', color: 'bg-border' },
  { label: 'Weak — needs uppercase, lowercase, number & symbol', color: 'bg-destructive' },
  { label: 'Fair — keep going', color: 'bg-amber-500' },
  { label: 'Good — almost there', color: 'bg-yellow-500' },
  { label: 'Strong — excellent password', color: 'bg-emerald-500' },
];

export const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      displayName: '',
      email: '',
      password: '',
      terms: false,
    },
  });

  const password = watch('password') ?? '';
  const terms = watch('terms');
  const strength = getPasswordStrength(password);
  const strengthInfo = strengthConfig[password.length === 0 ? 0 : strength];

  const mutation = useMutation({
    mutationFn: async (formData: RegisterFormValues) => {
      const data = await authApi.register(formData);
      if (data.accessToken) {
        useSession.getState().setAccessToken(data.accessToken);
      }
      let user = data.user as CurrentUser | undefined;
      // Fetch full user profile using the returned Bearer token if not directly embedded
      if (!user && data.accessToken) {
        try {
          user = (await authApi.getMe(data.accessToken)) as CurrentUser;
        } catch {
          user = {
            id: data.id,
            username: data.username,
            displayName: data.displayName || formData.displayName || formData.username,
            email: formData.email,
            role: data.role || 'USER',
            isEmailVerified: false,
          };
        }
      }
      return { accessToken: data.accessToken, user };
    },
    onSuccess: (data) => {
      authSession.markActive();
      if (data.user) {
        useSession.getState().setSession(data.accessToken, data.user as CurrentUser);
      }

      toast.success('Welcome to LeoChat! Your account is ready.', { duration: 3000 });

      const from =
        (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/app';
      navigate(from, { replace: true });
    },
    onError: (error) => {
      toast.error(formatApiError(error, 'Registration failed. Please try again.'));
    },
  });

  const onSubmit = (data: RegisterFormValues) => mutation.mutate(data);

  const isDisabled = !terms || mutation.isPending;

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:flex-row min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* ── Left: Form ── */}
      <div className="flex-1 flex flex-col p-6 sm:p-10 lg:p-14 overflow-y-auto">
        {/* Top Navbar */}
        <div className="flex items-center justify-between w-full mb-8 lg:mb-12">
          <Link to="/" className="flex items-center space-x-2.5 font-bold text-xl group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] text-primary-foreground flex items-center justify-center shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" fill="currentColor" />
            </div>
            <span className="font-extrabold tracking-tight text-foreground text-xl">LeoChat</span>
          </Link>

          <div className="flex items-center gap-3 text-sm">
            {/* Theme Toggle */}
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

            <span className="hidden sm:inline text-muted-foreground">Already registered?</span>
            <Button variant="outline" size="sm" asChild className="rounded-xl">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-[440px] mx-auto my-auto py-4">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
              <Sparkles className="w-3 h-3" /> Get started in seconds
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
              Create your account
            </h1>
            <p className="text-muted-foreground text-sm">
              Join LeoChat — real-time messaging built for focus and momentum.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-semibold text-foreground">
                Username
              </Label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="john_doe (letters, numbers, . _ -)"
                  className="h-11 pl-10 rounded-xl bg-card border-border text-foreground transition-all"
                  autoComplete="username"
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-destructive font-medium">{errors.username.message}</p>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-xs font-semibold text-foreground">
                Display name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  placeholder="John Doe"
                  className="h-11 pl-10 rounded-xl bg-card border-border text-foreground transition-all"
                  autoComplete="name"
                  {...register('displayName')}
                />
              </div>
              {errors.displayName && (
                <p className="text-xs text-destructive font-medium">{errors.displayName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="h-11 pl-10 rounded-xl bg-card border-border text-foreground transition-all"
                  autoComplete="email"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password + strength meter */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars • Aa • 1 • @#$%^&+=!"
                  className="h-11 pl-10 pr-10 rounded-xl bg-card border-border text-foreground transition-all"
                  autoComplete="new-password"
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

              {/* Animated strength bar */}
              <div className="flex gap-1 pt-1.5">
                {[1, 2, 3, 4].map((level) => (
                  <div key={level} className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ease-out ${
                        password.length > 0 && strength >= level
                          ? (strengthConfig[strength]?.color ?? 'bg-muted')
                          : 'bg-transparent'
                      }`}
                      style={{ width: password.length > 0 && strength >= level ? '100%' : '0%' }}
                    />
                  </div>
                ))}
              </div>
              {password.length > 0 && strengthInfo && (
                <p
                  className={`text-[11px] font-medium transition-colors duration-200 ${
                    strength >= 4
                      ? 'text-emerald-500'
                      : strength === 3
                        ? 'text-yellow-500'
                        : 'text-muted-foreground'
                  }`}
                >
                  {strengthInfo.label}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="pt-2 space-y-1">
              <div className="flex items-start gap-2.5">
                <input
                  id="terms"
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary shrink-0 bg-card"
                  {...register('terms')}
                />
                <Label
                  htmlFor="terms"
                  className="font-normal cursor-pointer text-xs text-muted-foreground leading-relaxed"
                >
                  I agree to LeoChat&apos;s{' '}
                  <Link to="/" className="text-primary hover:underline underline-offset-2">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/" className="text-primary hover:underline underline-offset-2">
                    Privacy Policy
                  </Link>
                  , and confirm I am at least 16 years old.
                </Label>
              </div>
              {errors.terms && (
                <p className="text-xs text-destructive pl-6 font-medium">{errors.terms.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              variant="gradient"
              className={`w-full h-11 mt-3 rounded-xl font-semibold shadow-md shadow-primary/20 transition-all ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
              }`}
              type="submit"
              disabled={isDisabled}
            >
              {mutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create account <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-auto text-center text-xs text-muted-foreground space-x-6 pt-6 border-t border-border/40">
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

      {/* ── Right: Feature Showcase Panel ── */}
      <div className="hidden lg:flex flex-col justify-center w-[46%] bg-gradient-to-br from-slate-950 via-slate-900 to-[hsl(var(--primary)/0.25)] dark:from-black dark:via-slate-950 dark:to-[hsl(var(--primary)/0.18)] text-white p-12 lg:p-16 relative overflow-hidden border-l border-border/40 shrink-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[460px] h-[460px] bg-[hsl(var(--primary-gradient-to,var(--primary)))]/15 rounded-full blur-[140px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 max-w-md mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 border border-white/15 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Built for momentum
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-8 leading-tight tracking-tight text-white/95">
            One workspace. Every conversation in context.
          </h2>

          <div className="space-y-3.5">
            {[
              {
                icon: <Zap className="w-5 h-5 text-amber-300" />,
                title: 'Real-time by default',
                desc: 'Messages, presence states, and typing indicators arrive instantly.',
              },
              {
                icon: <Users className="w-5 h-5 text-primary" />,
                title: 'Clear group channels',
                desc: 'Organize teammates with roles, member limits, and instant search.',
              },
              {
                icon: <Shield className="w-5 h-5 text-emerald-400" />,
                title: 'Private & protected',
                desc: 'Private direct messages remain confidential and strictly encrypted.',
              },
              {
                icon: <RefreshCcw className="w-5 h-5 text-sky-400" />,
                title: 'Seamless multi-device sync',
                desc: 'Pick up any conversation across laptop, tablet, or phone.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-4 backdrop-blur-md hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  {icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5 text-white">{title}</h3>
                  <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 pt-6 border-t border-white/10">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                MC
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                JL
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                NK
              </div>
            </div>
            <span className="text-xs text-white/70 font-medium">
              Joined by thousands of focused teams
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
