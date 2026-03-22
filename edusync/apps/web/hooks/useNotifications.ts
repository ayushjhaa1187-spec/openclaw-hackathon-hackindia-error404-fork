import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { socket } from '../lib/socket'; // Assuming socket client is exported here
import { useAuth } from './useAuth'; // Assuming useAuth provides current student/uid

export interface Notification {
  _id: string;
  type: string;
  title: string;
  body: string;
  actionUrl: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (type: 'unread' | 'all' = 'unread') => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/notifications?type=${type}`);
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = async (id: string) => {
    try {
      const res = await axios.patch(`/api/v1/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await axios.patch('/api/v1/notifications/read-all');
      if (res.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err: any) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    // Join user room for private notifications
    socket.emit('join-user-room', user.uid);

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [user?.uid, handleNewNotification]);

  useEffect(() => {
    if (user?.uid) {
      fetchNotifications();
    }
  }, [user?.uid, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markRead,
    markAllRead
  };
}
