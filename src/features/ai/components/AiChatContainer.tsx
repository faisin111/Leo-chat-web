import { useState, useEffect } from 'react';
import { AiSidebar } from './AiSidebar';
import { AiChatArea } from './AiChatArea';

export const AiChatContainer = () => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Close drawer on viewport resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex w-full h-full overflow-hidden bg-white dark:bg-[#000000] relative">
      {/* Desktop Docked Sidebar */}
      <div className="hidden md:flex h-full">
        <AiSidebar />
      </div>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsMobileDrawerOpen(false);
            }}
            aria-label="Close sidebar"
          />

          {/* Drawer Content */}
          <div className="relative z-50 h-full animate-in slide-in-from-left duration-200">
            <AiSidebar isMobile />
          </div>
        </div>
      )}

      {/* Main Conversation Canvas */}
      <AiChatArea onOpenMobileSidebar={() => setIsMobileDrawerOpen(true)} />
    </div>
  );
};
