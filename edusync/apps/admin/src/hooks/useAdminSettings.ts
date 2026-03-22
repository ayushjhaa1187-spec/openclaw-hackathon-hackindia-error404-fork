import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export function useAdminSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/settings/campus');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: any) => {
    try {
      const res = await fetch('/api/v1/admin/settings/campus', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings }),
      });
      if (!res.ok) throw new Error('Update failed');
      const data = await res.json();
      setSettings(data.data);
      toast.success('Settings synchronized across Nexus');
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refresh: fetchSettings
  };
}
