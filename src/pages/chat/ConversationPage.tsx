import { Button } from '@/shared/ui/button';
import { Phone, Video, Info, Smile, Paperclip, Send, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useState } from 'react'; import type { KeyboardEvent } from 'react';
import { useSendMessage } from '@/features/chat/api/use-send-message';

export const ConversationPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [content, setContent] = useState('');
  
  const sendMessage = useSendMessage(conversationId || '');

  const handleSend = () => {
    if (!content.trim() || !conversationId) return;
    sendMessage.mutate({ content: content.trim() }, {
      onSuccess: () => {
        setContent('');
      }
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Header */}
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
            #
          </div>
          <div>
            <h2 className="font-semibold text-sm">Conversation</h2>
            <p className="text-[10px] text-slate-500">{conversationId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-full h-9 w-9"><Phone className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-full h-9 w-9"><Video className="w-4 h-4" /></Button>
          <div className="w-px h-4 bg-slate-200 mx-2"></div>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-full h-9 w-9"><Info className="w-4 h-4" /></Button>
        </div>
      </header>

      {/* Messages List (API integration coming soon) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col pb-4">
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <p className="text-sm">No messages yet.</p>
          <p className="text-xs">Send a message to start the conversation!</p>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-end bg-slate-50 rounded-2xl border border-slate-200 p-1 pl-4 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <textarea 
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 max-h-32 text-sm focus:outline-none" 
            placeholder="Write a message..."
            rows={1}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sendMessage.isPending}
          />
          <div className="flex items-center space-x-1 p-2 shrink-0">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-full h-8 w-8"><Paperclip className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-full h-8 w-8"><Smile className="w-4 h-4" /></Button>
            <Button 
              size="icon" 
              className="rounded-full h-8 w-8 bg-primary text-white hover:bg-primary/90 ml-2 shadow-sm"
              onClick={handleSend}
              disabled={!content.trim() || sendMessage.isPending}
            >
              {sendMessage.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 ml-0.5" />}
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2 font-medium"><strong>Return</strong> to send, <strong>Shift + Return</strong> for new line</p>
      </div>
    </div>
  );
};
