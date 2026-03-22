import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api-client';
import { socket } from '../lib/socket-client';
import toast from '../lib/toast';

export function useAnalytics() {
  const [overview, setOverview] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [karmaFlow, setKarmaFlow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, trRes, kfRes] = await Promise.all([
        apiClient.get('/admin/analytics/overview'),
        apiClient.get(`/admin/analytics/trends?range=${range}`),
        apiClient.get(`/admin/analytics/karma?range=${range}`)
      ]);
      setOverview(ovRes.data);
      setTrends(trRes.data);
      setKarmaFlow(kfRes.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      toast.error('Failed to load institutional analytics.');
    } finally {
      setLoading(false);
    }
  }, [range]);

  const exportROI = async () => {
    try {
      await apiClient.post('/admin/analytics/export');
      toast.info('ROI report generation initiated. You will be notified when it is ready.');
    } catch (err) {
      toast.error('Failed to initiate report export.');
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Real-time updates
  useEffect(() => {
    socket.on('analytics:updated', () => {
      fetchAnalytics();
    });

    socket.on('report:ready', (data: { downloadUrl: string, reportName: string }) => {
      toast.success(`ROI Report Ready: ${data.reportName}`, {
        onClick: () => window.open(data.downloadUrl, '_blank')
      });
    });

    return () => {
      socket.off('analytics:updated');
      socket.off('report:ready');
    };
  }, [fetchAnalytics]);

  return {
    overview,
    trends,
    karmaFlow,
    loading,
    range,
    setRange,
    refresh: fetchAnalytics,
    exportROI
  };
}
