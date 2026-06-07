import { apiClient } from './api-client';

export const profileService = {
  getProfile: async (userId: string) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data.data; // unwrap { status, data: profile }
  },
  
  updateProfile: async (userId: string, data: Record<string, unknown>) => {
    const response = await apiClient.patch(`/users/me`, data); // always update own profile
    return response.data.data;
  },

  getUserPosts: async (userId: string) => {
    const response = await apiClient.get(`/feed/user/${userId}`);
    return response.data.data;
  }
};
