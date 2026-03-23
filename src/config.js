export const API_URL = typeof window !== 'undefined' && window.location.origin.includes('localhost') 
  ? 'http://localhost:5000/api' 
  : '/api';
export const SOCKET_URL = typeof window !== 'undefined' && window.location.origin.includes('localhost') 
  ? 'http://localhost:5000' 
  : window.location.origin;
