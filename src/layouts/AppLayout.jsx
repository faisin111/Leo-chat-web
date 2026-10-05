import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { MessageSquare, Users, Settings, Shield, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AppLayout() {
  const location = useLocation()

  const navItems = [
    { icon: MessageSquare, path: '/app/messages', label: 'Messages' },
    { icon: Users, path: '/app/people', label: 'People' },
    { icon: Settings, path: '/app/settings', label: 'Settings' },
    { icon: Shield, path: '/app/admin', label: 'Security' },
  ]

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden text-sm">
      {/* Global Sidebar */}
      <nav className="w-16 flex-shrink-0 bg-surface-dark flex flex-col items-center py-4 border-r border-gray-800 z-50">
        <div className="mb-8">
          <div className="bg-brand-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-4 w-full items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative group ${
                  isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-500 rounded-r-full"
                    />
                  )}
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </>
              )}
            </NavLink>
          ))}
        </div>
        
        <div className="flex flex-col gap-4 items-center mt-auto">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs cursor-pointer border-2 border-surface-dark shadow-[0_0_0_2px_#6366f1]">
            AS
          </div>
        </div>
      </nav>

      {/* Main Content Area with nested route animations */}
      <main className="flex-1 flex overflow-hidden bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
