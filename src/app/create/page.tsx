"use client";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";

const quickPrompts = [
  { text: "Looking for gym partner?", tags: ["#gym", "#fitness"] },
  { text: "Study group forming?", tags: ["#study", "#academic"] },
  { text: "Project collaboration?", tags: ["#tech", "#coding"] },
  { text: "Campus event happening?", tags: ["#events", "#campus"] },
];

export default function CreatePage() {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const addTag = () => {
    const raw = tagInput.trim();
    if (!raw) return;
    const tag = raw.startsWith("#") ? raw : `#${raw}`;
    if (!tags.includes(tag)) setTags([...tags, tag]);
    setTagInput("");
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const applyPrompt = (prompt: typeof quickPrompts[0]) => {
    setContent(prompt.text);
    const newTags = prompt.tags.filter((t) => !tags.includes(t));
    setTags([...tags, ...newTags]);
  };

  const handlePost = () => {
    if (!content.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setContent("");
      setTags([]);
    }, 2000);
  };

  return (
    <AppLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#f0f0f0" }}>Create Post</h1>
        <button
          style={{
            background: "none",
            border: "none",
            color: "#777",
            fontSize: "15px",
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: "8px",
          }}
        >
          Cancel
        </button>
      </div>

      {/* Author info */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
        <div className="avatar-gradient" style={{ width: "48px", height: "48px", borderRadius: "50%" }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: "15px", color: "#f0f0f0" }}>Alex Thompson</div>
          <div style={{ fontSize: "12px" }}>
            <span style={{ color: "#9a9a9a" }}>Computer Science • </span>
            <span style={{ color: "#F5A623" }}>Junior</span>
          </div>
        </div>
      </div>

      {/* Text area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        style={{
          width: "100%",
          minHeight: "140px",
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#e0e0e0",
          fontSize: "16px",
          lineHeight: 1.6,
          resize: "none",
          fontFamily: "inherit",
          marginBottom: "20px",
        }}
      />

      {/* Image upload */}
      <div
        style={{
          border: "1.5px dashed #333",
          borderRadius: "12px",
          padding: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          cursor: "pointer",
          marginBottom: "24px",
          transition: "border-color 0.15s",
          color: "#666",
          fontSize: "14px",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#F5A623")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#333")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        Add image
      </div>

      {/* Tags */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#f0f0f0", marginBottom: "12px" }}>Add tags</h3>
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()}
            placeholder="Add custom tag"
            style={{
              flex: 1,
              background: "#222",
              border: "1px solid #333",
              borderRadius: "10px",
              padding: "10px 14px",
              color: "#e0e0e0",
              fontSize: "14px",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={addTag}
            style={{
              padding: "10px 18px",
              background: "#F5A623",
              border: "none",
              borderRadius: "10px",
              color: "#000",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {tags.map((tag) => (
              <span
                key={tag}
                onClick={() => removeTag(tag)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 12px",
                  background: "rgba(245,166,35,0.15)",
                  border: "1px solid rgba(245,166,35,0.3)",
                  borderRadius: "999px",
                  fontSize: "12px",
                  color: "#F5A623",
                  cursor: "pointer",
                }}
              >
                {tag}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quick prompts */}
      <div style={{ marginBottom: "28px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#f0f0f0", marginBottom: "12px" }}>Quick prompts</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {quickPrompts.map((p) => (
            <button
              key={p.text}
              onClick={() => applyPrompt(p)}
              style={{
                background: "#222",
                border: "1px solid #2e2e2e",
                borderRadius: "12px",
                padding: "14px 16px",
                textAlign: "left",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#444")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2e2e2e")}
            >
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#e0e0e0", marginBottom: "6px" }}>{p.text}</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {p.tags.map((t) => (
                  <span key={t} className="tag-pill">{t}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Post button */}
      <button
        onClick={handlePost}
        disabled={!content.trim()}
        style={{
          width: "100%",
          padding: "14px",
          background: content.trim() ? "#F5A623" : "#2d2d2d",
          border: "none",
          borderRadius: "12px",
          color: content.trim() ? "#000" : "#555",
          fontSize: "15px",
          fontWeight: 700,
          cursor: content.trim() ? "pointer" : "not-allowed",
          transition: "all 0.15s",
        }}
      >
        {submitted ? "✓ Posted!" : "Post"}
      </button>
    </AppLayout>
  );
}
