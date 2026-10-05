import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import PageTransition from './components/PageTransition'
import AppLayout from './layouts/AppLayout'
import Messages from './pages/Messages'
import People from './pages/People'
import CreateGroup from './pages/CreateGroup'
import Settings from './pages/Settings'

function App() {
  const location = useLocation()

  return (
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
        
        {/* Authenticated App Routes */}
        <Route path="/app" element={<PageTransition><AppLayout /></PageTransition>}>
          <Route index element={<Messages />} />
          <Route path="messages" element={<Messages />} />
          <Route path="people" element={<People />} />
          <Route path="create-group" element={<CreateGroup />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default App
