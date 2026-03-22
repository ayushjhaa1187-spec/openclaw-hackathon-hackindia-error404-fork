import { useState } from 'react';
import apiClient from '../lib/api-client';

export function useAdmin() {
  const [stats, setStats] = useState<any>(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/stats');
      setStats(data);
    } catch (error) {
      console.error('Admin Stats Failure:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueue = async () => {
    try {
      const { data } = await apiClient.get('/admin/queue');
      setQueue(data);
    } catch (error) {
      console.error('Moderation Queue Failure:', error);
    }
  };

  const resolveItem = async (resourceId: string, action: 'approve' | 'reject') => {
    try {
      await apiClient.post('/admin/resolve', { resourceId, action });
      fetchQueue(); // Refresh queue
    } catch (error) {
      throw new Error('Resolution Action Failed');
    }
  };

  return { stats, queue, loading, fetchStats, fetchQueue, resolveItem };
}
