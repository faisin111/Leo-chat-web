import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { ShieldCheck, KeyRound, Smartphone, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/features/auth';
// eslint-disable-next-line no-restricted-imports
import { useChangePassword } from '@/features/auth/api/use-change-password';

export const SecurityPage = () => {
  const changePassword = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ChangePasswordFormValues) => {
    changePassword.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          reset();
        },
      },
    );
  };

  return (
    <div className="max-w-3xl w-full mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          Security
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your password and secure your account.
        </p>
      </div>

      <div className="space-y-6">
        {/* Change Password */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="p-6 border-b border-border flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
              <p className="text-sm text-muted-foreground">
                Update your password to keep your account secure.
              </p>
            </div>
          </div>
          <form className="p-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="current">Current password</Label>
              <Input
                id="current"
                type="password"
                placeholder="••••••••"
                className={`max-w-md ${errors.currentPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                {...register('currentPassword')}
              />
              {errors.currentPassword && (
                <p className="text-[10px] text-red-500">{errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New password</Label>
              <Input
                id="new"
                type="password"
                placeholder="••••••••"
                className={`max-w-md ${errors.newPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                {...register('newPassword')}
              />
              {errors.newPassword && (
                <p className="text-[10px] text-red-500">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                className={`max-w-md ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-[10px] text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
            <div className="pt-4">
              <Button
                type="submit"
                variant="gradient"
                disabled={!isDirty || changePassword.isPending}
                className="rounded-xl"
              >
                {changePassword.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Password
              </Button>
            </div>
          </form>
        </section>

        {/* Two-Factor Authentication */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="p-6 border-b border-border flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Two-Factor Authentication (2FA)
              </h2>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account.
              </p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
              <div className="flex items-center space-x-4">
                <Smartphone className="w-6 h-6 text-muted-foreground" />
                <div>
                  <h3 className="font-medium text-foreground text-sm">Authenticator App</h3>
                  <p className="text-xs text-muted-foreground">
                    Use an app like Google Authenticator or Authy.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">
                Enable
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
