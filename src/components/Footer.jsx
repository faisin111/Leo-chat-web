import { Link } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { APP_STRINGS } from '../constants/strings'

export default function Footer() {
  return (
    <footer className="bg-surface-dark text-white py-12 md:py-16 px-6 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-white p-1.5 rounded-lg">
              <MessageSquare className="w-5 h-5 text-surface-dark" />
            </div>
            <span className="text-xl font-semibold">{APP_STRINGS.appName}</span>
          </div>
          <p className="text-sm text-gray-400 mb-6 max-w-xs">
            {APP_STRINGS.footerDesc}
          </p>
          <p className="text-xs text-gray-500">
            {APP_STRINGS.copyright}
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-sm text-gray-200">{APP_STRINGS.navProduct}</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link to="#" className="hover:text-white transition-colors">Features</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Security</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Download</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-sm text-gray-200">Company</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link to="#" className="hover:text-white transition-colors">About</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-sm text-gray-200">Legal</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link to="#" className="hover:text-white transition-colors">Privacy</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Terms</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Status</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
