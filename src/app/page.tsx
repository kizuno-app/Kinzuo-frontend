"use client";
import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feedService } from "@/services/feed.service";
import { postService } from "@/services/post.service";
import { useAuthStore } from "@/store/auth.store";
import Link from "next/link";

import PostCard from "@/components/PostCard";

const PostSkeleton = () => (
  <div className="animate-pulse" style={{ background: "#171717", borderRadius: "16px", padding: "16px", marginBottom: "16px", border: "1px solid #262626" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#333" }} />
      <div>
        <div style={{ width: "120px", height: "16px", background: "#333", borderRadius: "4px", marginBottom: "6px" }} />
        <div style={{ width: "80px", height: "12px", background: "#333", borderRadius: "4px" }} />
      </div>
    </div>
    <div style={{ width: "100%", height: "16px", background: "#333", borderRadius: "4px", marginBottom: "8px" }} />
    <div style={{ width: "80%", height: "16px", background: "#333", borderRadius: "4px", marginBottom: "16px" }} />
    <div style={{ height: "200px", width: "100%", background: "#333", borderRadius: "12px", marginBottom: "16px" }} />
    <div style={{ display: "flex", gap: "16px" }}>
      <div style={{ width: "60px", height: "32px", background: "#333", borderRadius: "16px" }} />
      <div style={{ width: "60px", height: "32px", background: "#333", borderRadius: "16px" }} />
    </div>
  </div>
);
export default function HomePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: feedService.getHomeFeed,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
  });

  return (
    <>
      <div style={{ padding: "24px", borderBottom: "1px solid #262626", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", marginBottom: "4px" }}>
              Hey, {user?.firstName || 'User'} 👋
            </h1>
            <p style={{ fontSize: "14px", color: "#a1a1aa" }}>Find your people</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1f1f22", border: "1px solid #262626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span style={{ position: "absolute", top: "8px", right: "8px", width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%", border: "2px solid #1f1f22" }} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {isLoading && (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        )}
        
        {isError && (
          <div style={{ color: "#ef4444", textAlign: "center", padding: "40px" }}>Failed to load feed</div>
        )}

        {data?.pages.map((page, i) => (
          <div key={i}>
            {page.posts?.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ))}
        
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            style={{
              width: "100%", padding: "12px", background: "#171717", border: "1px solid #262626",
              borderRadius: "12px", color: "#a1a1aa", cursor: "pointer", marginBottom: "20px"
            }}
          >
            {isFetchingNextPage ? "Loading more..." : "Load More"}
          </button>
        )}
      </div>
    </>
  );
}
