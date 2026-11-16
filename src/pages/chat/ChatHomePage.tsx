import { MessageSquare } from 'lucide-react';

export const ChatHomePage = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-background h-full text-muted-foreground p-4">
    <div className="w-16 h-16 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-center mb-4">
      <MessageSquare className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-1">Your messages</h3>
    <p className="text-sm text-muted-foreground">Select a conversation or start a new one</p>
  </div>
);
