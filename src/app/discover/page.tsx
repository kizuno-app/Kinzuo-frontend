"use client";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { discoverService } from "@/services/discover.service";
import { connectionService } from "@/services/connection.service";

const mockCircles = [
  {
    id: 1,
    name: "Gym Buddies",
    emoji: "🏋",
    description: "Connect with fitness enthusiasts on campus",
    members: 234,
    active: 45,
    joined: false,
  },
  {
    id: 2,
    name: "Coding Club",
    emoji: "💻",
    description: "Weekly hackathons and coding challenges",
    members: 189,
    active: 67,
    joined: false,
  },
  {
    id: 3,
    name: "Design Community",
    emoji: "🎨",
    description: "Share designs and get feedback",
    members: 156,
    active: 32,
    joined: false,
  },
  {
    id: 4,
    name: "Entrepreneurship Hub",
    emoji: "🚀",
    description: "Startups, pitches and business ideas",
    members: 203,
    active: 28,
    joined: false,
  },
];

function CircleCard({ circle }: { circle: typeof mockCircles[0] }) {
  const [joined, setJoined] = useState(circle.joined);
  return (
    <div style={{
      background: "#171717",
      borderRadius: "16px",
      padding: "20px",
      marginBottom: "16px",
      border: "1px solid #262626",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <div style={{
          width: "52px", height: "52px", borderRadius: "12px",
          background: "#1f1f22", display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0, fontSize: "22px",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa", marginBottom: "4px" }}>
            {circle.emoji} {circle.name}
          </h3>
          <p style={{ fontSize: "13px", color: "#a1a1aa", marginBottom: "10px" }}>{circle.description}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
            <span style={{ fontSize: "12px", color: "#71717a" }}>{circle.members} members</span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#22c55e" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              {circle.active} active now
            </span>
          </div>
          <button
            onClick={() => setJoined(!joined)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              background: joined ? "transparent" : "#262626",
              border: joined ? "1px solid #3f3f46" : "1px solid transparent",
              color: joined ? "#fafafa" : "#fafafa",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {joined ? "✓ Joined" : "Join Circle"}
          </button>
        </div>
      </div>
    </div>
  );
}

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

        <button
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
          }}
          className="hover:bg-[#3f3f46]"
        >
          View Profile
        </button>

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
  const [tab, setTab] = useState<"people" | "circles">("people");

  const { data: suggestedUsers, isLoading, isError } = useQuery({
    queryKey: ['suggested-users'],
    queryFn: discoverService.getSuggestedUsers
  });

  return (
    <AppLayout>
      <div style={{ padding: "24px 24px 0", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fafafa", marginBottom: "20px" }}>Discover</h1>

        {/* Tab switcher */}
        <div style={{
          display: "flex",
          background: "#171717",
          borderRadius: "16px",
          padding: "6px",
          marginBottom: "24px",
        }}>
          {(["people", "circles"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                background: tab === t ? "#262626" : "transparent",
                border: "none",
                color: tab === t ? "#fafafa" : "#a1a1aa",
                fontSize: "15px",
                fontWeight: tab === t ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.15s",
                textTransform: "capitalize",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 24px" }}>
        {tab === "people" && (
          <>
            {isLoading && <div style={{ color: "#a1a1aa", textAlign: "center", padding: "40px" }}>Finding suggestions...</div>}
            {isError && <div style={{ color: "#ef4444", textAlign: "center", padding: "40px" }}>Failed to load suggestions</div>}
            {suggestedUsers?.map((p: any) => <PeopleCard key={p.id} person={p} />)}
          </>
        )}
        
        {tab === "circles" && mockCircles.map((c) => <CircleCard key={c.id} circle={c} />)}
      </div>
    </AppLayout>
  );
}
