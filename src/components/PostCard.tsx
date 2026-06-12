import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PostCard({ post }: { post: any }) {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const router = useRouter();

  // Optimistic like mutation
  const likeMutation = useMutation({
    mutationFn: () => postService.likePost(post.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["posts", "user", post.userId] });

      const previousFeed = queryClient.getQueryData(["feed"]);
      const previousUserPosts = queryClient.getQueryData(["posts", "user", post.userId]);
      
      // Update feed (infinite query structure)
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
                  likes: p.isLiked ? Math.max((p.likes || 0) - 1, 0) : (p.likes || 0) + 1
                };
              }
              return p;
            })
          }))
        };
      });

      // Update user posts (array structure)
      queryClient.setQueryData(["posts", "user", post.userId], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((p: any) => {
          if (p.id === post.id) {
            return {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? Math.max((p.likes || 0) - 1, 0) : (p.likes || 0) + 1
            };
          }
          return p;
        });
      });

      return { previousFeed, previousUserPosts };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(["feed"], context.previousFeed);
      }
      if (context?.previousUserPosts) {
        queryClient.setQueryData(["posts", "user", post.userId], context.previousUserPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "user", post.userId] });
    },
  });

  const shareMutation = useMutation({
    mutationFn: () => postService.sharePost(post.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["posts", "user", post.userId] });

      const previousFeed = queryClient.getQueryData(["feed"]);
      const previousUserPosts = queryClient.getQueryData(["posts", "user", post.userId]);
      
      // Update feed
      queryClient.setQueryData(["feed"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: any) => {
              if (p.id === post.id) {
                return { ...p, shares: (p.shares || 0) + 1 };
              }
              return p;
            })
          }))
        };
      });

      // Update user posts
      queryClient.setQueryData(["posts", "user", post.userId], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((p: any) => p.id === post.id ? { ...p, shares: (p.shares || 0) + 1 } : p);
      });

      return { previousFeed, previousUserPosts };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousFeed) queryClient.setQueryData(["feed"], context.previousFeed);
      if (context?.previousUserPosts) queryClient.setQueryData(["posts", "user", post.userId], context.previousUserPosts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "user", post.userId] });
    },
  });

  const handleLike = () => likeMutation.mutate();
  const handleShare = () => shareMutation.mutate();

  const authorName = post.author ? `${post.author.firstName} ${post.author.lastName}` : "Unknown User";
  const authorDept = post.author?.branch || "General";
  const authorYear = post.author?.year ? `Year ${post.author.year}` : "";
  const hasAvatar = !!post.author?.avatar;

  return (
    <div
      onClick={() => router.push(`/user/post/${post.id}`)}
      style={{
        background: "#171717",
        borderRadius: "16px",
        padding: "16px",
        marginBottom: "16px",
        border: "1px solid #262626",
        display: "flex",
        gap: "12px",
        cursor: "pointer",
        transition: "background 0.2s"
      }}
      className="hover:bg-[#1f1f22]"
    >
      {/* Left Column - Avatar */}
      <div style={{ flexShrink: 0 }}>
        <Link href={post.userId ? `/profile/${post.userId}` : '#'} onClick={(e) => e.stopPropagation()}>
          <div
            className={!hasAvatar ? "avatar-gradient" : ""}
            style={{ 
              width: "40px", height: "40px", borderRadius: "50%",
              backgroundSize: "cover", backgroundPosition: "center",
              backgroundImage: hasAvatar ? `url(${post.author.avatar})` : undefined
            }}
          />
        </Link>
      </div>

      {/* Right Column - Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Link href={post.userId ? `/profile/${post.userId}` : '#'} onClick={(e) => e.stopPropagation()} style={{ fontWeight: 700, fontSize: "15px", color: "#fafafa", textDecoration: "none" }} className="hover:underline">
              {authorName}
            </Link>
            <span style={{ fontSize: "15px", color: "#71767b" }}>@{post.author?.username || authorName.replace(/\s+/g, '').toLowerCase()}</span>
            <span style={{ fontSize: "15px", color: "#71767b" }}>·</span>
            <span style={{ fontSize: "15px", color: "#71767b" }}>
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
          <button onClick={(e) => e.stopPropagation()} style={{ background: "none", border: "none", color: "#71767b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
        </div>

        {/* Content */}
        <p style={{ fontSize: "15px", color: "#fafafa", lineHeight: 1.5, marginBottom: "12px", whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {post.content}
        </p>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div style={{ marginBottom: "12px", borderRadius: "16px", overflow: "hidden", border: "1px solid #262626" }}>
            <img src={post.media[0]} alt="Post media" style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        )}
        
        {post.mediaUrl && (!post.media || post.media.length === 0) && (
          <div style={{ marginBottom: "12px", borderRadius: "16px", overflow: "hidden", border: "1px solid #262626" }}>
            <img src={post.mediaUrl} alt="Post attachment" style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        )}

        {/* Tags */}
        {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
            {post.tags.map((t: string) => (
              <span key={t} style={{ color: "#1d9bf0", fontSize: "14px" }}>{t.startsWith('#') ? t : `#${t}`}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "425px", color: "#71767b", marginTop: "4px" }}>
          
          {/* Comment */}
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/user/post/${post.id}`); }}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "none", border: "none", cursor: "pointer",
              color: "inherit", fontSize: "13px", padding: 0,
            }}
            className="hover:text-blue-400 group"
          >
            <div className="group-hover:bg-blue-400/10 p-2 -m-2 rounded-full transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            {post.commentsCount || 0}
          </button>

          {/* Like */}
          <button
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "none", border: "none", cursor: "pointer",
              color: post.isLiked ? "#f91880" : "inherit", fontSize: "13px", padding: 0,
            }}
            className="hover:text-pink-500 group"
          >
            <div className="group-hover:bg-pink-500/10 p-2 -m-2 rounded-full transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill={post.isLiked ? "#f91880" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
            {post.likes || 0}
          </button>

          {/* Retweet */}
          <button
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "none", border: "none", cursor: "pointer",
              color: "inherit", fontSize: "13px", padding: 0,
            }}
            className="hover:text-green-500 group"
          >
            <div className="group-hover:bg-green-500/10 p-2 -m-2 rounded-full transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 1l4 4-4 4"></path>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                <path d="M7 23l-4-4 4-4"></path>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              </svg>
            </div>
            0
          </button>

          {/* Share */}
          <button
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "none", border: "none", cursor: "pointer",
              color: "inherit", fontSize: "13px", padding: 0,
            }}
            className="hover:text-blue-400 group"
          >
            <div className="group-hover:bg-blue-400/10 p-2 -m-2 rounded-full transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </div>
            {post.shares || 0}
          </button>

        </div>
      </div>
    </div>
  );
}
