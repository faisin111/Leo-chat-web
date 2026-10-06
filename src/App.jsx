import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useThemeStore } from './store/themeStore'
import { Toaster } from 'react-hot-toast'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import PageTransition from './components/PageTransition'
import AppLayout from './layouts/AppLayout'
import Messages from './pages/Messages'
import People from './pages/People'
import CreateGroup from './pages/CreateGroup'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import AdminSettings from './pages/AdminSettings'

function App() {
  const location = useLocation();
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: 'var(--bg-main)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-main)',
        },
        success: {
          style: {
            background: '#10b981',
            color: '#fff',
            border: 'none',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10b981',
          },
        },
        error: {
          style: {
            background: '#ef4444',
            color: '#fff',
            border: 'none',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
          },
        },
      }} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname.split('/')[1] || '/'}>
          <Route 
            path="/" 
            element={<PageTransition><Landing /></PageTransition>} 
          />
          <Route 
            path="/login" 
            element={<PageTransition><Login /></PageTransition>} 
          />
          <Route 
            path="/register" 
            element={<PageTransition><Register /></PageTransition>} 
          />
          <Route 
            path="/forgot-password" 
            element={<PageTransition><ForgotPassword /></PageTransition>} 
          />
          
          {/* Authenticated App Routes */}
          <Route path="/app" element={<PageTransition><AppLayout /></PageTransition>}>
            <Route index element={<Messages />} />
            <Route path="messages" element={<Messages />} />
            <Route path="people" element={<People />} />
            <Route path="create-group" element={<CreateGroup />} />
            <Route path="settings" element={<Settings />} />
            <Route path="admin" element={<Admin />} />
            <Route path="admin/settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default App
