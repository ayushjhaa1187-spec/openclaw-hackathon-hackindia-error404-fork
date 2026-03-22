import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, X, ExternalLink, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MOUDisclosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  partnerCampus: string;
  mouId: string;
  termsSummary: string;
}

export const MOUDisclosureModal: React.FC<MOUDisclosureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  partnerCampus,
  mouId,
  termsSummary
}) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
               <div className="flex items-center gap-3">
                  <ShieldAlert className="text-indigo-400" size={20} />
                  <h3 className="text-white font-black uppercase text-sm italic tracking-tight">Nexus Disclosure Notice</h3>
               </div>
               <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
               </button>
            </div>

            <div className="p-8 space-y-6">
               <div className="space-y-2">
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    You are initiating a cross-campus interaction with <span className="text-white font-bold">{partnerCampus}</span>. 
                    This swap is governed by the official Memorandum of Understanding (MOU) between your institutions.
                  </p>
               </div>

               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                     <span className="flex items-center gap-2 relative">
                        <FileText size={12} /> MOU Ref: {mouId.substring(0, 8)}...
                     </span>
                     <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle size={10} /> Active
                     </span>
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-xl">
                     <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight italic">
                        "{termsSummary || 'Institutional personnel will have oversight of cross-campus karma movements and interaction logs.'}"
                     </p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="p-4 border-l-2 border-indigo-500 bg-indigo-500/5 rounded-r-xl">
                     <p className="text-[10px] text-indigo-300 font-bold leading-relaxed">
                        By proceeding, you acknowledge that this interaction will be logged in the Nexus Transparency Log and shared with campus administrators at both nodes.
                     </p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group">
                     <div className="relative flex items-center mt-0.5">
                        <input 
                           type="checkbox" 
                           className="sr-only" 
                           checked={accepted} 
                           onChange={() => setAccepted(!accepted)} 
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${accepted ? 'bg-indigo-600 border-indigo-600' : 'border-white/10 group-hover:border-white/20'}`}>
                           {accepted && <CheckCircle size={12} className="text-white" />}
                        </div>
                     </div>
                     <span className="text-[10px] text-slate-400 font-black uppercase italic tracking-tight group-hover:text-slate-300 transition-colors">
                        I understand this interaction is subject to institutional oversight
                     </span>
                  </label>
               </div>
            </div>

            <div className="p-6 bg-white/5 border-t border-white/5 flex gap-4">
               <button 
                  onClick={onClose}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors italic"
               >
                  Cancel
               </button>
               <button 
                  disabled={!accepted}
                  onClick={onConfirm}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:grayscale text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 italic"
               >
                  Proceed to Swap
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
