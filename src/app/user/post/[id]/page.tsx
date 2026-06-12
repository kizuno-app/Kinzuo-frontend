"use client";
import { useQuery } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import AppLayout from "@/components/AppLayout";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";

export default function SinglePostPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuthStore();
  const [replyContent, setReplyContent] = useState("");

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: () => postService.getPost(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div style={{ padding: "40px", textAlign: "center", color: "#a1a1aa" }}>Loading post...</div>
      </AppLayout>
    );
  }

  if (isError || !post) {
    return (
      <AppLayout>
        <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>Failed to load post.</div>
      </AppLayout>
    );
  }

  const authorName = post.author ? `${post.author.firstName} ${post.author.lastName}` : "Unknown User";
  const authorUsername = post.author?.username || authorName.replace(/\s+/g, '').toLowerCase();
  const hasAvatar = !!post.author?.avatar;

  return (
    <AppLayout>
      <div style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "100px" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", position: "sticky", top: 0, background: "rgba(10,10,10,0.85)", backdropFilter: "blur(12px)", zIndex: 10 }}>
          <button 
            onClick={() => router.back()}
            style={{ background: "none", border: "none", color: "#fafafa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", borderRadius: "50%", marginRight: "20px" }}
            className="hover:bg-[#1f1f22] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", margin: 0 }}>Post</h1>
        </div>

        {/* Post Container */}
        <div style={{ padding: "16px" }}>
          
          {/* Author Row */}
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
              <div>
                <Link href={post.userId ? `/profile/${post.userId}` : '#'} style={{ fontWeight: 700, fontSize: "16px", color: "#fafafa", textDecoration: "none", display: "block" }} className="hover:underline">
                  {authorName}
                </Link>
                <div style={{ fontSize: "15px", color: "#71767b", marginTop: "2px" }}>
                  @{authorUsername}
                </div>
              </div>
            </div>
            
            <button style={{ background: "none", border: "none", color: "#71767b", cursor: "pointer", padding: "8px" }} className="hover:bg-[#1f1f22] rounded-full transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          </div>

          {/* Content */}
          <div style={{ fontSize: "20px", color: "#fafafa", lineHeight: 1.4, marginBottom: "16px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {post.content}
          </div>

          {/* Media */}
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

          {/* Metadata */}
          <div style={{ fontSize: "15px", color: "#71767b", marginBottom: "16px", display: "flex", gap: "6px" }}>
            <span>{new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            <span>·</span>
            <span>{new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>·</span>
            <span style={{ fontWeight: 600, color: "#fafafa" }}>{(post.views || Math.floor(Math.random() * 50000)).toLocaleString()} <span style={{ color: "#71767b", fontWeight: 400 }}>Views</span></span>
          </div>

          <div style={{ height: "1px", background: "#262626", margin: "16px 0" }} />

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#71767b", padding: "4px 0" }}>
            <button className="hover:text-blue-400 group" style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "15px" }}>
              <div className="group-hover:bg-blue-400/10 p-2 -m-2 rounded-full transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </div>
              {post.commentsCount || 0}
            </button>
            <button className="hover:text-green-500 group" style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "15px" }}>
              <div className="group-hover:bg-green-500/10 p-2 -m-2 rounded-full transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
              </div>
              {post.retweets || 0}
            </button>
            <button className="hover:text-pink-500 group" style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: post.isLiked ? "#f91880" : "inherit", fontSize: "15px" }}>
              <div className="group-hover:bg-pink-500/10 p-2 -m-2 rounded-full transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill={post.isLiked ? "#f91880" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
              </div>
              {post.likes || 0}
            </button>
            <button className="hover:text-blue-400 group" style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "15px" }}>
              <div className="group-hover:bg-blue-400/10 p-2 -m-2 rounded-full transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              </div>
              {post.bookmarks || 0}
            </button>
            <button className="hover:text-blue-400 group" style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "15px" }}>
              <div className="group-hover:bg-blue-400/10 p-2 -m-2 rounded-full transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
              </div>
            </button>
          </div>

          <div style={{ height: "1px", background: "#262626", margin: "16px 0" }} />

          {/* Reply Input */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", padding: "4px 0" }}>
            <div 
              className={!user?.avatar ? "avatar-gradient" : ""} 
              style={{ 
                width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                backgroundSize: "cover", backgroundPosition: "center",
                backgroundImage: user?.avatar ? `url(${user.avatar})` : undefined
              }} 
            />
            <input 
              type="text" 
              placeholder="Post your reply"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fafafa", fontSize: "16px" }}
            />
            <button 
              disabled={!replyContent.trim()}
              style={{
                padding: "8px 16px", background: "#fafafa", color: "#0a0a0a",
                border: "none", borderRadius: "999px", fontWeight: 700, fontSize: "15px",
                cursor: replyContent.trim() ? "pointer" : "not-allowed",
                opacity: replyContent.trim() ? 1 : 0.5,
              }}
            >
              Reply
            </button>
          </div>
          
          <div style={{ height: "1px", background: "#262626", margin: "16px 0" }} />
          
          {/* Comments List */}
          {post.comments && post.comments.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {post.comments.map((comment: any) => {
                const cAuthorName = comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : "Unknown User";
                const cAuthorUsername = comment.author?.username || cAuthorName.replace(/\s+/g, '').toLowerCase();
                const cHasAvatar = !!comment.author?.avatar;

                return (
                  <div key={comment.id} style={{ display: "flex", gap: "12px", padding: "12px 0", borderBottom: "1px solid #262626" }}>
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
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <Link href={comment.userId ? `/profile/${comment.userId}` : '#'} style={{ fontWeight: 700, fontSize: "15px", color: "#fafafa", textDecoration: "none" }} className="hover:underline">
                          {cAuthorName}
                        </Link>
                        <span style={{ fontSize: "15px", color: "#71767b" }}>@{cAuthorUsername}</span>
                        <span style={{ fontSize: "15px", color: "#71767b" }}>·</span>
                        <span style={{ fontSize: "15px", color: "#71767b" }}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ fontSize: "15px", color: "#fafafa", lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {comment.content}
                      </div>
                      
                      <div style={{ display: "flex", gap: "24px", marginTop: "12px", color: "#71767b" }}>
                        <button style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: 0 }} className="hover:text-blue-400">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        </button>
                        <button style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: 0 }} className="hover:text-pink-500">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#71767b" }}>
              No replies yet. Be the first to reply!
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
