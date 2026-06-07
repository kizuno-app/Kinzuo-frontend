"use client";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feedService } from "@/services/feed.service";
import { postService } from "@/services/post.service";
import { useAuthStore } from "@/store/auth.store";

function PostCard({ post }: { post: any }) {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);

  // Optimistic like mutation
  const likeMutation = useMutation({
    mutationFn: () => postService.likePost(post.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previousFeed = queryClient.getQueryData(["feed"]);
      
      queryClient.setQueryData(["feed"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: any) => {
              if (p.id === post.id) {
                return {
                  ...p,
                  isLiked: !p.isLiked,
                  likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1
                };
              }
              return p;
            })
          }))
        };
      });
      return { previousFeed };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["feed"], context?.previousFeed);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const authorName = post.author ? `${post.author.firstName} ${post.author.lastName}` : "Unknown User";
  const authorDept = post.author?.branch || "General";
  const authorYear = post.author?.year ? `Year ${post.author.year}` : "";
  const avatarClass = post.author?.avatar || "avatar-gradient";

  return (
    <div
      style={{
        background: "#171717",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "16px",
        border: "1px solid #262626",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            className={avatarClass}
            style={{ width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: "15px", color: "#fafafa" }}>{authorName}</div>
            <div style={{ fontSize: "13px", color: "#a1a1aa" }}>{authorDept} {authorYear ? `• ${authorYear}` : ''}</div>
          </div>
        </div>
        <span style={{ fontSize: "13px", color: "#71717a" }}>
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p style={{ fontSize: "15px", color: "#fafafa", lineHeight: 1.6, marginBottom: "16px", whiteSpace: 'pre-wrap' }}>
        {post.content}
      </p>

      {post.media && post.media.length > 0 && (
        <div style={{ marginBottom: "16px", borderRadius: "12px", overflow: "hidden" }}>
          <img src={post.media[0]} alt="Post media" style={{ width: "100%", height: "auto", display: "block" }} />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <button
            onClick={handleLike}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "none", border: "none", cursor: "pointer",
              color: post.isLiked ? "#F5A623" : "#a1a1aa", fontSize: "14px", fontWeight: 500, padding: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={post.isLiked ? "#F5A623" : "none"} stroke={post.isLiked ? "#F5A623" : "#a1a1aa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {post.likesCount || 0}
          </button>

          <button
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "none", border: "none", cursor: "pointer",
              color: "#a1a1aa", fontSize: "14px", fontWeight: 500, padding: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            {post.commentsCount || 0}
          </button>
        </div>

        <button
          onClick={() => setConnected(!connected)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", borderRadius: "999px",
            background: "transparent", border: "1px solid #3f3f46",
            color: "#fafafa", fontSize: "13px", fontWeight: 500,
            cursor: "pointer", transition: "all 0.15s",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          {connected ? "Connected" : "Connect"}
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuthStore();
  const [postContent, setPostContent] = useState("");
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

  const createPostMutation = useMutation({
    mutationFn: (content: string) => postService.createPost({ content }),
    onSuccess: () => {
      setPostContent("");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    }
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    createPostMutation.mutate(postContent);
  };

  return (
    <AppLayout>
      <div style={{ padding: "24px", borderBottom: "1px solid #262626", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", marginBottom: "4px" }}>
              Hey, {user?.firstName || 'User'} 👋
            </h1>
            <p style={{ fontSize: "14px", color: "#a1a1aa" }}>Find your people</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1f1f22", border: "1px solid #262626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
            <button style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1f1f22", border: "1px solid #262626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span style={{ position: "absolute", top: "8px", right: "8px", width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%", border: "2px solid #1f1f22" }} />
            </button>
          </div>
        </div>

        {/* Create Post Input */}
        <form onSubmit={handleCreatePost} style={{ display: "flex", gap: "12px" }}>
          <div className="avatar-gradient" style={{ width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              placeholder="What's happening on campus?" 
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px", background: "#171717",
                border: "1px solid #262626", borderRadius: "999px",
                color: "#fafafa", fontSize: "15px", outline: "none"
              }}
            />
          </div>
          <button 
            type="submit"
            disabled={createPostMutation.isPending || !postContent.trim()}
            style={{
              padding: "0 20px", background: "#F5A623", color: "#0a0a0a",
              border: "none", borderRadius: "999px", fontWeight: 600,
              cursor: (!postContent.trim() || createPostMutation.isPending) ? "not-allowed" : "pointer",
              opacity: (!postContent.trim() || createPostMutation.isPending) ? 0.5 : 1
            }}
          >
            Post
          </button>
        </form>
      </div>

      <div style={{ padding: "0 16px" }}>
        {isLoading && (
          <div style={{ color: "#a1a1aa", textAlign: "center", padding: "40px" }}>Loading feed...</div>
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
    </AppLayout>
  );
}
