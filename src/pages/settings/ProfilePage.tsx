import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Avatar } from '@/shared/ui/avatar';
import { useSession, isAdminRole } from '@/features/auth';
import {
  MonitorSmartphone,
  Bell,
  Edit2,
  X,
  Loader2,
  Upload,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { useState, useRef, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { showApiError } from '@/shared/api/api-error';
import { Link } from 'react-router-dom';
import { useUpdateProfile, useDeactivateAccount } from '@/features/users';
// eslint-disable-next-line no-restricted-imports
import { useResendVerification } from '@/features/auth/api/use-resend-verification';
import { mediaApi } from '@/features/media';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name is required'),
  bio: z.string().optional(),
  region: z.string().optional(),
  age: z.coerce.number().min(0).optional(),
  phoneNumber: z.string().optional(),
});

type ProfileFormInput = z.input<typeof profileSchema>;
type ProfileFormOutput = z.infer<typeof profileSchema>;

export const ProfilePage = () => {
  const user = useSession((s) => s.user);
  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deactivateConfirmText, setDeactivateConfirmText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateProfile = useUpdateProfile();
  const deactivateAccount = useDeactivateAccount();
  const resendVerification = useResendVerification();
  const isAdmin = isAdminRole(user?.role);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormInput, unknown, ProfileFormOutput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      region: user?.region || '',
      age: user?.age || 0,
      phoneNumber: user?.phoneNumber || '',
    },
  });

  const onSubmit = (data: ProfileFormOutput) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleCancel = () => {
    reset(); // Revert back to default values
    setIsEditing(false);
  };

  const handlePhotoSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10 MB limit');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const res = await mediaApi.uploadImage(file);
      await updateProfile.mutateAsync({ profilePictureUrl: res.url });
      toast.success('Profile photo updated successfully');
    } catch (err: unknown) {
      showApiError(err, 'Failed to upload profile photo');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Profile & account</h1>
          <p className="text-slate-500 text-sm">
            Manage your identity, privacy and sign-in preferences.
          </p>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={updateProfile.isPending}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={!isDirty || updateProfile.isPending}
              >
                {updateProfile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save changes
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Public Profile Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-semibold mb-1">Public profile</h3>
                <p className="text-xs text-slate-500">
                  This information is visible to people who can find you.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <Avatar
                src={user?.profilePictureUrl}
                alt={user?.displayName || 'User'}
                className="w-16 h-16 bg-primary/10 text-primary font-bold text-xl shrink-0"
                fallback={user?.displayName ? getInitials(user.displayName) : 'U'}
              />
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelected}
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full mb-1"
                  disabled={!isEditing || isUploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {isUploadingPhoto ? 'Uploading...' : 'Upload new photo'}
                </Button>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  JPEG, PNG, WEBP, GIF, AVIF - 10 MB max
                </p>
              </div>
            </div>

            <form id="profile-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">Display name</Label>
                  <Input
                    {...register('displayName')}
                    disabled={!isEditing}
                    className={`bg-slate-50 ${errors.displayName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.displayName && (
                    <p className="text-[10px] text-red-500">{errors.displayName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">Username</Label>
                  {/* Username is usually immutable after creation, or requires a different endpoint */}
                  <Input
                    defaultValue={user?.username}
                    disabled
                    className="bg-slate-50 text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <Label className="text-xs text-slate-500">Bio</Label>
                <Input
                  {...register('bio')}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself"
                  className="bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">Location (Region)</Label>
                  <Input
                    {...register('region')}
                    disabled={!isEditing}
                    placeholder="San Francisco, CA"
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-slate-500">Email Address</Label>
                    {user && !user.isEmailVerified && !user.emailVerified && (
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        Not verified
                      </span>
                    )}
                    {user && (user.isEmailVerified || user.emailVerified) && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      defaultValue={user?.email}
                      disabled
                      className="bg-slate-50 text-slate-400 flex-1"
                    />
                    {user && !user.isEmailVerified && !user.emailVerified && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={resendVerification.isPending || !user?.email}
                        onClick={() => resendVerification.mutate({ email: user?.email || '' })}
                      >
                        {resendVerification.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Verify'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">Phone Number</Label>
                  <Input
                    {...register('phoneNumber')}
                    disabled={!isEditing}
                    placeholder="+1 234 567 8900"
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">Age</Label>
                  <Input
                    type="number"
                    {...register('age')}
                    disabled={!isEditing}
                    placeholder="25"
                    className="bg-slate-50"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Sessions & Devices Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-semibold mb-1">Sessions & devices</h3>
                <p className="text-xs text-slate-500">
                  You&apos;re signed in on 3 devices. Review anything you don&apos;t recognize.
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full">
                Sign out others
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center p-3 rounded-xl border border-slate-100 bg-slate-50">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-4 shrink-0 text-slate-400">
                  <MonitorSmartphone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">MacBook Pro · Chrome</p>
                  <p className="text-xs text-slate-500">San Francisco, CA · Current session</p>
                </div>
                <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full uppercase">
                  Current
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone: Deactivate Account Card */}
          <div className="bg-white rounded-2xl p-6 border border-red-200/80 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-base">Danger Zone</h3>
                <p className="text-xs text-slate-500">Irreversible account actions</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mt-3 mb-4">
              Deactivating your account will disable your public profile, set your account status to
              disabled, and prevent you from logging in. Direct message channels with other users
              will be frozen.
            </p>

            {isAdmin ? (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/60 text-xs text-amber-800 space-y-1 mb-4">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Admin Account Restriction
                </p>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  The backend rules prohibit deactivating the single active Administrator account.
                  You must first transfer platform ownership to another member in the Admin Console.
                </p>
                <Link
                  to="/app/admin/ownership"
                  className="inline-block font-bold text-amber-900 underline mt-1"
                >
                  Go to Transfer Ownership &rarr;
                </Link>
              </div>
            ) : null}

            <Button
              type="button"
              variant="outline"
              disabled={isAdmin || deactivateAccount.isPending}
              onClick={() => {
                setDeactivateConfirmText('');
                setIsDeactivateModalOpen(true);
              }}
              className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 shadow-xs text-xs font-semibold"
            >
              Deactivate Account
            </Button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-semibold mb-1">Notifications</h3>
            <p className="text-xs text-slate-500 mb-6">Choose how LeoChat gets your attention.</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium">Direct messages</p>
                    <p className="text-[10px] text-slate-500">
                      Notify for every new direct message
                    </p>
                  </div>
                </div>
                <div className="w-8 h-5 rounded-full bg-primary flex items-center p-0.5 justify-end">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold mb-1">Security</h3>
                <p className="text-xs text-slate-500">Keep control of account access.</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full">
                Manage
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium">Two-factor authentication</p>
                  <p className="text-[10px] text-slate-500">Authenticator app enabled</p>
                </div>
                <span className="text-[10px] font-bold text-green-600 uppercase">On</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-[10px] text-slate-500">Updated 45 days ago</p>
                </div>
                <button className="text-xs text-primary font-medium hover:underline">Change</button>
              </div>
            </div>
          </div>

          {/* Blocked Users */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold mb-1">Blocked users</h3>
                <p className="text-xs text-slate-500">Blocked people can&apos;t message you.</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full">
                View all
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">
                    RB
                  </div>
                  <div>
                    <p className="text-sm font-medium">Riley Brooks</p>
                    <p className="text-[10px] text-slate-500">Blocked Aug 15</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-full">
                  Unblock
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deactivate Account Confirmation Modal */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Deactivate Account</h3>
                <p className="text-xs text-slate-500">This action will immediately log you out</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Your profile will be deactivated, and other members won&apos;t be able to send you
              messages. To proceed, please type{' '}
              <strong className="font-mono text-red-600">deactivate</strong> in the box below:
            </p>

            <Input
              value={deactivateConfirmText}
              onChange={(e) => setDeactivateConfirmText(e.target.value)}
              placeholder='Type "deactivate" to confirm'
              className="mb-4 text-xs h-10"
            />

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeactivateModalOpen(false)}
                disabled={deactivateAccount.isPending}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={
                  deactivateConfirmText.trim().toLowerCase() !== 'deactivate' ||
                  deactivateAccount.isPending
                }
                onClick={() => {
                  deactivateAccount.mutate();
                }}
                className="rounded-xl shadow-xs"
              >
                {deactivateAccount.isPending && (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                )}
                Confirm Deactivation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
