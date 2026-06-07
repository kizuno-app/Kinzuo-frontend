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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      // Backend returns { status: 'success', data: { token, user } }
      const { token, user } = response.data;
      if (!token || !user) throw new Error('Invalid server response');
      setAuth(user, token);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "32px", background: "#171717", borderRadius: "24px", border: "1px solid #262626" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ color: "#F5A623", fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>Campus Connect</h1>
          <p style={{ color: "#a1a1aa", fontSize: "15px" }}>Welcome back! Sign in to continue.</p>
        </div>

        {error && (
          <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "12px", color: "#ef4444", fontSize: "14px", marginBottom: "20px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", color: "#fafafa", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "12px 16px", background: "#0a0a0a", border: "1px solid #262626", borderRadius: "12px", color: "#fafafa", fontSize: "15px", outline: "none", transition: "border-color 0.2s" }}
              onFocus={(e) => e.target.style.borderColor = "#F5A623"}
              onBlur={(e) => e.target.style.borderColor = "#262626"}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "#fafafa", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "12px 16px", background: "#0a0a0a", border: "1px solid #262626", borderRadius: "12px", color: "#fafafa", fontSize: "15px", outline: "none", transition: "border-color 0.2s" }}
              onFocus={(e) => e.target.style.borderColor = "#F5A623"}
              onBlur={(e) => e.target.style.borderColor = "#262626"}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{ width: "100%", padding: "14px", background: "#F5A623", color: "#0a0a0a", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1, marginTop: "8px", transition: "opacity 0.2s" }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#a1a1aa", fontSize: "14px", marginTop: "24px" }}>
          Don't have an account? <Link href="/register" style={{ color: "#F5A623", textDecoration: "none", fontWeight: 500 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
