import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, FileText, Send, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import type { MessageType } from '@/features/chat';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendAttachment: (type: MessageType, url: string, caption?: string) => void;
  isSending?: boolean;
}

export const AttachmentModal = ({
  isOpen,
  onClose,
  onSendAttachment,
  isSending = false,
}: AttachmentModalProps) => {
  const [activeTab, setActiveTab] = useState<'IMAGE' | 'FILE'>('IMAGE');
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSendAttachment(activeTab, url.trim(), caption.trim());
    setUrl('');
    setCaption('');
    onClose();
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
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden z-10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Send Attachment</h3>
                <p className="text-xs text-slate-500">Share an image or document link</p>
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

            {/* Type selector */}
            <div className="px-6 pt-4 flex space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab('IMAGE')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'IMAGE'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Image
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('FILE')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'FILE'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                Document / File
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSend} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {activeTab === 'IMAGE' ? 'Image URL' : 'File URL'}
                </label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={
                    activeTab === 'IMAGE'
                      ? 'https://images.unsplash.com/...'
                      : 'https://example.com/document.pdf'
                  }
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm"
                  required
                />
              </div>

              {/* Image Preview */}
              {activeTab === 'IMAGE' && url && (
                <div className="w-full h-36 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center relative">
                  <img
                    src={url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Optional Caption / Note
                </label>
                <Input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a message..."
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="rounded-xl text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!url.trim() || isSending}
                  className="rounded-xl font-semibold shadow-sm px-6 gap-2"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
