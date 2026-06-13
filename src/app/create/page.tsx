"use client";
import { useState } from "react";

import { useAuthStore } from "@/store/auth.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();

  const createPostMutation = useMutation({
    mutationFn: (content: string) => postService.createPost({ content }),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      router.push("/");
    }
  });

  const handlePost = () => {
    if (!content.trim()) return;
    createPostMutation.mutate(content);
  };

  const authorName = user ? `${user.firstName} ${user.lastName}` : "Loading...";
  const authorDept = user?.branch || "Computer Science";
  const authorYear = user?.year ? `Year ${user.year}` : "Junior";
  const deptDisplay = `${authorDept} • ${authorYear}`;

  return (
    <>
      <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto", position: "relative" }}>
        {/* Header Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: "24px" }}>
          <button
            onClick={handlePost}
            disabled={!content.trim() || createPostMutation.isPending}
            style={{
              padding: "8px 24px", background: "#F5A623", color: "#0a0a0a",
              border: "none", borderRadius: "999px", fontWeight: 600, fontSize: "15px",
              cursor: (!content.trim() || createPostMutation.isPending) ? "not-allowed" : "pointer",
              opacity: (!content.trim() || createPostMutation.isPending) ? 0.5 : 1
            }}
          >
            {createPostMutation.isPending ? "Posting..." : "Post"}
          </button>
        </div>

        {/* Author info */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div 
            className={!user?.avatar ? "avatar-gradient" : ""} 
            style={{ 
              width: "48px", height: "48px", borderRadius: "50%", flexShrink: 0,
              backgroundSize: "cover", backgroundPosition: "center",
              backgroundImage: user?.avatar ? `url(${user.avatar})` : undefined
            }} 
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: "16px", color: "#fafafa" }}>{authorName}</div>
            <div style={{ fontSize: "14px", color: "#a1a1aa" }}>{deptDisplay}</div>
          </div>
        </div>

        {/* Text area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          style={{
            width: "100%",
            minHeight: "150px",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#fafafa",
            fontSize: "16px",
            lineHeight: 1.5,
            resize: "none",
            fontFamily: "inherit",
            marginBottom: "24px",
          }}
        />

        {/* Image upload */}
        <div
          style={{
            border: "1px dashed #3f3f46",
            borderRadius: "16px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
            transition: "border-color 0.2s",
            color: "#a1a1aa",
            fontSize: "15px",
            fontWeight: 500,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#71717a")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#3f3f46")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Add image
        </div>

      </div>
    </>
  );
}
