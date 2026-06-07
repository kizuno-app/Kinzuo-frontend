import { apiClient } from './api-client';

export const chatService = {
  getConversations: async () => {
    const response = await apiClient.get('/chat/conversations');
    return response.data.data; // unwrap { status, data: [...] }
  },
  
  getMessages: async (otherUserId: string, pageParam = 0) => {
    const response = await apiClient.get(`/chat/${otherUserId}/messages?limit=50&offset=${pageParam}`);
    return response.data.data;
  },
  
  sendMessage: async (receiverId: string, content: string) => {
    const response = await apiClient.post(`/chat/${receiverId}/message`, { content });
    return response.data.data;
  }
};
