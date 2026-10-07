import { useState, useEffect } from 'react';
import { Search, Users, X, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
// eslint-disable-next-line no-restricted-imports
import { useSearchUsers } from '@/features/users/api/use-search-users';
// eslint-disable-next-line no-restricted-imports
import type { UserSearchItem } from '@/features/users/api/users-api';
// eslint-disable-next-line no-restricted-imports
import { useAddGroupMembers } from '@/features/chat/api/use-add-group-members';
import { useSession } from '@/features/auth';
import { motion, AnimatePresence } from 'framer-motion';

type AddMembersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
};

export const AddMembersModal = ({ isOpen, onClose, conversationId }: AddMembersModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserSearchItem[]>([]);

  const currentUser = useSession((s) => s.user);
  const addMembers = useAddGroupMembers();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setDebouncedQuery('');
      setSelectedUsers([]);
    }
  }, [isOpen]);

  const { data: searchResults, isLoading: isSearchLoading } = useSearchUsers(debouncedQuery);

  const toggleUser = (user: UserSearchItem) => {
    setSelectedUsers((prev) => {
      if (prev.find((u) => u.id === user.id)) {
        return prev.filter((u) => u.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const handleAdd = () => {
    if (selectedUsers.length === 0) return;
    addMembers.mutate(
      {
        conversationId,
        memberIds: selectedUsers.map((u) => u.id),
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Add Members</h2>
                    <p className="text-xs text-slate-500">Select users to add to this group</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    className="pl-9 h-11 bg-white rounded-xl border-slate-200 text-sm"
                    placeholder="Search by username or display name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Selected pills */}
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full"
                      >
                        <span className="truncate max-w-[100px]">
                          {user.displayName || user.username}
                        </span>
                        <button
                          onClick={() => toggleUser(user)}
                          className="ml-2 text-primary/70 hover:text-primary"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[300px]">
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
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <Search className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-slate-500 text-sm">Type a name to search for users.</p>
                    </div>
                  )}

                {searchResults?.map((user) => {
                  const isSelected = !!selectedUsers.find((u) => u.id === user.id);
                  const isSelf = user.id === currentUser?.id;
                  if (isSelf) return null;

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

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 bg-white">
                <Button
                  onClick={handleAdd}
                  disabled={selectedUsers.length === 0 || addMembers.isPending}
                  className="w-full rounded-xl h-12 font-semibold shadow-sm"
                >
                  {addMembers.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    `Add ${selectedUsers.length} member${selectedUsers.length !== 1 ? 's' : ''}`
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
        className={`w-5 h-5 rounded-md border flex items-center justify-center mr-4 shrink-0 transition-colors ${selected ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white'}`}
      >
        {selected && <span className="text-[10px] font-bold">✓</span>}
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
