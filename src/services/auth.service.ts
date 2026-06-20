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
  },

  verifyEmail: async (token: string) => {
    // GET /auth/verify-email?token=xxx
    const response = await apiClient.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  resendVerification: async (email: string) => {
    // POST /auth/resend-verification
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    // POST /auth/forgot-password
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data: Record<string, unknown>) => {
    // POST /auth/reset-password with { token, newPassword }
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  requestOtp: async (purpose: string) => {
    // POST /auth/otp/request
    const response = await apiClient.post('/auth/otp/request', { purpose });
    return response.data;
  },

  verifyOtp: async (data: Record<string, unknown>) => {
    // POST /auth/otp/verify with { otp, purpose }
    const response = await apiClient.post('/auth/otp/verify', data);
    return response.data;
  }
};


