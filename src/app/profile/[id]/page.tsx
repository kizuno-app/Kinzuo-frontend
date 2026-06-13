"use client";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import { connectionService } from "@/services/connection.service";
import { useAuthStore } from "@/store/auth.store";
import { useParams } from "next/navigation";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';

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
    location: "",
    branch: "",
    year: "",
    avatar: "",
    coverImage: "",
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropType, setCropType] = useState<'avatar' | 'cover'>('avatar');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
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
        location: profile.location || "",
        branch: profile.branch || "",
        year: profile.year?.toString() || "",
        avatar: profile.avatar || "",
        coverImage: profile.coverImage || "",
      });
      setAvatarFile(null);
      setCoverFile(null);
    }
    setIsEditing(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImageToCrop(previewUrl);
    setCropType(type);
    setShowCropModal(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);

    if (type === 'avatar' && avatarInputRef.current) avatarInputRef.current.value = '';
    if (type === 'cover' && coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleCropComplete = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      const croppedFile = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (!croppedFile) return;

      const newPreviewUrl = URL.createObjectURL(croppedFile);

      if (cropType === 'avatar') {
        setAvatarFile(croppedFile);
        setEditForm(prev => ({ ...prev, avatar: newPreviewUrl }));
      } else {
        setCoverFile(croppedFile);
        setEditForm(prev => ({ ...prev, coverImage: newPreviewUrl }));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to crop image");
    } finally {
      setShowCropModal(false);
      setImageToCrop(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: any = {};
    if (editForm.firstName.trim().length >= 2) payload.firstName = editForm.firstName.trim();
    if (editForm.lastName.trim().length >= 2) payload.lastName = editForm.lastName.trim();
    if (editForm.bio.trim()) payload.bio = editForm.bio.trim();
    if (editForm.location.trim()) payload.location = editForm.location.trim();
    if (editForm.branch.trim()) payload.branch = editForm.branch.trim();
    
    const parsedYear = parseInt(editForm.year);
    if (!isNaN(parsedYear) && parsedYear >= 1 && parsedYear <= 5) {
      payload.year = parsedYear;
    }

    try {
      if (avatarFile) {
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('image', avatarFile);
        const res = await profileService.uploadImage(formData, 'avatar');
        if (res.status === 'success' && res.data.url) {
          payload.avatar = res.data.url;
        }
        setUploadingAvatar(false);
      } else if (editForm.avatar && !editForm.avatar.startsWith('blob:')) {
        payload.avatar = editForm.avatar;
      }
      
      if (coverFile) {
        setUploadingCover(true);
        const formData = new FormData();
        formData.append('image', coverFile);
        const res = await profileService.uploadImage(formData, 'cover');
        if (res.status === 'success' && res.data.url) {
          payload.coverImage = res.data.url;
        }
        setUploadingCover(false);
      } else if (editForm.coverImage && !editForm.coverImage.startsWith('blob:')) {
        payload.coverImage = editForm.coverImage;
      }

      updateMutation.mutate(payload);
    } catch (err) {
      console.error(err);
      alert("Failed to upload images before saving. Please try again.");
      setUploadingAvatar(false);
      setUploadingCover(false);
    }
  };

  const interests = profile?.skills?.length ? profile.skills : ["#AI", "#Machine Learning", "#Gym"];

  if (loadingProfile) {
    return (
      <div className="animate-pulse">
        <div style={{ height: "200px", width: "100%", background: "#262626" }} />
        <div style={{ position: "relative", padding: "0 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "-60px", marginBottom: "16px" }}>
            <div style={{ width: "134px", height: "134px", borderRadius: "50%", border: "4px solid #000000", background: "#333", zIndex: 10 }} />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ height: "24px", width: "200px", background: "#333", borderRadius: "8px", marginBottom: "8px" }} />
            <div style={{ height: "16px", width: "120px", background: "#333", borderRadius: "8px" }} />
          </div>
          <div style={{ height: "16px", width: "80%", background: "#333", borderRadius: "8px", marginBottom: "8px" }} />
          <div style={{ height: "16px", width: "60%", background: "#333", borderRadius: "8px", marginBottom: "16px" }} />
        </div>
      </div>
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
    <>
      {/* Crop Modal */}
      {showCropModal && imageToCrop && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", zIndex: 2000, display: "flex",
          alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#171717", borderRadius: "16px", width: "100%", maxWidth: cropType === 'cover' ? "800px" : "500px", 
            border: "1px solid #2a2a2a", overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          }}>
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #2a2a2a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f0f0f0", margin: 0 }}>
                {cropType === 'avatar' ? 'Edit Profile Picture' : 'Edit Cover Image'}
              </h2>
              <button onClick={() => { setShowCropModal(false); setImageToCrop(null); }} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", display: "flex", padding: "4px", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#a1a1aa'}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Cropper Area */}
            <div style={{ position: "relative", width: "100%", height: cropType === 'avatar' ? "400px" : "300px", backgroundColor: "#0a0a0a" }}>
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={cropType === 'avatar' ? 1 : 3}
                cropShape={cropType === 'avatar' ? 'round' : 'rect'}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(croppedArea, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                style={{
                  containerStyle: { backgroundColor: '#0a0a0a' },
                  cropAreaStyle: { border: '2px solid #F5A623', boxShadow: '0 0 0 9999em rgba(0,0,0,0.7)' }
                }}
              />
            </div>

            {/* Footer with Zoom and Actions */}
            <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: "28px" }}>
              {/* Zoom Slider */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "0 10px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                <input 
                  type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} 
                  style={{ flex: 1, accentColor: "#F5A623", cursor: "pointer", height: "4px", backgroundColor: "#333", borderRadius: "2px", outline: "none" }} 
                />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button onClick={() => { setShowCropModal(false); setImageToCrop(null); }} style={{ padding: "10px 24px", borderRadius: "999px", backgroundColor: "transparent", color: "#f0f0f0", border: "1px solid #333", cursor: "pointer", fontWeight: 600, transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#222'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  Cancel
                </button>
                <button onClick={handleCropComplete} style={{ padding: "10px 32px", borderRadius: "999px", backgroundColor: "#F5A623", color: "#000", border: "none", cursor: "pointer", fontWeight: 700, transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#d9921e'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#F5A623'}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && isOwnProfile && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex",
          alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div style={{
            background: "#171717", borderRadius: "16px", width: "100%", maxWidth: "600px", 
            border: "1px solid #2a2a2a", maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column"
          }}>
            <div style={{ position: "sticky", top: 0, background: "rgba(23,23,23,0.9)", backdropFilter: "blur(10px)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 20, borderBottom: "1px solid #2a2a2a" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <button onClick={() => setIsEditing(false)} style={{ background: "none", border: "none", color: "#f0f0f0", cursor: "pointer", display: "flex" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#f0f0f0", margin: 0 }}>Edit Profile</h2>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={updateMutation.isPending || uploadingAvatar || uploadingCover}
                style={{
                  padding: "6px 16px", borderRadius: "999px", background: "#f0f0f0", color: "#000",
                  border: "none", fontWeight: 700, fontSize: "14px", cursor: (updateMutation.isPending || uploadingAvatar || uploadingCover) ? "not-allowed" : "pointer", opacity: (updateMutation.isPending || uploadingAvatar || uploadingCover) ? 0.7 : 1
                }}
              >
                {updateMutation.isPending || uploadingAvatar || uploadingCover ? "Saving..." : "Save"}
              </button>
            </div>
            
            <div style={{ position: "relative" }}>
              {/* Cover Image Editor */}
              <div style={{ 
                height: "200px", width: "100%", position: "relative", 
                backgroundColor: "#333",
                backgroundImage: editForm.coverImage ? `url(${editForm.coverImage})` : "none", 
                backgroundSize: "cover", backgroundPosition: "center" 
              }}>
                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <button onClick={() => coverInputRef.current?.click()} style={{ backgroundColor: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "0.2s hover:bg-black" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </button>
                  <input type="file" ref={coverInputRef} style={{ display: "none" }} accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
                </div>
              </div>

              {/* Avatar Editor */}
              <div style={{ position: "absolute", bottom: "-60px", left: "20px" }}>
                <div style={{ 
                  width: "120px", height: "120px", borderRadius: "50%", border: "4px solid #171717", position: "relative", 
                  backgroundColor: "#555",
                  backgroundImage: editForm.avatar ? `url(${editForm.avatar})` : "none", 
                  backgroundSize: "cover", backgroundPosition: "center" 
                }}>
                  <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <button onClick={() => avatarInputRef.current?.click()} style={{ backgroundColor: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </button>
                    <input type="file" ref={avatarInputRef} style={{ display: "none" }} accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "80px 20px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#a1a1aa", marginBottom: "6px", fontWeight: 600 }}>First Name</label>
                  <input
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    placeholder="First Name"
                    style={{ width: "100%", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "12px 14px", color: "#f0f0f0", fontSize: "15px", outline: "none", transition: "border 0.2s" }}
                    onFocus={(e) => e.target.style.border = "1px solid #F5A623"}
                    onBlur={(e) => e.target.style.border = "1px solid #333"}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#a1a1aa", marginBottom: "6px", fontWeight: 600 }}>Last Name</label>
                  <input
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    placeholder="Last Name"
                    style={{ width: "100%", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "12px 14px", color: "#f0f0f0", fontSize: "15px", outline: "none", transition: "border 0.2s" }}
                    onFocus={(e) => e.target.style.border = "1px solid #F5A623"}
                    onBlur={(e) => e.target.style.border = "1px solid #333"}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#a1a1aa", marginBottom: "6px", fontWeight: 600 }}>Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  placeholder="Tell us about yourself"
                  rows={3}
                  style={{ width: "100%", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "12px 14px", color: "#f0f0f0", fontSize: "15px", outline: "none", resize: "none", transition: "border 0.2s", fontFamily: "inherit" }}
                  onFocus={(e) => e.target.style.border = "1px solid #F5A623"}
                  onBlur={(e) => e.target.style.border = "1px solid #333"}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#a1a1aa", marginBottom: "6px", fontWeight: 600 }}>Location</label>
                <input
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  placeholder="E.g. San Francisco, CA"
                  style={{ width: "100%", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "12px 14px", color: "#f0f0f0", fontSize: "15px", outline: "none", transition: "border 0.2s" }}
                  onFocus={(e) => e.target.style.border = "1px solid #F5A623"}
                  onBlur={(e) => e.target.style.border = "1px solid #333"}
                />
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#a1a1aa", marginBottom: "6px", fontWeight: 600 }}>Occupation / Branch</label>
                  <input
                    value={editForm.branch}
                    onChange={(e) => setEditForm({...editForm, branch: e.target.value})}
                    placeholder="Computer Science"
                    style={{ width: "100%", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "12px 14px", color: "#f0f0f0", fontSize: "15px", outline: "none", transition: "border 0.2s" }}
                    onFocus={(e) => e.target.style.border = "1px solid #F5A623"}
                    onBlur={(e) => e.target.style.border = "1px solid #333"}
                  />
                </div>
                <div style={{ width: "100px" }}>
                  <label style={{ display: "block", fontSize: "13px", color: "#a1a1aa", marginBottom: "6px", fontWeight: 600 }}>Year</label>
                  <input
                    type="number"
                    value={editForm.year}
                    onChange={(e) => setEditForm({...editForm, year: e.target.value})}
                    placeholder="1"
                    min="1" max="5"
                    style={{ width: "100%", background: "#222", border: "1px solid #333", borderRadius: "8px", padding: "12px 14px", color: "#f0f0f0", fontSize: "15px", outline: "none", transition: "border 0.2s" }}
                    onFocus={(e) => e.target.style.border = "1px solid #F5A623"}
                    onBlur={(e) => e.target.style.border = "1px solid #333"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner */}
      <div
        style={{
          height: "200px",
          width: "100%",
          background: profile?.coverImage ? `url(${profile.coverImage})` : "linear-gradient(135deg, #a4b5c4 0%, #d8cfd0 50%, #f4e8e1 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
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
              backgroundColor: "#171717"
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
                className="hover:bg-[#1a1a1a]"
              >
                Edit profile
              </button>
            ) : (
              <>
                <Link href={`/chats?userId=${user.id}`}>
                  <button style={{ width: "36px", height: "36px", borderRadius: "50%", background: "transparent", border: "1px solid #536471", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#eff3f4" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </button>
                </Link>
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
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", borderBottom: "1px solid #2a2a2a", gap: "0",
      }}>
        {(["posts", "about"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "12px 24px", background: "none", border: "none",
              borderBottom: activeTab === tab ? "2px solid #F5A623" : "2px solid transparent",
              color: activeTab === tab ? "#F5A623" : "#777",
              fontSize: "14px", fontWeight: activeTab === tab ? 700 : 400,
              cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

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
        // Followers Modal Code unchanged but keeping structure for brevity...
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
                      <div className={!u.avatar ? "avatar-gradient" : ""} style={{ width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0, backgroundImage: u.avatar ? `url(${u.avatar})` : undefined, backgroundSize: "cover" }} />
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
                      <div className={!u.avatar ? "avatar-gradient" : ""} style={{ width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0, backgroundImage: u.avatar ? `url(${u.avatar})` : undefined, backgroundSize: "cover" }} />
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
    </>
  );
}
