import { useState, useRef, useEffect, useCallback } from 'react';
import type { FormEvent, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Image as ImageIcon,
  FileText,
  Send,
  Loader2,
  UploadCloud,
  HardDrive,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import type { MessageType } from '@/features/chat';
import { mediaApi } from '@/features/media';
import { showApiError } from '@/shared/api/api-error';
import { toast } from 'sonner';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendAttachment: (type: MessageType, url: string, caption?: string) => void;
  isSending?: boolean;
  initialFile?: File | null;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getDocumentBadgeColor = (filename: string): { bg: string; text: string } => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return { bg: 'bg-red-100 border-red-200', text: 'text-red-700' };
    case 'doc':
    case 'docx':
      return { bg: 'bg-blue-100 border-blue-200', text: 'text-blue-700' };
    case 'xls':
    case 'xlsx':
    case 'csv':
      return { bg: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-700' };
    case 'ppt':
    case 'pptx':
      return { bg: 'bg-orange-100 border-orange-200', text: 'text-orange-700' };
    case 'zip':
    case 'rar':
    case '7z':
      return { bg: 'bg-amber-100 border-amber-200', text: 'text-amber-700' };
    default:
      return { bg: 'bg-indigo-100 border-indigo-200', text: 'text-indigo-700' };
  }
};

export const AttachmentModal = ({
  isOpen,
  onClose,
  onSendAttachment,
  isSending = false,
  initialFile = null,
}: AttachmentModalProps) => {
  const [activeTab, setActiveTab] = useState<'IMAGE' | 'FILE'>('IMAGE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File exceeds the 10 MB limit');
      return;
    }

    const isImage = file.type.startsWith('image/');
    if (isImage) {
      setActiveTab('IMAGE');
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
    } else {
      setActiveTab('FILE');
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }

    setSelectedFile(file);
  }, []);

  // Sync initialFile if passed in (e.g., from drag & drop or quick picker)
  useEffect(() => {
    if (initialFile) {
      handleFileSelected(initialFile);
    }
  }, [initialFile, handleFileSelected]);

  // Clean up object URLs when modal unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleClearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const confirmData = await mediaApi.uploadFile(selectedFile);
      onSendAttachment(activeTab, confirmData.url, caption.trim());
      handleClearFile();
      setCaption('');
      onClose();
    } catch (err: unknown) {
      showApiError(err, 'Failed to upload attachment from device');
    } finally {
      setIsUploading(false);
    }
  };

  const isBusy = isUploading || isSending;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={isBusy ? undefined : onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden z-10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Upload Attachment</h3>
                  <p className="text-xs text-slate-500">
                    Pick a photo or document directly from your internal storage
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                disabled={isBusy}
                className="rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Type selector */}
            <div className="px-6 pt-4 flex space-x-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  setActiveTab('IMAGE');
                  if (selectedFile && !selectedFile.type.startsWith('image/')) {
                    handleClearFile();
                  }
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'IMAGE'
                    ? 'bg-primary text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Photos & Images
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  setActiveTab('FILE');
                  if (selectedFile && selectedFile.type.startsWith('image/')) {
                    handleClearFile();
                  }
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'FILE'
                    ? 'bg-primary text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                Documents & Files
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSend} className="p-6 space-y-4">
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={
                  activeTab === 'IMAGE'
                    ? 'image/jpeg,image/png,image/webp,image/gif,image/avif'
                    : '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.json,application/*,text/*'
                }
                onChange={handleInputChange}
              />

              {/* Dropzone / Selected File Display */}
              {!selectedFile ? (
                <button
                  type="button"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-primary bg-primary/5 scale-[1.01]'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary mb-3">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    {activeTab === 'IMAGE'
                      ? 'Choose image from internal storage'
                      : 'Choose document from internal storage'}
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mb-3">
                    Click to browse your device files or drag and drop your{' '}
                    {activeTab === 'IMAGE' ? 'image' : 'document'} here
                  </p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-200/70 text-slate-600">
                    Max size: 10 MB
                  </span>
                </button>
              ) : (
                /* Selected File Preview */
                <div className="space-y-3">
                  {activeTab === 'IMAGE' && previewUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center max-h-56">
                      <img src={previewUrl} alt="Preview" className="w-full h-56 object-contain" />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isBusy}
                          className="p-1.5 rounded-xl bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
                          title="Change image"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleClearFile}
                          disabled={isBusy}
                          className="p-1.5 rounded-xl bg-rose-600/80 text-white hover:bg-rose-600 transition-colors"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Document preview card */
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 pr-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-xs uppercase shrink-0 ${
                            getDocumentBadgeColor(selectedFile.name).bg
                          } ${getDocumentBadgeColor(selectedFile.name).text}`}
                        >
                          {selectedFile.name.split('.').pop() || 'FILE'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900"
                        >
                          Change
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={isBusy}
                          onClick={handleClearFile}
                          className="rounded-xl text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* File meta info */}
                  {activeTab === 'IMAGE' && (
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                      <span className="truncate max-w-[280px] font-medium text-slate-700">
                        {selectedFile.name}
                      </span>
                      <span>{formatFileSize(selectedFile.size)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Caption Input */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Optional Caption / Note
                </label>
                <Input
                  value={caption}
                  disabled={isBusy}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a message or description..."
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isBusy}
                  className="rounded-xl text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedFile || isBusy}
                  className="rounded-xl font-semibold shadow-sm px-6 gap-2"
                >
                  {isBusy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading from device...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Attachment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
