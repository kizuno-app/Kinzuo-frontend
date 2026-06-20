import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './auth.store';

interface ChatState {
  socket: Socket | null;
  activeUserId: string | null;
  onlineUsers: string[];
  connectSocket: () => void;
  disconnectSocket: () => void;
  setActiveUser: (userId: string | null) => void;
  sendMessage: (receiverId: string, content: string) => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  activeUserId: null,
  onlineUsers: [],

  connectSocket: () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    // Prevent multiple connections
    if (get().socket?.connected) return;

    const socket = io(WS_URL, {
      // Server uses default socket.io path
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to WS');
      const user = useAuthStore.getState().user;
      if (user?.id) {
        socket.emit('join', user.id);
      }
    });

    socket.on('online_users', (users: string[]) => {
      set({ onlineUsers: users });
    });

    socket.on('user_online', (userId: string) => {
      set((state) => ({
        onlineUsers: [...new Set([...state.onlineUsers, userId])],
      }));
    });

    socket.on('user_offline', (userId: string) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.filter(id => id !== userId),
      }));
    });

    // We'll let components handle `message:receive` via useEffect if they need to update UI,
    // or we could manage a centralized message cache here. For now, React Query is easier for caching,
    // so we can invalidate or manually update the QueryCache when this triggers.

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },

  setActiveUser: (userId) => {
    set({ activeUserId: userId });
  },

  sendMessage: (receiverId, content) => {
    const { socket } = get();
    if (socket) {
      socket.emit('message:send', { receiverId, content });
    }
  }
}));
