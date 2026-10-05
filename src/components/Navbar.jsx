import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Menu, X } from 'lucide-react'
import { APP_STRINGS } from '../constants/strings'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: APP_STRINGS.navProduct, href: '#' },
    { name: APP_STRINGS.navSecurity, href: '#' },
    { name: APP_STRINGS.navTeams, href: '#' },
    { name: APP_STRINGS.navResources, href: '#' },
  ]

  return (
    <nav className="relative z-50 bg-surface-white">
      <div className="flex items-center justify-between py-4 px-6 md:py-6 md:px-8 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-brand-500 p-2 rounded-xl">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-text-main">{APP_STRINGS.appName}</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-text-muted">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.href} className="hover:text-text-main transition-colors">
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-text-main hover:text-text-main px-4 py-2 bg-surface-light hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
            {APP_STRINGS.login}
          </Link>
          <Link to="/register" className="text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
            <span>{APP_STRINGS.startChatting}</span>
            <span className="text-lg leading-none">&rarr;</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 text-text-muted hover:text-text-main"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-surface-white border-b border-gray-100 shadow-lg py-4 px-6 flex flex-col gap-4">
          <div className="flex flex-col gap-3 pb-4 border-b border-gray-100">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.href} className="text-base font-medium text-text-muted hover:text-brand-500">
                {link.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link to="/login" className="text-center font-medium text-text-main py-3 bg-surface-light rounded-lg border border-gray-200">
              {APP_STRINGS.login}
            </Link>
            <Link to="/register" className="text-center font-medium text-white bg-brand-500 py-3 rounded-lg">
              {APP_STRINGS.startChatting}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
