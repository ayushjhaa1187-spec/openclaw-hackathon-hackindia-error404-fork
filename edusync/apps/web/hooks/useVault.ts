import { useState } from 'react';
import apiClient from '../lib/api-client';

export function useVault() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResources = async (query = '', aiSearch = false, fileType = '') => {
    setLoading(true);
    try {
      const endpoint = aiSearch ? '/vault/search/ai' : '/vault';
      const params = aiSearch ? { q: query } : { search: query, fileType };
      const { data } = await apiClient.get(endpoint, { params });
      setResources(data.data || []);
    } catch (error) {
      console.error('Vault Retrieval Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResourceById = async (id: string) => {
    try {
      const { data } = await apiClient.get(`/vault/${id}`);
      return data.data;
    } catch (error) {
      console.error('Resource Fetch Error:', error);
      return null;
    }
  };

  const purchaseAsset = async (resourceId: string) => {
    try {
      const { data } = await apiClient.post(`/vault/purchase/${resourceId}`);
      if (data.success) return data.data;
      throw new Error(data.error);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Transaction Denied: Check Karma Balance');
    }
  };

  const uploadAsset = async (formData: FormData) => {
    try {
      const { data } = await apiClient.post('/vault/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Upload Protocol Failure');
    }
  };

  const resubmitAsset = async (id: string, metadata: any) => {
    try {
      const { data } = await apiClient.post(`/vault/resubmit/${id}`, metadata);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Resubmission Failed');
    }
  };

  return { 
    resources, 
    loading, 
    fetchResources, 
    getResourceById, 
    purchaseAsset, 
    uploadAsset,
    resubmitAsset
  };
}
