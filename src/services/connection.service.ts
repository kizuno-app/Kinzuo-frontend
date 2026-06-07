import { apiClient } from './api-client';

export const connectionService = {
  followUser: async (userId: string) => {
    const response = await apiClient.post(`/connections/${userId}/follow`);
    return response.data.data;
  },
  
  unfollowUser: async (userId: string) => {
    const response = await apiClient.post(`/connections/${userId}/unfollow`);
    return response.data.data;
  }
};
