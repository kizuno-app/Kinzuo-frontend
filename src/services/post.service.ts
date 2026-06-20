import { apiClient } from './api-client';

export const postService = {
  createPost: async (data: { content: string; media?: string[] }) => {
    const response = await apiClient.post('/posts', data);
    return response.data.data;
  },
  
  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post('/users/upload?type=post', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.url as string;
  },
  
  likePost: async (postId: string) => {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response.data.data;
  },
  
  addComment: async (postId: string, content: string, parentId?: string) => {
    const payload = parentId ? { content, parentId } : { content };
    const response = await apiClient.post(`/posts/${postId}/comment`, payload);
    return response.data.data;
  },
  
  sharePost: async (postId: string) => {
    const response = await apiClient.post(`/posts/${postId}/share`);
    return response.data.data;
  },

  repost: async (postId: string) => {
    const response = await apiClient.post(`/posts/${postId}/repost`);
    return response.data.data;
  },

  quotePost: async (postId: string, content: string, media?: string[]) => {
    const response = await apiClient.post(`/posts/${postId}/quote`, { content, media });
    return response.data.data;
  },
  
  getPost: async (postId: string) => {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data.data;
  },
  
  getComments: async (postId: string, parentId?: string, skip = 0, take = 3) => {
    let url = `/posts/${postId}/comments?skip=${skip}&take=${take}`;
    if (parentId) url += `&parentId=${parentId}`;
    const response = await apiClient.get(url);
    return response.data.data;
  },

  getPublicPost: async (shareToken: string) => {
    const response = await apiClient.get(`/posts/share/${shareToken}`);
    return response.data.data;
  },

  getShareToken: async (postId: string) => {
    const response = await apiClient.post(`/posts/${postId}/share-token`);
    return response.data.data.shareToken;
  },
};

