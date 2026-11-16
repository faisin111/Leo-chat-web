import { Button } from '@/shared/ui/button';

export const BlockedUsersPage = () => {
  return (
    <div className="max-w-3xl w-full mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          Blocked Users
        </h1>
        <p className="text-sm text-muted-foreground">
          People you have blocked will not be able to message you or see your profile.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="divide-y divide-border">
          <BlockedUserRow
            name="John Smith"
            handle="@johnsmith"
            initials="JS"
            color="bg-primary/10 text-primary border border-primary/20"
            date="Blocked on Oct 1, 2026"
          />
          <BlockedUserRow
            name="Spam Bot 99"
            handle="@crypto_king"
            initials="SB"
            color="bg-muted text-muted-foreground border border-border"
            date="Blocked on Sep 15, 2026"
          />
        </div>
      </div>
    </div>
  );
};

interface BlockedUserRowProps {
  name: string;
  handle: string;
  initials: string;
  color: string;
  date: string;
}

function BlockedUserRow({ name, handle, initials, color, date }: BlockedUserRowProps) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
      <div className="flex items-center space-x-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${color}`}
        >
          {initials}
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground">
            {handle} • {date}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="rounded-xl">
        Unblock
      </Button>
    </div>
  );
}
