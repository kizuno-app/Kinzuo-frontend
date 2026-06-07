import { apiClient } from './api-client';

export const feedService = {
  getHomeFeed: async ({ pageParam = 0 }: { pageParam?: number } = {}) => {
    const limit = 10;
    const response = await apiClient.get(`/feed?limit=${limit}&offset=${pageParam}`);
    // Backend returns { status:'success', data: [...posts] }
    const posts = response.data.data ?? [];
    return { posts, nextOffset: posts.length === limit ? (pageParam as number) + limit : undefined };
  }
};
