import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api-client';
import { getSocket } from '../lib/socket-client';
import { toast } from '../lib/toast';

export function useGuardian() {
  const [flags, setFlags] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchFlags = useCallback(async (status: string = 'pending') => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/guardian/flags', { params: { status } });
      setFlags(data);
    } catch (error) {
      console.error('Fetch Flags Error:', error);
      toast.error('Failed to load flag queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/admin/guardian/stats');
      setStats(data);
    } catch (error) {
      console.error('Fetch Stats Error:', error);
    }
  }, []);

  const resolveFlag = async (id: string, action: string, notes: string) => {
    try {
      const { data } = await apiClient.post(`/admin/guardian/flags/${id}/resolve`, { action, notes });
      setFlags(prev => prev.filter(f => f._id !== id));
      fetchStats();
      toast.success(`Flag resolved: ${action.replace('_', ' ')}`);
      return data;
    } catch (error: any) {
      console.error('Resolve Flag Error:', error);
      toast.error(error.response?.data?.error || 'Resolution failed.');
      throw error;
    }
  };

  const undoResolution = async (id: string) => {
    try {
       const { data } = await apiClient.post(`/admin/guardian/flags/${id}/undo`);
       fetchFlags();
       fetchStats();
       toast.success('Resolution reverted.');
       return data;
    } catch (error: any) {
      console.error('Undo error:', error);
      toast.error(error.response?.data?.error || 'Undo failed.');
      throw error;
    }
  };

  const getFlagDetails = async (id: string) => {
    try {
      const { data } = await apiClient.get(`/admin/guardian/flags/${id}`);
      return data;
    } catch (error) {
      console.error('Get Details Error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const socket = getSocket();

    // Live Flag Alerts
    socket.on('guardian:flag_raised', (data) => {
      fetchFlags();
      fetchStats();
      toast.info(`New ${data.severity.toUpperCase()} flag detected!`);
    });

    // Remote Resolution Sync (if other admin resolves)
    socket.on('guardian:flag_resolved', (data) => {
      setFlags(prev => prev.filter(f => f._id !== data.flagId));
      fetchStats();
    });

    return () => {
      socket.off('guardian:flag_raised');
      socket.off('guardian:flag_resolved');
    };
  }, [fetchFlags, fetchStats]);

  return {
    flags,
    stats,
    loading,
    fetchFlags,
    fetchStats,
    resolveFlag,
    undoResolution,
    getFlagDetails
  };
}
