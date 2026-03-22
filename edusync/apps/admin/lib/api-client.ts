import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.user) {
    // Assuming institutionalAuth needs Bearer token or specific header
    (config.headers as any).Authorization = `Bearer ${(session as any).accessToken || ''}`;
  }
  return config;
});

export default apiClient;
