import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api-client';
import { getSocket } from '../lib/socket-client';

export function useVerification() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const fetchQueue = useCallback(async (filters: any = {}) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/verify/queue', { params: filters });
      setQueue(data.resources);
    } catch (error) {
      console.error('Fetch Queue Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/admin/verify/audit');
      setAuditLogs(data);
    } catch (error) {
      console.error('Fetch Audit Logs Error:', error);
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();
    
    // Listen for AI-flagged resource alerts
    socket.on('admin:resource_flagged', (data) => {
      // Re-fetch queue to prioritize new flag
      fetchQueue();
    });

    return () => {
      socket.off('admin:resource_flagged');
    };
  }, [fetchQueue]);

  const openReview = async (id: string) => {
    try {
      const { data } = await apiClient.post(`/admin/verify/${id}/review`);
      return { success: true, resource: data };
    } catch (error: any) {
      if (error.response?.status === 409) {
        return { 
          success: false, 
          conflict: true, 
          reviewerUid: error.response.data.reviewerUid,
          openedAt: error.response.data.openedAt
        };
      }
      throw error;
    }
  };

  const approveResource = async (id: string, notes: string) => {
    try {
      await apiClient.post(`/admin/verify/${id}/approve`, { notes });
      setQueue(prev => prev.filter(r => r._id !== id));
      fetchAuditLogs();
    } catch (error) {
      console.error('Approve Error:', error);
      throw error;
    }
  };

  const rejectResource = async (id: string, reason: string, category: string) => {
    try {
      await apiClient.post(`/admin/verify/${id}/reject`, { reason, category });
      setQueue(prev => prev.filter(r => r._id !== id));
      fetchAuditLogs();
    } catch (error) {
      console.error('Reject Error:', error);
      throw error;
    }
  };

  const requestChanges = async (id: string, instruction: string) => {
    try {
      await apiClient.post(`/admin/verify/${id}/request-changes`, { instruction });
      setQueue(prev => prev.filter(r => r._id !== id));
      fetchAuditLogs();
    } catch (error) {
      console.error('Request Changes Error:', error);
      throw error;
    }
  };

  return {
    queue,
    loading,
    auditLogs,
    fetchQueue,
    fetchAuditLogs,
    openReview,
    approveResource,
    rejectResource,
    requestChanges
  };
}
