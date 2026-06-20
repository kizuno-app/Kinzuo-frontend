"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "POST" | "USER";
  targetId: string;
}

const REPORT_CATEGORIES = [
  { id: "SPAM", label: "Spam or misleading" },
  { id: "HARASSMENT", label: "Harassment or abuse" },
  { id: "FAKE_IDENTITY", label: "Fake identity or impersonation" },
  { id: "MISINFORMATION", label: "Misinformation" },
  { id: "NSFW", label: "NSFW or inappropriate content" },
  { id: "OTHER", label: "Other" },
];

export default function ReportModal({ isOpen, onClose, targetType, targetId }: ReportModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [reason, setReason] = useState("");

  const submitMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/reports", {
        targetType,
        targetId,
        category: selectedCategory,
        reason: reason || undefined,
      });
    },
    onSuccess: () => {
      alert("Report submitted successfully. Thank you for keeping our community safe.");
      onClose();
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Failed to submit report");
    }
  });

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
    }}>
      <div style={{
        background: "#171717", width: "100%", maxWidth: "400px",
        borderRadius: "16px", border: "1px solid #262626", overflow: "hidden"
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #262626", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fafafa", margin: 0 }}>Report {targetType === 'POST' ? 'Post' : 'User'}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", display: "flex", padding: "4px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ padding: "20px" }}>
          <p style={{ fontSize: "14px", color: "#a1a1aa", marginBottom: "16px" }}>
            Please select a reason for reporting this {targetType.toLowerCase()}. Your report will be reviewed by our moderation team.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            {REPORT_CATEGORIES.map(cat => (
              <label key={cat.id} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", color: "#fafafa", fontSize: "14px" }}>
                <input 
                  type="radio" 
                  name="reportCategory" 
                  value={cat.id} 
                  checked={selectedCategory === cat.id}
                  onChange={() => setSelectedCategory(cat.id)}
                  style={{ accentColor: "#ef4444", width: "16px", height: "16px" }}
                />
                {cat.label}
              </label>
            ))}
          </div>

          <textarea 
            placeholder="Additional details (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              width: "100%", background: "#0a0a0a", border: "1px solid #262626",
              borderRadius: "8px", padding: "12px", color: "#fafafa", fontSize: "14px",
              minHeight: "80px", resize: "vertical", outline: "none"
            }}
          />
        </div>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #262626", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button 
            onClick={onClose}
            style={{ background: "transparent", color: "#fafafa", border: "1px solid #3f3f46", padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button 
            onClick={() => submitMutation.mutate()}
            disabled={!selectedCategory || submitMutation.isPending}
            style={{ background: "#ef4444", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: (!selectedCategory || submitMutation.isPending) ? "not-allowed" : "pointer", opacity: (!selectedCategory || submitMutation.isPending) ? 0.5 : 1 }}
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
