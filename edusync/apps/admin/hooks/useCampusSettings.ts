import { useState, useCallback } from 'react';
import apiClient from '../lib/api-client';
import { toast } from '../lib/toast';

export function useCampusSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});
  const [isDirty, setIsDirty] = useState(false);

  const setLoadingState = (key: string, val: boolean) => setLoading(prev => ({ ...prev, [key]: val }));
  const setErrorState = (key: string, val: string | null) => setError(prev => ({ ...prev, [key]: val }));

  const fetchSettings = useCallback(async () => {
    setLoadingState('settings', true);
    try {
      const { data } = await apiClient.get('/admin/settings');
      setSettings(data);
    } catch (err: any) {
      console.error('Fetch Settings Error:', err);
      setErrorState('settings', err.response?.data?.error || 'Failed to load settings');
    } finally {
      setLoadingState('settings', false);
    }
  }, []);

  const updateNexusSettings = async (nexusSettings: any, confirmBulkDisable: boolean = false) => {
    setLoadingState('nexus', true);
    try {
      const { data } = await apiClient.patch('/admin/settings/nexus', { ...nexusSettings, confirmBulkDisable });
      setSettings((prev: any) => ({ ...prev, nexus: data.nexus }));
      toast.success('Nexus settings updated');
      setIsDirty(false);
      return data;
    } catch (err: any) {
      console.error('Update Nexus Settings Error:', err);
      if (err.response?.status === 400 && err.response?.data?.error?.includes('confirmation')) {
         throw new Error('BULK_DISABLE_REQUIRED');
      }
      toast.error(err.response?.data?.error || 'Failed to update Nexus settings');
      throw err;
    } finally {
      setLoadingState('nexus', false);
    }
  };

  const updateGuardianSettings = async (guardianSettings: any) => {
    setLoadingState('guardian', true);
    try {
      const { data } = await apiClient.patch('/admin/settings/guardian', guardianSettings);
      setSettings((prev: any) => ({ ...prev, guardian: data.guardian }));
      toast.success('Guardian settings updated');
      setIsDirty(false);
      return data;
    } catch (err: any) {
      console.error('Update Guardian Settings Error:', err);
      toast.error(err.response?.data?.error || 'Failed to update Guardian settings');
      throw err;
    } finally {
      setLoadingState('guardian', false);
    }
  };

  const updateKarmaSettings = async (karmaSettings: any) => {
    setLoadingState('karma', true);
    try {
      const { data } = await apiClient.patch('/admin/settings/karma', karmaSettings);
      setSettings((prev: any) => ({ ...prev, karma: data.karma }));
      toast.success('Karma settings updated');
      setIsDirty(false);
      return data;
    } catch (err: any) {
      console.error('Update Karma Settings Error:', err);
      toast.error(err.response?.data?.error || 'Failed to update Karma settings');
      throw err;
    } finally {
      setLoadingState('karma', false);
    }
  };

  const fetchAdminUsers = useCallback(async () => {
    setLoadingState('admins', true);
    try {
      const { data } = await apiClient.get('/admin/settings/admins');
      setAdminUsers(data);
    } catch (err: any) {
      console.error('Fetch Admins Error:', err);
      setErrorState('admins', err.response?.data?.error || 'Failed to load admins');
    } finally {
      setLoadingState('admins', false);
    }
  }, []);

  const addAdminUser = async (targetUid: string) => {
    setLoadingState('addAdmin', true);
    try {
      await apiClient.post('/admin/settings/admins', { targetUid });
      fetchAdminUsers();
      toast.success('Administrator added');
    } catch (err: any) {
      console.error('Add Admin Error:', err);
      toast.error(err.response?.data?.error || 'Failed to add administrator');
      throw err;
    } finally {
      setLoadingState('addAdmin', false);
    }
  };

  const removeAdminUser = async (uid: string) => {
    setLoadingState('removeAdmin', true);
    try {
      await apiClient.delete(`/admin/settings/admins/${uid}`);
      setAdminUsers(prev => prev.filter(a => a.firebaseUid !== uid));
      toast.success('Administrator removed');
    } catch (err: any) {
      console.error('Remove Admin Error:', err);
      toast.error(err.response?.data?.error || 'Failed to remove administrator');
      throw err;
    } finally {
      setLoadingState('removeAdmin', false);
    }
  };

  return {
    settings,
    adminUsers,
    loading,
    error,
    isDirty,
    setIsDirty,
    fetchSettings,
    updateNexusSettings,
    updateGuardianSettings,
    updateKarmaSettings,
    fetchAdminUsers,
    addAdminUser,
    removeAdminUser,
    setSettings
  };
}
