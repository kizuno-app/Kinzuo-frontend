"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export default function OtpPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  
  const [step, setStep] = useState<"request" | "verify">("request");
  const [purpose, setPurpose] = useState("SENSITIVE_ACTION");
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  // Timer state (10 minutes in seconds = 600)
  const [timeLeft, setTimeLeft] = useState(600);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Focus references for OTP digits input
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/otp");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (step === "verify") {
      setTimeLeft(600);
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
  }, [step]);

  const handleRequestOtp = async () => {
    setError("");
    setIsLoading(true);
    try {
      await authService.requestOtp(purpose);
      setSuccessMsg("A 6-digit OTP code has been sent to your registered email.");
      setStep("verify");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to request OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
      await authService.verifyOtp({ otp, purpose });
      setSuccessMsg("OTP successfully verified! Operation authorized.");
      // Clear OTP input
      setOtpValues(Array(6).fill(""));
      // Wait slightly and redirect back to feed or home
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!isAuthenticated || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
        <div style={{ color: "#a1a1aa", fontSize: "16px" }}>Redirecting...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "440px", padding: "32px", background: "#171717", borderRadius: "24px", border: "1px solid #262626" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ 
            background: "linear-gradient(90deg, #4f46e5 0%, #d4af37 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "32px", 
            fontWeight: 800, 
            marginBottom: "8px",
            display: "inline-block"
          }}>KIZUNO</h1>
          <p style={{ color: "#a1a1aa", fontSize: "15px" }}>
            {step === "request" ? "Request an authorization OTP" : "Verify OTP Code"}
          </p>
        </div>

        {error && (
          <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "12px", color: "#ef4444", fontSize: "14px", marginBottom: "20px", textAlign: "center" }}>
            {error}
          </div>
        )}

        {successMsg && !error && (
          <div style={{ padding: "12px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "12px", color: "#10b981", fontSize: "14px", marginBottom: "20px", textAlign: "center" }}>
            {successMsg}
          </div>
        )}

        {step === "request" ? (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", color: "#fafafa", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>Select Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", background: "#0a0a0a", border: "1px solid #262626", borderRadius: "12px", color: "#fafafa", fontSize: "15px", outline: "none" }}
              >
                <option value="SENSITIVE_ACTION">Authorize Sensitive Action</option>
                <option value="TWO_FACTOR">Two-Factor Authentication (2FA)</option>
              </select>
            </div>

            <button
              onClick={handleRequestOtp}
              disabled={isLoading}
              style={{ width: "100%", padding: "14px", background: "#4f46e5", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1, transition: "opacity 0.2s" }}
            >
              {isLoading ? "Sending OTP..." : "Generate & Send OTP"}
            </button>

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <Link href="/" style={{ color: "#a1a1aa", fontSize: "14px", textDecoration: "none" }}>Back to Dashboard</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "24px" }}>
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
                    background: "#0a0a0a",
                    border: "1px solid #262626",
                    borderRadius: "10px",
                    color: "#fafafa",
                    fontSize: "20px",
                    fontWeight: 600,
                    textAlign: "center",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#4f46e5"}
                  onBlur={(e) => e.target.style.borderColor = "#262626"}
                />
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <span style={{ fontSize: "13px", color: timeLeft === 0 ? "#ef4444" : "#a1a1aa" }}>
                {timeLeft === 0 ? "OTP Code expired" : `Expires in ${formatTime(timeLeft)}`}
              </span>
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={timeLeft > 540 || isLoading}
                style={{ background: "none", border: "none", color: "#cca43b", fontSize: "13px", fontWeight: 500, cursor: "pointer", opacity: (timeLeft > 540) ? 0.5 : 1 }}
              >
                Resend code
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || timeLeft === 0}
              style={{ width: "100%", padding: "14px", background: "#4f46e5", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: (isLoading || timeLeft === 0) ? "not-allowed" : "pointer", opacity: (isLoading || timeLeft === 0) ? 0.7 : 1, transition: "opacity 0.2s" }}
            >
              {isLoading ? "Verifying..." : "Verify & Authorize"}
            </button>

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <button
                type="button"
                onClick={() => setStep("request")}
                style={{ background: "none", border: "none", color: "#a1a1aa", fontSize: "14px", cursor: "pointer" }}
              >
                Change purpose / Request again
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
