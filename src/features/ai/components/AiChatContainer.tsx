import { AiSidebar } from './AiSidebar';
import { AiChatArea } from './AiChatArea';

export const AiChatContainer = () => {
  return (
    <div className="flex w-full h-full overflow-hidden bg-slate-950 relative">
      <AiSidebar />
      <AiChatArea />
    </div>
  );
};
