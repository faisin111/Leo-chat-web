import { Button } from '@/shared/ui/button';
import { Phone, Video, Info, Smile, Paperclip, Send, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useSendMessage } from '@/features/chat/api/use-send-message';
import { useMessages } from '@/features/chat/api/use-messages';
import { useSession } from '@/features/auth';
import { format } from 'date-fns';

export const ConversationPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [content, setContent] = useState('');
  
  const sendMessage = useSendMessage(conversationId || '');
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useMessages(conversationId || '');
  const currentUser = useSession((s) => s.user);

  // The messages often come sorted newest-first (descending seq) when paginating backward.
  // We reverse them so they flow top-to-bottom chronologically in standard flex layout.
  // Alternatively, we could use a flex-col-reverse container. Let's use standard reverse for now.
  const allMessages = data?.pages.flatMap(p => p.items) || [];
  

  const handleSend = () => {
    if (!content.trim() || !conversationId) return;
    
    sendMessage.mutate({ 
      content: content.trim(),
      type: 'TEXT',
      clientMessageId: crypto.randomUUID()
    }, {
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

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col-reverse gap-6 pb-4">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <p className="text-sm">No messages yet.</p>
            <p className="text-xs">Send a message to start the conversation!</p>
          </div>
        ) : (
          <>
            {allMessages.map((msg) => {
              const isOwn = msg.senderId === currentUser?.id;
              // Very simple initials generation for now
              const initials = isOwn ? (currentUser?.displayName?.[0] || 'U').toUpperCase() : 'U';
              const name = isOwn ? (currentUser?.displayName || 'You') : msg.senderId.substring(0, 8);
              const color = isOwn ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-700';
              const time = format(new Date(msg.createdAt), 'h:mm a');

              return (
                <div key={msg.id} className={`flex items-start space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1 ${color}`}>
                    {initials}
                  </div>
                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div className="flex items-baseline space-x-2 mb-1">
                      <span className="text-xs font-semibold">{name}</span>
                      <span className="text-[10px] text-slate-400">{time}</span>
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${isOwn ? 'bg-primary text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Load more is now at the END of the DOM, which appears at the visually TOP due to flex-col-reverse */}
            {hasNextPage && (
              <div className="text-center pt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => fetchNextPage()} 
                  disabled={isFetchingNextPage}
                  className="text-xs text-primary"
                >
                  {isFetchingNextPage ? 'Loading older...' : 'Load older messages'}
                </Button>
              </div>
            )}
          </>
        )}
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
