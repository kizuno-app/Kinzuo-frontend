"use client";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import { useAuthStore } from "@/store/auth.store";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"posts" | "about">("posts");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    branch: "",
    year: "",
  });
  
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile', currentUser?.id],
    queryFn: () => profileService.getProfile(currentUser?.id as string),
    enabled: !!currentUser?.id,
  });

  const { data: userPosts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['posts', 'user', currentUser?.id],
    queryFn: () => profileService.getUserPosts(currentUser?.id as string),
    enabled: !!currentUser?.id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => profileService.updateProfile(currentUser?.id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', currentUser?.id] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to update profile. Please ensure first/last name are at least 2 characters.");
    }
  });

  const handleEditClick = () => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        bio: profile.bio || "",
        branch: profile.branch || "",
        year: profile.year?.toString() || "",
      });
    }
    setIsEditing(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only send fields that are valid to avoid Zod validation errors
    const payload: any = {};
    if (editForm.firstName.trim().length >= 2) payload.firstName = editForm.firstName.trim();
    if (editForm.lastName.trim().length >= 2) payload.lastName = editForm.lastName.trim();
    if (editForm.bio.trim()) payload.bio = editForm.bio.trim();
    if (editForm.branch.trim()) payload.branch = editForm.branch.trim();
    
    const parsedYear = parseInt(editForm.year);
    if (!isNaN(parsedYear) && parsedYear >= 1 && parsedYear <= 5) {
      payload.year = parsedYear;
    }

    updateMutation.mutate(payload);
  };

  // Fallback data if profile fields are empty
  const interests = profile?.skills?.length ? profile.skills : ["#AI", "#Machine Learning", "#Gym"];
  const currentlyItems = profile?.currently ? profile.currently : [
    { emoji: "🚀", text: "Open to project collaborations", color: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.25)" },
  ];

  if (loadingProfile) {
    return (
      <AppLayout>
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>Loading profile...</div>
      </AppLayout>
    );
  }

  const user = {
    id: profile?.userId || currentUser?.id,
    firstName: profile?.firstName || currentUser?.firstName || "",
    lastName: profile?.lastName || currentUser?.lastName || "",
    email: currentUser?.email || "",
    avatar: profile?.avatar,
  };

  return (
    <AppLayout>
      {/* Edit Profile Modal */}
      {isEditing && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex",
          alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div style={{
            background: "#171717", borderRadius: "16px", padding: "24px",
            width: "100%", maxWidth: "500px", border: "1px solid #2a2a2a",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f0f0f0" }}>Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#a1a1aa", marginBottom: "6px" }}>First Name</label>
                  <input
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    style={{ width: "100%", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "10px 12px", color: "#f0f0f0", fontSize: "14px", outline: "none" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#a1a1aa", marginBottom: "6px" }}>Last Name</label>
                  <input
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    style={{ width: "100%", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "10px 12px", color: "#f0f0f0", fontSize: "14px", outline: "none" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#a1a1aa", marginBottom: "6px" }}>Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  rows={3}
                  style={{ width: "100%", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "10px 12px", color: "#f0f0f0", fontSize: "14px", outline: "none", resize: "none" }}
                />
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#a1a1aa", marginBottom: "6px" }}>Major / Branch</label>
                  <input
                    value={editForm.branch}
                    onChange={(e) => setEditForm({...editForm, branch: e.target.value})}
                    style={{ width: "100%", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "10px 12px", color: "#f0f0f0", fontSize: "14px", outline: "none" }}
                  />
                </div>
                <div style={{ width: "100px" }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#a1a1aa", marginBottom: "6px" }}>Year</label>
                  <input
                    type="number"
                    value={editForm.year}
                    onChange={(e) => setEditForm({...editForm, year: e.target.value})}
                    style={{ width: "100%", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "10px 12px", color: "#f0f0f0", fontSize: "14px", outline: "none" }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                style={{
                  marginTop: "8px", width: "100%", padding: "12px", borderRadius: "8px", background: "#F5A623",
                  color: "#171717", border: "none", fontWeight: 600, fontSize: "14px", cursor: updateMutation.isPending ? "not-allowed" : "pointer", opacity: updateMutation.isPending ? 0.7 : 1
                }}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Banner */}
      <div
        style={{
          height: "140px",
          borderRadius: "16px 16px 0 0",
          background: "linear-gradient(135deg, #f5a623 0%, #e05a4e 50%, #c4513b 100%)",
          position: "relative",
          marginBottom: "56px",
        }}
      >
        {/* Avatar */}
        <div
          className={user?.avatar || "avatar-gradient"}
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            border: "4px solid #171717",
            position: "absolute",
            bottom: "-45px",
            left: "24px",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      {/* Name + Edit */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#f0f0f0", marginBottom: "2px" }}>{user?.firstName} {user?.lastName}</h1>
          <p style={{ fontSize: "13px", color: "#777" }}>@{currentUser?.email?.split('@')[0] || 'user'}</p>
        </div>
        <button
          onClick={handleEditClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: "10px",
            background: "#222",
            border: "1px solid #333",
            color: "#e0e0e0",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          Edit Profile
        </button>
      </div>

      {/* Bio */}
      <p style={{ fontSize: "15px", color: "#d0d0d0", lineHeight: 1.6, marginBottom: "16px" }}>
        {profile?.bio || "No bio yet."}
      </p>

      {/* Info row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "14px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#999" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          {profile?.branch || "General"} • {profile?.year ? `Year ${profile?.year}` : "N/A"}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#999" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
          Campus Main
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#777", marginBottom: "20px" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
        Joined {new Date(profile?.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "28px", marginBottom: "24px" }}>
        {[
          { label: "Connections", value: profile?._count?.followers || profile?.connectionsCount || "0" },
          { label: "Circles", value: "0" },
          { label: "Posts", value: userPosts.length || "0" },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#f0f0f0" }}>{stat.value}</div>
            <div style={{ fontSize: "12px", color: "#777" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Interests */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f0f0f0", marginBottom: "10px" }}>Interests</h3>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {interests.map((tag: string) => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>
      </div>

      {/* Currently */}
      <div style={{ marginBottom: "28px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f0f0f0", marginBottom: "10px" }}>Currently</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {currentlyItems.map((item: any, i: number) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                borderRadius: "12px",
                background: item.color,
                border: `1px solid ${item.border}`,
                fontSize: "14px",
                color: "#e0e0e0",
                fontWeight: 500,
              }}
            >
              {item.emoji} {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid #2a2a2a",
        marginBottom: "18px",
        gap: "0",
      }}>
        {(["posts", "about"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "12px 24px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #F5A623" : "2px solid transparent",
              color: activeTab === tab ? "#F5A623" : "#777",
              fontSize: "14px",
              fontWeight: activeTab === tab ? 700 : 400,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts tab */}
      {activeTab === "posts" && (
        <div>
          {loadingPosts && <div style={{ color: "#666", textAlign: "center", padding: "20px" }}>Loading posts...</div>}
          {!loadingPosts && userPosts.length === 0 && (
            <div style={{ color: "#666", textAlign: "center", padding: "20px" }}>No posts yet.</div>
          )}
          {userPosts.map((post: any) => (
            <div
              key={post.id}
              style={{
                background: "#222",
                borderRadius: "14px",
                padding: "18px",
                marginBottom: "12px",
                border: "1px solid #2a2a2a",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className={post.author?.avatar || "avatar-gradient"} style={{ width: "36px", height: "36px", borderRadius: "50%" }} />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: "14px", color: "#f0f0f0" }}>{post.author?.firstName} {post.author?.lastName}</span>
                    <span style={{ fontSize: "12px", color: "#555", marginLeft: "8px" }}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "14px", color: "#d0d0d0", lineHeight: 1.6, marginBottom: "12px" }}>{post.content}</p>
              
              {/* Media/Image rendering if any */}
              {post.mediaUrl && (
                <div style={{ marginBottom: "12px", borderRadius: "8px", overflow: "hidden" }}>
                  <img src={post.mediaUrl} alt="Post attachment" style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
              )}

              {/* Tags mapping assuming post.tags is array of strings */}
              {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                  {post.tags.map((t: string) => (
                    <span key={t} className="tag-pill">{t}</span>
                  ))}
                </div>
              )}
              
              <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#777" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                  {post.likes || 0}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                  {post.commentsCount || 0}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  {post.shares || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* About tab */}
      {activeTab === "about" && (
        <div style={{ background: "#222", borderRadius: "14px", padding: "20px", border: "1px solid #2a2a2a" }}>
          <div style={{ marginBottom: "18px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#9a9a9a", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Education</h4>
            <p style={{ fontSize: "15px", color: "#e0e0e0" }}>State University — {profile?.branch || "General"}</p>
            <p style={{ fontSize: "13px", color: "#777" }}>Year {profile?.year || 1}</p>
          </div>
          <div style={{ marginBottom: "18px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#9a9a9a", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Skills</h4>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {interests.map((s: string) => (
                <span key={s} className="tag-pill">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#9a9a9a", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Location</h4>
            <p style={{ fontSize: "15px", color: "#e0e0e0" }}>Campus Main</p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
