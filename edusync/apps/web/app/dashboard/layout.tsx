import NavBar from "../../components/layouts/NavBar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="container mx-auto py-8 lg:py-12">
        {children}
      </main>
      
      <footer className="mt-32 py-24 border-t border-white/5 text-center bg-slate-950/40 relative overflow-hidden">
         <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none flex items-center justify-center">
            <h1 className="text-[24rem] font-black rotate-12 tracking-tighter uppercase italic">NEXUS</h1>
         </div>
         <div className="container mx-auto px-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-indigo-600/30">E</div>
               <div className="text-left">
                  <span className="text-2xl font-black tracking-tighter text-white uppercase italic block">EduSync Ecosystem</span>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Proprietary Multi-Campus Protocol v4.0</span>
               </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
               <span className="flex items-center gap-2 hover:text-indigo-400 transition-colors cursor-pointer"><div className="w-1 h-1 bg-indigo-500 rounded-full"></div> MOU Verified</span>
               <span className="flex items-center gap-2 hover:text-emerald-400 transition-colors cursor-pointer"><div className="w-1 h-1 bg-emerald-500 rounded-full"></div> AES-256 Auth</span>
               <span className="flex items-center gap-2 hover:text-amber-400 transition-colors cursor-pointer"><div className="w-1 h-1 bg-amber-500 rounded-full"></div> HackIndia 2026</span>
            </div>

            <p className="text-[9px] text-slate-600 font-bold max-w-xs text-right hidden lg:block leading-relaxed uppercase italic tracking-widest">
               Official Multi-Campus Peer Protocol. All interactions are audited for academic integrity.
            </p>
         </div>
      </footer>
    </div>
  );
}
