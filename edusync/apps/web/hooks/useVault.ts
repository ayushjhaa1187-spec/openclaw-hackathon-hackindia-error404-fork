import { useState } from 'react';
import apiClient from '../lib/api-client';

export function useVault() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResources = async (query = '', campus = '', type = '') => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/vault', {
        params: { query, campus, type }
      });
      setResources(data);
    } catch (error) {
      console.error('Vault Retrieval Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseAsset = async (resourceId: string) => {
    try {
      const { data } = await apiClient.post(`/vault/purchase/${resourceId}`);
      return data;
    } catch (error) {
      throw new Error('Transaction Denied: Check Karma Balance');
    }
  };

  const uploadAsset = async (formData: any) => {
    try {
      const { data } = await apiClient.post('/vault/upload', formData);
      return data;
    } catch (error) {
      throw new Error('Upload Protocol Failure');
    }
  };

  return { resources, loading, fetchResources, purchaseAsset, uploadAsset };
}
