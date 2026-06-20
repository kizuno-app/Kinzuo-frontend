import { apiClient } from './api-client';

export const feedService = {
  getHomeFeed: async ({ pageParam = { offset: 0, seenIds: [] } }: { pageParam?: { offset: number; seenIds: string[] } } = {}) => {
    const limit = 10;
    const seenIdsStr = pageParam.seenIds.length > 0 ? `&seenIds=${pageParam.seenIds.join(',')}` : '';
    const response = await apiClient.get(`/feed?limit=${limit}&offset=${pageParam.offset}${seenIdsStr}`);
    // Backend returns { status:'success', data: [...posts] }
    const posts = response.data.data ?? [];
    return { posts };
  }
};
