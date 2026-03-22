import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api-client';
import { getSocket } from '../lib/socket-client'; // Assuming existence, or I'll create it
import { toast } from '../lib/toast';

export function useNexus() {
  const [skills, setSkills] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [nexusMeta, setNexusMeta] = useState<any>(null);
  const [nexusEnabled, setNexusEnabled] = useState(false);

  const fetchSwaps = useCallback(async (status?: string) => {
    try {
      const { data } = await apiClient.get('/swaps', { params: { status } });
      setSwaps(data.data);
    } catch (error) {
      console.error('Fetch Swaps Error:', error);
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();
    
    socket.on('swap:new_request', (data) => {
      toast.success(`🚀 New Swap Request: ${data.skill}`, { icon: '🤝' });
      fetchSwaps();
    });

    socket.on('swap:accepted', (data) => {
      toast.success('🤝 Swap Proposal Accepted!', { icon: '✅' });
      fetchSwaps();
    });

    socket.on('swap:rejected', (data) => {
      toast.error('❌ Swap Proposal Rejected');
      fetchSwaps();
    });

    socket.on('swap:completed', (data) => {
      toast.success('✨ Skill Swap Completed! Karma Transferred.', { icon: '⭐' });
      fetchSwaps();
    });

    socket.on('swap:admin_resolved', (data) => {
      toast.success(`⚖️ Admin Resolution: ${data.action}`, { icon: '🛡️' });
      fetchSwaps();
    });

    socket.on('swap:cancel_requested', (data) => {
      toast.success('⚠️ Peer requested cancellation', { icon: '🤝' });
      fetchSwaps();
    });

    socket.on('swap:canceled_mutual', (data) => {
      toast.success('💸 Mutual Cancellation: Karma Refunded', { icon: '↩️' });
      fetchSwaps();
    });

    return () => {
      socket.off('swap:new_request');
      socket.off('swap:accepted');
      socket.off('swap:rejected');
      socket.off('swap:completed');
      socket.off('swap:admin_resolved');
      socket.off('swap:cancel_requested');
      socket.off('swap:canceled_mutual');
    };
  }, [fetchSwaps]);

  const searchSkills = async (query = '', campus = '') => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/skills', {
        params: { query, campus }
      });
      setSkills(data);
    } catch (error) {
      console.error('Nexus Discovery Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const proposeSwap = async (providerUid: string, skill: string, karma: number, campus: string) => {
    try {
      const { data } = await apiClient.post('/swaps/propose', {
        providerUid,
        skill,
        karmaStaked: karma,
        providerCampus: campus,
        isCrossCampus: campus !== 'IIT_JAMMU'
      });
      toast.success('Proposal Transmitted to Nexus');
      return data;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Swap Proposal Failed');
      throw error;
    }
  };

  const acceptSwap = async (id: string) => {
    try {
      await apiClient.patch(`/swaps/${id}/accept`);
      toast.success('Swap Accepted');
      fetchSwaps();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Accept Failed');
    }
  };

  const rejectSwap = async (id: string) => {
    try {
      await apiClient.patch(`/swaps/${id}/reject`);
      toast.success('Swap Rejected');
      fetchSwaps();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Reject Failed');
    }
  };

  const completeSwap = async (id: string) => {
    try {
      await apiClient.patch(`/swaps/${id}/complete`);
      toast.success('Swap Marked Complete');
      fetchSwaps();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Completion Failed');
    }
  };

  const requestCancel = async (id: string) => {
    try {
      await apiClient.patch(`/swaps/${id}/request-cancel`);
      toast.success('Cancellation Requested');
      fetchSwaps();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Request Failed');
    }
  };

  const adminOverride = async (id: string, action: 'force_refund' | 'force_payout', notes: string) => {
    try {
      await apiClient.patch(`/swaps/${id}/admin-override`, { action, notes });
      toast.success(`Admin Override: ${action}`);
      fetchSwaps();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Override Failed');
    }
  };

  const purchaseResource = async (resourceId: string) => {
    try {
      await apiClient.post(`/vault/purchase/${resourceId}`);
      toast.success('Resource Unlocked! Check your Vault.');
      fetchSwaps(); // Update balance
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Purchase Failed');
    }
  };

  const uploadResource = async (data: any) => {
    try {
      await apiClient.post('/vault/upload', data);
      toast.success('Resource Uploaded Successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload Failed');
    }
  };

  return { 
    skills, 
    swaps, 
    loading, 
    searchSkills, 
    proposeSwap, 
    acceptSwap, 
    rejectSwap, 
    completeSwap, 
    requestCancel,
    adminOverride,
    purchaseResource,
    uploadResource,
    fetchSwaps,

    // Phase 8: Nexus Cross-Campus Methods
    fetchCrossCampusProfile: async (uid: string) => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(`/nexus/profile/${uid}`);
        if (data.success) {
          setProfileData(data.data.profile);
          setNexusMeta(data.data.nexusMeta);
          return data.data;
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to fetch Nexus profile');
      } finally {
        setLoading(false);
      }
    },

    fetchMOUPartners: async () => {
      try {
        const { data } = await apiClient.get('/nexus/partners');
        if (data.success) {
          setPartners(data.data.partners);
        }
      } catch (error) {
        console.error('Fetch partners error:', error);
      }
    },

    fetchNexusExplore: async (q: string = '', cursor?: string) => {
      setLoading(true);
      try {
        const { data } = await apiClient.get('/nexus/explore', {
          params: { q, cursor }
        });
        if (data.success) {
          if (cursor) {
            setSkills((prev: any) => [...prev, ...data.data.students]);
          } else {
            setSkills(data.data.students);
          }
          return data.data;
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Nexus Discovery Error');
      } finally {
        setLoading(false);
      }
    },

    updateNexusSettings: async (crossCampusEnabled: boolean) => {
      try {
        const { data } = await apiClient.patch('/settings/nexus', { crossCampusEnabled });
        if (data.success) {
          setNexusEnabled(crossCampusEnabled);
          toast.success(`Nexus ${crossCampusEnabled ? 'Enabled' : 'Disabled'}`);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Update Failed');
      }
    },

    updateNotificationPreferences: async (prefs: any) => {
      try {
        const { data } = await apiClient.patch('/settings/notifications', prefs);
        if (data.success) {
          toast.success('Notification preferences updated');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Update Failed');
      }
    },

    updatePrivacySettings: async (settings: any) => {
      try {
        const { data } = await apiClient.patch('/settings/privacy', settings);
        if (data.success) {
          toast.success('Privacy settings updated');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Update Failed');
      }
    },

    profileData,
    nexusMeta,
    partners,
    nexusEnabled
  };
}
