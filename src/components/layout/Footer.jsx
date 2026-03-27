import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 px-4 hidden md:block">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <Link to="/dashboard" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black overflow-hidden">E</div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">EduSync</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Bridging knowledge across campuses. Switch to Nexus Mode to discover skills and resources beyond your boundaries.
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              {/* Social icons would go here */}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><Link to="/explore" className="hover:text-indigo-600 transition-colors">Explore Skills</Link></li>
                <li><Link to="/vault" className="hover:text-indigo-600 transition-colors">Knowledge Vault</Link></li>
                <li><Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Nexus Map</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Support</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><Link to="/settings" className="hover:text-indigo-600 transition-colors">Settings</Link></li>
                <li><Link to="/404" className="hover:text-indigo-600 transition-colors">Help Center</Link></li>
                <li><Link to="/404" className="hover:text-indigo-600 transition-colors">Report Issue</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><Link to="/404" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/404" className="hover:text-indigo-600 transition-colors">Terms of Use</Link></li>
                <li><Link to="/404" className="hover:text-indigo-600 transition-colors">Academic Integrity</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-semibold tracking-wide uppercase">
          <p>© 2026 EduSync · Created for HackIndia 2026</p>
          <p>Built with ❤️ by Team Error404</p>
        </div>
      </div>
    </footer>
  )
}
