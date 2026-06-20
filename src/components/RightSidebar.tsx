"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { discoverService } from "@/services/discover.service";
import { connectionService } from "@/services/connection.service";
import { useChatStore } from "@/store/chat.store";
import Link from "next/link";

const SkeletonRow = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px" }} className="animate-pulse">
    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#262626", flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div style={{ height: "14px", width: "100px", background: "#262626", borderRadius: "4px", marginBottom: "6px" }} />
      <div style={{ height: "12px", width: "140px", background: "#262626", borderRadius: "4px", marginBottom: "4px" }} />
      <div style={{ height: "10px", width: "80px", background: "#262626", borderRadius: "4px" }} />
    </div>
  </div>
);

function SuggestionRow({ item, onlineUsers }: { item: any; onlineUsers: string[] }) {
  const queryClient = useQueryClient();
  const person = item.data;
  const fullName = `${person.firstName} ${person.lastName}`;
  const dept = person.branch || "";
  const yearStr = person.year ? `Year ${person.year}` : "";
  const formattedDept = dept ? `${dept}${yearStr ? ` • ${yearStr}` : ""}` : yearStr;
  const interests = person.skills?.slice(0, 3).join(", ") || "";
  const isOnline = onlineUsers.includes(person.id);

  const followMutation = useMutation({
    mutationFn: () => person.isFollowing 
      ? connectionService.unfollowUser(person.id) 
      : connectionService.followUser(person.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["suggested-users-sidebar"] });
      const previousUsers = queryClient.getQueryData(["suggested-users-sidebar"]);
      
      queryClient.setQueryData(["suggested-users-sidebar"], (old: any) => {
        if (!old) return old;
        return old.map((u: any) => {
          if (u.type === 'user' && u.data.id === person.id) {
            return { ...u, data: { ...u.data, isFollowing: !u.data.isFollowing } };
          }
          return u;
        });
      });
      return { previousUsers };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["suggested-users-sidebar"], context?.previousUsers);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["suggested-users-sidebar"] });
      queryClient.invalidateQueries({ queryKey: ["suggested-users"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px",
        borderRadius: "12px",
        transition: "background 0.2s",
      }}
      className="hover:bg-[#171717] group"
    >
      <Link
        href={`/profile/${person.id}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          textDecoration: "none",
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          className={!person.avatar ? "avatar-gradient" : ""}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            flexShrink: 0,
            position: "relative",
            backgroundImage: person.avatar ? `url(${person.avatar})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {isOnline && (
            <span
              style={{
                position: "absolute",
                bottom: "0",
                right: "0",
                width: "10px",
                height: "10px",
                background: "#22c55e",
                borderRadius: "50%",
                border: "2px solid #0a0a0a",
              }}
            />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#fafafa", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fullName}
          </div>
          {formattedDept && (
            <div style={{ fontSize: "12px", color: "#a1a1aa", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {formattedDept}
            </div>
          )}
          {interests && (
            <div style={{ fontSize: "12px", color: "#71717a", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {interests}
            </div>
          )}
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          followMutation.mutate();
        }}
        style={{
          marginLeft: "8px",
          padding: "6px 14px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 700,
          cursor: "pointer",
          border: "none",
          background: person.isFollowing ? "#262626" : "#fafafa",
          color: person.isFollowing ? "#fafafa" : "#0a0a0a",
          transition: "background 0.2s, color 0.2s",
          flexShrink: 0,
        }}
        className={person.isFollowing ? "hover:bg-[#3f3f46]" : "hover:bg-[#e4e4e7]"}
      >
        {person.isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
}

export default function RightSidebar() {
  const { onlineUsers } = useChatStore();

  const { data: suggestedUsers = [], isLoading, isError } = useQuery({
    queryKey: ["suggested-users-sidebar"],
    queryFn: () => discoverService.getSuggestedUsers(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Filter out organization accounts and limit to 3 users for a clean sidebar
  const regularSuggestions = (suggestedUsers || [])
    .filter((item: any) => item.type === "user" && !item.data.isOrgAccount)
    .slice(0, 3);

  return (
    <aside
      style={{
        width: "320px",
        height: "100vh",
        position: "sticky",
        top: 0,
        padding: "78px 0 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
      }}
    >
      <section style={{ display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa", marginBottom: "16px" }}>
          Suggested for you
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {isLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : isError ? (
            <div style={{ fontSize: "13px", color: "#ef4444", padding: "10px" }}>
              Failed to load suggestions
            </div>
          ) : regularSuggestions.length === 0 ? (
            <div style={{ fontSize: "13px", color: "#71717a", padding: "10px" }}>
              No suggestions at the moment
            </div>
          ) : (
            regularSuggestions.map((item: any) => (
              <SuggestionRow key={item.data.id} item={item} onlineUsers={onlineUsers} />
            ))
          )}
        </div>
      </section>

      <footer style={{ padding: "10px 10px 0", borderTop: "1px solid #262626", paddingTop: "16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px", marginBottom: "8px" }}>
          <Link href="/terms" style={{ fontSize: "12px", color: "#71717a", textDecoration: "none" }} className="hover:underline">Terms of Service</Link>
          <Link href="/privacy" style={{ fontSize: "12px", color: "#71717a", textDecoration: "none" }} className="hover:underline">Privacy Policy</Link>
          <Link href="/cookies" style={{ fontSize: "12px", color: "#71717a", textDecoration: "none" }} className="hover:underline">Cookie Policy</Link>
          <Link href="/about" style={{ fontSize: "12px", color: "#71717a", textDecoration: "none" }} className="hover:underline">More</Link>
        </div>
        <div style={{ fontSize: "12px", color: "#71717a" }}>
          © {new Date().getFullYear()} Kizuno. All rights reserved.
        </div>
      </footer>
    </aside>
  );
}

