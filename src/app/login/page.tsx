"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      const { token, user } = response.data;
      if (!token || !user) throw new Error('Invalid server response');
      setAuth(user, token);
      
      if (user && !user.emailVerified) {
        router.push("/verify-email");
      } else {
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirect') || '/';
        router.push(redirectTo);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to login");
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
              Welcome back <span style={{ display: "inline-block" }}>👋</span>
            </h1>
            <p style={{ color: "#4b5563", fontSize: "15px", margin: 0 }}>
              Please enter your details.
            </p>
          </div>

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
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
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

            {/* Password Field */}
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Remember & Forgot Row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "14px", marginTop: "4px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4b5563", cursor: "pointer", fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{
                    accentColor: "#4f46e5",
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                  }}
                />
                Remember for 30 days
              </label>
              <Link href="/forgot-password" style={{ color: "#cca43b", textDecoration: "none", fontWeight: 600 }} className="hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Log In Button */}
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
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <p style={{ textAlign: "center", color: "#4b5563", fontSize: "14px", marginTop: "24px" }}>
            Don't have an account? <Link href="/register" style={{ color: "#cca43b", textDecoration: "none", fontWeight: 700 }} className="hover:underline">Sign Up</Link>
          </p>

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
