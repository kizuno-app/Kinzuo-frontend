"use client";
import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chat.service";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";

export default function ChatsPage() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  
  const queryClient = useQueryClient();
  const { socket, onlineUsers, sendMessage: sendSocketMessage } = useChatStore();
  const { user: currentUser } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversations = [], isLoading: loadingConvs } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatService.getConversations,
  });

  // Fetch messages for active conversation
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', active],
    queryFn: () => chatService.getMessages(active as string),
    enabled: !!active,
  });

  // Listen for real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: any) => {
      // Update messages cache if the message is for the active conversation
      if (active === message.senderId || active === message.receiverId) {
        queryClient.setQueryData(['messages', active], (old: any) => {
          if (!old) return [message];
          return [...old, message];
        });
      }
      
      // Update conversations list to show last message
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on('new_message', handleReceiveMessage); // server emits 'new_message'
    return () => {
      socket.off('new_message', handleReceiveMessage);
    };
  }, [socket, active, queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filtered = conversations.filter((c: any) => {
    const peerLabel = c.peerName || c.participants?.[0] || '';
    return peerLabel.toLowerCase().includes(search.toLowerCase());
  });

  const activeConv = conversations.find((c: any) => c.id === active || c.participants?.[0] === active);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !active) return;
    
    const content = messageInput.trim();
    setMessageInput("");
    
    // Optimistic UI update
    const newMessage = {
      id: Date.now().toString(),
      senderId: currentUser?.id,
      receiverId: active,
      content,
      createdAt: new Date().toISOString()
    };
    
    queryClient.setQueryData(['messages', active], (old: any) => {
      if (!old) return [newMessage];
      return [...old, newMessage];
    });

    try {
      // Send via socket for real-time
      sendSocketMessage(active, content);
      
      // Also persist via REST API (if backend requires it, or just use socket)
      // await chatService.sendMessage(active, content);
      
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <AppLayout>
      {active && activeConv ? (
        /* Chat Thread View */
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 100px)" }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            paddingBottom: "16px", borderBottom: "1px solid #2a2a2a", marginBottom: "16px",
          }}>
            <button onClick={() => setActive(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9a9a9a", padding: "4px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            </button>
            <div className="avatar-gradient" style={{ width: "40px", height: "40px", borderRadius: "50%", position: "relative" }}>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#f0f0f0" }}>
                {activeConv.participants?.[0] || 'Chat'}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>Chat</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "16px" }}>
            {loadingMessages && <div style={{ color: "#666", textAlign: "center" }}>Loading messages...</div>}
            
            {messages.map((msg: any) => {
              const isMe = msg.senderId === currentUser?.id;
              return (
                <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "72%",
                    padding: "10px 14px",
                    borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: isMe ? "#F5A623" : "#252525",
                    color: isMe ? "#000" : "#e0e0e0",
                    fontSize: "14px",
                    lineHeight: 1.5,
                  }}>
                    <div>{msg.content}</div>
                    <div style={{ fontSize: "10px", color: isMe ? "rgba(0,0,0,0.5)" : "#555", marginTop: "4px", textAlign: "right" }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: "10px", paddingTop: "12px", borderTop: "1px solid #2a2a2a" }}>
            <input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              style={{
                flex: 1, background: "#222", border: "1px solid #333",
                borderRadius: "12px", padding: "12px 16px", color: "#e0e0e0",
                fontSize: "14px", outline: "none", fontFamily: "inherit",
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              style={{
                width: "44px", height: "44px", borderRadius: "50%",
                background: "#F5A623", border: "none", cursor: messageInput.trim() ? "pointer" : "not-allowed",
                opacity: messageInput.trim() ? 1 : 0.5,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
        </div>
      ) : (
        /* Conversation List */
        <>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#f0f0f0", marginBottom: "18px" }}>Chats</h1>

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#222", border: "1px solid #2e2e2e", borderRadius: "12px",
            padding: "10px 14px", marginBottom: "16px",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              style={{ background: "none", border: "none", outline: "none", color: "#e0e0e0", fontSize: "14px", flex: 1, fontFamily: "inherit" }}
            />
          </div>

          {/* Conversation list */}
          <div>
            {loadingConvs && <div style={{ color: "#666", textAlign: "center", padding: "20px" }}>Loading conversations...</div>}
            {filtered.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => setActive(conv.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 0",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid #242424",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div className="avatar-gradient" style={{ width: "48px", height: "48px", borderRadius: "50%" }} />
                {conv.updatedAt && (
                  <span style={{
                    position: "absolute", bottom: "1px", right: "1px",
                    width: "12px", height: "12px", background: "#22c55e",
                    borderRadius: "50%", border: "2px solid #171717",
                    display: "none", // only show when we have real online status
                  }} />
                )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                    <span style={{ fontWeight: 700, fontSize: "15px", color: "#f0f0f0" }}>
                      Chat {conv.id?.slice(0, 6)}
                    </span>
                    <span style={{ fontSize: "12px", color: "#555", flexShrink: 0 }}>
                      {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <div style={{
                    fontSize: "13px",
                    color: conv.unread > 0 ? "#c0c0c0" : "#666",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {conv.lastMessage || "No messages yet"}
                  </div>
                </div>
                {conv.unread > 0 && (
                  <div style={{
                    minWidth: "22px", height: "22px", borderRadius: "50%",
                    background: "#F5A623", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "11px", fontWeight: 700,
                    color: "#000", flexShrink: 0,
                  }}>
                    {conv.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
}
