import { useState, useCallback } from 'react';
import apiClient from '../lib/api-client';
import { toast } from '../lib/toast';

export function useStudentDetail() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentDetail = useCallback(async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get(`/admin/students/${uid}`);
      setStudent(data);
    } catch (err: any) {
      console.error('Fetch Student Detail Error:', err);
      setError(err.response?.data?.error || 'Failed to load student details');
      toast.error('Failed to load student details');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateModerationStatus = async (uid: string, action: string, params: { reason: string, durationDays?: number }) => {
    setLoading(true);
    try {
      const { data } = await apiClient.patch(`/admin/students/${uid}/moderation`, { action, ...params });
      
      // Update local state optimistically
      if (student && student.profile.firebaseUid === uid) {
        setStudent({
          ...student,
          moderation: {
            ...student.moderation,
            currentStatus: data.status,
            suspendedUntil: data.suspendedUntil || null
          }
        });
      }
      
      toast.success(`Student ${action}ed successfully`);
      return data;
    } catch (err: any) {
      console.error('Update Moderation Error:', err);
      toast.error(err.response?.data?.error || `Failed to ${action} student`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearRecord = async (uid: string, reason: string) => {
    setLoading(true);
    try {
      const { data } = await apiClient.patch(`/admin/students/${uid}/clear-record`, { reason });
      
      if (student && student.profile.firebaseUid === uid) {
        setStudent({
          ...student,
          moderation: {
            ...student.moderation,
            totalFlags: 0
          }
        });
      }
      
      toast.success('Student record cleared');
      return data;
    } catch (err: any) {
      console.error('Clear Record Error:', err);
      toast.error(err.response?.data?.error || 'Failed to clear record');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchSwapHistory = async (uid: string, limit: number = 20, cursor?: string) => {
    try {
      const { data } = await apiClient.get(`/admin/students/${uid}/swaps`, { params: { limit, cursor } });
      return data;
    } catch (err) {
      console.error('Fetch Swap History Error:', err);
      toast.error('Failed to load swap history');
      throw err;
    }
  };

  const fetchFlagHistory = async (uid: string, limit: number = 20, cursor?: string) => {
    try {
      const { data } = await apiClient.get(`/admin/students/${uid}/flags`, { params: { limit, cursor } });
      return data;
    } catch (err) {
      console.error('Fetch Flag History Error:', err);
      toast.error('Failed to load flag history');
      throw err;
    }
  };

  return {
    student,
    loading,
    error,
    fetchStudentDetail,
    updateModerationStatus,
    clearRecord,
    fetchSwapHistory,
    fetchFlagHistory
  };
}
