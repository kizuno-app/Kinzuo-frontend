"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chat.service";
import { profileService } from "@/services/profile.service";
import { discoverService } from "@/services/discover.service";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { useSearchParams } from "next/navigation";
import { useE2EE } from "@/features/chat/hooks/useE2EE";

function formatRelativeTime(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function ChatPeerProfile({ peerId, onClick, conv, isActive, searchQuery, forceShow }: { peerId: string, onClick: () => void, conv?: any, isActive: boolean, searchQuery?: string, forceShow?: boolean }) {
  const { data: profile } = useQuery({
    queryKey: ['profile', peerId],
    queryFn: () => profileService.getProfile(peerId),
    enabled: !!peerId,
  });

  const matchesSearch = forceShow || !searchQuery || (profile && `${profile.firstName} ${profile.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!matchesSearch) return null;

  // Mock online status for visual parity with design, based on peerId to be deterministic
  const isOnline = peerId.charCodeAt(0) % 2 === 0;

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "16px 12px",
        background: isActive ? "#1a1a1a" : "transparent",
        border: "none",
        borderBottom: "1px solid #1a1a1a",
        cursor: "pointer",
        textAlign: "left",
      }}
      className="hover:bg-[#1a1a1a] transition-colors"
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div 
          style={{ 
            width: "56px", 
            height: "56px", 
            borderRadius: "50%", 
            backgroundSize: "cover", 
            backgroundPosition: "center",
            backgroundImage: profile?.avatar ? `url(${profile.avatar})` : "linear-gradient(135deg, #e39d6b, #b95d52)",
          }} 
        />
        {isOnline && (
          <div style={{
            position: "absolute",
            bottom: "0px",
            right: "0px",
            width: "16px",
            height: "16px",
            backgroundColor: "#00e676",
            borderRadius: "50%",
            border: "3px solid #0a0a0a" // Match typical dark background
          }} />
        )}
      </div>
      
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ fontWeight: 600, fontSize: "17px", color: "#fff", letterSpacing: "0.2px" }}>
          {profile ? `${profile.firstName} ${profile.lastName}` : `User ${peerId.slice(0, 6)}`}
        </div>
        <div style={{
          fontSize: "14px",
          color: conv?.unread > 0 ? "#ddd" : "#999",
          fontWeight: conv?.unread > 0 ? 500 : 400,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {conv?.lastMessage || "Start a conversation"}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
        <div style={{ fontSize: "13px", color: "#888" }}>
          {conv?.updatedAt ? formatRelativeTime(conv?.updatedAt) : ""}
        </div>
        {conv?.unread > 0 ? (
          <div style={{
            background: "#fdd835",
            color: "#000",
            fontSize: "12px",
            fontWeight: 700,
            width: "22px",
            height: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%"
          }}>
            {conv.unread}
          </div>
        ) : (
          <div style={{ height: "22px" }} />
        )}
      </div>
    </button>
  );
}

function ActiveChatEmptyProfile({ peerId }: { peerId: string }) {
  const { data: profile } = useQuery({
    queryKey: ['profile', peerId],
    queryFn: () => profileService.getProfile(peerId),
    enabled: !!peerId,
  });

  if (!profile) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginTop: "-40px" }}>
      <div 
        style={{ 
          width: "96px", height: "96px", borderRadius: "50%", 
          backgroundSize: "cover", backgroundPosition: "center",
          backgroundImage: profile.avatar ? `url(${profile.avatar})` : "linear-gradient(135deg, #e39d6b, #b95d52)" 
        }} 
      />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 800, fontSize: "20px", color: "#fff", marginBottom: "4px" }}>
          {profile.firstName} {profile.lastName}
        </div>
        <div style={{ fontSize: "15px", color: "#888", marginBottom: "8px" }}>
          @{profile.username || profile.firstName.toLowerCase()}
        </div>
        <div style={{ fontSize: "14px", color: "#aaa", marginBottom: "20px" }}>
          <span style={{ color: "#fff", fontWeight: 700 }}>{profile.followersCount || 0}</span> Followers · Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently"}
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
  const { data: profile } = useQuery({
    queryKey: ['profile', peerId],
    queryFn: () => profileService.getProfile(peerId),
    enabled: !!peerId,
  });

  const isOnline = peerId.charCodeAt(0) % 2 === 0;

  if (isEmpty) {
    // Empty state header matching Image 1
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingBottom: "12px", borderBottom: "none", marginBottom: "0px", paddingTop: "8px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "12px" }}>
          <div 
            style={{ 
              width: "36px", height: "36px", borderRadius: "50%", 
              backgroundSize: "cover", backgroundPosition: "center",
              backgroundImage: profile?.avatar ? `url(${profile.avatar})` : "linear-gradient(135deg, #e39d6b, #b95d52)" 
            }} 
          />
          <div style={{ fontWeight: 700, fontSize: "16px", color: "#fff" }}>
            {profile ? `${profile.firstName} ${profile.lastName}` : `User ${peerId.slice(0, 6)}`}
          </div>
        </div>
        <button style={{ 
          background: "#1a1a1a", border: "none", color: "#ccc", cursor: "pointer", 
          width: "36px", height: "36px", borderRadius: "50%", display: "flex", 
          alignItems: "center", justifyContent: "center", marginRight: "12px"
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
        </button>
      </div>
    );
  }

  // Active chat state header matching Image 2
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      paddingBottom: "12px", borderBottom: "1px solid #1a1a1a", marginBottom: "0px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#e0e0e0", padding: "4px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <div style={{ position: "relative" }}>
          <div 
            style={{ 
              width: "44px", height: "44px", borderRadius: "50%", 
              backgroundSize: "cover", backgroundPosition: "center",
              backgroundImage: profile?.avatar ? `url(${profile.avatar})` : "linear-gradient(135deg, #e39d6b, #b95d52)" 
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
            {profile ? `${profile.firstName} ${profile.lastName}` : `User ${peerId.slice(0, 6)}`}
          </div>
          {isOnline ? (
            <div style={{ fontSize: "13px", color: "#00e676" }}>Active now</div>
          ) : (
            <div style={{ fontSize: "13px", color: "#666" }}>Offline</div>
        )}
      </div>
    </div>
    <button style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", padding: "8px" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
    </button>
  </div>
);
}

function ChatsContent() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get('userId');

  const [search, setSearch] = useState("");
  const [active, setActive] = useState<string | null>(initialUserId);
  const [messageInput, setMessageInput] = useState("");
  
  const queryClient = useQueryClient();
  const { socket, sendMessage: sendSocketMessage } = useChatStore();
  const { user: currentUser } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    queryKey: ['messages', active],
    queryFn: () => chatService.getMessages(active as string),
    enabled: !!active,
  });

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: any) => {
      if (active === message.senderId || active === message.receiverId) {
        queryClient.setQueryData(['messages', active], (old: any) => {
          if (!old) return [message];
          return [...old, message];
        });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on('new_message', handleReceiveMessage);
    return () => {
      socket.off('new_message', handleReceiveMessage);
    };
  }, [socket, active, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialUserId && initialUserId !== active) {
      setActive(initialUserId);
    }
  }, [initialUserId]);

  const activePeerId = active;

  const handleSendMessage = async (imageUrlParam?: string) => {
    // If imageUrlParam is a React SyntheticEvent, ignore it
    const imageUrl = typeof imageUrlParam === 'string' ? imageUrlParam : undefined;

    if ((!messageInput.trim() && !imageUrl) || !active) return;
    
    const content = messageInput.trim();
    setMessageInput("");
    
    const newMessage = {
      id: Date.now().toString(),
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
      
      const response = await apiClient.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const imageUrl = response.data.data.url;
      await handleSendMessage(imageUrl);
    } catch (err) {
      console.error('Failed to upload image', err);
    }
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 100px)", width: "100%" }}>
      
      {/* LEFT SIDEBAR: Chat List */}
      <div 
        className={`flex-col flex-shrink-0 border-r border-[#1a1a1a] ${active && activePeerId ? 'hidden md:flex' : 'flex'}`}
        style={{ width: "100%", maxWidth: "380px" }}
      >
        <div style={{ padding: "0 12px", paddingTop: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: 0 }}>Chats</h1>
            {isRegistered && (
              <span style={{ fontSize: "12px", background: "rgba(0, 255, 128, 0.1)", color: "#00ff80", padding: "4px 8px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                E2EE Active
              </span>
            )}
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

        <div style={{ borderTop: "1px solid #1a1a1a", flex: 1, overflowY: "auto" }}>
          {loadingConvs && <div style={{ color: "#666", textAlign: "center", padding: "20px" }}>Loading conversations...</div>}
          
          {search.trim().length > 0 && searchingUsers && (
            <div style={{ color: "#666", textAlign: "center", padding: "20px" }}>Searching users...</div>
          )}

          {/* Show global search results if active search */}
          {search.trim().length > 0 ? (
            searchResults.map((user: any) => (
              <ChatPeerProfile 
                key={user.id} 
                peerId={user.id} 
                isActive={active === user.id}
                forceShow={true}
                onClick={() => {
                  setActive(user.id);
                  setSearch(""); // Clear search after selection
                }} 
              />
            ))
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
        className={`flex-col flex-1 ${!active || !activePeerId ? 'hidden md:flex' : 'flex'}`}
        style={{ minWidth: 0 }}
      >
        {active && activePeerId ? (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
            <ActiveChatHeader 
              peerId={activePeerId} 
              onBack={() => setActive(null)} 
              isEmpty={messages.length === 0 && !loadingMessages}
            />

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "16px", paddingLeft: "16px", paddingRight: "16px" }}>
              {loadingMessages && <div style={{ color: "#666", textAlign: "center", marginTop: "20px" }}>Loading messages...</div>}
              
              {messages.length === 0 && !loadingMessages ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  {/* Empty state profile overview */}
                  <ActiveChatEmptyProfile peerId={activePeerId} />
                </div>
              ) : (
                <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {messages.map((msg: any) => {
                    const isMe = msg.senderId === currentUser?.id;
                    return (
                      <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                        <div style={{
                          maxWidth: "75%",
                          padding: "12px 16px",
                          borderRadius: isMe ? "24px 24px 8px 24px" : "24px 24px 24px 8px",
                          background: isMe ? "#d3a436" : "#222222",
                          color: isMe ? "#111" : "#fff",
                          fontSize: "15px",
                          lineHeight: 1.4,
                        }}>
                          {msg.imageUrl && (
                            <div style={{ marginBottom: "8px" }}>
                              <img src={msg.imageUrl} alt="Chat image" style={{ maxWidth: "100%", borderRadius: "12px" }} />
                            </div>
                          )}
                          {msg.content && <div>{msg.content}</div>}
                          <div style={{ 
                            fontSize: "11px", 
                            color: isMe ? "rgba(0,0,0,0.6)" : "#888", 
                            marginTop: "6px", 
                            textAlign: "left",
                            fontWeight: 500
                          }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ display: "flex", gap: "10px", padding: "12px 16px", borderTop: "1px solid #1a1a1a", alignItems: "center" }}>
              <label style={{ cursor: "pointer", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </label>
              <input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
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
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
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
    <Suspense fallback={<div style={{ color: "#666", textAlign: "center", padding: "40px" }}>Loading chats...</div>}>
      <ChatsContent />
    </Suspense>
  );
}
