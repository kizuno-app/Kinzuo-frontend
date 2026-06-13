"use client";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";

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
              width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
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
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyToUsername, setReplyToUsername] = useState<string | null>(null);

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: () => postService.getPost(id),
    enabled: !!id,
  });

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

  if (isLoading) {
    return (
      <>
        <div style={{ padding: "40px", textAlign: "center", color: "#a1a1aa" }}>Loading post...</div>
      </>
    );
  }

  if (isError || !post) {
    return (
      <>
        <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>Failed to load post.</div>
      </>
    );
  }

  const authorName = post.author ? `${post.author.firstName} ${post.author.lastName}` : "Unknown User";
  const authorUsername = post.author?.username || authorName.replace(/\s+/g, '').toLowerCase();
  const hasAvatar = !!post.author?.avatar;

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
          
          {/* Post Author Row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link href={post.userId ? `/profile/${post.userId}` : '#'}>
                <div
                  className={!hasAvatar ? "avatar-gradient" : ""}
                  style={{ 
                    width: "48px", height: "48px", borderRadius: "50%", flexShrink: 0,
                    backgroundSize: "cover", backgroundPosition: "center",
                    backgroundImage: hasAvatar ? `url(${post.author.avatar})` : undefined
                  }}
                />
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Link href={post.userId ? `/profile/${post.userId}` : '#'} style={{ fontWeight: 700, fontSize: "16px", color: "#fafafa", textDecoration: "none" }} className="hover:underline">
                  {authorName}
                </Link>
                <div style={{ fontSize: "15px", color: "#71767b" }}>
                  @{authorUsername}
                </div>
                <span style={{ fontSize: "15px", color: "#71767b" }}>·</span>
                <span style={{ fontSize: "15px", color: "#71767b" }}>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <button style={{ background: "none", border: "none", color: "#71767b", cursor: "pointer", padding: "8px" }} className="hover:bg-[#1f1f22] rounded-full transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          </div>

          {/* Post Content */}
          <div style={{ fontSize: "18px", color: "#fafafa", lineHeight: 1.5, marginBottom: "16px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {post.content}
          </div>

          {/* Post Media */}
          {post.media && post.media.length > 0 && (
            <div style={{ marginBottom: "16px", borderRadius: "16px", overflow: "hidden", border: "1px solid #262626" }}>
              <img src={post.media[0]} alt="Post media" style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          )}
          {post.mediaUrl && (!post.media || post.media.length === 0) && (
            <div style={{ marginBottom: "16px", borderRadius: "16px", overflow: "hidden", border: "1px solid #262626" }}>
              <img src={post.mediaUrl} alt="Post attachment" style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          )}

          {/* Post Actions */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#71767b", padding: "4px 0", maxWidth: "400px" }}>
            <button className="hover:text-blue-400 group" style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "15px" }}>
              <div className="group-hover:bg-blue-400/10 p-2 -m-2 rounded-full transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </div>
              {post.commentsCount || 0}
            </button>
            <button className="hover:text-pink-500 group" style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: post.isLiked ? "#f91880" : "inherit", fontSize: "15px" }}>
              <div className="group-hover:bg-pink-500/10 p-2 -m-2 rounded-full transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill={post.isLiked ? "#f91880" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
              </div>
              {post.likes || 0}
            </button>
            <button className="hover:text-green-500 group" style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "15px" }}>
              <div className="group-hover:bg-green-500/10 p-2 -m-2 rounded-full transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
              </div>
              {post.retweets || 0}
            </button>
            <button className="hover:text-blue-400 group" style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "15px" }}>
              <div className="group-hover:bg-blue-400/10 p-2 -m-2 rounded-full transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
              </div>
            </button>
          </div>

          <div style={{ height: "2px", background: "#333333", margin: "20px 0", borderRadius: "1px" }} />

          {/* Write Comment Box */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
            <div 
              className={!user?.avatar ? "avatar-gradient" : ""} 
              style={{ 
                width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
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
          
          {/* Comments List */}
          {topLevelComments.length > 0 ? (
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
          )}

        </div>
      </div>
    </>
  );
}
