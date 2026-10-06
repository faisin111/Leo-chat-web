import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MessageSquare, Zap, Users, Shield, RefreshCcw, Loader2 } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { toApiException } from '@/shared/api/api-error';
import { authApi, registerSchema, type RegisterFormValues } from '@/features/auth';

const getPasswordStrength = (pass: string) => {
  let score = 0;
  if (!pass) return 0;
  if (pass.length > 0) score += 1;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  return Math.min(score, 4);
};

export const RegisterPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      terms: false,
    },
  });

  const password = watch('password');
  const terms = watch('terms');
  const strength = getPasswordStrength(password || '');

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Account created successfully! Please sign in.', {
        style: { background: '#22c55e', color: 'white', border: 'none' },
      });
      navigate('/login');
    },
    onError: (error) => {
      const apiError = toApiException(error);
      toast.error(apiError.message || 'Registration failed', {
        style: { background: '#ef4444', color: 'white', border: 'none' },
      });
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    mutation.mutate(data);
  };

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-border';
    if (strength === 1) return 'bg-red-500';
    if (strength === 2) return 'bg-orange-500';
    if (strength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (strength === 0) return 'Enter a password';
    if (strength === 1) return 'Weak - Too short';
    if (strength === 2) return 'Fair - Add numbers & uppercase';
    if (strength === 3) return 'Good - Add symbols for strong';
    return 'Strong - Excellent password';
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:flex-row h-full min-h-screen">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col p-8 lg:p-12 relative overflow-y-auto">
        <div className="flex items-center justify-between w-full mb-12 lg:mb-24">
          <div className="flex items-center space-x-2 font-bold text-xl text-primary">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <MessageSquare className="w-4 h-4" fill="currentColor" />
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

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  placeholder="Alex"
                  {...register('firstName')}
                  className="h-12"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2 flex-1">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Rivera"
                  {...register('lastName')}
                  className="h-12"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@northstar.design"
                {...register('email')}
                className="h-12"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                {...register('password')}
                className="h-12"
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}

              {/* Password strength indicator with animation */}
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map((level) => (
                  <div key={level} className="h-1 flex-1 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ease-out ${getStrengthColor()}`}
                      style={{ width: strength >= level ? '100%' : '0%' }}
                    ></div>
                  </div>
                ))}
              </div>
              <p
                className={`text-xs font-medium mt-1 transition-colors duration-500 ${strength === 4 ? 'text-green-600' : 'text-muted-foreground'}`}
              >
                {getStrengthLabel()}
              </p>
            </div>

            <div className="flex items-start mt-6 pt-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 rounded border-input text-primary focus:ring-primary h-4 w-4"
                {...register('terms')}
              />
              <Label
                htmlFor="terms"
                className="ml-2 font-normal cursor-pointer text-sm text-muted-foreground leading-relaxed"
              >
                I agree to LeoChat&apos;s Terms of Service and Privacy Policy, and confirm I&apos;m
                at least 16 years old.
              </Label>
            </div>
            {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms.message}</p>}

            <Button
              className="w-full h-12 mt-6 transition-all duration-700 ease-in-out"
              type="submit"
              disabled={!terms || mutation.isPending}
            >
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create account'}
            </Button>
          </form>

          <div className="mt-12 text-center text-xs text-muted-foreground space-x-4">
            <Link to="/" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="/" className="hover:text-foreground">
              Terms
            </Link>
            <Link to="/" className="hover:text-foreground">
              Help center
            </Link>
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
