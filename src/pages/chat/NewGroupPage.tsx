import { ArrowLeft, Users, Loader2, X, MessageSquarePlus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useState, useEffect } from 'react';
// eslint-disable-next-line no-restricted-imports
import { useSearchUsers } from '@/features/users/api/use-search-users';
// eslint-disable-next-line no-restricted-imports
import type { UserSearchItem } from '@/features/users/api/users-api';
// eslint-disable-next-line no-restricted-imports
import { useCreateGroup } from '@/features/chat/api/use-create-group';
import { useSession } from '@/features/auth';

export const NewGroupPage = () => {
  const [title, setTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserSearchItem[]>([]);

  const currentUser = useSession((s) => s.user);
  const createGroup = useCreateGroup();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearchLoading } = useSearchUsers(debouncedQuery);

  const toggleUser = (user: UserSearchItem) => {
    setSelectedUsers((prev) => {
      if (prev.find((u) => u.id === user.id)) {
        return prev.filter((u) => u.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const handleCreate = () => {
    if (!title.trim() || selectedUsers.length === 0) return;
    createGroup.mutate({
      title: title.trim(),
      memberIds: selectedUsers.map((u) => u.id),
    });
  };

  return (
    <div className="flex-1 flex flex-col h-[100dvh] bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-8 shrink-0 z-10 sticky top-0">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="mr-4 text-slate-500 hover:bg-slate-100"
          >
            <Link to="/app">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex flex-col">
            <h2 className="font-bold text-slate-900 leading-tight">New Group</h2>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
          {/* Left Panel: Inputs and Search */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Group Details
              </h3>
              <Input
                className="h-12 bg-slate-50 rounded-xl border-slate-200 font-medium text-lg placeholder:font-normal"
                placeholder="Group Name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
              />
            </div>

            <div className="bg-white rounded-3xl flex-1 flex flex-col border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Add Members
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    className="pl-10 h-12 bg-white rounded-xl border-slate-200"
                    placeholder="Search by username or display name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 relative">
                {isSearchLoading && debouncedQuery && (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                )}

                {!isSearchLoading && searchResults?.length === 0 && debouncedQuery && (
                  <p className="text-sm text-slate-500 text-center py-8">
                    No users found matching &quot;{debouncedQuery}&quot;
                  </p>
                )}

                {!isSearchLoading &&
                  (!searchResults || searchResults.length === 0) &&
                  !debouncedQuery && (
                    <div className="text-center py-12 flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 text-sm">
                        Search for users to add them to the group.
                      </p>
                    </div>
                  )}

                {searchResults?.map((user) => {
                  const isSelected = !!selectedUsers.find((u) => u.id === user.id);
                  const isSelf = user.id === currentUser?.id;
                  if (isSelf) return null; // Don't show self in search to add

                  return (
                    <SelectableUser
                      key={user.id}
                      initials={(user.displayName || user.username).substring(0, 2).toUpperCase()}
                      name={user.displayName || user.username}
                      handle={`@${user.username}`}
                      selected={isSelected}
                      avatarUrl={user.profilePictureUrl}
                      onClick={() => toggleUser(user)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Preview */}
          <div className="w-full md:w-[340px] shrink-0">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 relative overflow-hidden">
                <Users className="w-8 h-8 relative z-10" />
              </div>

              <h3 className="text-xl font-bold mb-2 text-center break-words w-full">
                {title.trim() || 'Untitled Group'}
              </h3>

              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider mb-8">
                GROUP CHAT
              </span>

              <div className="w-full mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Members · {selectedUsers.length + 1}
                  </span>
                  {selectedUsers.length > 0 && (
                    <button
                      onClick={() => setSelectedUsers([])}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-700 uppercase transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 hide-scrollbar">
                  <SelectedMember
                    initials={(currentUser?.displayName || currentUser?.username || 'U')
                      .substring(0, 2)
                      .toUpperCase()}
                    name={currentUser?.displayName || currentUser?.username || 'You'}
                    memberRole="OWNER"
                    avatarUrl={currentUser?.profilePictureUrl}
                  />
                  {selectedUsers.map((user) => (
                    <SelectedMember
                      key={user.id}
                      initials={(user.displayName || user.username).substring(0, 2).toUpperCase()}
                      name={user.displayName || user.username}
                      memberRole="MEMBER"
                      removable
                      onRemove={() => toggleUser(user)}
                      avatarUrl={user.profilePictureUrl}
                    />
                  ))}
                  {selectedUsers.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4 italic">
                      No members added yet
                    </p>
                  )}
                </div>
              </div>

              <div className="w-full space-y-3 mt-auto">
                <Button
                  onClick={handleCreate}
                  disabled={!title.trim() || selectedUsers.length === 0 || createGroup.isPending}
                  className="w-full rounded-xl h-12 shadow-sm font-semibold gap-2"
                >
                  {createGroup.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <MessageSquarePlus className="w-5 h-5" />
                      Create Group
                    </>
                  )}
                </Button>
                {(!title.trim() || selectedUsers.length === 0) && (
                  <p className="text-[10px] text-center text-slate-500 font-medium px-4">
                    Please provide a group name and select at least one member.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectableUser({ initials, name, handle, selected, avatarUrl, onClick }: any) {
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      role="button"
      tabIndex={0}
      className={`flex items-center p-3 rounded-xl border-2 transition-colors cursor-pointer ${selected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-slate-200 bg-white'}`}
    >
      <div
        className={`w-6 h-6 rounded-md border flex items-center justify-center mr-4 shrink-0 transition-colors ${selected ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white'}`}
      >
        {selected && <span className="text-xs font-bold">✓</span>}
      </div>
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-4 shrink-0 overflow-hidden bg-slate-100 text-slate-700`}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1 min-w-0 pr-4">
        <p className="font-semibold text-sm text-slate-900 truncate">{name}</p>
        <p className="text-xs text-slate-500 truncate">{handle}</p>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectedMember({
  initials,
  name,
  memberRole,
  removable = false,
  avatarUrl,
  onRemove,
}: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center space-x-3 min-w-0 pr-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0 ${memberRole === 'OWNER' ? 'bg-slate-900 text-white' : 'bg-primary/10 text-primary'}`}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <span className="text-xs font-semibold text-slate-900 truncate">{name}</span>
      </div>
      <div className="flex items-center space-x-2 shrink-0">
        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${memberRole === 'OWNER' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}
        >
          {memberRole}
        </span>
        {removable && (
          <button
            onClick={onRemove}
            className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
