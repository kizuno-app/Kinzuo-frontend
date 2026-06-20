"use client";
import { useState, useRef, Suspense } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { useRouter, useSearchParams } from "next/navigation";
import EmbeddedPost from "@/components/EmbeddedPost";

function CreatePageContent() {
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotePostId = searchParams.get("quote");

  // Fetch the original post for quote preview
  const { data: quotedPost } = useQuery({
    queryKey: ["post", quotePostId],
    queryFn: () => postService.getPost(quotePostId!),
    enabled: !!quotePostId,
  });

  const createPostMutation = useMutation({
    mutationFn: (data: { content: string, media?: string[] }) => postService.createPost(data),
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      router.push("/");
    }
  });

  const quotePostMutation = useMutation({
    mutationFn: (data: { content: string, media?: string[] }) => postService.quotePost(quotePostId!, data.content, data.media),
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      router.push("/");
    }
  });

  const isPending = createPostMutation.isPending || quotePostMutation.isPending;

  const handlePost = async () => {
    if (!text.trim() || isPending || isUploading) return;
    
    setIsUploading(true);
    try {
      const uploadedMediaUrls: string[] = [];
      for (const file of selectedFiles) {
        const url = await postService.uploadMedia(file);
        uploadedMediaUrls.push(url);
      }
      if (quotePostId) {
        quotePostMutation.mutate({ content: text, media: uploadedMediaUrls });
      } else {
        createPostMutation.mutate({ content: text, media: uploadedMediaUrls });
      }
    } catch (error) {
      console.error("Failed to upload images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      const newImages = newFiles.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const authorName = user ? `${user.firstName} ${user.lastName}` : "Loading...";
  const username = user?.username ? `@${user.username}` : `@${user?.firstName?.toLowerCase() || 'user'}`;

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
        display: "flex",
        alignItems: "center"
      }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fafafa", margin: 0 }}>{quotePostId ? "Quote" : "Create"}</h1>
      </div>

      <div style={{ 
        padding: "32px 24px", 
        width: "100%", 
        maxWidth: "700px", 
        margin: "0 auto", 
        display: "flex", 
        flexDirection: "column" 
      }}>
        <div style={{
          background: "#171717", 
          border: "1px solid #262626",
          borderRadius: "24px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)"
        }}>
          {/* User Info & Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div 
                className={!user?.avatar ? "avatar-gradient" : ""} 
                style={{ 
                  width: "48px", height: "48px", borderRadius: user?.role === 'ORGANIZATION' ? "8px" : "50%", flexShrink: 0,
                  backgroundSize: "cover", backgroundPosition: "center",
                  backgroundImage: user?.avatar ? `url(${user.avatar})` : undefined,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
                }} 
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: "16px", color: "#fafafa" }}>{authorName}</div>
                <div style={{ fontSize: "14px", color: "#a1a1aa", fontWeight: 500 }}>{username}</div>
              </div>
            </div>

            <button 
              onClick={() => router.back()}
              style={{
                width: "40px", height: "40px", borderRadius: "12px", background: "#262626", 
                border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#a1a1aa", transition: "background 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#3f3f46"}
              onMouseLeave={e => e.currentTarget.style.background = "#262626"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Text Area */}
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            placeholder={quotePostId ? "Add your thoughts…" : "What's on your mind? Share your thoughts, storyboard, or idea..."}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fafafa",
              fontSize: "20px",
              resize: "none",
              fontFamily: "inherit",
              lineHeight: 1.5,
              minHeight: "120px",
              paddingTop: "8px",
              overflow: "hidden"
            }}
          />

          {/* Image Previews */}
          {images.length > 0 && (
            <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "8px", marginTop: "auto" }}>
              {images.map((src, i) => (
                <div key={i} style={{ width: "120px", height: "120px", borderRadius: "16px", overflow: "hidden", flexShrink: 0, position: "relative", border: "1px solid #262626" }}>
                  <img src={src} alt="upload preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}

          {/* Quote Preview */}
          {quotePostId && quotedPost && (
            <div style={{ marginBottom: "8px" }}>
              <EmbeddedPost post={quotedPost} disableNavigation />
            </div>
          )}

          {/* Bottom Toolbar */}
          <div style={{
            background: "#0a0a0a", 
            borderRadius: "24px",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            border: "1px solid #262626",
            marginTop: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                width: "48px", height: "48px", borderRadius: "18px", background: isMenuOpen ? "#3f3f46" : "#262626", 
                border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fafafa",
                transition: "transform 0.2s, background 0.2s",
                position: "relative",
                zIndex: 11
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.background = "#3f3f46"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.background = isMenuOpen ? "#3f3f46" : "#262626"; }}
            >
              <svg 
                width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{
                  transform: isMenuOpen ? "rotate(135deg)" : "rotate(0deg)",
                  transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {/* Inline Slide-out Menu */}
            <div style={{
              overflow: "hidden",
              width: isMenuOpen ? "110px" : "0px",
              opacity: isMenuOpen ? 1 : 0,
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              display: "flex",
              alignItems: "center"
            }}>
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsMenuOpen(false);
                }}
                style={{
                  background: "#262626",
                  border: "none",
                  height: "48px",
                  padding: "0 16px",
                  color: "#fafafa",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  borderRadius: "18px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "15px",
                  transition: "background 0.2s",
                  whiteSpace: "nowrap"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#3f3f46"}
                onMouseLeave={e => e.currentTarget.style.background = "#262626"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Image
              </button>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              multiple 
              style={{ display: "none" }} 
            />
          </div>

            <button 
              onClick={handlePost}
              disabled={!text.trim() || isPending || isUploading}
              style={{
                width: "48px", height: "48px", borderRadius: "18px", background: "#4f46e5", 
                border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: (!text.trim() || isPending || isUploading) ? "not-allowed" : "pointer", 
                color: "#ffffff",
                boxShadow: "0 4px 16px rgba(79, 70, 229, 0.25)",
                opacity: (!text.trim() || isPending || isUploading) ? 0.5 : 1,
                transition: "transform 0.2s, opacity 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={e => { if (text.trim() && !isPending && !isUploading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(79, 70, 229, 0.35)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(79, 70, 229, 0.25)"; }}
            >
              {isPending || isUploading ? (
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>...</span>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div style={{ padding: "40px", textAlign: "center", color: "#71767b" }}>Loading...</div>
    }>
      <CreatePageContent />
    </Suspense>
  );
}
