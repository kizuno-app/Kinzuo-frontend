"use client";
import { useEffect, useState, useMemo } from "react";
import { useNotificationStore } from "@/store/notification.store";
import { apiClient } from "@/services/api-client";
import { format, formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();
  const { setUnreadCount, fetchUnreadCount } = useNotificationStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("View all");

  useEffect(() => {
    fetchNotifications();
    markAllAsRead();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get("/notifications?limit=50");
      setNotifications(response.data.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch("/notifications/read-all");
      setUnreadCount(0); // clear local count
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleNotificationClick = (n: any) => {
    if (n.type === 'FOLLOW_USER') {
      router.push(`/profile/${n.actorId}`);
    } else if (n.type === 'LIKE_POST' || n.type === 'COMMENT_POST' || n.type === 'REPLY_COMMENT') {
      if (n.postId) {
        router.push(`/user/post/${n.postId}`);
      }
    } else if (n.type === 'MESSAGE_SENT') {
      router.push(`/chats/${n.actorId}`);
    }
  };

  const tabs = useMemo(() => {
    return [
      { name: "View all", count: notifications.length },
      { name: "Comments", count: notifications.filter(n => ['COMMENT_POST', 'REPLY_COMMENT'].includes(n.type)).length },
      { name: "Followers", count: notifications.filter(n => n.type === 'FOLLOW_USER').length },
      { name: "Likes", count: notifications.filter(n => n.type === 'LIKE_POST').length },
    ];
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "Comments") return notifications.filter(n => ['COMMENT_POST', 'REPLY_COMMENT'].includes(n.type));
    if (activeTab === "Followers") return notifications.filter(n => n.type === 'FOLLOW_USER');
    if (activeTab === "Likes") return notifications.filter(n => n.type === 'LIKE_POST');
    return notifications;
  }, [notifications, activeTab]);

  if (loading) {
    return <div style={{ padding: "24px", color: "#a1a1aa" }}>Loading notifications...</div>;
  }

  return (
    <div style={{ padding: "24px", minHeight: "100%", background: "#0a0a0a" }}>
      <div style={{
        background: "#0a0a0a",
        width: "100%",
        fontFamily: "'Inter', sans-serif"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fafafa", margin: 0, letterSpacing: "-0.5px" }}>
            Your notifications
          </h1>
          <button 
            onClick={markAllAsRead}
            style={{ 
              display: "flex", alignItems: "center", gap: "6px", 
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
        <div style={{ display: "flex", gap: "16px", marginBottom: "32px", borderBottom: "1px solid #262626", paddingBottom: "16px", flexWrap: "wrap" }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "transparent", border: "none", cursor: "pointer",
                  padding: "6px 4px", fontSize: "14px", fontWeight: 600,
                  color: isActive ? "#fafafa" : "#a1a1aa",
                  borderBottom: isActive ? "2px solid #fafafa" : "2px solid transparent",
                  marginBottom: "-17px",
                  transition: "color 0.2s"
                }}
              >
                {tab.name}
                <span style={{
                  background: isActive ? "#262626" : "#171717",
                  color: isActive ? "#fafafa" : "#a1a1aa",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 700
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filteredNotifications.length === 0 ? (
            <div style={{ color: "#a1a1aa", textAlign: "center", padding: "40px 0" }}>No notifications here.</div>
          ) : (
            filteredNotifications.map((n) => {
              const isUnread = !n.isRead;
              
              let actionText = "";
              if (n.type === 'FOLLOW_USER') actionText = "followed you";
              else if (n.type === 'COMMENT_POST') actionText = "commented on your post";
              else if (n.type === 'REPLY_COMMENT') actionText = "replied to your comment";
              else if (n.type === 'LIKE_POST') actionText = "liked your post";
              else if (n.type === 'MESSAGE_SENT') actionText = "sent you a message";

              // Get day and time format
              const dateObj = new Date(n.createdAt);
              const dayTime = format(dateObj, "eeee h:mma"); // e.g. Thursday 4:20pm
              const timeAgoStr = formatDistanceToNow(dateObj, { addSuffix: true }); // e.g. 2 hours ago

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    display: "flex",
                    gap: "16px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: isUnread ? "#171717" : "transparent",
                    border: isUnread ? "1px solid #262626" : "1px solid transparent",
                    transition: "background 0.2s",
                    position: "relative",
                    cursor: "pointer"
                  }}
                  onMouseOver={(e) => {
                    if (!isUnread) e.currentTarget.style.background = "#171717";
                  }}
                  onMouseOut={(e) => {
                    if (!isUnread) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* Avatar */}
                  <div style={{ position: "relative", width: "48px", height: "48px", flexShrink: 0 }}>
                    {n.actor?.avatar ? (
                      <img
                        src={n.actor.avatar}
                        alt="avatar"
                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", background: "#262626" }}
                      />
                    ) : (
                      <div
                        className="avatar-gradient"
                        style={{ width: "100%", height: "100%", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fafafa", fontSize: "20px", fontWeight: "bold" }}
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
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#d4d4d8", fontSize: "15px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 700, color: "#fafafa" }}>@{n.actor?.username || n.actorId.substring(0,6)}</span> {actionText}
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
    </div>
  );
}
