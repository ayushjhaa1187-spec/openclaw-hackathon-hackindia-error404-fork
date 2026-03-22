import axios, { AxiosError } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach Institutional JWT to every request
apiClient.interceptors.request.use(async (config) => {
  const session = await getSession() as any;
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// Response interceptor for status-specific handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      toast.error('Nexus Handshake Expired: Re-authenticating institutional identity.');
      await signOut({ callbackUrl: '/login' });
    } else if (status === 403) {
      toast.error('Access Denied: You do not have permission for this node.');
      window.location.href = '/forbidden';
    } else if (status === 429) {
      toast.error('Nexus Throttling: Too many requests. Please wait.');
      window.location.href = '/rate-limited';
    } else if (status === 500) {
      toast.error('Critical Node Error: Synchronization failed. Our team has been notified.');
      // Report to error tracking
      fetch('/api/v1/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorMessage: error.message,
          errorStack: error.stack,
          url: window.location.href,
          type: 'api_error',
        }),
      }).catch(console.error);
    } else if (!error.response) {
      toast.error('Network Lost: Connection to the Nexus node was interrupted.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
