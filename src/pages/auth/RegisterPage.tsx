import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { formatApiError } from '@/shared/api/api-error';
import { authApi, registerSchema, type RegisterFormValues } from '@/features/auth';

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
  { label: 'Weak — needs uppercase, lowercase, number & @#$%^&+=!', color: 'bg-red-500' },
  { label: 'Fair — keep going', color: 'bg-orange-500' },
  { label: 'Good — almost there', color: 'bg-yellow-500' },
  { label: 'Strong — great password!', color: 'bg-green-500' },
];

export const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Account created! Please sign in.', { duration: 4000 });
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      toast.error(formatApiError(error, 'Registration failed. Please try again.'));
    },
  });

  const onSubmit = (data: RegisterFormValues) => mutation.mutate(data);

  const isDisabled = !terms || mutation.isPending;

  return (
    <div className="flex w-full flex-1 flex-col lg:flex-row h-full min-h-screen">
      {/* ── Left: Form ── */}
      <div className="flex-1 flex flex-col p-8 lg:p-12 overflow-y-auto">
        <div className="flex items-center justify-between w-full mb-10 lg:mb-16">
          <div className="flex items-center space-x-2 font-bold text-xl text-primary">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <MessageSquare className="w-4 h-4" fill="currentColor" />
            </div>
            <span>LeoChat</span>
          </div>
          <div className="text-sm hidden sm:flex items-center gap-3">
            <span className="text-muted-foreground">Already have an account?</span>
            <Button variant="outline" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        <div className="w-full max-w-[440px] mx-auto flex-1">
          <h1 className="text-3xl font-bold mb-1">Create your account</h1>
          <p className="text-muted-foreground mb-8">Join LeoChat — it only takes a minute.</p>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Username */}
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="john_doe  (letters, numbers, . _ -)"
                  className="h-12 pl-9"
                  autoComplete="username"
                  {...register('username')}
                />
              </div>
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>

            {/* Display Name */}
            <div className="space-y-1">
              <Label htmlFor="displayName">Display name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  placeholder="John Doe"
                  className="h-12 pl-9"
                  autoComplete="name"
                  {...register('displayName')}
                />
              </div>
              {errors.displayName && (
                <p className="text-xs text-red-500">{errors.displayName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="h-12 pl-9"
                  autoComplete="email"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password + strength meter */}
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars • Aa • 1 • @#$%^&+=!"
                  className="h-12 pl-9 pr-10"
                  autoComplete="new-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}

              {/* Animated strength bar */}
              <div className="flex gap-1 pt-1">
                {[1, 2, 3, 4].map((level) => (
                  <div key={level} className="h-1.5 flex-1 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        password.length > 0 && strength >= level
                          ? (strengthConfig[strength]?.color ?? 'bg-border')
                          : 'bg-transparent'
                      }`}
                      style={{ width: password.length > 0 && strength >= level ? '100%' : '0%' }}
                    />
                  </div>
                ))}
              </div>
              {password.length > 0 && strengthInfo && (
                <p
                  className={`text-xs font-medium transition-colors duration-300 ${
                    strength === 4
                      ? 'text-green-600'
                      : strength === 3
                        ? 'text-yellow-600'
                        : 'text-muted-foreground'
                  }`}
                >
                  {strengthInfo.label}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="pt-2 space-y-1">
              <div className="flex items-start gap-3">
                <input
                  id="terms"
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary shrink-0"
                  {...register('terms')}
                />
                <Label
                  htmlFor="terms"
                  className="font-normal cursor-pointer text-sm text-muted-foreground leading-relaxed"
                >
                  I agree to LeoChat&apos;s{' '}
                  <Link to="/" className="text-primary underline underline-offset-2">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/" className="text-primary underline underline-offset-2">
                    Privacy Policy
                  </Link>
                  , and confirm I&apos;m at least 16 years old.
                </Label>
              </div>
              {errors.terms && <p className="text-xs text-red-500 pl-7">{errors.terms.message}</p>}
            </div>

            {/* Submit */}
            <Button
              className={`w-full h-12 mt-2 font-semibold text-base transition-all duration-500 ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
              }`}
              type="submit"
              disabled={isDisabled}
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </span>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <div className="mt-10 text-center text-xs text-muted-foreground space-x-4">
            <Link to="/" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="/" className="hover:text-foreground">
              Terms
            </Link>
            <Link to="/" className="hover:text-foreground">
              Help
            </Link>
          </div>
        </div>
      </div>

      {/* ── Right: Feature panel ── */}
      <div className="hidden lg:flex flex-col justify-center w-[45%] bg-slate-900 text-white p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 max-w-md mx-auto">
          <div className="inline-block px-2 py-1 bg-white/10 rounded text-[10px] font-bold uppercase tracking-widest mb-6">
            Built for momentum
          </div>
          <h2 className="text-4xl font-bold mb-10 leading-tight">
            One workspace. Every conversation in context.
          </h2>

          <div className="space-y-4">
            {[
              {
                icon: <Zap className="w-5 h-5" />,
                title: 'Real-time by default',
                desc: 'Messages, presence and typing updates arrive instantly.',
              },
              {
                icon: <Users className="w-5 h-5" />,
                title: 'Groups that stay clear',
                desc: 'Keep roles, people and decisions easy to understand.',
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: 'Privacy you can see',
                desc: 'Private content remains private—even from platform admins.',
              },
              {
                icon: <RefreshCcw className="w-5 h-5" />,
                title: 'Always in sync',
                desc: 'Pick up any conversation from any signed-in device.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-0.5">{title}</h3>
                  <p className="text-sm text-white/60">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-3">
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
