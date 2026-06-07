import { apiClient } from './api-client';

export const authService = {
  login: async (data: Record<string, unknown>) => {
    // Returns { status: 'success', data: { token, user } }
    const response = await apiClient.post('/auth/login', data);
    return response.data; // { status, data: { token, user } }
  },
  
  register: async (data: Record<string, unknown>) => {
    // Returns { status: 'success', data: { id, email } }
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};

