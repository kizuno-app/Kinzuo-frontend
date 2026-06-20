import { apiClient } from "./api-client";

export const platformAdminService = {
  getMetrics: async () => {
    return await apiClient.get('/_sys/x-org-ops/_q/metrics');
  },
  
  getApplications: async () => {
    return await apiClient.get('/_sys/x-org-ops/_q/all');
  },
  
  resolveApplication: async (id: string, status: 'APPROVED' | 'REJECTED') => {
    return await apiClient.post(`/_sys/x-org-ops/_q/${id}/resolve`, { status });
  }
};
