import { useState, useEffect } from 'react';
import apiClient from '../lib/api-client';

export function useNexus() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const proposeSwap = async (providerUid: string, skill: string, karma: number) => {
    try {
      const { data } = await apiClient.post('/swaps/propose', {
        providerUid,
        skill,
        karmaStaked: karma
      });
      return data;
    } catch (error) {
      throw new Error('Swap Proposal Failed');
    }
  };

  return { skills, loading, searchSkills, proposeSwap };
}
