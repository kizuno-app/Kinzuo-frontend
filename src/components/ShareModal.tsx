"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chat.service";
import { discoverService } from "@/services/discover.service";
import { profileService } from "@/services/profile.service";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onShared?: (message: string) => void;
}

export default function ShareModal({ isOpen, onClose, postId, onShared }: ShareModalProps) {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading: loadingConvs } = useQuery({
    queryKey: ["conversations"],
    queryFn: chatService.getConversations,
    enabled: isOpen,
  });

  const { data: searchResults = [], isLoading: searchingUsers } = useQuery({
    queryKey: ["users_share_search", search],
    queryFn: () => discoverService.getSuggestedUsers(search),
    enabled: isOpen && search.trim().length > 0,
  });

  const shareMutation = useMutation({
    onMutate: async () => {
      // Optimistically update counts
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const previousFeed = queryClient.getQueryData(["feed"]);
      const previousPost = queryClient.getQueryData(["post", postId]);

      queryClient.setQueryData(["feed"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: any) => {
              if (p.id === postId) {
                return { ...p, isShared: true, shares: (p.shares || 0) + (p.isShared ? 0 : 1) };
              }
              return p;
            })
          }))
        };
      });

      queryClient.setQueryData(["post", postId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isShared: true,
          shares: (old.shares || 0) + (old.isShared ? 0 : 1)
        };
      });

      return { previousFeed, previousPost };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    }
  });

  if (!isOpen) return null;

  const handleShareToUser = async (peerId: string, peerName: string) => {
    try {
      const postLink = `${window.location.origin}/user/post/${postId}`;
      const messageContent = `Check out this post: ${postLink}`;
      
      // Send message in chat
      await chatService.sendMessage(peerId, messageContent);
      
      // Track share on server
      await apiClientPostShare(postId);

      if (onShared) {
        onShared(`Post shared to ${peerName}!`);
      }
      onClose();
    } catch (error) {
      console.error("Failed to share post via chat:", error);
      alert("Failed to send post via chat");
    }
  };

  const apiClientPostShare = async (id: string) => {
    try {
      const { apiClient } = await import("@/services/api-client");
      await apiClient.post(`/posts/${id}/share`);
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
    }}>
      <div style={{
        background: "#171717", width: "100%", maxWidth: "440px",
        borderRadius: "16px", border: "1px solid #262626", overflow: "hidden",
        display: "flex", flexDirection: "column", maxHeight: "80vh"
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #262626", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa", margin: 0 }}>Send via Chat</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", display: "flex", padding: "4px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Search Input */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #262626" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#222", borderRadius: "24px",
            padding: "8px 12px",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people..."
              style={{ background: "none", border: "none", outline: "none", color: "#e0e0e0", fontSize: "14px", flex: 1, fontFamily: "inherit" }}
            />
          </div>
        </div>

        {/* Chat List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {search.trim().length > 0 ? (
            /* Search Results */
            searchingUsers ? (
              <div style={{ color: "#71767b", textAlign: "center", padding: "20px", fontSize: "14px" }}>Searching...</div>
            ) : searchResults.length === 0 ? (
              <div style={{ color: "#71767b", textAlign: "center", padding: "20px", fontSize: "14px" }}>No users found</div>
            ) : (
              searchResults.map((item: any) => {
                const u = item.data;
                if (!u || u.isOrgAccount) return null;
                const displayName = `${u.firstName} ${u.lastName}`;
                return (
                  <UserRow 
                    key={u.id}
                    userId={u.id}
                    displayName={displayName}
                    username={u.username}
                    avatar={u.avatar}
                    onSelect={() => handleShareToUser(u.id, displayName)}
                  />
                );
              })
            )
          ) : (
            /* Recent Conversations */
            loadingConvs ? (
              <div style={{ color: "#71767b", textAlign: "center", padding: "20px", fontSize: "14px" }}>Loading active chats...</div>
            ) : conversations.length === 0 ? (
              <div style={{ color: "#71767b", textAlign: "center", padding: "20px", fontSize: "14px" }}>No recent chats. Search above to find contacts.</div>
            ) : (
              conversations.map((conv: any) => {
                const peerId = conv.participants?.[0];
                if (!peerId) return null;
                return (
                  <ConversationRow 
                    key={conv.id}
                    peerId={peerId}
                    onSelect={(name) => handleShareToUser(peerId, name)}
                  />
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* UserRow sub-component */
function UserRow({ userId, displayName, username, avatar, onSelect }: { userId: string; displayName: string; username?: string; avatar?: string; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: "12px",
        padding: "10px", background: "transparent", border: "none",
        borderRadius: "12px", cursor: "pointer", textAlign: "left",
        transition: "background 0.2s"
      }}
      className="hover:bg-[#262626]"
    >
      <div
        className={!avatar ? "avatar-gradient" : ""}
        style={{
          width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
          backgroundSize: "cover", backgroundPosition: "center",
          backgroundImage: avatar ? `url(${avatar})` : undefined
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "14px", color: "#fafafa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayName}
        </div>
        <div style={{ fontSize: "13px", color: "#71767b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          @{username || displayName.replace(/\s+/g, "").toLowerCase()}
        </div>
      </div>
      <div style={{
        background: "#F5A623", color: "#111", padding: "6px 12px",
        borderRadius: "16px", fontSize: "12px", fontWeight: 700
      }}>
        Send
      </div>
    </button>
  );
}

/* ConversationRow sub-component that queries user profile */
function ConversationRow({ peerId, onSelect }: { peerId: string; onSelect: (name: string) => void }) {
  const { data: profile } = useQuery({
    queryKey: ["profile", peerId],
    queryFn: () => profileService.getProfile(peerId),
    enabled: !!peerId,
  });

  if (!profile || profile.isOrgAccount) return null;
  const displayName = `${profile.firstName} ${profile.lastName}`;

  return (
    <UserRow 
      userId={peerId}
      displayName={displayName}
      username={profile.username}
      avatar={profile.avatar}
      onSelect={() => onSelect(displayName)}
    />
  );
}
