'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  ShieldCheck, 
  Building2, 
  Activity, 
  AlertTriangle,
  ChevronRight,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Globe
} from 'lucide-react';
import apiClient from '../../../lib/api-client';
import { toast } from '../../../lib/toast';

export default function SuperAdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await apiClient.get('/super-admin/dashboard');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load global monitoring data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-8">...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Control Center</h1>
          <p className="text-white/40 mt-1">Global oversight and cross-campus governance.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center gap-2">
            <Activity className="w-4 h-4" />
            System Status: Nominal
          </div>
        </div>
      </div>

      {/* Global Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: data?.totalStudents, icon: Users, trend: '+12%', color: 'blue' },
          { label: 'Active Swaps', value: data?.activeSwaps, icon: Activity, trend: '+5%', color: 'indigo' },
          { label: 'Cross-Campus', value: data?.crossCampusSwaps, icon: Globe, trend: '+24%', color: 'emerald' },
          { label: 'Pending MOUs', value: data?.pendingActions?.length, icon: ShieldCheck, trend: 'Critical', color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
             <div className="flex justify-between mb-4">
               <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
                 <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
               </div>
               <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{stat.trend}</span>
             </div>
             <div className="text-2xl font-bold">{stat.value}</div>
             <div className="text-xs text-white/40 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Campus List */}
        <div className="lg:col-span-2 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-bold">Active Campus Nodes</h3>
             <button className="text-xs text-indigo-400 font-bold hover:underline">View All Network</button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {data?.campuses?.map((campus: any) => (
               <div key={campus.id} className="p-6 rounded-2xl bg-black/20 border border-white/5 flex flex-col justify-between hover:border-indigo-500/30 transition-all group">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs">
                         {campus.id.substring(0, 2)}
                       </div>
                       <div>
                          <div className="text-sm font-bold group-hover:text-indigo-400 transition-colors">{campus.name}</div>
                          <div className="text-[10px] text-white/30 uppercase tracking-widest">{campus.studentCount} Students</div>
                       </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${campus.enabled ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-red-500'}`}></div>
                 </div>
                 <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-white/40">Health Score</span>
                    <span className="text-emerald-400">{campus.healthScore * 100}%</span>
                 </div>
                 <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${campus.healthScore * 100}%` }}></div>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Pending Actions */}
        <div className="p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-transparent backdrop-blur-xl">
           <h3 className="text-xl font-bold mb-8">Pending Governance</h3>
           <div className="space-y-4">
              {data?.pendingActions?.map((action: any) => (
                <div key={action.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                         <ShieldCheck className="w-4 h-4 text-amber-500" />
                      </div>
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{action.type}</span>
                   </div>
                   <p className="text-sm font-medium leading-snug">{action.description}</p>
                   <div className="mt-4 flex justify-between items-center text-[10px] text-white/40">
                      <span>{new Date(action.createdAt).toLocaleDateString()}</span>
                      <ChevronRight className="w-3 h-3" />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* College Groups Section */}
      <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
         <div className="flex justify-between items-center mb-8">
            <div>
               <h3 className="text-xl font-bold">Federated College Groups</h3>
               <p className="text-sm text-white/40">Multi-campus organizational structures.</p>
            </div>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20">
               <Plus className="w-4 h-4" />
               Establish Group
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data?.collegeGroups?.map((group: any) => (
              <div key={group.collegeGroupId} className="p-6 rounded-3xl border border-white/10 bg-black/20 hover:border-indigo-500/30 transition-all group">
                 <h4 className="text-lg font-bold mb-2">{group.name}</h4>
                 <div className="flex flex-wrap gap-2 mb-6">
                    {group.members.map((m: string) => (
                      <span key={m} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/60">
                         {m}
                      </span>
                    ))}
                 </div>
                 <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                    <div>
                       <div className="text-[10px] text-white/30 uppercase font-bold">Swaps</div>
                       <div className="font-bold">{group.metadata.crossCampusSwaps}</div>
                    </div>
                    <div>
                       <div className="text-[10px] text-white/30 uppercase font-bold">Health</div>
                       <div className="font-bold text-emerald-400">{(group.metadata.healthScore * 100).toFixed(0)}%</div>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
