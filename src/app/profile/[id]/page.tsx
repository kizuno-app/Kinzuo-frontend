"use client";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import { connectionService } from "@/services/connection.service";
import { useAuthStore } from "@/store/auth.store";
import { useParams } from "next/navigation";
import Link from "next/link";
import PostCard from "@/components/PostCard";
export default function ProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<"posts" | "about">("posts");
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
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
  
  const isOwnProfile = currentUser?.id === profileId;
  
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => profileService.getProfile(profileId),
    enabled: !!profileId,
  });

  const { data: userPosts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['posts', 'user', profileId],
    queryFn: () => profileService.getUserPosts(profileId),
    enabled: !!profileId,
  });

  const { data: followers = [], isLoading: loadingFollowers } = useQuery({
    queryKey: ['followers', profileId],
    queryFn: () => connectionService.getFollowers(profileId),
    enabled: !!profileId && showFollowersModal,
  });

  const { data: following = [], isLoading: loadingFollowing } = useQuery({
    queryKey: ['following', profileId],
    queryFn: () => connectionService.getFollowing(profileId),
    enabled: !!profileId && showFollowingModal,
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
    id: profile?.userId || profileId,
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    email: profile?.email || "",
    avatar: profile?.avatar,
  };

  return (
    <AppLayout>
      {/* Edit Profile Modal */}
      {isEditing && isOwnProfile && (
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
          height: "200px",
          width: "100%",
          background: "linear-gradient(135deg, #a4b5c4 0%, #d8cfd0 50%, #f4e8e1 100%)", // soft pastel look
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: "16px", left: "16px", display: "flex", alignItems: "center", gap: "24px" }}>
          <button onClick={() => window.history.back()} style={{ background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", cursor: "pointer", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
        </div>
      </div>

      {/* Profile Info Section */}
      <div style={{ position: "relative", padding: "0 16px" }}>
        {/* Avatar & Buttons Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "-60px", marginBottom: "16px" }}>
          {/* Avatar */}
          <div
            className={!profile?.avatar ? "avatar-gradient" : ""}
            style={{
              width: "134px",
              height: "134px",
              borderRadius: "50%",
              border: "4px solid #000000",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundImage: profile?.avatar ? `url(${profile.avatar})` : undefined,
              zIndex: 10,
            }}
          />
          
          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            {isOwnProfile ? (
              <button
                onClick={handleEditClick}
                style={{
                  padding: "6px 16px",
                  borderRadius: "999px",
                  background: "transparent",
                  border: "1px solid #536471",
                  color: "#eff3f4",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                className="hover:bg-gray-900"
              >
                Edit profile
              </button>
            ) : (
              <>
                <button style={{ width: "36px", height: "36px", borderRadius: "50%", background: "transparent", border: "1px solid #536471", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#eff3f4" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
                <button style={{ width: "36px", height: "36px", borderRadius: "50%", background: "transparent", border: "1px solid #536471", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#eff3f4" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </button>
                <button 
                  onClick={() => {
                    if (profile?.isFollowing) {
                      connectionService.unfollowUser(user.id).then(() => queryClient.invalidateQueries({ queryKey: ['profile', profileId] }));
                    } else {
                      connectionService.followUser(user.id).then(() => queryClient.invalidateQueries({ queryKey: ['profile', profileId] }));
                    }
                  }}
                  style={{
                    padding: "0 16px",
                    height: "36px",
                    borderRadius: "999px",
                    background: profile?.isFollowing ? "transparent" : "#eff3f4",
                    border: profile?.isFollowing ? "1px solid #536471" : "none",
                    color: profile?.isFollowing ? "#eff3f4" : "#0f1419",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {profile?.isFollowing ? "Following" : "Follow"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Name and Handle */}
        <div style={{ marginBottom: "16px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#e7e9ea", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
            {profile?.firstName} {profile?.lastName}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1d9bf0" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.5 12.5L20.25 15L20.75 18.25L17.5 19L16 22L12.5 20.5L9 22L7.5 19L4.25 18.25L4.75 15L2.5 12.5L4.75 10L4.25 6.75L7.5 6L9 3L12.5 4.5L16 3L17.5 6L20.75 6.75L20.25 10L22.5 12.5ZM10.5 16.5L17.5 9.5L16 8L10.5 13.5L8 11L6.5 12.5L10.5 16.5Z" fill="#1d9bf0"/>
            </svg>
          </h1>
          <p style={{ fontSize: "15px", color: "#71767b", margin: 0 }}>@{profile?.username || `${profile?.firstName?.toLowerCase() || ''}${profile?.lastName?.toLowerCase() || ''}`}</p>
        </div>

        {/* Bio */}
        <p style={{ fontSize: "15px", color: "#e7e9ea", lineHeight: 1.3, marginBottom: "12px", whiteSpace: "pre-wrap" }}>
          {profile?.bio || "No bio yet."}
        </p>

        {/* Info row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "12px", color: "#71767b", fontSize: "15px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-3V5a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM9 5h6v2H9V5z"></path></svg>
            {profile?.branch || "Science & Technology"}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {profile?.location || "Location not set"}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            Joined {new Date(profile?.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "16px", fontSize: "15px" }}>
          <div onClick={() => setShowFollowingModal(true)} style={{ cursor: "pointer", color: "#71767b" }} className="hover:underline">
            <span style={{ fontWeight: 700, color: "#e7e9ea" }}>{profile?.followingCount || 0}</span> Following
          </div>
          <div onClick={() => setShowFollowersModal(true)} style={{ cursor: "pointer", color: "#71767b" }} className="hover:underline">
            <span style={{ fontWeight: 700, color: "#e7e9ea" }}>{profile?.followersCount || 0}</span> Followers
          </div>
          <div style={{ color: "#71767b" }}>
            <span style={{ fontWeight: 700, color: "#e7e9ea" }}>{userPosts.length || 0}</span> Posts
          </div>
        </div>

        {!isOwnProfile && (
          <div style={{ fontSize: "13px", color: "#71767b", marginBottom: "16px" }}>
            Not followed by anyone you're following
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid #2a2a2a",
        marginBottom: "0", // removed bottom margin so posts line up nicely if needed
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
        <div style={{ padding: "16px" }}>
          {loadingPosts && <div style={{ color: "#666", textAlign: "center", padding: "20px" }}>Loading posts...</div>}
          {!loadingPosts && userPosts.length === 0 && (
            <div style={{ color: "#666", textAlign: "center", padding: "20px" }}>No posts yet.</div>
          )}
          {userPosts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* About tab */}
      {activeTab === "about" && (
        <div style={{ padding: "16px" }}>
          <div style={{ background: "#171717", borderRadius: "16px", padding: "20px", border: "1px solid #262626" }}>
            <div style={{ marginBottom: "18px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#9a9a9a", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Education</h4>
              <p style={{ fontSize: "15px", color: "#e0e0e0" }}>State University — {profile?.branch || "General"}</p>
              <p style={{ fontSize: "13px", color: "#777" }}>Year {profile?.year || 1}</p>
            </div>
            <div style={{ marginBottom: "18px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#9a9a9a", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Skills</h4>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {interests.map((s: string) => (
                  <span key={s} className="tag-pill" style={{ background: "#262626", color: "#a1a1aa", padding: "4px 10px", borderRadius: "999px", fontSize: "12px" }}>{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#9a9a9a", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Location</h4>
              <p style={{ fontSize: "15px", color: "#e0e0e0" }}>{profile?.location || "Location not set"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex",
          alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div style={{
            background: "#171717", borderRadius: "16px", padding: "24px",
            width: "100%", maxWidth: "450px", border: "1px solid #2a2a2a",
            maxHeight: "80vh", display: "flex", flexDirection: "column"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f0f0f0" }}>Followers</h2>
              <button onClick={() => setShowFollowersModal(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }}>
              {loadingFollowers && <div style={{ color: "#777", textAlign: "center" }}>Loading...</div>}
              {!loadingFollowers && followers.length === 0 && <div style={{ color: "#777", textAlign: "center" }}>No followers yet.</div>}
              {followers.map((conn: any) => {
                const u = conn.profile;
                if (!u) return null;
                return (
                  <Link href={`/profile/${u.userId}`} key={u.userId} onClick={() => setShowFollowersModal(false)} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "12px", transition: "background 0.2s" }} className="hover:bg-[#222]">
                      <div className={u.avatar || "avatar-gradient"} style={{ width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 600, color: "#fafafa" }}>{u.firstName} {u.lastName}</div>
                        <div style={{ fontSize: "13px", color: "#a1a1aa" }}>{u.branch || "General"}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex",
          alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div style={{
            background: "#171717", borderRadius: "16px", padding: "24px",
            width: "100%", maxWidth: "450px", border: "1px solid #2a2a2a",
            maxHeight: "80vh", display: "flex", flexDirection: "column"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f0f0f0" }}>Following</h2>
              <button onClick={() => setShowFollowingModal(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }}>
              {loadingFollowing && <div style={{ color: "#777", textAlign: "center" }}>Loading...</div>}
              {!loadingFollowing && following.length === 0 && <div style={{ color: "#777", textAlign: "center" }}>Not following anyone yet.</div>}
              {following.map((conn: any) => {
                const u = conn.profile;
                if (!u) return null;
                return (
                  <Link href={`/profile/${u.userId}`} key={u.userId} onClick={() => setShowFollowingModal(false)} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "12px", transition: "background 0.2s" }} className="hover:bg-[#222]">
                      <div className={u.avatar || "avatar-gradient"} style={{ width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 600, color: "#fafafa" }}>{u.firstName} {u.lastName}</div>
                        <div style={{ fontSize: "13px", color: "#a1a1aa" }}>{u.branch || "General"}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
