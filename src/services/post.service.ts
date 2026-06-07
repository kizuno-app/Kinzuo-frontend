import { apiClient } from './api-client';

export const postService = {
  createPost: async (data: { content: string; media?: string[] }) => {
    const response = await apiClient.post('/posts', data);
    return response.data.data;
  },
  
  likePost: async (postId: string) => {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response.data.data;
  },
  
  commentOnPost: async (postId: string, content: string) => {
    const response = await apiClient.post(`/posts/${postId}/comment`, { content });
    return response.data.data;
  }
};
