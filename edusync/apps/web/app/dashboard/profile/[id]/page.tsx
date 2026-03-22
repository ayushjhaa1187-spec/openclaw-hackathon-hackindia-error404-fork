'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Shield, GraduationCap, Star, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api-client';

export default function StudentProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/profile/${id}`);
        setStudent(response.data);
      } catch (err) {
        console.error('Nexus Profile Load Failure');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const proposeSwap = () => {
    // Navigate to swap request modal or page
    router.push(`/dashboard/explore?proposal=${id}`);
  };

  if (loading) return <div className="p-8 text-indigo-400">Syncing with Nexus Node...</div>;
  if (!student) return <div className="p-8 text-red-400">Student Node Not Found</div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Card className="bg-slate-900/50 border-indigo-500/30 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <User size={40} className="text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-100">{student.name}</CardTitle>
            <div className="flex items-center text-slate-400 space-x-2">
              <GraduationCap size={16} />
              <span>{student.campus.replace('_', ' ')}</span>
            </div>
          </div>
          <div className="ml-auto flex flex-col items-end">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">
              Karma: {student.karma}
            </Badge>
            <div className="flex items-center text-amber-500 mt-1">
              <Star size={16} fill="currentColor" />
              <span className="ml-1 font-bold">{student.reputationScore.toFixed(1)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Skills Offered</h3>
            <div className="flex flex-wrap gap-2">
              {student.skills.map((skill: string) => (
                <Badge key={skill} className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Specialization</h3>
            <p className="text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              {student.specialization || 'General Studies'}
            </p>
          </section>

          <div className="flex space-x-4">
            <Button 
              onClick={proposeSwap}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              <MessageSquare className="mr-2" />
              Propose Skill Swap
            </Button>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Shield size={20} className="mr-2" />
              Report Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-400">Swap History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100">12 Swaps Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-400">Vault Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100">5 Resources Shared</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
