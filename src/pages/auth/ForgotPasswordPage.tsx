import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MessageSquare, Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { formatApiError } from '@/shared/api/api-error';
import { authApi, forgotPasswordSchema, type ForgotPasswordFormValues } from '@/features/auth';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (data: unknown, variables) => {
      let token = typeof data === 'string' ? data : (data as { token?: string })?.token;

      // If the backend returns it in a dev mode message string: "DEV MODE TOKEN: <token>"
      if (!token && (data as { message?: string })?.message) {
        const msg = (data as { message: string }).message;
        const match = msg.match(/DEV MODE TOKEN:\s*([a-f0-9-]+)/i);
        if (match) {
          token = match[1];
        }
      }

      if (token) {
        toast.success('Password reset link generated');
        navigate('/reset-password', { state: { token } });
      } else {
        // Formspree email delivery: the reset link was delivered directly to the user's inbox
        setSubmittedEmail(variables.email);
        toast.success('Password reset instructions sent! Please check your email.', {
          duration: 5000,
        });
      }
    },
    onError: (error) => {
      toast.error(formatApiError(error, 'Failed to send recovery request.'));
    },
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:flex-row h-full min-h-screen">
      {/* Left side - Visuals */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-900 border-r border-border p-12 relative overflow-hidden text-white">
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
            Secure, reliable, and always ready when you need to recover access.
          </h2>
        </div>

        <div className="relative z-10 text-xs text-white/60 mt-24">
          Private by design • Synced everywhere
        </div>
      </div>

      {/* Right side - Form or Confirmation */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative">
        <div className="w-full max-w-[400px]">
          {submittedEmail ? (
            <div className="text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-4 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We sent password reset instructions to{' '}
                <span className="font-semibold text-foreground">{submittedEmail}</span>. Please
                check your inbox and click the reset link to create a new password.
              </p>
              <div className="pt-4 space-y-2.5">
                <Button
                  variant="outline"
                  className="w-full h-11 cursor-pointer"
                  onClick={() => setSubmittedEmail(null)}
                >
                  Resend or use a different email
                </Button>
                <Button asChild variant="ghost" className="w-full h-11 cursor-pointer">
                  <Link to="/login">Back to login</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Link>

              <h1 className="text-3xl font-bold mb-2">Forgot password?</h1>
              <p className="text-muted-foreground mb-8">
                No worries, we&apos;ll send you instructions to help you reset your password.
              </p>

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="space-y-2">
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

                <Button className="w-full h-12 mt-6" type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Continue to reset password'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
