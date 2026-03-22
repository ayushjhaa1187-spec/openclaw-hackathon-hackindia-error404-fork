'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Users, 
  Trash,
  Settings,
  ShieldCheck,
  Search,
  Building2,
  ChevronRight,
  Loader2
} from 'lucide-react';
import apiClient from '../../../../lib/api-client';
import { toast } from '../../../../lib/toast';

const CAMPUSES = [
  { id: 'IIT_JAMMU', name: 'IIT Jammu' },
  { id: 'IIT_DELHI', name: 'IIT Delhi' },
  { id: 'IIT_BOMBAY', name: 'IIT Bombay' },
  { id: 'IIT_KANPUR', name: 'IIT Kanpur' },
  { id: 'NIT_TRICHY', name: 'NIT Trichy' }
];

export default function CollegeGroupManager() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', members: [] as string[] });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await apiClient.get('/super-admin/college-groups');
      setGroups(res.data);
    } catch (err) {
      toast.error('Failed to load college groups.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name || newGroup.members.length < 1) {
      toast.error('Name and at least one member required.');
      return;
    }
    try {
      await apiClient.post('/super-admin/college-groups', newGroup);
      toast.success(`Group "${newGroup.name}" established.`);
      setNewGroup({ name: '', members: [] });
      setShowNewForm(false);
      fetchGroups();
    } catch (err) {
      toast.error('Failed to create group.');
    }
  };

  const handleDissolve = async (groupId: string) => {
    if (!confirm('Dissolve this group? All shared agreements will remain but the federation will be dissolved.')) return;
    try {
      await apiClient.delete(`/super-admin/college-groups/${groupId}`);
      toast.info('Group dissolved.');
      fetchGroups();
    } catch (err) {
      toast.error('Failed to dissolve group.');
    }
  };

  const toggleMember = (cid: string) => {
    setNewGroup(prev => ({
      ...prev,
      members: prev.members.includes(cid) 
        ? prev.members.filter(m => m !== cid) 
        : [...prev.members, cid]
    }));
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Federated Coalitions</h1>
          <p className="text-white/40 mt-1">Manage multi-campus organizations and cluster agreements.</p>
        </div>
        <button 
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Establish New Group
        </button>
      </div>

      {showNewForm && (
        <div className="p-8 rounded-[40px] border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-xl animate-in slide-in-from-top-4 duration-500">
           <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <label className="text-sm font-bold text-white/60">Organization Name</label>
                    <input 
                       type="text"
                       placeholder="e.g. IIT Hub West"
                       value={newGroup.name}
                       onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                       className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-sm font-bold text-white/60">Cluster Members</label>
                    <div className="grid grid-cols-2 gap-2">
                       {CAMPUSES.map(c => (
                         <button
                           key={c.id}
                           type="button"
                           onClick={() => toggleMember(c.id)}
                           className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                             newGroup.members.includes(c.id) 
                             ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' 
                             : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                           }`}
                         >
                           {c.name}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                 <button 
                    type="button" 
                    onClick={() => setShowNewForm(false)}
                    className="px-6 py-3 rounded-2xl text-sm font-bold text-white/40 hover:text-white transition-all"
                 >
                    Discard Draft
                 </button>
                 <button 
                    type="submit"
                    className="px-10 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/20"
                 >
                    Confirm Federation
                 </button>
              </div>
           </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div key={group.collegeGroupId} className="p-8 rounded-[40px] border border-white/5 bg-white/5 backdrop-blur-xl group hover:border-indigo-500/30 transition-all flex flex-col justify-between">
             <div>
                <div className="flex justify-between items-start mb-6">
                   <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20">
                      <ShieldCheck className="w-8 h-8 text-indigo-400" />
                   </div>
                   <button 
                    onClick={() => handleDissolve(group.collegeGroupId)}
                    className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                   >
                      <Trash2 className="w-5 h-5" />
                   </button>
                </div>
                <h3 className="text-2xl font-bold mb-2">{group.name}</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                   {group.members.map((m: string) => (
                     <span key={m} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                       {m.replace('_', ' ')}
                     </span>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-3 gap-1 border-t border-white/5 pt-8">
                <div className="text-center">
                   <div className="text-[10px] text-white/20 font-bold uppercase mb-1">Health</div>
                   <div className="text-xl font-bold text-emerald-400">{(group.metadata.healthScore * 100).toFixed(0)}%</div>
                </div>
                <div className="text-center">
                   <div className="text-[10px] text-white/20 font-bold uppercase mb-1">Swaps</div>
                   <div className="text-xl font-bold">{group.metadata.crossCampusSwaps}</div>
                </div>
                <div className="text-center">
                   <div className="text-[10px] text-white/20 font-bold uppercase mb-1">Status</div>
                   <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-2">{group.status}</div>
                </div>
             </div>
          </div>
        ))}
        {groups.length === 0 && !loading && (
          <div className="md:col-span-2 h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[40px] text-white/20">
             <Building2 className="w-12 h-12 mb-4 opacity-10" />
             <p className="font-medium italic">No active federations found in this node network.</p>
          </div>
        )}
      </div>
    </div>
  );
}
