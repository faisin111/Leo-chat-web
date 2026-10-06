import { Button } from '@/shared/ui/button';

import { Phone, Video, Info, Smile, Paperclip, Send } from 'lucide-react';

export const ConversationPage = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Header */}
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
            PR
          </div>
          <div>
            <h2 className="font-semibold text-sm">Product room</h2>
            <p className="text-[10px] text-slate-500">8 members</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-full h-9 w-9"><Phone className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-full h-9 w-9"><Video className="w-4 h-4" /></Button>
          <div className="w-px h-4 bg-slate-200 mx-2"></div>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-full h-9 w-9"><Info className="w-4 h-4" /></Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-end pb-4">
        <div className="text-center my-4"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full">Today</span></div>
        
        <MessageRow initials="MC" name="Maya Chen" time="10:42 AM" color="bg-green-100 text-green-700">
          Hey everyone, just uploaded the new specs for the Q3 release.
        </MessageRow>
        
        <MessageRow initials="JL" name="Jamie Lee" time="10:45 AM" color="bg-yellow-100 text-yellow-700">
          Looks great! Did we get sign-off from legal on the new privacy notice?
        </MessageRow>
        
        <MessageRow initials="U" name="You" time="10:48 AM" color="bg-primary/10 text-primary" isOwn>
          Yes, legal approved it yesterday. I've attached the final PDF to the epic.
        </MessageRow>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-end bg-slate-50 rounded-2xl border border-slate-200 p-1 pl-4 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <textarea 
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 max-h-32 text-sm" 
            placeholder="Write a message..."
            rows={1}
          />
          <div className="flex items-center space-x-1 p-2 shrink-0">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-full h-8 w-8"><Paperclip className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-full h-8 w-8"><Smile className="w-4 h-4" /></Button>
            <Button size="icon" className="rounded-full h-8 w-8 bg-primary text-white hover:bg-primary/90 ml-2 shadow-sm"><Send className="w-3.5 h-3.5 ml-0.5" /></Button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2 font-medium"><strong>Return</strong> to send, <strong>Shift + Return</strong> for new line</p>
      </div>
    </div>
  );
};

function MessageRow({ initials, name, time, color, isOwn, children }: any) {
  return (
    <div className={`flex items-start space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1 ${color}`}>
        {initials}
      </div>
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="text-xs font-semibold">{name}</span>
          <span className="text-[10px] text-slate-400">{time}</span>
        </div>
        <div className={`px-4 py-2.5 rounded-2xl text-sm ${isOwn ? 'bg-primary text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
