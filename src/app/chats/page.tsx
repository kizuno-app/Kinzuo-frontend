"use client";
import { useState, useEffect, useRef, Suspense, useLayoutEffect } from "react";
import EmojiPicker, { Theme, EmojiStyle } from "emoji-picker-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chat.service";
import { profileService } from "@/services/profile.service";
import { discoverService } from "@/services/discover.service";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient } from "@/services/api-client";
import { useE2EE } from "@/features/chat/hooks/useE2EE";

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Memory cache to store resolved user profiles synchronously and avoid visual flickers
const profileMemoryCache: Record<string, any> = {};

function ChatPeerProfile({ peerId, onClick, conv, isActive, searchQuery, forceShow }: { peerId: string, onClick: () => void, conv?: any, isActive: boolean, searchQuery?: string, forceShow?: boolean }) {
  const cachedProfile = profileMemoryCache[peerId];
  const { data: profile } = useQuery({
    queryKey: ['profile', peerId],
    queryFn: async () => {
      const data = await profileService.getProfile(peerId);
      if (data) {
        profileMemoryCache[peerId] = data;
      }
      return data;
    },
    enabled: !!peerId,
    initialData: cachedProfile,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const matchesSearch = forceShow || !searchQuery || (profile && `${profile.firstName} ${profile.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!matchesSearch || profile?.isOrgAccount) return null;

  const { onlineUsers } = useChatStore();
  const isOnline = onlineUsers.includes(peerId);

  const activeProfile = profile || cachedProfile;

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px",
        background: isActive ? "#262626" : "#171717",
        border: "1px solid",
        borderColor: isActive ? "#333" : "transparent",
        borderRadius: "16px",
        marginBottom: "10px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s ease",
      }}
      className="hover:bg-[#262626]"
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundImage: activeProfile?.avatar ? `url(${activeProfile.avatar})` : "linear-gradient(135deg, #e39d6b, #b95d52)",
          }}
        />
        {conv?.unread > 0 ? (
          <div style={{
            position: "absolute",
            bottom: "-2px",
            right: "-2px",
            background: "#ef4444",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 800,
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: "2.5px solid #171717"
          }}>
            {conv.unread}
          </div>
        ) : isOnline && (
          <div style={{
            position: "absolute",
            bottom: "-2px",
            right: "-2px",
            width: "16px",
            height: "16px",
            backgroundColor: "#00e676",
            borderRadius: "50%",
            border: "2.5px solid #171717"
          }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: "16px", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {activeProfile ? `${activeProfile.firstName} ${activeProfile.lastName}` : "Loading..."}
          </span>
          <span style={{ fontSize: "13px", color: "#71717a", flexShrink: 0, marginLeft: "8px" }}>
            {conv?.updatedAt ? formatRelativeTime(conv.updatedAt) : ""}
          </span>
        </div>
        <div style={{
          fontSize: "14px",
          color: conv?.unread > 0 ? "#ddd" : "#a1a1aa",
          fontWeight: conv?.unread > 0 ? 500 : 400,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}>
          {conv?.lastMessage || "Start a conversation"}
        </div>
      </div>
    </button>
  );
}

function ActiveChatEmptyProfile({ peerId }: { peerId: string }) {
  const cachedProfile = profileMemoryCache[peerId];
  const { data: profile } = useQuery({
    queryKey: ['profile', peerId],
    queryFn: async () => {
      const data = await profileService.getProfile(peerId);
      if (data) {
        profileMemoryCache[peerId] = data;
      }
      return data;
    },
    enabled: !!peerId,
    initialData: cachedProfile,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const activeProfile = profile || cachedProfile;
  if (!activeProfile) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginTop: "-40px" }}>
      <div
        style={{
          width: "96px", height: "96px", borderRadius: "50%",
          backgroundSize: "cover", backgroundPosition: "center",
          backgroundImage: activeProfile.avatar ? `url(${activeProfile.avatar})` : "linear-gradient(135deg, #e39d6b, #b95d52)"
        }}
      />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 800, fontSize: "20px", color: "#fff", marginBottom: "4px" }}>
          {activeProfile.firstName} {activeProfile.lastName}
        </div>
        <div style={{ fontSize: "15px", color: "#888", marginBottom: "8px" }}>
          @{activeProfile.username || activeProfile.firstName.toLowerCase()}
        </div>
        <div style={{ fontSize: "14px", color: "#aaa", marginBottom: "20px" }}>
          <span style={{ color: "#fff", fontWeight: 700 }}>{activeProfile.followersCount || 0}</span> Followers · Joined {activeProfile.createdAt ? new Date(activeProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently"}
        </div>
        <button style={{
          background: "#fff", color: "#000", fontWeight: 700, fontSize: "14px",
          border: "none", padding: "10px 20px", borderRadius: "24px", cursor: "pointer"
        }}>
          View Profile
        </button>
      </div>
    </div>
  );
}

function ActiveChatHeader({ peerId, onBack, isEmpty }: { peerId: string, onBack: () => void, isEmpty: boolean }) {
  const cachedProfile = profileMemoryCache[peerId];
  const { data: profile } = useQuery({
    queryKey: ['profile', peerId],
    queryFn: async () => {
      const data = await profileService.getProfile(peerId);
      if (data) {
        profileMemoryCache[peerId] = data;
      }
      return data;
    },
    enabled: !!peerId,
    initialData: cachedProfile,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const { onlineUsers } = useChatStore();
  const isOnline = onlineUsers.includes(peerId);

  const activeProfile = profile || cachedProfile;

  if (isEmpty) {
    // Empty state header matching Image 1
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px", borderBottom: "none", marginBottom: "0px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "12px" }}>
          <div
            style={{
              width: "36px", height: "36px", borderRadius: "50%",
              backgroundSize: "cover", backgroundPosition: "center",
              backgroundImage: activeProfile?.avatar ? `url(${activeProfile.avatar})` : "linear-gradient(135deg, #e39d6b, #b95d52)"
            }}
          />
          <div style={{ fontWeight: 700, fontSize: "16px", color: "#fff" }}>
            {activeProfile ? `${activeProfile.firstName} ${activeProfile.lastName}` : "Loading..."}
          </div>
        </div>
        <button style={{
          background: "#1a1a1a", border: "none", color: "#ccc", cursor: "pointer",
          width: "36px", height: "36px", borderRadius: "50%", display: "flex",
          alignItems: "center", justifyContent: "center", marginRight: "12px"
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 20px", borderBottom: "1px solid #1a1a1a", marginBottom: "0px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={onBack} className="md:hidden" style={{ background: "none", border: "none", cursor: "pointer", color: "#e0e0e0", padding: "4px", marginRight: "-8px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: "44px", height: "44px", borderRadius: "50%",
              backgroundSize: "cover", backgroundPosition: "center",
              backgroundImage: activeProfile?.avatar ? `url(${activeProfile.avatar})` : "linear-gradient(135deg, #e39d6b, #b95d52)"
            }}
          />
          {isOnline && (
            <div style={{
              position: "absolute", bottom: "0px", right: "-2px",
              width: "14px", height: "14px", backgroundColor: "#00e676",
              borderRadius: "50%", border: "2.5px solid #0a0a0a"
            }} />
          )}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "17px", color: "#fff", letterSpacing: "0.2px" }}>
            {activeProfile ? `${activeProfile.firstName} ${activeProfile.lastName}` : "Loading..."}
          </div>
          {isOnline ? (
            <div style={{ fontSize: "13px", color: "#00e676" }}>Active now</div>
          ) : (
            <div style={{ fontSize: "13px", color: "#666" }}>Offline</div>
          )}
        </div>
      </div>
      <button style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", padding: "8px" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
      </button>
    </div>
  );
}

function ChatsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get('userId');

  const [search, setSearch] = useState("");
  const [active, setActive] = useState<string | null>(initialUserId);
  const [visiblePeerId, setVisiblePeerId] = useState<string | null>(initialUserId);

  useEffect(() => {
    if (active) {
      setVisiblePeerId(active);
    } else {
      const timer = setTimeout(() => setVisiblePeerId(null), 300);
      return () => clearTimeout(timer);
    }
  }, [active]);

  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const queryClient = useQueryClient();
  const { socket, sendMessage: sendSocketMessage } = useChatStore();
  const { user: currentUser } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser?.role === 'ORGANIZATION') {
      router.replace('/');
    }
  }, [currentUser, router]);

  if (currentUser?.role === 'ORGANIZATION') {
    return null;
  }

  // Initialize Device E2EE Keys
  const { deviceId, isRegistered } = useE2EE(currentUser?.id as string);

  const { data: conversations = [], isLoading: loadingConvs } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatService.getConversations,
  });

  const { data: searchResults = [], isLoading: searchingUsers } = useQuery({
    queryKey: ['users_search', search],
    queryFn: () => discoverService.getSuggestedUsers(search),
    enabled: search.trim().length > 0,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', visiblePeerId],
    queryFn: () => chatService.getMessages(visiblePeerId as string),
    enabled: !!visiblePeerId,
  });

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: any) => {
      const normalizedMessage = { ...message, id: message.id || message.messageId };
      if (active === normalizedMessage.senderId || active === normalizedMessage.receiverId) {
        queryClient.setQueryData(['messages', active], (old: any) => {
          if (!old) return [normalizedMessage];
          if (old.some((m: any) => m.id === normalizedMessage.id)) return old;
          return [...old, normalizedMessage];
        });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const handleMessagesRead = (data: any) => {
      if (active === data.readerId) {
        queryClient.setQueryData(['messages', active], (old: any) => {
          if (!old) return old;
          return old.map((m: any) => m.senderId === currentUser?.id ? { ...m, read: true } : m);
        });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on('new_message', handleReceiveMessage);
    socket.on('messages_read', handleMessagesRead);
    return () => {
      socket.off('new_message', handleReceiveMessage);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, active, queryClient, currentUser?.id]);

  // Mark unread messages as read when viewing the chat
  useEffect(() => {
    if (visiblePeerId && messages.length > 0) {
      const hasUnread = messages.some((m: any) => m.senderId === visiblePeerId && !m.read);
      if (hasUnread) {
        // Find the conversation ID from the conversations list (or let backend resolve it by peerId)
        const conv = conversations.find((c: any) => c.participants.includes(visiblePeerId));
        if (conv) {
          chatService.markAsRead(conv.id).then(() => {
            queryClient.setQueryData(['messages', visiblePeerId], (old: any) => {
              if (!old) return old;
              return old.map((m: any) => m.senderId === visiblePeerId ? { ...m, read: true } : m);
            });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
          }).catch(err => console.error("Failed to mark as read:", err));
        }
      }
    }
  }, [visiblePeerId, messages, conversations, queryClient]);

  const prevPeerIdRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const isNewChat = prevPeerIdRef.current !== visiblePeerId;
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: isNewChat ? "auto" : "smooth", block: "end" });
    }
    if (messages.length > 0) {
      prevPeerIdRef.current = visiblePeerId;
    }
  }, [messages, visiblePeerId]);

  useEffect(() => {
    if (initialUserId && initialUserId !== active) {
      setActive(initialUserId);
    }
  }, [initialUserId]);

  const activePeerId = visiblePeerId;

  const handleSendMessage = async (imageUrlParam?: string) => {
    // If imageUrlParam is a React SyntheticEvent, ignore it
    const imageUrl = typeof imageUrlParam === 'string' ? imageUrlParam : undefined;

    if ((!messageInput.trim() && !imageUrl) || !active) return;

    const content = messageInput.trim();
    setMessageInput("");

    const optimisticId = Date.now().toString() + Math.random().toString(36).substring(7);

    const newMessage = {
      id: optimisticId,
      senderId: currentUser?.id,
      receiverId: active,
      content,
      imageUrl,
      createdAt: new Date().toISOString()
    };

    queryClient.setQueryData(['messages', active], (old: any) => {
      if (!old) return [newMessage];
      return [...old, newMessage];
    });

    try {
      await chatService.sendMessage(active, content, imageUrl);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !active) return;

    try {
      // Optioanally add a local loading state for image here
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post('/chat/upload', formData);

      const imageUrl = response.data.data.url;
      await handleSendMessage(imageUrl);
    } catch (err) {
      console.error('Failed to upload image', err);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflowX: "hidden", position: "relative" }}>

      {/* LEFT SIDEBAR: Chat List */}
      <div
        className="flex-col flex-shrink-0 border-r border-[#1a1a1a] flex w-full md:w-[450px]"
      >
        <div style={{ padding: "0 12px", paddingTop: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: 0 }}>Chats</h1>
            {/* E2EE badge removed as per request */}
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#222", borderRadius: "24px",
            padding: "12px 16px", marginBottom: "16px",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              style={{ background: "none", border: "none", outline: "none", color: "#e0e0e0", fontSize: "15px", flex: 1, fontFamily: "inherit" }}
            />
          </div>
        </div>

        <div style={{ borderTop: "1px solid #1a1a1a", flex: 1, overflowY: "auto", padding: "16px 12px" }}>
          {loadingConvs && (
            <div className="animate-pulse" style={{ display: "flex", flexDirection: "column" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "16px 12px", borderBottom: "1px solid #1a1a1a" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#222", flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ height: "16px", width: "120px", background: "#222", borderRadius: "4px" }} />
                    <div style={{ height: "14px", width: "180px", background: "#222", borderRadius: "4px" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {search.trim().length > 0 && searchingUsers && (
            <div style={{ color: "#666", textAlign: "center", padding: "20px" }}>Searching users...</div>
          )}

          {/* Show global search results if active search */}
          {search.trim().length > 0 ? (
            searchResults.map((item: any) => {
              const u = item.data;
              if (!u || u.isOrgAccount) return null;
              // Pre-populate memory cache to avoid flicker on click!
              profileMemoryCache[u.id] = u;
              return (
                <ChatPeerProfile
                  key={u.id}
                  peerId={u.id}
                  isActive={active === u.id}
                  forceShow={true}
                  onClick={() => {
                    setActive(u.id);
                    setSearch(""); // Clear search after selection
                  }}
                />
              );
            })
          ) : (
            /* Show existing conversations if no search */
            conversations.map((conv: any) => {
              const peerId = conv.participants?.[0];
              if (!peerId) return null;
              return (
                <ChatPeerProfile
                  key={conv.id}
                  peerId={peerId}
                  conv={conv}
                  isActive={active === peerId}
                  onClick={() => setActive(peerId)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: Active Chat */}
      <div
        className={`flex-col flex-1 fixed inset-0 z-[150] bg-[#0a0a0a] transition-transform duration-300 ease-in-out md:static md:z-auto md:bg-transparent md:transform-none md:transition-none ${active ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ minWidth: 0, display: "flex" }}
      >
        {activePeerId ? (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
            <ActiveChatHeader
              peerId={activePeerId}
              onBack={() => setActive(null)}
              isEmpty={messages.length === 0 && !loadingMessages}
            />

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "16px", paddingLeft: "16px", paddingRight: "16px" }}>
              {loadingMessages && (
                <div className="animate-pulse" style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[1, 2, 3].map((i) => {
                    const isMe = i % 2 !== 0;
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                        <div style={{
                          width: "200px", height: "60px",
                          borderRadius: isMe ? "24px 24px 8px 24px" : "24px 24px 24px 8px",
                          background: isMe ? "#4a3c1f" : "#222222",
                        }} />
                      </div>
                    );
                  })}
                </div>
              )}

              {messages.length === 0 && !loadingMessages ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  {/* Empty state profile overview */}
                  <ActiveChatEmptyProfile peerId={activePeerId} />
                </div>
              ) : (
                <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {messages.map((msg: any) => {
                    const isMe = msg.senderId === currentUser?.id;
                    const JUMBO_EMOJIS = ["😂", "😹", "❤️", "🖕", "🔞"];
                    const isJumbo = msg.content && JUMBO_EMOJIS.includes(msg.content.trim()) && !msg.imageUrl;

                    return (
                      <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: "4px" }}>
                        <div style={isJumbo ? {
                          fontSize: "56px",
                          lineHeight: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isMe ? "flex-end" : "flex-start",
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
                        } : {
                          maxWidth: "75%",
                          padding: "12px 18px",
                          borderRadius: isMe ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                          background: isMe ? "linear-gradient(135deg, #FFB800, #F5A623)" : "linear-gradient(135deg, #2a2a2a, #1e1e1e)",
                          border: isMe ? "none" : "1px solid #333",
                          boxShadow: isMe ? "0 4px 15px rgba(245, 166, 35, 0.25)" : "0 4px 15px rgba(0, 0, 0, 0.2)",
                          color: isMe ? "#111" : "#fafafa",
                          fontSize: "15px",
                          lineHeight: 1.5,
                          letterSpacing: "0.2px",
                        }}>
                          {msg.imageUrl && (
                            <div style={{ marginBottom: "8px" }}>
                              <img src={msg.imageUrl} alt="Chat image" style={{ maxWidth: "100%", borderRadius: "12px" }} />
                            </div>
                          )}
                          {msg.content && <div>{msg.content}</div>}
                          {isJumbo ? (
                            <div style={{
                              fontSize: "11px",
                              color: "#888",
                              marginTop: "4px",
                              fontWeight: 600,
                              textAlign: isMe ? "right" : "left",
                            }}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isMe && <span style={{ marginLeft: "4px", color: msg.read ? "#34B7F1" : "#888" }}>{msg.read ? "✓✓" : "✓"}</span>}
                            </div>
                          ) : (
                            <div style={{
                              fontSize: "11px",
                              color: isMe ? "rgba(0,0,0,0.55)" : "#888",
                              marginTop: "6px",
                              textAlign: "right",
                              fontWeight: 600
                            }}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isMe && <span style={{ marginLeft: "4px", color: msg.read ? "#34B7F1" : "rgba(0,0,0,0.55)" }}>{msg.read ? "✓✓" : "✓"}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div style={{ display: "flex", gap: "10px", padding: "12px 16px", borderTop: "1px solid #1a1a1a", alignItems: "center", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", color: "#666", marginRight: "4px" }} ref={emojiPickerRef}>
                {/* Emoji / Smiley */}
                <svg onClick={() => setShowEmojiPicker(!showEmojiPicker)} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ cursor: "pointer" }} className="hover:text-[#a1a1aa] transition-colors"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>

                {showEmojiPicker && (
                  <div style={{ position: "absolute", bottom: "100%", left: "16px", marginBottom: "16px", zIndex: 200, boxShadow: "0 10px 25px rgba(0,0,0,0.5)", borderRadius: "12px", overflow: "hidden" }}>
                    <EmojiPicker
                      theme={Theme.DARK}
                      emojiStyle={EmojiStyle.FACEBOOK}
                      onEmojiClick={(emojiData) => {
                        setMessageInput((prev) => prev + emojiData.emoji);
                      }}
                    />
                  </div>
                )}
                {/* Paperclip */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ cursor: "pointer" }} className="hover:text-[#a1a1aa] transition-colors"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                {/* Image Upload */}
                <label style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="hover:text-[#a1a1aa] transition-colors">
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                </label>
              </div>
              <input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder=" encrypted message"
                style={{
                  flex: 1, background: "#222", border: "1px solid #333",
                  borderRadius: "24px", padding: "12px 16px", color: "#e0e0e0",
                  fontSize: "14px", outline: "none", fontFamily: "inherit",
                }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!messageInput.trim()}
                style={{
                  width: "44px", height: "44px", borderRadius: "50%",
                  background: "#d3a436", border: "none", cursor: messageInput.trim() ? "pointer" : "not-allowed",
                  opacity: messageInput.trim() ? 1 : 0.5,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-4">
            <div style={{ color: "#444" }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div style={{ fontSize: "18px", color: "#888", fontWeight: 600 }}>Select a message</div>
            <div style={{ fontSize: "14px", color: "#555" }}>Choose from your existing conversations, start a new one, or just keep swimming.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", height: "calc(100vh - 100px)", width: "100%" }}>
        <div className="flex-col flex-shrink-0 border-r border-[#1a1a1a] flex" style={{ width: "100%", maxWidth: "550px" }}>
          <div style={{ padding: "0 12px", paddingTop: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: 0 }}>Chats</h1>
            </div>
            <div style={{ height: "42px", background: "#222", borderRadius: "24px", marginBottom: "16px" }} />
          </div>
          <div className="animate-pulse" style={{ borderTop: "1px solid #1a1a1a", flex: 1, overflowY: "auto" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "16px 12px", borderBottom: "1px solid #1a1a1a" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#222", flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ height: "16px", width: "120px", background: "#222", borderRadius: "4px" }} />
                  <div style={{ height: "14px", width: "180px", background: "#222", borderRadius: "4px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-col flex-1 hidden md:flex" style={{ minWidth: 0, alignItems: "center", justifyContent: "center" }}>
          <div className="animate-pulse" style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#222" }} />
        </div>
      </div>
    }>
      <ChatsContent />
    </Suspense>
  );
}
