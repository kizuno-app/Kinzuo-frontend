import { apiClient } from './api-client';

export const discoverService = {
  getSuggestedUsers: async (q?: string) => {
    const response = await apiClient.get('/discover/suggested-users', { params: { q } });
    return response.data.data; // unwrap { status, data: [...] }
  },
  
  getTrending: async () => {
    const response = await apiClient.get('/discover/trending');
    return response.data.data;
  }
};
