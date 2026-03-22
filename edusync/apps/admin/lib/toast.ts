import { toast as hotToast } from 'react-hot-toast';

export const toast = {
  success: (msg: string, options?: any) => hotToast.success(msg, {
    style: {
      background: '#10b981',
      color: '#fff',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      fontSize: '10px',
      letterSpacing: '0.1em'
    },
    ...options
  }),
  error: (msg: string, options?: any) => hotToast.error(msg, {
    style: {
      background: '#ef4444',
      color: '#fff',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      fontSize: '10px',
      letterSpacing: '0.1em'
    },
    ...options
  }),
  loading: (msg: string, options?: any) => hotToast.loading(msg, {
    style: {
      background: '#6366f1',
      color: '#fff',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      fontSize: '10px',
      letterSpacing: '0.1em'
    },
    ...options
  }),
  info: (msg: string, options?: any) => hotToast(msg, {
    icon: 'ℹ️',
    style: {
      background: '#6366f1',
      color: '#fff',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      fontSize: '10px',
      letterSpacing: '0.1em'
    },
    ...options
  }),
};

export default toast;
