import { create } from 'zustand';
import { apiClient } from '@/services/api-client';

interface NotificationState {
  unreadCount: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  fetchUnreadCount: () => Promise<void>;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  isDrawerOpen: false,
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  fetchUnreadCount: async () => {
    try {
      const response = await apiClient.get('/user-alerts/unread-count');
      set({ unreadCount: response.data?.data?.count || 0 });
    } catch (error: any) {
      if (error?.code !== 'ERR_NETWORK') {
        console.error('Failed to fetch unread count', error);
      }
    }
  },
  incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnreadCount: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  setUnreadCount: (count: number) => set({ unreadCount: count }),
}));
