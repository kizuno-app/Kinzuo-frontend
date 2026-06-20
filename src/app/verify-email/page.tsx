"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const { user, logout, isAuthenticated, updateUser } = useAuthStore();
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "prompt">("loading");
  const [message, setMessage] = useState("Verifying your email address...");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!token && !isAuthenticated) {
      router.push("/login?redirect=/verify-email");
    }
  }, [token, isAuthenticated, router]);

  // Handle automatic link verification if token is present in URL
  useEffect(() => {
    if (!token) {
      if (isAuthenticated && user && !user.emailVerified) {
        setStatus("prompt");
      } else if (isAuthenticated && user?.emailVerified) {
        setStatus("success");
        setMessage("Your email address is already verified!");
      }
      return;
    }

    const verifyLink = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus("success");
        setMessage("Your email address has been successfully verified! You can now access all features of Kizuna.");
        updateUser({ emailVerified: true });
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed. The link may have expired or already been used.");
      }
    };

    verifyLink();
  }, [token, isAuthenticated, user, updateUser]);

  // Handle timer countdown
  useEffect(() => {
    if (status === "prompt") {
      setTimeLeft(600);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newValues = [...otpValues];
    newValues[index] = val.slice(-1);
    setOtpValues(newValues);

    // Auto-focus next input
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const otp = otpValues.join("");
    if (otp.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyOtp({ otp, purpose: "EMAIL_VERIFICATION" });
      updateUser({ emailVerified: true });
      setStatus("success");
      setMessage("Your email address has been successfully verified! You can now access all features of Kizuna.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!user?.email) return;
    setResendStatus("sending");
    setError("");
    try {
      await authService.resendVerification(user.email);
      setResendStatus("success");
      setTimeLeft(600);
      setOtpValues(Array(6).fill(""));
      setTimeout(() => setResendStatus("idle"), 5000);
    } catch (err: any) {
      setResendStatus("error");
      setError(err.response?.data?.message || "Failed to resend code.");
      setTimeout(() => setResendStatus("idle"), 5000);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

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
        {status === "loading" && (
          <div style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{
              width: "48px",
              height: "48px",
              border: "3px solid rgba(79, 70, 229, 0.1)",
              borderTop: "3px solid #4f46e5",
              borderRadius: "50%",
              margin: "0 auto 20px auto",
              animation: "spin 1s linear infinite"
            }} />
            <style jsx global>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <h2 style={{ color: "#111827", fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>Verifying Email</h2>
            <p style={{ color: "#4b5563", fontSize: "15px", lineHeight: "1.5" }}>{message}</p>
          </div>
        )}

        {status === "prompt" && (
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
                Verify account <span style={{ display: "inline-block" }}>✉️</span>
              </h1>
              <p style={{ color: "#4b5563", fontSize: "15px", margin: 0, lineHeight: "1.5" }}>
                We've sent a 6-digit verification code to <strong>{user?.email}</strong>. Please check your inbox and enter the code below.
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

            {resendStatus === "success" && (
              <div style={{ 
                padding: "12px 16px", 
                background: "#ecfdf5", 
                border: "1px solid #a7f3d0", 
                borderRadius: "12px", 
                color: "#059669", 
                fontSize: "14px", 
                marginBottom: "24px", 
                fontWeight: 500 
              }}>
                Verification code successfully resent!
              </div>
            )}

            <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* 6 Digit Input Boxes */}
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={val}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: "14px",
                      color: "#1f2937",
                      fontSize: "20px",
                      fontWeight: 600,
                      textAlign: "center",
                      outline: "none",
                      transition: "border-color 0.2s"
                    }}
                    className="focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]"
                  />
                ))}
              </div>

              {/* Timer and Resend Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
                <span style={{ color: timeLeft === 0 ? "#ef4444" : "#4b5563", fontWeight: 500 }}>
                  {timeLeft === 0 ? "Code expired" : `Expires in ${formatTime(timeLeft)}`}
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === "sending" || timeLeft > 540}
                  style={{ background: "none", border: "none", color: "#cca43b", fontSize: "14px", fontWeight: 600, cursor: "pointer", opacity: (timeLeft > 540) ? 0.5 : 1 }}
                  className="hover:underline"
                >
                  {resendStatus === "sending" ? "Resending..." : "Resend code"}
                </button>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                <button
                  type="submit"
                  disabled={isLoading || timeLeft === 0}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#4f46e5",
                    color: "#ffffff",
                    borderRadius: "9999px",
                    fontSize: "15px",
                    fontWeight: 700,
                    border: "none",
                    cursor: (isLoading || timeLeft === 0) ? "not-allowed" : "pointer",
                    opacity: (isLoading || timeLeft === 0) ? 0.7 : 1,
                    transition: "background 0.2s, transform 0.1s"
                  }}
                  className="hover:bg-[#4338ca] active:scale-[0.99]"
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "transparent",
                    color: "#4b5563",
                    borderRadius: "9999px",
                    fontSize: "15px",
                    fontWeight: 700,
                    border: "1px solid #d1d5db",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                  className="hover:bg-gray-50"
                >
                  Sign out / Use another account
                </button>
              </div>
            </form>
          </div>
        )}

        {status === "success" && (
          <div style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
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
            <h2 style={{ color: "#111827", fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>Success!</h2>
            <p style={{ color: "#4b5563", fontSize: "15px", lineHeight: "1.5", marginBottom: "24px" }}>{message}</p>
            <Link href="/onboarding" style={{
              display: "block",
              width: "100%",
              padding: "14px",
              background: "#4f46e5",
              color: "#ffffff",
              borderRadius: "9999px",
              fontSize: "15px",
              fontWeight: 700,
              textDecoration: "none",
              textAlign: "center",
              transition: "opacity 0.2s"
            }} className="hover:bg-[#4338ca]">
              Continue to Onboarding
            </Link>
          </div>
        )}

        {status === "error" && (
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
            <h2 style={{ color: "#111827", fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>Verification Failed</h2>
            <p style={{ color: "#4b5563", fontSize: "15px", lineHeight: "1.5", marginBottom: "24px" }}>{message}</p>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "14px",
                background: "#4f46e5",
                color: "#ffffff",
                border: "none",
                borderRadius: "9999px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.2s"
              }}
              className="hover:bg-[#4338ca]"
            >
              Back to Login
            </button>
          </div>
        )}
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

export default function VerifyEmailPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
      <Suspense fallback={
        <div style={{ width: "100%", maxWidth: "360px", padding: "32px", background: "#ffffff", textAlign: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "3px solid rgba(79, 70, 229, 0.1)",
            borderTop: "3px solid #4f46e5",
            borderRadius: "50%",
            margin: "0 auto 20px auto",
            animation: "spin 1s linear infinite"
          }} />
          <h2 style={{ color: "#111827", fontSize: "20px", fontWeight: 600 }}>Loading...</h2>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}

