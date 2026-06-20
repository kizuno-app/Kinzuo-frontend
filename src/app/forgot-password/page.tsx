"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to request password reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Left Column: Form */}
      <div 
        style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          alignItems: "center", 
          padding: "40px 24px",
          background: "#ffffff"
        }}
        className="w-full md:w-1/2"
      >
        <div style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column" }}>
          
          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ 
              fontSize: "36px", 
              fontWeight: 700, 
              color: "#111827", 
              marginBottom: "8px",
              letterSpacing: "-0.5px",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              Forgot password? <span style={{ display: "inline-block" }}>🔒</span>
            </h1>
            <p style={{ color: "#4b5563", fontSize: "15px", margin: 0 }}>
              No worries, we'll send you reset instructions.
            </p>
          </div>

          {/* Success state vs Form state */}
          {success ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ 
                padding: "20px 16px", 
                background: "#f0fdf4", 
                border: "1px solid #bbf7d0", 
                borderRadius: "16px", 
                color: "#16a34a", 
                fontSize: "14px", 
                fontWeight: 500,
                lineHeight: "1.6",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                alignItems: "center",
                textAlign: "center"
              }}>
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  background: "#dcfce7", 
                  borderRadius: "50%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: "#15803d",
                  fontSize: "24px",
                  fontWeight: "bold"
                }}>
                  ✓
                </div>
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#166534", marginBottom: "4px" }}>Check your email</h2>
                  We've sent a link to reset your password to <strong>{email}</strong>.
                </div>
              </div>

              <Link 
                href="/login" 
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "#4f46e5",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "9999px",
                  fontSize: "15px",
                  fontWeight: 700,
                  textDecoration: "none",
                  textAlign: "center",
                  transition: "background 0.2s, transform 0.1s",
                }}
                className="hover:bg-[#4338ca] active:scale-[0.99]"
              >
                Back to Log In
              </Link>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div style={{ 
                  padding: "12px 16px", 
                  background: "#fef2f2", 
                  border: "1px solid #fee2e2", 
                  borderRadius: "12px", 
                  color: "#ef4444", 
                  fontSize: "14px", 
                  marginBottom: "24px", 
                  fontWeight: 500 
                }}>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Email Field */}
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "14px 44px 14px 18px",
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: "14px",
                      color: "#1f2937",
                      fontSize: "15px",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    className="focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] placeholder-gray-400"
                  />
                  <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex", alignItems: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#4f46e5",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "9999px",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.7 : 1,
                    marginTop: "12px",
                    transition: "background 0.2s, transform 0.1s",
                  }}
                  className="hover:bg-[#4338ca] active:scale-[0.99]"
                >
                  {isLoading ? "Sending link..." : "Send Reset Link"}
                </button>
              </form>

              {/* Back to Login Link */}
              <p style={{ textAlign: "center", color: "#4b5563", fontSize: "14px", marginTop: "24px" }}>
                Remembered your password? <Link href="/login" style={{ color: "#cca43b", textDecoration: "none", fontWeight: 700 }} className="hover:underline">Sign In</Link>
              </p>
            </>
          )}

        </div>
      </div>

      {/* Right Column: Illustration (Desktop Only) */}
      <div 
        style={{ 
          flex: 1, 
          padding: "24px", 
          background: "#ffffff", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          height: "100vh",
          position: "sticky",
          top: 0
        }}
        className="hidden md:flex"
      >
        <div 
          style={{ 
            width: "100%", 
            height: "100%", 
            borderRadius: "32px", 
            overflow: "hidden", 
            position: "relative",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
        >
          <img 
            src="/login_illustration.png" 
            alt="Terraced Fields Illustration" 
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "cover", 
              display: "block" 
            }} 
          />
        </div>
      </div>
    </div>
  );
}
