import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Home, Compass } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-rose-600 rounded-full blur-[120px] opacity-15" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10"
      >
        <div className="text-[180px] font-black leading-none tracking-tighter opacity-10 font-outfit select-none">404</div>
        <div className="mt-[-80px] space-y-4">
           <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-rose-600/20">
              <AlertCircle size={40} />
           </div>
           <h1 className="text-4xl md:text-6xl font-outfit font-black uppercase tracking-tight">Nexus Disconnected.</h1>
           <p className="text-slate-400 text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed">
             This domain of the inter-campus network doesn't exist yet. The coordinates might be wrong.
           </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
           <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl flex items-center gap-2">
                 <Home size={20} /> Back to Dashboard
              </Button>
           </Link>
           <Link to="/explore">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl text-white border-white/20 hover:bg-white/10 flex items-center gap-2">
                 <Compass size={20} /> Explore the Nexus
              </Button>
           </Link>
        </div>
      </motion.div>

      <div className="mt-24 pt-12 border-t border-white/5 w-full text-[10px] font-black uppercase tracking-widest opacity-30">
         EduSync · Error404 · Signal Lost
      </div>
    </div>
  )
}
