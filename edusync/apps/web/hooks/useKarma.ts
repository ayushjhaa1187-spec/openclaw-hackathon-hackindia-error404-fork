import { useState, useEffect } from 'react';
import apiClient from '../lib/api-client';

export function useKarma() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/karma/balance');
      setBalance(data.balance);
    } catch (error) {
      console.error('Karma Registry Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return { balance, loading, refreshBalance: fetchBalance };
}
