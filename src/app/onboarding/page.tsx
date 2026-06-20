"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { profileService } from "@/services/profile.service";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  // Username checking
  const [usernameError, setUsernameError] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  useEffect(() => {
    // If the user hasn't typed anything or it's too short, don't validate yet
    if (username.length < 3) {
      if (username.length > 0) {
        setUsernameError("Username must be at least 3 characters");
      } else {
        setUsernameError("");
      }
      return;
    }

    if (username.length > 20) {
      setUsernameError("Username cannot exceed 20 characters");
      return;
    }

    // Debounce username check
    const timeoutId = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const isAvailable = await profileService.checkUsername(username);
        if (!isAvailable) {
          setUsernameError("Username is taken");
        } else {
          setUsernameError("");
        }
      } catch (error) {
        setUsernameError("Failed to verify username");
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      // 1. Upload avatar if selected
      let uploadedAvatarUrl = avatarUrl;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("image", avatarFile);
        const uploadRes = await profileService.uploadImage(formData, "avatar");
        uploadedAvatarUrl = uploadRes.data.url;
      }

      // 2. Update Profile & set onboardingCompleted
      const updateData = {
        username,
        bio: bio || undefined,
        location: location || undefined,
        onboardingCompleted: true,
      };

      if (user) {
        await profileService.updateProfile(user.id, updateData);
      }
      
      // Update local store
      updateUser({
        username,
        bio: bio || undefined,
        location: location || undefined,
        avatar: uploadedAvatarUrl || undefined,
        onboardingCompleted: true,
      });

      router.push("/");
    } catch (error) {
      console.error("Failed to complete onboarding", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUsernameValid = username.length >= 3 && username.length <= 20 && !usernameError && !isCheckingUsername;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>
        
        {step === 1 && (
          <div className="onboarding-step fade-in">
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fafafa", marginBottom: "8px" }}>Choose a username</h1>
            <p style={{ color: "#a1a1aa", fontSize: "15px", marginBottom: "32px" }}>Your username is unique. You can always change it later.</p>
            
            <div style={{ marginBottom: "24px", position: "relative" }}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))} // prevent spaces
                style={{
                  width: "100%", padding: "16px", background: "#171717", border: `1px solid ${usernameError ? "#ef4444" : isUsernameValid ? "#22c55e" : "#262626"}`, 
                  borderRadius: "12px", color: "#fafafa", fontSize: "16px", outline: "none", transition: "border-color 0.2s"
                }}
              />
              {isCheckingUsername && <div style={{ position: "absolute", right: "16px", top: "18px", color: "#a1a1aa", fontSize: "14px" }}>Checking...</div>}
              {usernameError && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "8px" }}>{usernameError}</p>}
            </div>

            <button
              onClick={handleNext}
              disabled={!isUsernameValid}
              style={{ width: "100%", padding: "16px", background: "#fafafa", color: "#0a0a0a", border: "none", borderRadius: "32px", fontSize: "16px", fontWeight: 700, cursor: isUsernameValid ? "pointer" : "not-allowed", opacity: isUsernameValid ? 1 : 0.5 }}
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step fade-in" style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fafafa", marginBottom: "8px", textAlign: "left" }}>Pick a profile picture</h1>
            <p style={{ color: "#a1a1aa", fontSize: "15px", marginBottom: "40px", textAlign: "left" }}>Have a favorite selfie? Upload it now.</p>
            
            <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto 40px", borderRadius: "50%", background: "#262626", border: "2px solid #333", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ color: "#777" }}>
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setAvatarFile(e.target.files[0]);
                    setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <button onClick={handleNext} style={{ width: "100%", padding: "16px", background: "#fafafa", color: "#0a0a0a", border: "none", borderRadius: "32px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>
                Next
              </button>
              <button onClick={handleNext} style={{ width: "100%", padding: "16px", background: "transparent", color: "#fafafa", border: "1px solid #262626", borderRadius: "32px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>
                Skip for now
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step fade-in">
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fafafa", marginBottom: "8px" }}>Describe yourself</h1>
            <p style={{ color: "#a1a1aa", fontSize: "15px", marginBottom: "32px" }}>What makes you special? Don't think too hard, just have fun with it.</p>
            
            <div style={{ marginBottom: "24px", position: "relative" }}>
              <textarea
                placeholder="Your bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 160))} // max 160 chars
                style={{
                  width: "100%", padding: "16px", background: "#0a0a0a", border: "1px solid #3b82f6", 
                  borderRadius: "12px", color: "#fafafa", fontSize: "16px", outline: "none", minHeight: "120px", resize: "none"
                }}
              />
              <div style={{ position: "absolute", right: "12px", top: "16px", color: "#a1a1aa", fontSize: "13px" }}>
                {bio.length} / 160
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <button onClick={handleNext} style={{ width: "100%", padding: "16px", background: "#fafafa", color: "#0a0a0a", border: "none", borderRadius: "32px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>
                Next
              </button>
              <button onClick={handleNext} style={{ width: "100%", padding: "16px", background: "transparent", color: "#fafafa", border: "1px solid #262626", borderRadius: "32px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>
                Skip for now
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="onboarding-step fade-in">
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fafafa", marginBottom: "8px" }}>Where do you live?</h1>
            <p style={{ color: "#a1a1aa", fontSize: "15px", marginBottom: "32px" }}>Find accounts in the same location as you.</p>
            
            <div style={{ marginBottom: "24px", position: "relative" }}>
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value.slice(0, 30))} // max 30 chars
                style={{
                  width: "100%", padding: "16px", background: "#0a0a0a", border: "1px solid #3b82f6", 
                  borderRadius: "12px", color: "#fafafa", fontSize: "16px", outline: "none"
                }}
              />
              <div style={{ position: "absolute", right: "12px", top: "18px", color: "#a1a1aa", fontSize: "13px" }}>
                {location.length} / 30
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <button disabled={isSubmitting} onClick={handleFinish} style={{ width: "100%", padding: "16px", background: "#fafafa", color: "#0a0a0a", border: "none", borderRadius: "32px", fontSize: "16px", fontWeight: 700, cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? "Finishing..." : "Finish"}
              </button>
              <button disabled={isSubmitting} onClick={handleFinish} style={{ width: "100%", padding: "16px", background: "transparent", color: "#fafafa", border: "1px solid #262626", borderRadius: "32px", fontSize: "16px", fontWeight: 700, cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
                Skip for now
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
