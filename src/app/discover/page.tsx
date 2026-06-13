"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { discoverService } from "@/services/discover.service";
import { connectionService } from "@/services/connection.service";
import Link from "next/link";

const PeopleSkeleton = () => (
  <div className="animate-pulse" style={{ background: "#171717", borderRadius: "24px", padding: "24px", marginBottom: "24px", border: "1px solid #262626" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
      <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#333", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: "150px", height: "20px", background: "#333", borderRadius: "4px", marginBottom: "6px" }} />
        <div style={{ width: "120px", height: "16px", background: "#333", borderRadius: "4px", marginBottom: "6px" }} />
        <div style={{ width: "100px", height: "14px", background: "#333", borderRadius: "4px" }} />
      </div>
    </div>
    
    <div style={{ width: "90%", height: "16px", background: "#333", borderRadius: "4px", marginBottom: "8px" }} />
    <div style={{ width: "70%", height: "16px", background: "#333", borderRadius: "4px", marginBottom: "16px" }} />

    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
      <div style={{ width: "60px", height: "26px", background: "#333", borderRadius: "12px" }} />
      <div style={{ width: "80px", height: "26px", background: "#333", borderRadius: "12px" }} />
      <div style={{ width: "50px", height: "26px", background: "#333", borderRadius: "12px" }} />
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "20px" }}>
      <div style={{ flex: 1, height: "44px", background: "#333", borderRadius: "999px" }} />
      <div style={{ width: "120px", height: "44px", background: "#333", borderRadius: "999px" }} />
      <div style={{ width: "44px", height: "44px", background: "#333", borderRadius: "50%", flexShrink: 0 }} />
    </div>
  </div>
);

function PeopleCard({ person }: { person: any }) {
  const queryClient = useQueryClient();
  const [skipped, setSkipped] = useState(false);

  const followMutation = useMutation({
    mutationFn: () => person.isFollowing ? connectionService.unfollowUser(person.id) : connectionService.followUser(person.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["suggested-users"] });
      const previousUsers = queryClient.getQueryData(["suggested-users"]);
      
      queryClient.setQueryData(["suggested-users"], (old: any) => {
        if (!old) return old;
        return old.map((p: any) => {
          if (p.id === person.id) {
            return { ...p, isFollowing: !p.isFollowing };
          }
          return p;
        });
      });
      return { previousUsers };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["suggested-users"], context?.previousUsers);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["suggested-users"] });
    },
  });

  if (skipped) return null;

  const fullName = `${person.firstName} ${person.lastName}`;
  const dept = person.branch || "General";
  const yearStr = person.year ? `Year ${person.year}` : "";
  const avatarClass = person.avatar || "avatar-gradient";

  return (
    <div style={{
      background: "#171717",
      borderRadius: "24px",
      padding: "24px",
      marginBottom: "24px",
      border: "1px solid #262626",
    }}>
      {/* Header Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
        <div className={avatarClass} style={{ width: "64px", height: "64px", borderRadius: "50%", flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: "18px", color: "#fafafa", marginBottom: "2px" }}>{fullName}</div>
          <div style={{ fontSize: "15px", color: "#a1a1aa", marginBottom: "2px" }}>{dept} {yearStr ? `• ${yearStr}` : ''}</div>
          <div style={{ fontSize: "14px", color: "#F5A623", fontWeight: 500 }}>{person.mutualConnections || 0} mutual connections</div>
        </div>
      </div>

      {/* Bio */}
      {person.bio && (
        <p style={{ fontSize: "15px", color: "#a1a1aa", lineHeight: 1.5, marginBottom: "16px" }}>
          {person.bio}
        </p>
      )}

      {/* Tags */}
      {person.skills && person.skills.length > 0 && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          {person.skills.map((tag: string) => (
            <span key={tag} style={{
              background: "#1f1f22",
              padding: "6px 14px",
              borderRadius: "12px",
              fontSize: "13px",
              color: "#a1a1aa",
              fontWeight: 500,
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "20px" }}>
        <button
          onClick={() => followMutation.mutate()}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            background: person.isFollowing ? "#262626" : "#eab308",
            color: person.isFollowing ? "#fafafa" : "#171717",
            padding: "12px 16px",
            borderRadius: "999px",
            border: "none",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {!person.isFollowing && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          )}
          {person.isFollowing ? "Connected" : "Connect"}
        </button>

        <Link
          href={`/profile/${person.id}`}
          style={{
            background: "#262626",
            color: "#fafafa",
            padding: "12px 20px",
            borderRadius: "999px",
            border: "none",
            fontSize: "15px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.15s",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          className="hover:bg-[#3f3f46]"
        >
          View Profile
        </Link>

        <button
          onClick={() => setSkipped(true)}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "#262626",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
          className="hover:bg-[#3f3f46]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const { data: suggestedUsers, isLoading, isError } = useQuery({
    queryKey: ['suggested-users', debouncedSearchQuery],
    queryFn: () => discoverService.getSuggestedUsers(debouncedSearchQuery)
  });

  return (
    <>
      <div style={{ padding: "24px 24px 0", marginBottom: "20px" }}>
        {/* Search Bar */}
        <div style={{ position: "relative", marginBottom: "24px" }}>
          <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <input 
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              background: "#171717",
              border: "1px solid #262626",
              borderRadius: "16px",
              padding: "16px 16px 16px 48px",
              color: "#fafafa",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.2s"
            }}
          />
        </div>
      </div>

      <div style={{ padding: "0 24px" }}>
        {isLoading && (
          <>
            <PeopleSkeleton />
            <PeopleSkeleton />
            <PeopleSkeleton />
          </>
        )}
        {isError && <div style={{ color: "#ef4444", textAlign: "center", padding: "40px" }}>Failed to load suggestions</div>}
        {!isLoading && suggestedUsers?.map((p: any) => <PeopleCard key={p.id} person={p} />)}
      </div>
    </>
  );
}
