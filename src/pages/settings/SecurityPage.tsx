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
    <div className="max-w-3xl w-full mx-auto p-8 overflow-y-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Security</h1>
        <p className="text-slate-500">Manage your password and secure your account.</p>
      </div>

      <div className="space-y-8">
        {/* Change Password */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
              <p className="text-sm text-slate-500">
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
              <Button type="submit" disabled={!isDirty || changePassword.isPending}>
                {changePassword.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Password
              </Button>
            </div>
          </form>
        </section>

        {/* Two-Factor Authentication */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Two-Factor Authentication (2FA)
              </h2>
              <p className="text-sm text-slate-500">
                Add an extra layer of security to your account.
              </p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl mb-4">
              <div className="flex items-center space-x-4">
                <Smartphone className="w-6 h-6 text-slate-400" />
                <div>
                  <h3 className="font-medium text-slate-900">Authenticator App</h3>
                  <p className="text-sm text-slate-500">
                    Use an app like Google Authenticator or Authy.
                  </p>
                </div>
              </div>
              <Button variant="outline">Enable</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
