"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { discoverService } from "@/services/discover.service";
import { connectionService } from "@/services/connection.service";
import Link from "next/link";
import OrgShowcase from "@/components/OrgShowcase";

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
        return old.map((item: any) => {
          if (item.type === 'user' && item.data.id === person.id) {
            return { ...item, data: { ...item.data, isFollowing: !item.data.isFollowing } };
          }
          return item;
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
  const dept = person.branch || "";
  const yearStr = person.year ? `Year ${person.year}` : "";
  const subtitle = [dept, yearStr].filter(Boolean).join(" • ");
  const avatarClass = !person.avatar ? "avatar-gradient" : "";

  return (
    <div style={{
      background: "#171717",
      borderRadius: "24px",
      padding: "24px",
      marginBottom: "24px",
      border: "1px solid #262626",
      position: "relative",
    }}>
      {/* Skip/Dismiss Button in Top Right */}
      <button
        onClick={() => setSkipped(true)}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: "rgba(38, 38, 38, 0.4)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
          zIndex: 10,
        }}
        className="hover:bg-[#3f3f46] hover:scale-105"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Header Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
        <div 
          className={avatarClass} 
          style={{ 
            width: "80px", 
            height: "80px", 
            borderRadius: person.isOrgAccount ? "16px" : "50%", 
            flexShrink: 0,
            backgroundImage: person.avatar ? `url(${person.avatar})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }} 
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "18px", color: "#fafafa", marginBottom: "2px", display: "flex", alignItems: "center", gap: "4px", paddingRight: "28px" }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fullName}</span>
            {person.verified && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1d9bf0" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <path d="M22.5 12.5L20.25 15L20.75 18.25L17.5 19L16 22L12.5 20.5L9 22L7.5 19L4.25 18.25L4.75 15L2.5 12.5L4.75 10L4.25 6.75L7.5 6L9 3L12.5 4.5L16 3L17.5 6L20.75 6.75L20.25 10L22.5 12.5ZM10.5 16.5L17.5 9.5L16 8L10.5 13.5L8 11L6.5 12.5L10.5 16.5Z" fill="#1d9bf0"/>
              </svg>
            )}
          </div>
          {subtitle && (
            <div style={{ fontSize: "15px", color: "#a1a1aa", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle}</div>
          )}
          <div style={{ fontSize: "14px", color: "#cca43b", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{person.mutualConnections || 0} mutual connections</div>
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
            background: person.isFollowing ? "#262626" : "#4f46e5",
            color: "#ffffff",
            padding: "8px 16px",
            borderRadius: "999px",
            border: "none",
            fontSize: "14px",
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
            flex: 1,
            background: "#262626",
            color: "#fafafa",
            padding: "8px 16px",
            borderRadius: "999px",
            border: "none",
            fontSize: "14px",
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
    queryFn: () => discoverService.getSuggestedUsers(debouncedSearchQuery),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return (
    <>
      <div style={{ 
        padding: "24px 24px 20px", 
        position: "sticky", 
        top: 0, 
        zIndex: 50, 
        background: "rgba(10, 10, 10, 0.8)", 
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #262626",
        marginBottom: "24px"
      }}>
        {/* Search Bar */}
        <div style={{ position: "relative" }}>
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

      {!searchQuery && <OrgShowcase />}

      <div style={{ padding: "0 24px" }}>
        {isLoading && (
          <>
            <PeopleSkeleton />
            <PeopleSkeleton />
            <PeopleSkeleton />
          </>
        )}
        {isError && <div style={{ color: "#ef4444", textAlign: "center", padding: "40px" }}>Failed to load suggestions</div>}
        {!isLoading && suggestedUsers?.map((item: any) => {
          if (item.type === 'user') {
            return <PeopleCard key={`user-${item.data.id}`} person={item.data} />;
          }
          return null;
        })}
      </div>
    </>
  );
}
