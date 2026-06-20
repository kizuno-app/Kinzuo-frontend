import { apiClient } from './api-client';

export const organizationService = {
  getTrendingOrganizations: async () => {
    const response = await apiClient.get('/users/org-accounts/trending');
    return response.data.data;
  },
  
  getOrganizationProfile: async (id: string) => {
    const response = await apiClient.get(`/organizations/${id}`);
    return response.data.data;
  }
};
