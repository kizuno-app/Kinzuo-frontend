import { apiClient } from './api-client';

export const discoverService = {
  getSuggestedUsers: async () => {
    const response = await apiClient.get('/discover/suggested-users');
    return response.data.data; // unwrap { status, data: [...] }
  },
  
  getTrending: async () => {
    const response = await apiClient.get('/discover/trending');
    return response.data.data;
  }
};
