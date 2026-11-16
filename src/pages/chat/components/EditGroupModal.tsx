import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings2, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Avatar } from '@/shared/ui/avatar';
import { useUpdateConversation } from '@/features/chat';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  initialTitle?: string;
  initialAvatarUrl?: string | null;
}

export const EditGroupModal = ({
  isOpen,
  onClose,
  conversationId,
  initialTitle = '',
  initialAvatarUrl = '',
}: EditGroupModalProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || '');
  const updateConversation = useUpdateConversation();

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setAvatarUrl(initialAvatarUrl || '');
    }
  }, [isOpen, initialTitle, initialAvatarUrl]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !conversationId) return;

    updateConversation.mutate(
      {
        id: conversationId,
        data: {
          title: title.trim(),
          avatarUrl: avatarUrl.trim() || undefined,
        },
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-card rounded-3xl w-full max-w-md shadow-2xl border border-border overflow-hidden z-10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Edit Group</h3>
                  <p className="text-xs text-muted-foreground">Update group name and avatar</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Group Name
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter group name"
                  maxLength={100}
                  className="h-11 rounded-xl bg-muted/40 border-border text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Avatar Image URL (Optional)
                </label>
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={avatarUrl.trim() || null}
                    alt="Preview"
                    className="w-12 h-12 rounded-2xl bg-muted border border-border shrink-0 text-foreground"
                    fallback={<ImageIcon className="w-5 h-5 text-muted-foreground" />}
                  />
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="h-11 rounded-xl bg-muted/40 border-border flex-1 text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="rounded-xl text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!title.trim() || updateConversation.isPending}
                  className="rounded-xl font-semibold shadow-md px-6 bg-gradient-to-r from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] text-primary-foreground hover:brightness-105 active:scale-95 transition-all"
                >
                  {updateConversation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
