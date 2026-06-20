"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing from URL.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({ token, newPassword: password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. The link may have expired or is invalid.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{
          width: "60px",
          height: "60px",
          background: "#fef2f2",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px auto",
          fontSize: "30px",
          color: "#ef4444",
          border: "1px solid #fee2e2"
        }}>
          ✕
        </div>
        <h2 style={{ color: "#111827", fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>Invalid Reset Link</h2>
        <p style={{ color: "#4b5563", fontSize: "15px", lineHeight: "1.5", marginBottom: "24px" }}>
          This password reset link is invalid or missing a token. Please request a new link.
        </p>
        <Link href="/forgot-password" style={{
          display: "block",
          width: "100%",
          padding: "14px",
          background: "#4f46e5",
          color: "#ffffff",
          borderRadius: "9999px",
          fontSize: "15px",
          fontWeight: 700,
          textDecoration: "none",
          textAlign: "center"
        }} className="hover:bg-[#4338ca]">
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column" }}>
      {success ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{
            width: "60px",
            height: "60px",
            background: "#ecfdf5",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px auto",
            fontSize: "30px",
            color: "#10b981",
            border: "1px solid #a7f3d0"
          }}>
            ✓
          </div>
          <h2 style={{ color: "#111827", fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>Reset Complete</h2>
          <p style={{ color: "#4b5563", fontSize: "15px", lineHeight: "1.5", marginBottom: "24px" }}>
            Your password has been reset successfully. You can now log in using your new credentials.
          </p>
          <Link href="/login" style={{
            display: "block",
            width: "100%",
            padding: "14px",
            background: "#4f46e5",
            color: "#ffffff",
            borderRadius: "9999px",
            fontSize: "15px",
            fontWeight: 700,
            textDecoration: "none",
            textAlign: "center"
          }} className="hover:bg-[#4338ca]">
            Proceed to Login
          </Link>
        </div>
      ) : (
        <>
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
              Reset password <span style={{ display: "inline-block" }}>🔒</span>
            </h1>
            <p style={{ color: "#4b5563", fontSize: "15px", margin: 0 }}>
              Create your new secure password below.
            </p>
          </div>

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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="New Password"
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "14px",
                  color: "#1f2937",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                className="focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] placeholder-gray-400"
              />
            </div>

            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Confirm New Password"
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "14px",
                  color: "#1f2937",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                className="focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] placeholder-gray-400"
              />
            </div>

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
                transition: "background 0.2s, transform 0.1s"
              }}
              className="hover:bg-[#4338ca] active:scale-[0.99]"
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", width: "100vw" }}>
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
        <Suspense fallback={
          <div style={{ width: "100%", maxWidth: "360px", padding: "32px", background: "#ffffff", textAlign: "center" }}>
            <div style={{
              width: "48px",
              height: "48px",
              border: "3px solid rgba(79, 70, 229, 0.1)",
              borderTop: "3px solid #4f46e5",
              borderRadius: "50%",
              margin: "0 auto 20px auto",
              animation: "spin 1s linear infinite"
            }} />
            <h2 style={{ color: "#111827", fontSize: "20px", fontWeight: 600 }}>Loading Token...</h2>
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>
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
            alt="Illustration" 
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
