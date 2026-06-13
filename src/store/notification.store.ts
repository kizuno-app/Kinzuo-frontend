import { create } from 'zustand';
import { apiClient } from '@/services/api-client';

interface NotificationState {
  unreadCount: number;
  fetchUnreadCount: () => Promise<void>;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  fetchUnreadCount: async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      set({ unreadCount: response.data?.data?.count || 0 });
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  },
  incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnreadCount: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  setUnreadCount: (count: number) => set({ unreadCount: count }),
}));
