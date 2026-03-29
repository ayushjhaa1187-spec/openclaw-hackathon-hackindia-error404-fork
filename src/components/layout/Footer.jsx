import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin, Instagram, ArrowUp } from 'lucide-react'

export default function Footer({ dark = false }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className={`${dark ? 'bg-slate-950 text-slate-400 border-slate-900' : 'bg-white text-slate-500 border-slate-200'} border-t pt-16 pb-8 px-6 transition-colors`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* COLUMN 1: BRAND */}
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black overflow-hidden shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform">E</div>
              <span className={`text-2xl font-black tracking-tighter ${dark ? 'text-white' : 'text-slate-900'}`}>EduSync</span>
            </Link>
            <p className="text-sm leading-relaxed mb-8 opacity-80">
              Bridging knowledge across campuses. Empowering the next generation of Indian engineers through a federated peer-to-peer Nexus.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 rounded-lg bg-slate-500/5 hover:bg-indigo-600 hover:text-white transition-all"><Github size={18} /></a>
              <a href="#" className="p-2 rounded-lg bg-slate-500/5 hover:bg-indigo-600 hover:text-white transition-all"><Twitter size={18} /></a>
              <a href="#" className="p-2 rounded-lg bg-slate-500/5 hover:bg-indigo-600 hover:text-white transition-all"><Linkedin size={18} /></a>
              <a href="#" className="p-2 rounded-lg bg-slate-500/5 hover:bg-indigo-600 hover:text-white transition-all"><Instagram size={18} /></a>
            </div>
          </div>

          {/* COLUMN 2: PLATFORM */}
          <div>
            <h4 className={`font-black uppercase text-xs tracking-[0.2em] mb-8 ${dark ? 'text-indigo-400' : 'text-slate-900'}`}>Platform</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/explore" className="hover:text-indigo-500 transition-colors">Explore Skills</Link></li>
              <li><Link to="/vault" className="hover:text-indigo-500 transition-colors">Knowledge Vault</Link></li>
              <li><Link to="/dashboard" className="hover:text-indigo-500 transition-colors">Nexus Map</Link></li>
              <li><Link to="/campus-charter" className="hover:text-indigo-500 transition-colors">Campus Charter</Link></li>
              <li><Link to="/honor-code" className="hover:text-indigo-500 transition-colors">Honor Code</Link></li>
            </ul>
          </div>

          {/* COLUMN 3: SUPPORT */}
          <div>
            <h4 className={`font-black uppercase text-xs tracking-[0.2em] mb-8 ${dark ? 'text-indigo-400' : 'text-slate-900'}`}>Support</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/settings" className="hover:text-indigo-500 transition-colors">Node Settings</Link></li>
              <li><Link to="/help" className="hover:text-indigo-500 transition-colors">Help Center / FAQ</Link></li>
              <li><a href="mailto:support@edusync.nexus" className="hover:text-indigo-500 transition-colors">Contact Us</a></li>
              <li><Link to="/help" className="hover:text-indigo-500 transition-colors">Report Issue</Link></li>
            </ul>
          </div>

          {/* COLUMN 4: LEGAL */}
          <div>
            <h4 className={`font-black uppercase text-xs tracking-[0.2em] mb-8 ${dark ? 'text-indigo-400' : 'text-slate-900'}`}>Legal & Repo</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/privacy" className="hover:text-indigo-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-indigo-500 transition-colors">Terms of Use</Link></li>
              <li><Link to="/honor-code" className="hover:text-indigo-500 transition-colors">Academic Integrity</Link></li>
              <li><a href="https://github.com/HackIndiaXYZ/openclaw-hackathon-hackindia-error404" target="_blank" rel="noreferrer" className="hover:text-indigo-500 transition-colors inline-flex items-center gap-2">GitHub Repository <Github size={14} /></a></li>
            </ul>
          </div>
        </div>

        {/* QUICK LINKS BAR */}
        <div className={`py-6 border-t border-b ${dark ? 'border-slate-900' : 'border-slate-100'} flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-[10px] font-black uppercase tracking-[0.3em]`}>
          <Link to="/dashboard" className="hover:text-indigo-500 transition-colors">Dashboard</Link>
          <Link to="/explore" className="hover:text-indigo-500 transition-colors">Explore</Link>
          <Link to="/vault" className="hover:text-indigo-500 transition-colors">Vault</Link>
          <Link to="/chat" className="hover:text-indigo-500 transition-colors">Chat</Link>
          <Link to="/profile" className="hover:text-indigo-500 transition-colors">Profile</Link>
        </div>

        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-xs font-black uppercase tracking-widest opacity-60">
          <p>© 2026 EduSync · Created for HackIndia 2026</p>
          
          <button 
            onClick={scrollToTop}
            className="group flex flex-col items-center gap-2 hover:text-indigo-500 transition-all"
          >
            <div className={`p-3 rounded-full border ${dark ? 'border-slate-800' : 'border-slate-200'} group-hover:border-indigo-500 group-hover:-translate-y-1 transition-all`}>
              <ArrowUp size={16} />
            </div>
            <span className="text-[8px]">Back to Top</span>
          </button>

          <p>Built with ❤️ by Team Error404</p>
        </div>
      </div>
    </footer>
  )
}
