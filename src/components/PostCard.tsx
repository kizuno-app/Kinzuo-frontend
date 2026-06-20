import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { differenceInHours, format } from "date-fns";
import { formatCompactTimeAgo } from "@/utils/date";
import OrgContextChip from "./OrgContextChip";
import ReportModal from "./ReportModal";
import EmbeddedPost from "./EmbeddedPost";
import ShareModal from "./ShareModal";
import { useAuthStore } from "@/store/auth.store";

export default function PostCard({ post, hideActions = false }: { post: any; hideActions?: boolean }) {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRetweetMenu, setShowRetweetMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const retweetMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [shareToken, setShareToken] = useState<string | null>(null);

  const isSimpleRepost = post.repostOfId && !post.isQuote;
  const displayPost = isSimpleRepost && post.repostOf ? post.repostOf : post;

  useEffect(() => {
    if (showShareMenu && isAuthenticated && !shareToken) {
      postService.getShareToken(displayPost.id)
        .then(token => setShareToken(token))
        .catch(err => console.error("Failed to prefetch share token:", err));
    }
  }, [showShareMenu, isAuthenticated, displayPost.id, shareToken]);

  // Close share dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showShareMenu]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Close retweet dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (retweetMenuRef.current && !retweetMenuRef.current.contains(e.target as Node)) {
        setShowRetweetMenu(false);
      }
    };
    if (showRetweetMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showRetweetMenu]);

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
                return { 
                  ...p, 
                  isShared: true, 
                  shares: (p.shares || 0) + (p.isShared ? 0 : 1) 
                };
              }
              return p;
            })
          }))
        };
      });

      // Update user posts
      queryClient.setQueryData(["posts", "user", post.userId], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((p: any) => p.id === post.id ? { 
          ...p, 
          isShared: true, 
          shares: (p.shares || 0) + (p.isShared ? 0 : 1) 
        } : p);
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

  // Repost mutation (toggle: repost / unrepost)
  const repostMutation = useMutation({
    mutationFn: () => postService.repost(post.id),
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
                const wasReposted = p.isReposted;
                return {
                  ...p,
                  isReposted: !wasReposted,
                  repostsCount: wasReposted
                    ? Math.max((p.repostsCount || 0) - 1, 0)
                    : (p.repostsCount || 0) + 1,
                };
              }
              return p;
            }),
          })),
        };
      });

      return { previousFeed };
    },
    onError: (err, vars, context) => {
      if (context?.previousFeed) queryClient.setQueryData(["feed"], context.previousFeed);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "user", post.userId] });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    likeMutation.mutate();
  };
  const handleCopyLink = async () => {
    let currentToken = shareToken;
    if (isAuthenticated && !currentToken) {
      try {
        currentToken = await postService.getShareToken(displayPost.id);
        setShareToken(currentToken);
      } catch (err) {
        console.error("Failed to generate share token:", err);
      }
    }

    let shareLink = "";
    if (isAuthenticated && currentToken) {
      shareLink = `${window.location.origin}/share/${currentToken}`;
    } else {
      if (window.location.pathname.includes("/share/")) {
        shareLink = window.location.href;
      } else {
        shareLink = `${window.location.origin}/user/post/${displayPost.id}`;
      }
    }

    // Use execCommand as primary — it works after async calls without document focus
    const textarea = document.createElement("textarea");
    textarea.value = shareLink;
    textarea.setAttribute("readonly", "");
    textarea.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0";
    document.body.appendChild(textarea);
    textarea.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (_) { /* ignore */ }
    document.body.removeChild(textarea);

    if (!copied) {
      // Fallback to navigator.clipboard (may fail if not focused)
      try {
        await navigator.clipboard.writeText(shareLink);
        copied = true;
      } catch (_) { /* ignore */ }
    }

    if (copied) {
      setToast("Link copied to clipboard!");
      if (isAuthenticated) {
        shareMutation.mutate();
      }
    } else {
      setToast("Failed to copy link. Please copy it manually.");
    }
    setShowShareMenu(false);
  };
  const handleRepost = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setShowRetweetMenu(false);
    repostMutation.mutate();
  };
  const handleQuote = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setShowRetweetMenu(false);
    router.push(`/create?quote=${post.id}`);
  };

  // Determine display data — for simple reposts, show the original post content
  const reposterName = isSimpleRepost && post.author
    ? `${post.author.firstName} ${post.author.lastName}`
    : null;

  const authorName = displayPost.author ? `${displayPost.author.firstName} ${displayPost.author.lastName}` : "Unknown User";
  const authorDept = displayPost.author?.branch || "";
  const authorYear = displayPost.author?.year ? `Year ${displayPost.author.year}` : "";
  const hasAvatar = !!displayPost.author?.avatar;

  return (
    <div
      onClick={() => {
        if (!isAuthenticated) {
          router.push("/login");
        } else {
          router.push(`/user/post/${post.id}`);
        }
      }}
      style={{
        background: "#171717",
        borderRadius: "16px",
        padding: "16px",
        marginBottom: "16px",
        border: "1px solid #262626",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "background 0.2s"
      }}
      className="hover:bg-[#1f1f22]"
    >
      {/* Repost indicator header */}
      {isSimpleRepost && reposterName && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#22c55e",
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "8px",
            paddingLeft: "52px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 1l4 4-4 4"></path>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <path d="M7 23l-4-4 4-4"></path>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          </svg>
          {reposterName} reposted
        </div>
      )}

      <div style={{ display: "flex", gap: "12px" }}>
        {/* Left Column - Avatar */}
        <div style={{ flexShrink: 0 }}>
          <Link href={displayPost.userId ? `/profile/${displayPost.userId}` : '#'} onClick={(e) => e.stopPropagation()}>
            <div
              className={!hasAvatar ? "avatar-gradient" : ""}
              style={{ 
                width: "40px", height: "40px", 
                borderRadius: displayPost.author?.isOrgAccount ? "8px" : "50%",
                backgroundSize: "cover", backgroundPosition: "center",
                backgroundImage: hasAvatar ? `url(${displayPost.author.avatar})` : undefined
              }}
            />
          </Link>
        </div>

        {/* Right Column - Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Org Chip */}
          {post.organization && (
            <OrgContextChip org={post.organization} />
          )}

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", minWidth: 0 }}>
              <Link href={displayPost.userId ? `/profile/${displayPost.userId}` : '#'} onClick={(e) => e.stopPropagation()} style={{ fontWeight: 700, fontSize: "15px", color: "#fafafa", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }} className="hover:underline">
                {authorName}
                {displayPost.author?.verified && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#10b981" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C12 2 13 4 15 4C17 4 18 3 18 3C18 3 19 5 21 6C23 7 24 6 24 6C24 6 22 8 22 10C22 12 23 14 23 14C23 14 21 15 19 17C17 19 17 21 17 21C17 21 15 20 13 20C11 20 9 21 9 21C9 21 9 19 7 17C5 15 3 14 3 14C3 14 4 12 4 10C4 8 2 6 2 6C2 6 3 7 5 6C7 5 8 3 8 3C8 3 9 4 11 4C13 4 12 2 12 2Z" fill="#10b981"/>
                    <path d="M10 15L7 12L8.41 10.59L10 12.17L15.59 6.58L17 8L10 15Z" fill="#ffffff"/>
                  </svg>
                )}
              </Link>
              <span style={{ fontSize: "15px", color: "#71767b" }}>@{displayPost.author?.username || authorName.replace(/\s+/g, '').toLowerCase()}</span>
              <span style={{ fontSize: "15px", color: "#71767b" }}>·</span>
              <span style={{ fontSize: "15px", color: "#71767b" }}>
                {formatCompactTimeAgo(displayPost.createdAt)}
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} 
                style={{ background: "none", border: "none", color: "#71767b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </button>
              {showMenu && (
                <div 
                  style={{ 
                    position: "absolute", right: 0, top: "24px", background: "#171717", 
                    border: "1px solid #262626", borderRadius: "8px", padding: "4px", 
                    zIndex: 10, minWidth: "120px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)" 
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => {
                      if (!isAuthenticated) {
                        router.push("/login");
                        return;
                      }
                      setShowMenu(false);
                      setShowReportModal(true);
                    }}
                    style={{ 
                      display: "flex", alignItems: "center", gap: "8px", width: "100%", 
                      padding: "8px 12px", background: "transparent", border: "none", 
                      color: "#ef4444", fontSize: "14px", cursor: "pointer", borderRadius: "4px" 
                    }}
                    className="hover:bg-[#262626]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {displayPost.content && (
            <p style={{ fontSize: "15px", color: "#fafafa", lineHeight: 1.5, marginBottom: "12px", whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {displayPost.content}
            </p>
          )}

          {/* Media */}
          {displayPost.media && displayPost.media.length > 0 && (
            <div style={{ marginBottom: "12px", borderRadius: "16px", overflow: "hidden", border: "1px solid #262626" }}>
              <img src={displayPost.media[0]} alt="Post media" style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          )}
          
          {displayPost.mediaUrl && (!displayPost.media || displayPost.media.length === 0) && (
            <div style={{ marginBottom: "12px", borderRadius: "16px", overflow: "hidden", border: "1px solid #262626" }}>
              <img src={displayPost.mediaUrl} alt="Post attachment" style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          )}

          {/* Embedded original post for quotes */}
          {post.isQuote && post.repostOf && (
            <div onClick={(e) => e.stopPropagation()} style={{ marginBottom: "12px" }}>
              <EmbeddedPost post={post.repostOf} />
            </div>
          )}

          {/* Tags */}
          {displayPost.tags && Array.isArray(displayPost.tags) && displayPost.tags.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
              {displayPost.tags.map((t: string) => (
                <span key={t} style={{ color: "#1d9bf0", fontSize: "14px" }}>{t.startsWith('#') ? t : `#${t}`}</span>
              ))}
            </div>
          )}

          {/* Actions */}
          {!hideActions && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "425px", color: "#71767b", marginTop: "4px" }}>
              
              {/* Comment */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAuthenticated) {
                    router.push("/login");
                  } else {
                    router.push(`/user/post/${post.id}`);
                  }
                }}
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

              {/* Retweet with dropdown */}
              <div style={{ position: "relative" }} ref={retweetMenuRef}>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowRetweetMenu(!showRetweetMenu); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "none", border: "none", cursor: "pointer",
                    color: post.isReposted ? "#22c55e" : "inherit", fontSize: "13px", padding: 0,
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
                  {post.repostsCount || 0}
                </button>

                {/* Retweet dropdown menu */}
                {showRetweetMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 8px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#171717",
                      border: "1px solid #333",
                      borderRadius: "12px",
                      padding: "4px",
                      zIndex: 20,
                      minWidth: "160px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    }}
                  >
                    <button
                      onClick={handleRepost}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px", width: "100%",
                        padding: "10px 14px", background: "transparent", border: "none",
                        color: post.isReposted ? "#22c55e" : "#fafafa", fontSize: "14px",
                        cursor: "pointer", borderRadius: "8px", fontWeight: 600,
                      }}
                      className="hover:bg-[#262626]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 1l4 4-4 4"></path>
                        <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                        <path d="M7 23l-4-4 4-4"></path>
                        <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                      </svg>
                      {post.isReposted ? "Undo Repost" : "Repost"}
                    </button>
                    <button
                      onClick={handleQuote}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px", width: "100%",
                        padding: "10px 14px", background: "transparent", border: "none",
                        color: "#fafafa", fontSize: "14px",
                        cursor: "pointer", borderRadius: "8px", fontWeight: 600,
                      }}
                      className="hover:bg-[#262626]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Quote
                    </button>
                  </div>
                )}
              </div>

              {/* Share */}
              <div style={{ position: "relative" }} ref={shareMenuRef}>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "none", border: "none", cursor: "pointer",
                    color: post.isShared ? "#3b82f6" : "inherit", fontSize: "13px", padding: 0,
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

                {/* Share dropdown menu */}
                {showShareMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 8px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#171717",
                      border: "1px solid #333",
                      borderRadius: "12px",
                      padding: "4px",
                      zIndex: 20,
                      minWidth: "160px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    }}
                  >
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          router.push("/login");
                          return;
                        }
                        setShowShareMenu(false);
                        setShowShareModal(true);
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px", width: "100%",
                        padding: "10px 14px", background: "transparent", border: "none",
                        color: "#fafafa", fontSize: "14px",
                        cursor: "pointer", borderRadius: "8px", fontWeight: 600,
                      }}
                      className="hover:bg-[#262626]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Send via Chat
                    </button>
                    <button
                      onClick={handleCopyLink}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px", width: "100%",
                        padding: "10px 14px", background: "transparent", border: "none",
                        color: "#fafafa", fontSize: "14px",
                        cursor: "pointer", borderRadius: "8px", fontWeight: 600,
                      }}
                      className="hover:bg-[#262626]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      Copy link
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
      
      {showReportModal && (
        <div onClick={(e) => e.stopPropagation()}>
          <ReportModal 
            isOpen={showReportModal} 
            onClose={() => setShowReportModal(false)} 
            targetType="POST" 
            targetId={post.id} 
          />
        </div>
      )}

      {showShareModal && (
        <div onClick={(e) => e.stopPropagation()}>
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            postId={post.id}
            onShared={(msg) => setToast(msg)}
          />
        </div>
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", left: "50%",
          transform: "translateX(-50%)", background: "#F5A623",
          color: "#111", padding: "12px 24px", borderRadius: "24px",
          fontWeight: 700, fontSize: "14px", zIndex: 2000,
          boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
