import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useSession } from '@/features/auth';
import { MonitorSmartphone, Bell } from 'lucide-react';

export const ProfilePage = () => {
  const user = useSession((s) => s.user);
  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div className="p-8 max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Profile & account</h1>
          <p className="text-slate-500 text-sm">
            Manage your identity, privacy and sign-in preferences.
          </p>
        </div>
        <Button>Save changes</Button>
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
              <Button variant="outline" size="sm" className="rounded-full">
                Preview
              </Button>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                {user?.displayName ? getInitials(user.displayName) : 'U'}
              </div>
              <div>
                <Button variant="outline" size="sm" className="rounded-full mb-1">
                  Upload new photo
                </Button>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  JPG or PNG - 4 MB max
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Display name</Label>
                <Input defaultValue={user?.displayName} className="bg-slate-50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Username</Label>
                <Input defaultValue={user?.username} className="bg-slate-50" />
              </div>
            </div>

            <div className="space-y-1.5 mb-4">
              <Label className="text-xs text-slate-500">Bio</Label>
              <Input
                defaultValue={user?.bio}
                placeholder="Tell us about yourself"
                className="bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Location (Region)</Label>
                <Input
                  defaultValue={user?.region}
                  placeholder="San Francisco, CA"
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Email Address</Label>
                <Input
                  defaultValue={user?.email}
                  placeholder="john@example.com"
                  className="bg-slate-50"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Phone Number</Label>
                <Input
                  defaultValue={user?.phoneNumber}
                  placeholder="+1 234 567 8900"
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Age</Label>
                <Input
                  type="number"
                  defaultValue={user?.age}
                  placeholder="25"
                  className="bg-slate-50"
                />
              </div>
            </div>
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
    </div>
  );
};
