import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MessageSquare, Loader2, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { toApiException } from '@/shared/api/api-error';
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
    mutationFn: authApi.login,
    onSuccess: (data) => {
      authSession.markActive();
      useSession.getState().setAccessToken(data.accessToken);

      // If the backend returns the user object, set it too
      if (data.user) {
        useSession.getState().setUser(data.user);
      }

      toast.success('Successfully logged in!', { duration: 3000 });

      const from =
        (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/app';
      navigate(from, { replace: true });
    },
    onError: (error) => {
      const apiError = toApiException(error);
      const detail =
        apiError.fieldErrors.length > 0
          ? apiError.fieldErrors.map((e) => `${e.field}: ${e.message}`).join(' · ')
          : apiError.message;
      toast.error(detail || 'Invalid username or password.');
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:flex-row h-full min-h-screen">
      {/* Left side - Visuals */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-900 border-r border-border p-12 relative overflow-hidden text-white">
        {/* Background gradient/image placeholder */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex items-center space-x-2 font-bold text-xl text-primary-foreground">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <MessageSquare className="w-4 h-4" fill="currentColor" />
          </div>
          <span>LeoChat</span>
        </div>

        <div className="relative z-10 max-w-md mt-24">
          <div className="w-12 h-12 bg-white/10 text-primary-foreground flex items-center justify-center rounded-xl mb-6 text-2xl font-serif">
            &quot;
          </div>
          <h2 className="text-3xl font-bold mb-6 leading-tight text-white">
            &quot;LeoChat keeps our decisions close to the work—and our conversations genuinely
            focused.&quot;
          </h2>
          <div>
            <p className="font-bold text-white">Maya Chen</p>
            <p className="text-white/60 text-sm">Head of Design, Northstar Studio</p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/60 mt-24">
          Private by design • Synced everywhere
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative">
        <div className="absolute top-8 right-8 text-sm">
          <span className="text-muted-foreground mr-2">New to LeoChat?</span>
          <Button variant="outline" asChild>
            <Link to="/register">Create account</Link>
          </Button>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center space-x-2 font-bold text-xl text-primary mb-12">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <MessageSquare className="w-4 h-4" fill="currentColor" />
            </div>
            <span>LeoChat</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Sign in to continue your conversations.</p>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="john_doe"
                className="h-12"
                autoComplete="username"
                {...register('username')}
              />
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="h-12 pr-10"
                  autoComplete="current-password"
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
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <Label htmlFor="remember" className="font-normal cursor-pointer text-sm">
                  Remember me
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button className="w-full h-12 mt-6" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Your session is encrypted and protected.
          </div>

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
    </div>
  );
};
