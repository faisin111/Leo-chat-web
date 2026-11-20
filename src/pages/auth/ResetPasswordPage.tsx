import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MessageSquare, Loader2, Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { formatApiError } from '@/shared/api/api-error';
import { authApi, resetPasswordSchema, type ResetPasswordFormValues } from '@/features/auth';

export const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Support both query param (?token=xyz from email) and router state
  const tokenFromUrl = searchParams.get('token') || '';
  const tokenFromState = (location.state as { token?: string } | null)?.token || '';
  const [initialToken] = useState(() => tokenFromUrl || tokenFromState);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: initialToken, newPassword: '', confirmPassword: '' },
  });

  // Inject token if found
  useEffect(() => {
    if (initialToken) {
      setValue('token', initialToken);
    }
  }, [initialToken, setValue]);

  const mutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success('Password successfully reset! Please sign in with your new password.', {
        duration: 4000,
      });
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      toast.error(formatApiError(error, 'Failed to reset password. The link may have expired.'));
    },
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:flex-row h-full min-h-screen">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-900 border-r border-border p-12 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10 flex items-center space-x-2 font-bold text-xl text-primary-foreground">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <MessageSquare className="w-4 h-4" fill="currentColor" />
          </div>
          <span>LeoChat</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative">
        <div className="w-full max-w-[400px]">
          {!initialToken ? (
            <div className="text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold">Missing Reset Token</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This password reset link is invalid or incomplete. Please request a new password
                reset link.
              </p>
              <div className="pt-4">
                <Button asChild className="w-full h-11 cursor-pointer">
                  <Link to="/forgot-password">Request new password reset</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">Set new password</h1>
              <p className="text-muted-foreground mb-8">
                Your email reset link is valid. Please enter your new password below.
              </p>

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 chars • Aa • 1"
                      className="h-12 pl-9 pr-10"
                      autoComplete="new-password"
                      {...register('newPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-red-500">{errors.newPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      className="h-12 pl-9 pr-10"
                      autoComplete="new-password"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showConfirm ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button className="w-full h-12 mt-6" type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Save new password'
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
