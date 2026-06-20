"use client";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notification.store";
import { apiClient } from "@/services/api-client";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import PostCard from "./PostCard";
import { formatCompactTimeAgo } from "@/utils/date";

export default function NotificationsPanel({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const { setUnreadCount, fetchUnreadCount } = useNotificationStore();
  const { data: notifications = [], isLoading: loading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await apiClient.get("/user-alerts?limit=50");
      return response.data.data || [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: true,
  });

  const [activeTab, setActiveTab] = useState("View all");

  useEffect(() => {
    markAllAsRead();
  }, []);

  const markAllAsRead = async () => {
    try {
      await apiClient.patch("/user-alerts/read-all");
      setUnreadCount(0); // clear local count
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleNotificationClick = (n: any) => {
    if (n.type === 'FOLLOW_USER') {
      router.push(`/profile/${n.actorId}`);
    } else if (n.type === 'LIKE_POST' || n.type === 'COMMENT_POST' || n.type === 'REPLY_COMMENT' || n.type === 'REPOST_POST' || n.type === 'QUOTE_POST') {
      if (n.postId) {
        router.push(`/user/post/${n.postId}`);
      }
    } else if (n.type === 'MESSAGE_SENT') {
      router.push(`/chats/${n.actorId}`);
    }
    if (onClose) onClose(); // close drawer when item clicked
  };

  const tabs = useMemo(() => {
    return [
      { name: "View all", count: notifications.length },
      { name: "Mentions", count: notifications.filter((n: any) => ['REPOST_POST', 'QUOTE_POST', 'LIKE_POST', 'COMMENT_POST', 'REPLY_COMMENT', 'MENTION'].includes(n.type)).length },
      { name: "Followers", count: notifications.filter((n: any) => n.type === 'FOLLOW_USER').length },
      { name: "Invites", count: notifications.filter((n: any) => n.type === 'INVITE').length },
    ];
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "Mentions") {
      return notifications.filter((n: any) => 
        ['REPOST_POST', 'QUOTE_POST', 'LIKE_POST', 'COMMENT_POST', 'REPLY_COMMENT', 'MENTION'].includes(n.type)
      );
    }
    if (activeTab === "Followers") return notifications.filter((n: any) => n.type === 'FOLLOW_USER');
    if (activeTab === "Invites") return notifications.filter((n: any) => n.type === 'INVITE');
    return notifications;
  }, [notifications, activeTab]);

  if (loading) {
    return (
      <div style={{ padding: "24px", minHeight: "100%", background: "#0a0a0a", width: "100%", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ height: "32px", width: "240px", background: "#262626", borderRadius: "8px" }} />
          <div style={{ height: "24px", width: "120px", background: "#262626", borderRadius: "6px" }} />
        </div>
        <div style={{ display: "inline-flex", gap: "8px", marginBottom: "32px", padding: "4px", border: "1px solid #262626", borderRadius: "12px" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: "36px", width: "80px", background: "#262626", borderRadius: "8px" }} />
          ))}
        </div>
        <div className="animate-pulse" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: "flex", gap: "16px", padding: "16px", borderRadius: "12px", background: "#171717", border: "1px solid transparent" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#333", flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center" }}>
                <div style={{ height: "16px", width: "60%", background: "#333", borderRadius: "4px" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ height: "12px", width: "100px", background: "#333", borderRadius: "4px" }} />
                  <div style={{ height: "12px", width: "80px", background: "#333", borderRadius: "4px" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", background: "#0a0a0a", fontFamily: "'Inter', sans-serif" }}>
      {/* Sticky Header Container */}
      <div style={{
        position: "sticky",
        top: 0,
        background: "rgba(10, 10, 10, 0.85)",
        backdropFilter: "blur(12px)",
        zIndex: 10,
        padding: "24px 24px 16px 24px",
        borderBottom: "1px solid #262626"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fafafa", margin: 0, letterSpacing: "-0.5px", display: "flex", alignItems: "center", gap: "12px" }}>
            {onClose && (
              <button 
                onClick={onClose} 
                style={{ background: "transparent", border: "none", color: "#fafafa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", borderRadius: "50%" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
            Notifications
          </h1>
          <button 
            onClick={markAllAsRead}
            className="hidden md:flex items-center gap-[6px]"
            style={{ 
              background: "none", border: "none", cursor: "pointer", 
              color: "#a1a1aa", fontSize: "14px", fontWeight: 600, padding: 0,
              transition: "color 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "#fafafa"}
            onMouseOut={(e) => e.currentTarget.style.color = "#a1a1aa"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L7 17l-5-5"></path>
              <path d="M22 10l-7.5 7.5L13 16"></path>
            </svg>
            Mark all as read
          </button>
        </div>

        {/* Tabs */}
        <div 
          className="hidden md:inline-flex"
          style={{ 
            gap: "4px", 
            padding: "4px",
            border: "1px solid #262626", 
            borderRadius: "12px",
            background: "rgba(10, 10, 10, 0.5)",
            flexWrap: "wrap"
          }}
        >
          {tabs.map(tab => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: isActive ? "#262626" : "transparent", 
                  borderStyle: "none", 
                  cursor: "pointer",
                  padding: "8px 16px", 
                  borderRadius: "10px",
                  fontSize: "14px", fontWeight: 600,
                  color: isActive ? "#fafafa" : "#a1a1aa",
                  transition: "all 0.2s"
                }}
              >
                {tab.name}
                <span style={{
                  background: isActive ? "#404040" : "#171717",
                  color: isActive ? "#fafafa" : "#a1a1aa",
                  padding: "2px 6px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "16px 24px 24px 24px" }}>
          {filteredNotifications.length === 0 ? (
            <div style={{ color: "#a1a1aa", textAlign: "center", padding: "40px 0" }}>No notifications here.</div>
          ) : (
            filteredNotifications.map((n: any) => {
              const isUnread = !n.isRead;
              
              if (n.type === 'QUOTE_POST' && n.post) {
                return (
                  <div key={n.id} style={{ position: "relative" }}>
                    <PostCard post={n.post} hideActions={true} />
                    {isUnread && (
                      <div style={{ 
                        width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", 
                        position: "absolute", right: "16px", top: "24px", zIndex: 5
                      }} />
                    )}
                  </div>
                );
              }

              let actionText = "";
              if (n.type === 'FOLLOW_USER') actionText = "followed you";
              else if (n.type === 'COMMENT_POST') actionText = "commented on your post";
              else if (n.type === 'REPLY_COMMENT') actionText = "replied to your comment";
              else if (n.type === 'LIKE_POST') actionText = "liked your post";
              else if (n.type === 'MESSAGE_SENT') actionText = "sent you a message";
              else if (n.type === 'REPOST_POST') actionText = "reposted your post";
              else if (n.type === 'QUOTE_POST') actionText = "quoted your post";
              else if (n.type === 'SYSTEM_WARNING') actionText = "issued a moderation warning for community guidelines violation";

              // Get day and time format
              const dateObj = new Date(n.createdAt);
              const dayTime = format(dateObj, "eeee h:mma"); // e.g. Thursday 4:20pm
              const timeAgoStr = formatCompactTimeAgo(dateObj);

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    display: "flex",
                    gap: "16px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "#171717",
                    border: isUnread ? "1px solid #262626" : "1px solid transparent",
                    transition: "background 0.2s",
                    position: "relative",
                    cursor: "pointer"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#262626";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "#171717";
                  }}
                >
                  {/* Avatar */}
                  <div style={{ position: "relative", width: "48px", height: "48px", flexShrink: 0 }}>
                    {n.actorId === 'system' ? (
                      <div
                        style={{ width: "100%", height: "100%", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ef4444", color: "#fafafa" }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      </div>
                    ) : n.actor?.avatar ? (
                      <img
                        src={n.actor.avatar}
                        alt="avatar"
                        style={{ width: "100%", height: "100%", borderRadius: n.actor?.isOrgAccount ? "8px" : "50%", objectFit: "cover", background: "#262626" }}
                      />
                    ) : (
                      <div
                        className="avatar-gradient"
                        style={{ width: "100%", height: "100%", borderRadius: n.actor?.isOrgAccount ? "8px" : "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fafafa", fontSize: "20px", fontWeight: "bold" }}
                      >
                        {((n.actor?.username || n.actorId) as string).charAt(0).toUpperCase()}
                      </div>
                    )}
                    {n.type === 'LIKE_POST' && (
                      <div style={{
                        position: "absolute", bottom: -2, right: -2, 
                        background: "#ef4444", borderRadius: "50%", padding: "4px",
                        border: "2px solid #0a0a0a", display: "flex"
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </div>
                    )}
                    {n.type === 'REPOST_POST' && (
                      <div style={{
                        position: "absolute", bottom: -2, right: -2, 
                        background: "#22c55e", borderRadius: "50%", padding: "4px",
                        border: "2px solid #0a0a0a", display: "flex"
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 1l4 4-4 4"></path>
                          <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                          <path d="M7 23l-4-4 4-4"></path>
                          <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#d4d4d8", fontSize: "15px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 700, color: "#fafafa" }}>
                        {n.actorId === 'system' ? 'System Moderator' : `@${n.actor?.username || n.actorId.substring(0,6)}`}
                      </span> {actionText}
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#a1a1aa", fontSize: "13px" }}>
                      <span>{dayTime}</span>
                      <span>{timeAgoStr}</span>
                    </div>

                    {/* Sub-box for comments */}
                    {n.commentText && (
                      <div style={{ 
                        marginTop: "12px", 
                        background: "#262626", 
                        padding: "12px 16px", 
                        borderRadius: "8px",
                        color: "#e4e4e7",
                        fontSize: "14px",
                        lineHeight: "1.5"
                      }}>
                        {n.commentText}
                      </div>
                    )}
                  </div>

                  {/* Unread Dot */}
                  {isUnread && (
                    <div style={{ 
                      width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", 
                      position: "absolute", right: "16px", top: "24px" 
                    }} />
                  )}
                </div>
              );
            })
          )}
        </div>
    </div>
  );
}
