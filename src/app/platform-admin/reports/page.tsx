"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { apiClient } from "@/services/api-client";
import { formatDistanceToNow } from "date-fns";

export default function ReportsModerationPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/reports/_x/mod-q');
      setCases(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch cases", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: string) => {
    let confirmMsg = "";
    if (action === "DELETE") {
      confirmMsg = "Are you sure you want to permanently delete this post? All comments, likes, and shares will be removed.";
    } else if (action === "SUSPEND") {
      confirmMsg = "Are you sure you want to suspend this user account? They will be immediately logged out and blocked from the platform.";
    } else if (action === "WARN") {
      confirmMsg = "Are you sure you want to issue a formal warning to this user regarding community guidelines?";
    } else if (action === "DISMISS") {
      confirmMsg = "Are you sure you want to dismiss this moderation case? All reports for this target will be resolved.";
    }

    if (!confirm(confirmMsg)) return;

    try {
      await apiClient.post(`/reports/_x/mod-q/${id}/act`, { action });
      fetchCases();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to process action");
    }
  };

  const postCases = cases.filter((c) => c.targetType === "POST");
  const userCases = cases.filter((c) => c.targetType === "USER");

  return (
    <AdminLayout portalType="PLATFORM">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <p style={{ color: "#a1a1aa", fontSize: "15px", margin: 0 }}>
          Review, investigate, and resolve user-reported violations. Keep Kizuno safe!
        </p>
        <button 
          onClick={fetchCases}
          style={{
            background: "#171717",
            color: "#fafafa",
            border: "1px solid #262626",
            padding: "8px 16px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#262626";
            e.currentTarget.style.borderColor = "#404040";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#171717";
            e.currentTarget.style.borderColor = "#262626";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
          </svg>
          Refresh Queue
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid #262626", marginBottom: "32px" }}>
        <button
          onClick={() => setActiveTab("posts")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "posts" ? "2px solid #4f46e5" : "2px solid transparent",
            color: activeTab === "posts" ? "#fafafa" : "#a1a1aa",
            padding: "12px 0",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          Reported Posts
          <span style={{
            background: activeTab === "posts" ? "#4f46e5" : "#262626",
            color: activeTab === "posts" ? "#ffffff" : "#a1a1aa",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: 700
          }}>
            {postCases.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "users" ? "2px solid #4f46e5" : "2px solid transparent",
            color: activeTab === "users" ? "#fafafa" : "#a1a1aa",
            padding: "12px 0",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          Reported Users
          <span style={{
            background: activeTab === "users" ? "#4f46e5" : "#262626",
            color: activeTab === "users" ? "#ffffff" : "#a1a1aa",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: 700
          }}>
            {userCases.length}
          </span>
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "240px" }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid #262626", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#a1a1aa", marginTop: "16px", fontSize: "14px" }}>Loading reported queue items...</p>
        </div>
      ) : activeTab === "posts" ? (
        /* Posts Queue */
        postCases.length === 0 ? (
          <div style={{ background: "#171717", borderRadius: "16px", border: "1px solid #262626", padding: "64px 32px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", padding: "16px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", marginBottom: "20px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>All Clear!</h3>
            <p style={{ color: "#a1a1aa", fontSize: "14px", maxWidth: "320px", margin: "0 auto" }}>No reported posts pending review. The community is clean.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {postCases.map((modCase) => {
              const details = modCase.targetDetails || {};
              const author = details.author || {};
              
              return (
                <div 
                  key={modCase.id} 
                  style={{
                    background: "#171717",
                    borderRadius: "16px",
                    border: "1px solid #262626",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px"
                  }}
                >
                  {/* Case Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #262626", paddingBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {author.avatar ? (
                        <img 
                          src={author.avatar} 
                          alt="avatar" 
                          style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", background: "#262626" }} 
                        />
                      ) : (
                        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#4f46e5", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                          {(author.firstName || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontWeight: 700, color: "#fafafa" }}>{author.firstName} {author.lastName}</span>
                          <span style={{ color: "#a1a1aa", fontSize: "14px" }}>@{author.username}</span>
                        </div>
                        <span style={{ color: "#a1a1aa", fontSize: "12px" }}>
                          Posted {details.createdAt ? formatDistanceToNow(new Date(details.createdAt)) + " ago" : "Unknown date"}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 700 }}>
                        {modCase.reportCount} Reports
                      </span>
                      <span style={{ background: "rgba(251, 191, 36, 0.1)", color: "#fbbf24", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}>
                        {modCase.status}
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div style={{ color: "#e4e4e7", fontSize: "15px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {details.content || <span style={{ color: "#71717a", fontStyle: "italic" }}>No content / deleted original post text</span>}
                  </div>

                  {/* Media attachments */}
                  {details.media && details.media.length > 0 && (
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
                      {details.media.map((imgUrl: string, idx: number) => (
                        <img 
                          key={idx}
                          src={imgUrl}
                          alt="post attachment"
                          style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "8px", objectFit: "cover", border: "1px solid #262626" }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Actions Panel */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #262626", paddingTop: "16px", marginTop: "8px" }}>
                    <span style={{ color: "#71717a", fontSize: "12px", fontFamily: "monospace" }}>
                      Target ID: {modCase.targetId}
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleAction(modCase.id, "DISMISS")}
                        style={{
                          background: "#262626",
                          color: "#a1a1aa",
                          border: "1px solid #3f3f46",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.color = "#fafafa";
                          e.currentTarget.style.background = "#323232";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.color = "#a1a1aa";
                          e.currentTarget.style.background = "#262626";
                        }}
                      >
                        Dismiss Reports
                      </button>
                      <button
                        onClick={() => handleAction(modCase.id, "WARN")}
                        style={{
                          background: "rgba(251, 191, 36, 0.1)",
                          color: "#fbbf24",
                          border: "1px solid rgba(251, 191, 36, 0.2)",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "rgba(251, 191, 36, 0.2)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "rgba(251, 191, 36, 0.1)";
                        }}
                      >
                        Warn Author
                      </button>
                      <button
                        onClick={() => handleAction(modCase.id, "DELETE")}
                        style={{
                          background: "rgba(239, 68, 68, 0.15)",
                          color: "#ef4444",
                          border: "1px solid rgba(239, 68, 68, 0.25)",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                        }}
                      >
                        Delete Post
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Users Queue */
        userCases.length === 0 ? (
          <div style={{ background: "#171717", borderRadius: "16px", border: "1px solid #262626", padding: "64px 32px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", padding: "16px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", marginBottom: "20px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>All Clear!</h3>
            <p style={{ color: "#a1a1aa", fontSize: "14px", maxWidth: "320px", margin: "0 auto" }}>No user accounts pending moderation. Your community is thriving.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {userCases.map((modCase) => {
              const details = modCase.targetDetails || {};
              
              return (
                <div 
                  key={modCase.id} 
                  style={{
                    background: "#171717",
                    borderRadius: "16px",
                    border: "1px solid #262626",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px"
                  }}
                >
                  {/* Case Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #262626", paddingBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      {details.avatar ? (
                        <img 
                          src={details.avatar} 
                          alt="avatar" 
                          style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", background: "#262626" }} 
                        />
                      ) : (
                        <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#4f46e5", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" }}>
                          {(details.firstName || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontWeight: 700, color: "#fafafa", fontSize: "17px" }}>{details.firstName} {details.lastName}</span>
                          <span style={{ color: "#a1a1aa", fontSize: "14px" }}>@{details.username}</span>
                        </div>
                        <div style={{ color: "#a1a1aa", fontSize: "13px", marginTop: "2px", display: "flex", gap: "10px" }}>
                          {details.college && <span>🏫 {details.college}</span>}
                          {details.branch && <span>📚 {details.branch}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 700 }}>
                        {modCase.reportCount} Reports
                      </span>
                      <span style={{ background: "rgba(251, 191, 36, 0.1)", color: "#fbbf24", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}>
                        {modCase.status}
                      </span>
                    </div>
                  </div>

                  {/* Profile Details */}
                  {details.bio && (
                    <div>
                      <h4 style={{ color: "#fafafa", fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Bio</h4>
                      <p style={{ color: "#e4e4e7", fontSize: "14px", lineHeight: "1.5" }}>{details.bio}</p>
                    </div>
                  )}

                  {/* Actions Panel */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #262626", paddingTop: "16px", marginTop: "8px" }}>
                    <span style={{ color: "#71717a", fontSize: "12px", fontFamily: "monospace" }}>
                      User ID: {modCase.targetId}
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleAction(modCase.id, "DISMISS")}
                        style={{
                          background: "#262626",
                          color: "#a1a1aa",
                          border: "1px solid #3f3f46",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.color = "#fafafa";
                          e.currentTarget.style.background = "#323232";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.color = "#a1a1aa";
                          e.currentTarget.style.background = "#262626";
                        }}
                      >
                        Dismiss Reports
                      </button>
                      <button
                        onClick={() => handleAction(modCase.id, "WARN")}
                        style={{
                          background: "rgba(251, 191, 36, 0.1)",
                          color: "#fbbf24",
                          border: "1px solid rgba(251, 191, 36, 0.2)",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "rgba(251, 191, 36, 0.2)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "rgba(251, 191, 36, 0.1)";
                        }}
                      >
                        Warn User
                      </button>
                      <button
                        onClick={() => handleAction(modCase.id, "SUSPEND")}
                        style={{
                          background: "rgba(239, 68, 68, 0.15)",
                          color: "#ef4444",
                          border: "1px solid rgba(239, 68, 68, 0.25)",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                        }}
                      >
                        Suspend Account
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Spin animation styles */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
}
