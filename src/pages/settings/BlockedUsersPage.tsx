import { Button } from '@/shared/ui/button';


export const BlockedUsersPage = () => {
  return (
    <div className="max-w-3xl w-full mx-auto p-8 overflow-y-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Blocked Users</h1>
        <p className="text-slate-500">People you have blocked will not be able to message you or see your profile.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          <BlockedUserRow name="John Smith" handle="@johnsmith" initials="JS" color="bg-blue-100 text-blue-700" date="Blocked on Oct 1, 2026" />
          <BlockedUserRow name="Spam Bot 99" handle="@crypto_king" initials="SB" color="bg-gray-100 text-gray-700" date="Blocked on Sep 15, 2026" />
        </div>
      </div>
    </div>
  );
};

function BlockedUserRow({ name, handle, initials, color, date }: any) {
  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${color}`}>
          {initials}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{name}</h3>
          <p className="text-xs text-slate-500">{handle} • {date}</p>
        </div>
      </div>
      <Button variant="outline" className="text-slate-600 hover:text-slate-900">
        Unblock
      </Button>
    </div>
  );
}
