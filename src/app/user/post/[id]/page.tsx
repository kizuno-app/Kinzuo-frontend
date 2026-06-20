"use client";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useState, useRef, useEffect } from "react";
import { formatCompactTimeAgo } from "@/utils/date";
import EmbeddedPost from "@/components/EmbeddedPost";
import ShareModal from "@/components/ShareModal";


const getTimeAgo = (dateStr: string) => {
  const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000 / 60);
  if (diff < 60) return `${Math.max(1, diff)}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
};

function CommentThread({ comment, postId, isNested = false, onReply }: { comment: any; postId: string; isNested?: boolean; onReply: (parentId: string, username: string) => void }) {
  const cAuthorName = comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : "Unknown User";
  const cAuthorUsername = comment.author?.username || cAuthorName.replace(/\s+/g, '').toLowerCase();
  const cHasAvatar = !!comment.author?.avatar;
  const timeAgo = getTimeAgo(comment.createdAt);

  const [showReplies, setShowReplies] = useState(false);

  const { data: repliesData, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["comments", postId, comment.id],
    queryFn: ({ pageParam = 0 }) => postService.getComments(postId, comment.id, pageParam as number, 3),
    getNextPageParam: (lastPage, allPages) => lastPage.length === 3 ? allPages.length * 3 : undefined,
    initialPageParam: 0,
    enabled: showReplies,
  });

  const loadedReplies = repliesData ? repliesData.pages.flat() : [];

  return (
    <div style={{ position: "relative", marginTop: isNested ? "16px" : "24px" }}>
      <div style={{ display: "flex", gap: "12px", position: "relative", zIndex: 2 }}>
        {/* Avatar */}
        <Link href={comment.userId ? `/profile/${comment.userId}` : '#'}>
          <div
            className={!cHasAvatar ? "avatar-gradient" : ""}
            style={{ 
              width: "40px", height: "40px", borderRadius: comment.author?.isOrgAccount ? "8px" : "50%", flexShrink: 0,
              backgroundSize: "cover", backgroundPosition: "center",
              backgroundImage: cHasAvatar ? `url(${comment.author.avatar})` : undefined
            }}
          />
        </Link>
        
        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Link href={comment.userId ? `/profile/${comment.userId}` : '#'} style={{ fontWeight: 700, fontSize: "15px", color: "#fafafa", textDecoration: "none" }} className="hover:underline">
              {cAuthorName}
            </Link>
            <span style={{ fontSize: "15px", color: "#71767b" }}>@{cAuthorUsername}</span>
            <span style={{ fontSize: "15px", color: "#71767b" }}>·</span>
            <span style={{ fontSize: "15px", color: "#71767b" }}>{timeAgo}</span>
          </div>
          
          <div style={{ fontSize: "15px", color: "#fafafa", lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: "8px" }}>
            {comment.content}
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "#71767b", fontSize: "14px" }}>
            <button style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: 0 }} className="hover:text-pink-500 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
              <span>{comment.likes || 0}</span>
            </button>
            <button onClick={() => onReply(comment.id, cAuthorUsername)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, fontWeight: 500 }} className="hover:text-fafafa transition-colors">
              Reply
            </button>
            <span>·</span>
            <span>{timeAgo}</span>

            {comment.repliesCount > 0 && !showReplies && (
              <>
                <span>·</span>
                <button onClick={() => setShowReplies(true)} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", padding: 0, fontWeight: 600 }} className="hover:underline">
                  View {comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showReplies && (
        <div style={{ paddingLeft: "48px", position: "relative" }}>
          {/* Vertical line connecting children */}
          <div style={{
            position: "absolute",
            left: "19px", 
            top: "-12px", 
            bottom: "20px",
            width: "2px", 
            background: "#27272a" 
          }} />
          
          {loadedReplies.map((reply: any) => (
            <div key={reply.id} style={{ position: "relative" }}>
              {/* Horizontal arrow */}
              <svg style={{ position: "absolute", left: "-29px", top: "28px", width: "16px", height: "16px", overflow: "visible", zIndex: 1 }} fill="none" stroke="#27272a" strokeWidth="2">
                <path d="M 0 0 L 12 0" />
                <path d="M 8 -4 L 12 0 L 8 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <CommentThread comment={reply} postId={postId} isNested={true} onReply={onReply} />
            </div>
          ))}

          {hasNextPage && (
            <div style={{ position: "relative", marginTop: "16px", paddingLeft: "12px" }}>
              <button 
                onClick={() => fetchNextPage()} 
                disabled={isFetchingNextPage}
                style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", padding: 0, fontWeight: 600 }} 
                className="hover:underline"
              >
                {isFetchingNextPage ? "Loading..." : "Load more replies"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SinglePostPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyToUsername, setReplyToUsername] = useState<string | null>(null);
  const [showRetweetMenu, setShowRetweetMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const retweetMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);

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

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: () => postService.getPost(id),
    enabled: !!id,
  });

  const targetPostId = (post?.repostOfId && !post?.isQuote) ? post.repostOfId : id;

  useEffect(() => {
    if (showShareMenu && isAuthenticated && !shareToken && targetPostId) {
      postService.getShareToken(targetPostId)
        .then(token => setShareToken(token))
        .catch(err => console.error("Failed to prefetch share token:", err));
    }
  }, [showShareMenu, isAuthenticated, targetPostId, shareToken]);

  const { data: commentsData, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["comments", id, "root"],
    queryFn: ({ pageParam = 0 }) => postService.getComments(id, undefined, pageParam as number, 3),
    getNextPageParam: (lastPage, allPages) => lastPage.length === 3 ? allPages.length * 3 : undefined,
    initialPageParam: 0,
    enabled: !!id,
  });

  const topLevelComments = commentsData ? commentsData.pages.flat() : [];

  const commentMutation = useMutation({
    mutationFn: (data: { content: string, parentId?: string }) => postService.addComment(id, data.content, data.parentId),
    onSuccess: () => {
      setReplyContent("");
      setReplyToId(null);
      setReplyToUsername(null);
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      queryClient.invalidateQueries({ queryKey: ["post", id] });
    }
  });

  const handlePostReply = () => {
    if (!replyContent.trim()) return;
    commentMutation.mutate({ content: replyContent, parentId: replyToId || undefined });
  };

  const likeMutation = useMutation({
    mutationFn: () => postService.likePost(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", id] });
      const previousPost = queryClient.getQueryData(["post", id]);

      queryClient.setQueryData(["post", id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isLiked: !old.isLiked,
          likes: old.isLiked ? Math.max((old.likes || 0) - 1, 0) : (old.likes || 0) + 1
        };
      });

      return { previousPost };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", id], context.previousPost);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const shareMutation = useMutation({
    mutationFn: () => postService.sharePost(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", id] });
      const previousPost = queryClient.getQueryData(["post", id]);

      queryClient.setQueryData(["post", id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isShared: true,
          shares: (old.shares || 0) + (old.isShared ? 0 : 1)
        };
      });

      return { previousPost };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", id], context.previousPost);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const repostMutation = useMutation({
    mutationFn: () => postService.repost(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", id] });
      const previousPost = queryClient.getQueryData(["post", id]);

      queryClient.setQueryData(["post", id], (old: any) => {
        if (!old) return old;
        const wasReposted = old.isReposted;
        return {
          ...old,
          isReposted: !wasReposted,
          repostsCount: wasReposted
            ? Math.max((old.repostsCount || 0) - 1, 0)
            : (old.repostsCount || 0) + 1,
        };
      });

      return { previousPost };
    },
    onError: (err, vars, context) => {
      if (context?.previousPost) queryClient.setQueryData(["post", id], context.previousPost);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
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
    if (isAuthenticated && !currentToken && targetPostId) {
      try {
        currentToken = await postService.getShareToken(targetPostId);
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
        shareLink = `${window.location.origin}/user/post/${targetPostId}`;
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
    router.push(`/create?quote=${id}`);
  };

  if (isLoading) {
    return (
      <div style={{ width: "100%", padding: "0 8px" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 8px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#262626", marginRight: "12px", marginLeft: "-8px" }} />
          <div style={{ height: "24px", width: "60px", backgroundColor: "#262626", borderRadius: "8px" }} />
        </div>
        <div className="animate-pulse" style={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "16px", padding: "16px", marginTop: "8px" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#333" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px" }}>
              <div style={{ height: "16px", width: "140px", backgroundColor: "#333", borderRadius: "4px" }} />
              <div style={{ height: "14px", width: "90px", backgroundColor: "#333", borderRadius: "4px" }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
            <div style={{ height: "16px", width: "100%", backgroundColor: "#333", borderRadius: "4px" }} />
            <div style={{ height: "16px", width: "90%", backgroundColor: "#333", borderRadius: "4px" }} />
            <div style={{ height: "16px", width: "70%", backgroundColor: "#333", borderRadius: "4px" }} />
          </div>
          <div style={{ height: "300px", width: "100%", backgroundColor: "#333", borderRadius: "12px", marginBottom: "16px" }} />
          <div style={{ display: "flex", gap: "24px", padding: "8px 0" }}>
            <div style={{ height: "24px", width: "60px", backgroundColor: "#333", borderRadius: "12px" }} />
            <div style={{ height: "24px", width: "60px", backgroundColor: "#333", borderRadius: "12px" }} />
            <div style={{ height: "24px", width: "60px", backgroundColor: "#333", borderRadius: "12px" }} />
          </div>
          <div style={{ height: "2px", backgroundColor: "#333", margin: "16px 0", borderRadius: "1px" }} />
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#333" }} />
            <div style={{ flex: 1, height: "40px", backgroundColor: "#333", borderRadius: "999px" }} />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <>
        <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>Failed to load post.</div>
      </>
    );
  }

  const isSimpleRepost = post.repostOfId && !post.isQuote;
  const displayPost = isSimpleRepost && post.repostOf ? post.repostOf : post;
  const reposterName = isSimpleRepost && post.author
    ? `${post.author.firstName} ${post.author.lastName}`
    : null;

  const authorName = displayPost.author ? `${displayPost.author.firstName} ${displayPost.author.lastName}` : "Unknown User";
  const authorUsername = displayPost.author?.username || authorName.replace(/\s+/g, '').toLowerCase();
  const hasAvatar = !!displayPost.author?.avatar;

  return (
    <>
      <div style={{ width: "100%", padding: "0 8px", paddingBottom: "100px" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "12px 8px", position: "sticky", top: 0, background: "rgba(10,10,10,0.85)", backdropFilter: "blur(12px)", zIndex: 10 }}>
          <button 
            onClick={() => router.back()}
            style={{ background: "none", border: "none", color: "#fafafa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", borderRadius: "50%", marginRight: "12px", marginLeft: "-8px" }}
            className="hover:bg-[#1f1f22] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", margin: 0 }}>Post</h1>
        </div>

        {/* Master Card Container */}
        <div style={{ 
          background: "#171717", 
          border: "1px solid #262626", 
          borderRadius: "16px", 
          padding: "16px",
          marginTop: "8px",
          marginBottom: "20px"
        }}>
          
          {/* Repost indicator header */}
          {isSimpleRepost && reposterName && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#71767b",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "12px",
                paddingLeft: "48px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 1l4 4-4 4"></path>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                <path d="M7 23l-4-4 4-4"></path>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              </svg>
              <span>
                <Link href={`/profile/${post.userId}`} style={{ color: "inherit", textDecoration: "none" }} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                  {reposterName}
                </Link>{" "}
                reposted
              </span>
            </div>
          )}

          {/* Two-Column Post Layout */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            {/* Left Column - Avatar */}
            <div style={{ flexShrink: 0 }}>
              <Link href={displayPost.userId ? `/profile/${displayPost.userId}` : '#'}>
                <div
                  className={!hasAvatar ? "avatar-gradient" : ""}
                  style={{ 
                    width: "48px", height: "48px", borderRadius: displayPost.author?.isOrgAccount ? "8px" : "50%",
                    backgroundSize: "cover", backgroundPosition: "center",
                    backgroundImage: hasAvatar ? `url(${displayPost.author.avatar})` : undefined
                  }}
                />
              </Link>
            </div>

            {/* Right Column - Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Post Author Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Link href={displayPost.userId ? `/profile/${displayPost.userId}` : '#'} style={{ fontWeight: 700, fontSize: "16px", color: "#fafafa", textDecoration: "none" }} className="hover:underline">
                    {authorName}
                  </Link>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                    <span style={{ fontSize: "14px", color: "#71767b" }}>@{authorUsername}</span>
                    <span style={{ fontSize: "14px", color: "#71767b" }}>·</span>
                    <span style={{ fontSize: "14px", color: "#71767b" }}>
                      {formatCompactTimeAgo(displayPost.createdAt)}
                    </span>
                  </div>
                </div>
                
                <button style={{ background: "none", border: "none", color: "#71767b", cursor: "pointer", padding: "8px", margin: "-8px" }} className="hover:bg-[#1f1f22] rounded-full transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
              </div>

              {/* Post Content */}
              <div style={{ fontSize: "18px", color: "#fafafa", lineHeight: 1.5, marginBottom: "16px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {displayPost.content}
              </div>

              {/* Post Media */}
              {displayPost.media && displayPost.media.length > 0 && (
                <div style={{ marginBottom: "16px", borderRadius: "16px", overflow: "hidden", border: "1px solid #262626" }}>
                  <img src={displayPost.media[0]} alt="Post media" style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
              )}
              {displayPost.mediaUrl && (!displayPost.media || displayPost.media.length === 0) && (
                <div style={{ marginBottom: "16px", borderRadius: "16px", overflow: "hidden", border: "1px solid #262626" }}>
                  <img src={displayPost.mediaUrl} alt="Post attachment" style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
              )}

              {/* Embedded original post for quotes */}
              {displayPost.isQuote && displayPost.repostOf && (
                <div style={{ marginBottom: "16px" }}>
                  <EmbeddedPost post={displayPost.repostOf} />
                </div>
              )}

              {/* Post Actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#71767b", padding: "4px 0", maxWidth: "400px" }}>
                {/* Comment */}
                <button 
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "none", border: "none", cursor: "pointer",
                    color: "inherit", fontSize: "14px", padding: 0,
                  }}
                  className="hover:text-blue-400 group"
                >
                  <div className="group-hover:bg-blue-400/10 p-2 -m-2 rounded-full transition-colors" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <span style={{ display: "inline-block", verticalAlign: "middle" }}>{post.commentsCount || 0}</span>
                </button>

                {/* Like */}
                <button 
                  onClick={handleLike}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "none", border: "none", cursor: "pointer",
                    color: post.isLiked ? "#f91880" : "inherit", fontSize: "14px", padding: 0,
                  }}
                  className="hover:text-pink-500 group"
                >
                  <div className="group-hover:bg-pink-500/10 p-2 -m-2 rounded-full transition-colors" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={post.isLiked ? "#f91880" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  </div>
                  <span style={{ display: "inline-block", verticalAlign: "middle" }}>{post.likes || 0}</span>
                </button>

                {/* Retweet with dropdown */}
                <div style={{ position: "relative" }} ref={retweetMenuRef}>
                  <button 
                    onClick={() => setShowRetweetMenu(!showRetweetMenu)}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      background: "none", border: "none", cursor: "pointer",
                      color: post.isReposted ? "#22c55e" : "inherit", fontSize: "14px", padding: 0,
                    }}
                    className="hover:text-green-500 group"
                  >
                    <div className="group-hover:bg-green-500/10 p-2 -m-2 rounded-full transition-colors" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 1l4 4-4 4"></path>
                        <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                        <path d="M7 23l-4-4 4-4"></path>
                        <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                      </svg>
                    </div>
                    <span style={{ display: "inline-block", verticalAlign: "middle" }}>{post.repostsCount || 0}</span>
                  </button>

                  {/* Retweet dropdown */}
                  {showRetweetMenu && (
                    <div
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
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      background: "none", border: "none", cursor: "pointer",
                      color: post.isShared ? "#3b82f6" : "inherit", fontSize: "14px", padding: 0,
                    }}
                    className="hover:text-blue-400 group"
                  >
                    <div className="group-hover:bg-blue-400/10 p-2 -m-2 rounded-full transition-colors" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                    </div>
                    <span style={{ display: "inline-block", verticalAlign: "middle" }}>{post.shares || 0}</span>
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
            </div>
          </div>

          <div style={{ height: "2px", background: "#333333", margin: "20px 0", borderRadius: "1px" }} />

          {/* Write Comment Box */}
          {!isAuthenticated ? (
            <div style={{
              background: "linear-gradient(135deg, #1f1f22 0%, #171717 100%)",
              border: "1px solid #262626",
              borderRadius: "16px",
              padding: "24px",
              textAlign: "center",
              margin: "16px 0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>Join the conversation</h3>
              <p style={{ fontSize: "13px", color: "#a1a1aa", marginBottom: "16px" }}>
                Log in or sign up to see replies, or reply to this post.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                <Link href="/login" style={{
                  background: "#F5A623", color: "#111", fontWeight: 700, fontSize: "13px",
                  padding: "8px 18px", borderRadius: "20px", textDecoration: "none"
                }}>
                  Log In
                </Link>
                <Link href="/register" style={{
                  background: "transparent", color: "#fff", border: "1.5px solid #3f3f46",
                  fontWeight: 700, fontSize: "13px", padding: "8px 18px", borderRadius: "20px",
                  textDecoration: "none"
                }} className="hover:bg-[#262626]">
                  Sign Up
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
              <div 
                className={!user?.avatar ? "avatar-gradient" : ""} 
                style={{ 
                  width: "40px", height: "40px", borderRadius: user?.role === 'ORGANIZATION' ? "8px" : "50%", flexShrink: 0,
                  backgroundSize: "cover", backgroundPosition: "center",
                  backgroundImage: user?.avatar ? `url(${user.avatar})` : undefined
                }} 
              />
              <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                <input 
                  type="text" 
                  placeholder={replyToId ? `Replying to @${replyToUsername}...` : "Write a comment..."}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !commentMutation.isPending && replyContent.trim()) {
                      handlePostReply();
                    }
                  }}
                  style={{ 
                    width: "100%", background: "transparent", border: "1px solid #262626", 
                    outline: "none", color: "#fafafa", fontSize: "15px",
                    padding: "12px 80px 12px 16px", borderRadius: "999px"
                  }}
                />
                <button 
                  onClick={handlePostReply}
                  disabled={!replyContent.trim() || commentMutation.isPending}
                  style={{
                    position: "absolute", right: "6px",
                    padding: "6px 12px", background: replyContent.trim() ? "#fafafa" : "transparent", 
                    color: replyContent.trim() ? "#0a0a0a" : "#71767b",
                    border: replyContent.trim() ? "none" : "1px solid #262626", 
                    borderRadius: "999px", fontWeight: 600, fontSize: "14px",
                    cursor: !replyContent.trim() || commentMutation.isPending ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {commentMutation.isPending ? "..." : "Reply"}
                </button>
              </div>
              {replyToId && (
                <button 
                  onClick={() => { setReplyToId(null); setReplyToUsername(null); setReplyContent(""); }} 
                  style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "8px" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              )}
            </div>
          )}
          
          {/* Comments List */}
          {isAuthenticated && (
            topLevelComments.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", paddingBottom: "16px" }}>
                {topLevelComments.map((comment: any) => (
                  <CommentThread 
                    key={comment.id} 
                    comment={comment} 
                    postId={id}
                    onReply={(parentId, username) => {
                      setReplyToId(parentId);
                      setReplyToUsername(username);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                  />
                ))}
                
                {hasNextPage ? (
                  <div style={{ textAlign: "center", paddingTop: "24px", paddingBottom: "8px" }}>
                    <button 
                      onClick={() => fetchNextPage()} 
                      disabled={isFetchingNextPage}
                      style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontWeight: 600, fontSize: "15px" }} 
                      className="hover:underline"
                    >
                      {isFetchingNextPage ? "Loading..." : "Load more comments"}
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", paddingTop: "32px", paddingBottom: "8px", color: "#71767b", fontSize: "14px" }}>
                    No more comments
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#71767b" }}>
                No comments yet. Be the first to share your thoughts!
              </div>
            )
          )}

        </div>
      </div>

      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          postId={id}
          onShared={(msg) => setToast(msg)}
        />
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
    </>
  );
}
