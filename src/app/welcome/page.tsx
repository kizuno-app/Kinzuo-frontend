"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Custom premium SVG Icons
const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

const ArrowDownIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{
      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.3s ease",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c4 0 7-2 7-2s3 2 7 2a1 1 0 0 1 1 1v7Z"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const MessageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20"/>
  </svg>
);

interface FAQItem {
  question: string;
  answer: string;
}

export default function WelcomePage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  // Dynamic States for interactive social widgets
  const [activeSandboxTab, setActiveSandboxTab] = useState<"domain" | "post" | "chat">("chat");
  const [likes, setLikes] = useState(142);
  const [hasLiked, setHasLiked] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [verifiedDomain, setVerifiedDomain] = useState<string | null>(null);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState([
    { sender: "KizunoBot", text: "Hey! Welcome to the interactive trial. Type a question about campus life or workspaces!", time: "2:14 PM" },
  ]);
  const [newMessageText, setNewMessageText] = useState("");

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat simulator to the bottom on new messages
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Tab 2 Post States
  const [sandboxPostText, setSandboxPostText] = useState("");
  const [sandboxFeedPosts, setSandboxFeedPosts] = useState([
    { author: "Rohan Sharma", handle: "@rohan_iitb", time: "2m ago", content: "Just launched our collaborative workspace feed. Real-time updates live! 🚀", likes: 142, hasLiked: false }
  ]);

  // Emoji physics particles state
  const [particles, setParticles] = useState<{ id: number; char: string; x: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) {
    return <div style={{ minHeight: "100vh", backgroundColor: "#0c0b10" }} />;
  }

  // Warm, Professional Social Media Palette (Premium Indigo & Gold)
  const theme = {
    bg: isDarkMode ? "#0c0b10" : "#f8fafc",
    textPrimary: isDarkMode ? "#fafafa" : "#0f172a",
    textSecondary: isDarkMode ? "#a3a3b2" : "#475569",
    border: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)",
    cardBg: isDarkMode ? "#13121a" : "#ffffff",
    navbarBg: isDarkMode ? "rgba(12, 11, 16, 0.85)" : "rgba(248, 250, 252, 0.85)",
    btnSecondaryBg: isDarkMode ? "#1d1b26" : "#f1f5f9",
    gridColor: isDarkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(15, 23, 42, 0.015)",
    accentPurple: "#4f46e5", // Indigo for Trust
    accentRose: "#d4af37",   // Gold for Premium looks
    accentAmber: "#cca43b",  // Rich Gold accent
    accentEmerald: "#10b981", // Success green
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikes(likes - 1);
      setHasLiked(false);
    } else {
      setLikes(likes + 1);
      setHasLiked(true);
      spawnEmoji("❤️");
    }
  };

  const spawnEmoji = (emoji: string) => {
    const id = Date.now() + Math.random();
    const x = Math.random() * 80 - 40; // centered offset
    setParticles(prev => [...prev, { id, char: emoji, x }]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1500);
  };

  const handleVerifyDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput) return;
    if (domainInput.includes("@iitb.ac.in") || domainInput.includes("iitb.ac.in")) {
      setVerifiedDomain("IIT Bombay Workspace");
      spawnEmoji("🎉");
    } else if (domainInput.includes("@bits-pilani.ac.in") || domainInput.includes("bits-pilani.ac.in")) {
      setVerifiedDomain("BITS Pilani Workspace");
      spawnEmoji("🎉");
    } else if (domainInput.includes(".edu") || domainInput.includes(".ac.in")) {
      setVerifiedDomain("Academic Workspace Verified");
      spawnEmoji("✓");
    } else {
      setVerifiedDomain("Verified Community Workspace");
      spawnEmoji("👍");
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    setChatMessages([
      ...chatMessages,
      { sender: "You", text: newMessageText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setNewMessageText("");
    spawnEmoji("💬");
  };

  const faqData: FAQItem[] = [
    {
      question: "What is KIZUNO?",
      answer: "KIZUNO is a campus and organization social application where you can verify your email domain, access live feeds, react to post updates, and chat in real-time channels."
    },
    {
      question: "How does domain verification work?",
      answer: "When users register, the system checks their email suffix (like student@iitb.ac.in). If matching, they are instantly added to their dedicated college or corporate workspace."
    },
    {
      question: "Can people from other countries join?",
      answer: "Yes. KIZUNO is currently centered around an active Indian developer ecosystem (with central hubs in Bangalore, Mumbai, and Delhi), but our routing structure connects to global nodes in Singapore, Tokyo, New York, and London."
    },
    {
      question: "Is organization data private?",
      answer: "Yes. Post feeds and chat rooms are locked strictly behind domain matching. External users cannot access internal organizational spaces."
    }
  ];

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: theme.bg,
      color: theme.textPrimary,
      fontFamily: "system-ui, -apple-system, sans-serif",
      position: "relative",
      overflowX: "hidden",
      transition: "background-color 0.4s ease, color 0.4s ease",
    }}>

      {/* Grid Pattern overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage: `radial-gradient(circle at 1px 1px, ${theme.gridColor} 1px, transparent 0)`,
        backgroundSize: "24px 24px",
        zIndex: 1,
      }} />

      {/* Ambient Blur Glows (Warm, Social Gradient accents) */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "55%",
            height: "55%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${isDarkMode ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.08)"} 0%, transparent 70%)`,
            filter: "blur(110px)",
          }}
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "20%",
            right: "-10%",
            width: "60%",
            height: "60%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${isDarkMode ? "rgba(236,72,153,0.12)" : "rgba(236,72,153,0.06)"} 0%, transparent 70%)`,
            filter: "blur(130px)",
          }}
        />
      </div>

      {/* Header / Navigation */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        borderBottom: `1px solid ${theme.border}`,
        backgroundColor: theme.navbarBg,
        backdropFilter: "blur(20px)",
        transition: "background-color 0.4s ease, border-color 0.4s ease",
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "14px",
              background: `linear-gradient(135deg, ${theme.accentPurple} 0%, ${theme.accentRose} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 20px ${isDarkMode ? "rgba(139,92,246,0.25)" : "rgba(139,92,246,0.12)"}`,
            }}>
              <span style={{ color: "#ffffff", fontWeight: 950, fontSize: "20px", fontStyle: "italic", letterSpacing: "-1px" }}>K</span>
            </div>
            <span style={{
              fontWeight: 900,
              fontSize: "24px",
              letterSpacing: "-1.2px",
              color: theme.textPrimary,
            }}>
              KIZUNO
            </span>
          </div>

          {/* Navigation Links */}
          {!isMobile && (
            <nav style={{ display: "flex", alignItems: "center", gap: "36px" }}>
              <a href="#features" style={{ color: theme.textSecondary, textDecoration: "none", fontSize: "15px", fontWeight: 600, transition: "color 0.2s" }} className="hover:text-[#8b5cf6]">Workspace</a>
              <a href="#connections" style={{ color: theme.textSecondary, textDecoration: "none", fontSize: "15px", fontWeight: 600, transition: "color 0.2s" }} className="hover:text-[#8b5cf6]">Connections</a>
              <a href="#faq" style={{ color: theme.textSecondary, textDecoration: "none", fontSize: "15px", fontWeight: 600, transition: "color 0.2s" }} className="hover:text-[#8b5cf6]">FAQ</a>
            </nav>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                background: theme.btnSecondaryBg,
                color: theme.textPrimary,
                border: `1px solid ${theme.border}`,
                borderRadius: "12px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                transition: "all 0.3s ease",
              }}
            >
              {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            <Link href="/login" style={{
              color: theme.textSecondary,
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: 600,
              padding: "8px 16px",
              transition: "color 0.2s",
            }} className="hover:text-[#8b5cf6]">
              Login
            </Link>

            <Link href="/register" style={{
              background: `linear-gradient(135deg, ${theme.accentPurple} 0%, ${theme.accentRose} 100%)`,
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "14px",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: 650,
              boxShadow: `0 6px 20px ${isDarkMode ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.12)"}`,
              transition: "opacity 0.2s",
            }} className="hover:opacity-90">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main style={{ position: "relative", zIndex: 10 }}>

        {/* Hero Section */}
        <section style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: isMobile ? "56px 24px 48px" : "96px 24px 80px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          gap: "64px",
        }}>
          {/* Left Text details */}
          <div style={{ flex: 1.1, display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left" }}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "9999px",
                border: `1px solid ${isDarkMode ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.15)"}`,
                backgroundColor: "rgba(139,92,246,0.06)",
                color: theme.accentPurple,
                fontSize: "13px",
                fontWeight: 650,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: "24px",
              }}
            >
              <SparklesIcon />
              Where Campus Communities Live
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              style={{
                fontSize: isMobile ? "44px" : "62px",
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-2px",
                marginBottom: "24px",
              }}
            >
              Your Campus.<br />
              Your Community.<br />
              <span style={{
                background: `linear-gradient(90deg, ${theme.accentPurple} 0%, ${theme.accentRose} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Connected.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                fontSize: "19px",
                color: theme.textSecondary,
                lineHeight: 1.65,
                marginBottom: "40px",
                maxWidth: "540px",
              }}
            >
              KIZUNO connects your university, organization, and circles in a vibrant social network. Share media feeds, verify domains, and text in real-time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: "16px",
                width: isMobile ? "100%" : "auto",
              }}
            >
              <Link href="/register" style={{
                background: `linear-gradient(135deg, ${theme.accentPurple} 0%, ${theme.accentRose} 100%)`,
                color: "#ffffff",
                textAlign: "center",
                padding: "16px 36px",
                borderRadius: "14px",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: 700,
                boxShadow: `0 8px 24px ${isDarkMode ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.1)"}`,
                transition: "transform 0.2s ease",
              }} className="hover:scale-[1.02] active:scale-[0.98]">
                Join as a User
              </Link>
              
              <Link href="/organization/register" style={{
                background: theme.btnSecondaryBg,
                color: theme.textPrimary,
                border: `1px solid ${theme.border}`,
                textAlign: "center",
                padding: "16px 36px",
                borderRadius: "14px",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: 700,
                transition: "transform 0.2s ease",
              }} className="hover:scale-[1.02] active:scale-[0.98]">
                Claim Workspace
              </Link>
            </motion.div>
          </div>

          {/* Right Side: Immersive Overlapping Social Mockups (Threads/Instagram Vibes) */}
          <div style={{
            flex: 0.9,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            position: "relative",
            minHeight: "380px",
          }}>
            {/* Background glowing circle */}
            <div style={{
              position: "absolute",
              width: "280px",
              height: "280px",
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)`,
              zIndex: 1,
            }} />

            {/* Post Card A (Overlapping Bottom) */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: 30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                position: "absolute",
                left: "2%",
                top: "10%",
                width: "280px",
                backgroundColor: isDarkMode ? "#15141c" : "#ffffff",
                border: `1px solid ${theme.border}`,
                borderRadius: "20px",
                padding: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                zIndex: 2,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #8b5cf6, #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "10px", fontWeight: "bold" }}>A</div>
                <div>
                  <h4 style={{ fontSize: "12px", fontWeight: 700, margin: 0 }}>Aditya Sharma</h4>
                  <span style={{ fontSize: "9px", color: theme.textSecondary }}>@aditya_bits · 5m ago</span>
                </div>
              </div>
              <p style={{ fontSize: "11px", margin: "0 0 10px", lineHeight: 1.4 }}>
                Sunset view from the hostel roof tonight. BITS vibes are unmatched! 🌅✨
              </p>
              <div style={{ borderRadius: "12px", overflow: "hidden", height: "100px", position: "relative", border: `1px solid ${theme.border}` }}>
                <img src="/community_dark.png" alt="Campus vibes attachment" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "10px", fontSize: "10px", color: theme.textSecondary }}>
                <span>❤️ 244 Likes</span>
                <span>💬 18 Comments</span>
              </div>
            </motion.div>

            {/* Chat Bubble B (Overlapping Top Right) */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                position: "absolute",
                right: "2%",
                bottom: "15%",
                width: "220px",
                backgroundColor: isDarkMode ? "#181622" : "#ffffff",
                border: `1px solid ${theme.border}`,
                borderRadius: "18px",
                padding: "12px",
                boxShadow: "0 12px 36px rgba(0,0,0,0.2)",
                zIndex: 3,
              }}
            >
              <span style={{
                fontSize: "9px",
                fontWeight: 700,
                color: "#ffffff",
                backgroundColor: theme.accentPurple,
                padding: "3px 6px",
                borderRadius: "4px",
                display: "inline-block",
                marginBottom: "8px",
              }}>
                DIRECT MESSAGE
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "10px", alignSelf: "flex-start", backgroundColor: isDarkMode ? "#252233" : "#f1f5f9", padding: "6px 10px", borderRadius: "12px", maxWidth: "85%" }}>
                  Meeting at the library?
                </div>
                <div style={{ fontSize: "10px", alignSelf: "flex-end", backgroundColor: theme.accentPurple, color: "#fff", padding: "6px 10px", borderRadius: "12px", maxWidth: "85%" }}>
                  Yes, see you in 5! 🚀
                </div>
              </div>
            </motion.div>

            {/* Floating Alert Pill C */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                right: "15%",
                top: "12%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "999px",
                backgroundColor: isDarkMode ? "rgba(12,11,16,0.9)" : "rgba(255,255,255,0.95)",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                fontSize: "11px",
                fontWeight: 700,
                zIndex: 4,
              }}
            >
              <span style={{ color: theme.accentRose }}>🔥</span>
              <span>Priya liked your post</span>
            </motion.div>
          </div>
        </section>

        {/* Interactive Sandbox Section (Replaces Bento Grid) */}
        <section id="features" style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "72px 24px 96px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "9999px",
            border: `1px solid ${isDarkMode ? "rgba(16,185,129,0.25)" : "rgba(16,185,129,0.12)"}`,
            backgroundColor: "rgba(16,185,129,0.06)",
            color: theme.accentEmerald,
            fontSize: "12px",
            fontWeight: 650,
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "16px",
          }}>
            Interactive Sandbox
          </div>

          <h2 style={{ fontSize: isMobile ? "32px" : "46px", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: "16px" }}>
            Try Kizuno in 30 Seconds
          </h2>
          <p style={{ fontSize: "17px", color: theme.textSecondary, maxWidth: "600px", lineHeight: 1.6, marginBottom: "48px" }}>
            Experience the core workspace interactions instantly before creating an account.
          </p>

          {/* Sandbox Component container */}
          <div style={{
            width: "100%",
            maxWidth: "840px",
            borderRadius: "24px",
            border: `1px solid ${theme.border}`,
            backgroundColor: isDarkMode ? "#121215" : "#ffffff",
            overflow: "hidden",
            boxShadow: isDarkMode ? "0 20px 40px rgba(0,0,0,0.4)" : "0 20px 40px rgba(15,23,42,0.04)",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Sandbox Tabs */}
            <div style={{
              display: "flex",
              borderBottom: `1px solid ${theme.border}`,
              backgroundColor: isDarkMode ? "#101013" : "#f1f5f9",
            }}>
              {/* Tab 1: Verify Domain */}
              <button
                onClick={() => setActiveSandboxTab("domain")}
                style={{
                  flex: 1,
                  padding: "20px 16px",
                  border: "none",
                  borderBottom: activeSandboxTab === "domain" ? `3px solid ${theme.accentPurple}` : "3px solid transparent",
                  backgroundColor: "transparent",
                  color: activeSandboxTab === "domain" ? theme.textPrimary : theme.textSecondary,
                  fontWeight: 700,
                  fontSize: isMobile ? "13px" : "15px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
              >
                <span>🛡️</span> 1. Verify Domain
              </button>

              {/* Tab 2: Publish Post */}
              <button
                onClick={() => setActiveSandboxTab("post")}
                style={{
                  flex: 1,
                  padding: "20px 16px",
                  border: "none",
                  borderBottom: activeSandboxTab === "post" ? `3px solid ${theme.accentPurple}` : "3px solid transparent",
                  backgroundColor: "transparent",
                  color: activeSandboxTab === "post" ? theme.textPrimary : theme.textSecondary,
                  fontWeight: 700,
                  fontSize: isMobile ? "13px" : "15px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
              >
                <span>🚀</span> 2. Publish Post
              </button>

              {/* Tab 3: Direct Message */}
              <button
                onClick={() => setActiveSandboxTab("chat")}
                style={{
                  flex: 1,
                  padding: "20px 16px",
                  border: "none",
                  borderBottom: activeSandboxTab === "chat" ? `3px solid ${theme.accentPurple}` : "3px solid transparent",
                  backgroundColor: "transparent",
                  color: activeSandboxTab === "chat" ? theme.textPrimary : theme.textSecondary,
                  fontWeight: 700,
                  fontSize: isMobile ? "13px" : "15px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
              >
                <span>💬</span> 3. Direct Message
              </button>
            </div>

            {/* Sandbox Contents */}
            <div style={{
              padding: isMobile ? "24px" : "36px",
              backgroundColor: isDarkMode ? "#13121a" : "#f8fafc",
              textAlign: "left",
              minHeight: "300px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}>
              
              {/* Tab 1 content: Domain Verification */}
              {activeSandboxTab === "domain" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "500px", margin: "0 auto", width: "100%" }}>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px", color: theme.textPrimary, letterSpacing: "-0.5px" }}>Instant Domain Workspace Matcher</h3>
                  <p style={{ fontSize: "14px", color: theme.textSecondary, lineHeight: 1.5, margin: 0 }}>
                    KIZUNO validates student and organization members automatically by email domain. Type your institutional domain (e.g. <span style={{ color: theme.accentPurple }}>student@iitb.ac.in</span> or <span style={{ color: theme.accentPurple }}>bits-pilani.ac.in</span>) to try.
                  </p>
                  
                  <form onSubmit={handleVerifyDomain} style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <input 
                      type="text" 
                      placeholder="student@iitb.ac.in"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: `1px solid ${theme.border}`,
                        backgroundColor: isDarkMode ? "rgba(0,0,0,0.3)" : "#ffffff",
                        color: theme.textPrimary,
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                    <button type="submit" style={{
                      backgroundColor: theme.accentPurple,
                      color: "#ffffff",
                      border: "none",
                      padding: "0 20px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(139,92,246,0.15)",
                    }}>Verify</button>
                  </form>

                  <AnimatePresence mode="wait">
                    {verifiedDomain && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                          padding: "12px 16px",
                          backgroundColor: "rgba(34, 197, 94, 0.08)",
                          border: "1px solid rgba(34, 197, 94, 0.2)",
                          borderRadius: "12px",
                          color: "#22c55e",
                          fontSize: "13px",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "8px",
                        }}
                      >
                        <CheckIcon />
                        {verifiedDomain}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Tab 2 content: Publish Post */}
              {activeSandboxTab === "post" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div style={{ maxWidth: "550px" }}>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px", color: theme.textPrimary, letterSpacing: "-0.5px" }}>Vibrant Feed Publisher</h3>
                    <p style={{ fontSize: "14px", color: theme.textSecondary, lineHeight: 1.5, margin: 0 }}>
                      Type a post and publish it to the local feed simulation below to see how it renders.
                    </p>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!sandboxPostText.trim()) return;
                    const newPost = {
                      author: "Guest User",
                      handle: "@guest",
                      time: "Just now",
                      content: sandboxPostText,
                      likes: 0,
                      hasLiked: false,
                    };
                    setSandboxFeedPosts([newPost, ...sandboxFeedPosts]);
                    setSandboxPostText("");
                    spawnEmoji("🚀");
                  }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <textarea 
                      placeholder="What is happening on your campus?"
                      value={sandboxPostText}
                      onChange={(e) => setSandboxPostText(e.target.value)}
                      style={{
                        width: "100%",
                        minHeight: "80px",
                        padding: "14px",
                        borderRadius: "14px",
                        border: `1px solid ${theme.border}`,
                        backgroundColor: isDarkMode ? "rgba(0,0,0,0.3)" : "#ffffff",
                        color: theme.textPrimary,
                        fontSize: "14px",
                        outline: "none",
                        resize: "none",
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button type="submit" style={{
                        backgroundColor: theme.accentPurple,
                        color: "#ffffff",
                        border: "none",
                        padding: "10px 24px",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(139,92,246,0.15)",
                      }}>Publish Post</button>
                    </div>
                  </form>

                  {/* Simulated Posts list */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: `1px solid ${theme.border}`, paddingTop: "20px" }}>
                    {sandboxFeedPosts.map((post, idx) => (
                      <div 
                        key={idx}
                        style={{
                          backgroundColor: isDarkMode ? "#17161f" : "#ffffff",
                          border: `1px solid ${theme.border}`,
                          borderRadius: "16px",
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `linear-gradient(135deg, ${theme.accentPurple}, ${theme.accentRose})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "bold" }}>G</div>
                          <div>
                            <h4 style={{ fontSize: "13px", fontWeight: 700, margin: 0 }}>{post.author}</h4>
                            <span style={{ fontSize: "10px", color: theme.textSecondary }}>{post.handle} · {post.time}</span>
                          </div>
                        </div>
                        <p style={{ fontSize: "12px", margin: 0, lineHeight: 1.4 }}>{post.content}</p>
                        <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: theme.textSecondary, paddingTop: "8px", borderTop: `1px solid ${theme.border}` }}>
                          <span style={{ cursor: "pointer", fontWeight: 600 }} onClick={() => {
                            const updated = [...sandboxFeedPosts];
                            if (updated[idx].hasLiked) {
                              updated[idx].likes -= 1;
                              updated[idx].hasLiked = false;
                            } else {
                              updated[idx].likes += 1;
                              updated[idx].hasLiked = true;
                              spawnEmoji("❤️");
                            }
                            setSandboxFeedPosts(updated);
                          }}>
                            ❤️ {post.likes} Likes
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3 content: Direct Message Simulator */}
              {activeSandboxTab === "chat" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ textAlign: "center" }}>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 4px", color: theme.textPrimary, letterSpacing: "-0.5px", textAlign: "center" }}>Real-time DM Simulator</h3>
                  </div>

                  {/* Messaging Dialogue view */}
                  <div style={{
                    border: `1px solid ${theme.border}`,
                    borderRadius: "20px",
                    backgroundColor: isDarkMode ? "#17161f" : "#ffffff",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    height: "260px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                  }}>
                    {/* Chat channel title info */}
                    <div style={{
                      padding: "12px 18px",
                      borderBottom: `1px solid ${theme.border}`,
                      backgroundColor: isDarkMode ? "#101013" : "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                        <span style={{ fontSize: "12px", fontWeight: 700 }}>KizunoBot</span>
                      </div>
                      <span style={{ fontSize: "10px", color: theme.textSecondary }}>System socket active</span>
                    </div>

                    {/* Messages history viewport */}
                    <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {chatMessages.map((msg, i) => (
                        <div 
                          key={i} 
                          style={{ 
                            display: "flex", 
                            flexDirection: "column",
                            alignItems: msg.sender === "You" ? "flex-end" : "flex-start",
                            maxWidth: "100%",
                          }}
                        >
                          <span style={{ fontSize: "9px", color: theme.textSecondary, marginBottom: "2px", marginLeft: "4px", marginRight: "4px" }}>
                            {msg.sender}
                          </span>
                          <div style={{ 
                            fontSize: "12px", 
                            backgroundColor: msg.sender === "You" ? theme.accentPurple : (isDarkMode ? "#252233" : "#e2e8f0"),
                            color: msg.sender === "You" ? "#ffffff" : theme.textPrimary,
                            padding: "10px 14px", 
                            borderRadius: msg.sender === "You" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                            maxWidth: "80%",
                            lineHeight: 1.4,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                          }}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Send box form details */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newMessageText.trim()) return;
                        const userMsg = {
                          sender: "You",
                          text: newMessageText,
                          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        setChatMessages(prev => [...prev, userMsg]);
                        setNewMessageText("");
                        spawnEmoji("💬");

                        // Simulate KizunoBot automatic response
                        setTimeout(() => {
                          setChatMessages(prev => [
                            ...prev,
                            {
                              sender: "KizunoBot",
                              text: "Awesome! That works instantly. Go ahead and create your account",
                              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }
                          ]);
                          spawnEmoji("🤖");
                        }, 1000);
                      }} 
                      style={{ 
                        display: "flex", 
                        borderTop: `1px solid ${theme.border}`,
                        padding: "8px",
                        backgroundColor: isDarkMode ? "#101013" : "#f1f5f9",
                        alignItems: "center",
                      }}
                    >
                      <input 
                        type="text" 
                        placeholder="Say hello or ask about workspaces..."
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        style={{
                          flex: 1,
                          border: "none",
                          padding: "10px 14px",
                          fontSize: "12px",
                          outline: "none",
                          backgroundColor: "transparent",
                          color: theme.textPrimary,
                        }}
                      />
                      <button type="submit" style={{
                        backgroundColor: theme.accentPurple,
                        color: "#ffffff",
                        border: "none",
                        fontWeight: 700,
                        padding: "8px 16px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "12px",
                        boxShadow: "0 4px 10px rgba(139,92,246,0.2)",
                      }}>Send</button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* Global Connection Map - Indian Centered */}
        <section id="connections" style={{
          borderTop: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}`,
          backgroundColor: isDarkMode ? "rgba(12, 11, 16, 0.4)" : "rgba(255, 255, 255, 0.5)",
          padding: "96px 24px",
          position: "relative",
          transition: "background-color 0.4s ease, border-color 0.4s ease",
        }}>
          <div style={{
            maxWidth: "1200px",
            margin: "0 auto",
            textAlign: "center",
          }}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ maxWidth: "720px", margin: "0 auto 64px" }}
            >
              <h2 style={{ fontSize: isMobile ? "32px" : "44px", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: "20px" }}>
                Connected India & Global Workspaces
              </h2>
              <p style={{ fontSize: "17px", color: theme.textSecondary, lineHeight: 1.6 }}>
                Based out of active Indian tech hubs, KIZUNO routes messages and feeds securely to developers, students, and creators globally.
              </p>
            </motion.div>

            {/* Custom Interactive SVG Connections Network Map */}
            <div style={{
              width: "100%",
              maxWidth: "840px",
              margin: "0 auto",
              aspectRatio: isMobile ? "4/3" : "2.1/1",
              borderRadius: "28px",
              border: `1px solid ${theme.border}`,
              backgroundColor: isDarkMode ? "rgba(18, 18, 22, 0.4)" : "rgba(255, 255, 255, 0.85)",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 12px 40px rgba(0,0,0,0.03)",
            }}>
              <svg width="100%" height="100%" viewBox="0 0 800 380" style={{ display: "block" }}>
                {/* SVG Connections Paths */}
                {/* Hub links to global nodes */}
                <motion.path 
                  d="M 320 220 L 100 120" // Bangalore to London
                  fill="none" 
                  stroke="url(#purpleGrad)" 
                  strokeWidth="2.5" 
                  strokeDasharray="6 4"
                  animate={{ strokeDashoffset: [0, -100] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />
                <motion.path 
                  d="M 320 220 L 700 100" // Bangalore to Tokyo
                  fill="none" 
                  stroke="url(#purpleGrad)" 
                  strokeWidth="2.5" 
                  strokeDasharray="8 6"
                  animate={{ strokeDashoffset: [0, 100] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <motion.path 
                  d="M 300 180 L 120 240" // Delhi to New York
                  fill="none" 
                  stroke="url(#roseGrad)" 
                  strokeWidth="2" 
                  strokeDasharray="5 5"
                  animate={{ strokeDashoffset: [0, -80] }}
                  transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                />
                <motion.path 
                  d="M 280 200 L 680 280" // Mumbai to Singapore
                  fill="none" 
                  stroke="url(#purpleGrad)" 
                  strokeWidth="2" 
                  strokeDasharray="6 4"
                  animate={{ strokeDashoffset: [0, 100] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />

                {/* Hub links to other Indian hubs */}
                <path d="M 280 200 L 320 220 M 320 220 L 300 180 M 300 180 L 280 200" fill="none" stroke={theme.accentPurple} strokeWidth="1.5" strokeOpacity="0.4" />

                {/* Gradients */}
                <defs>
                  <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={theme.accentPurple} stopOpacity="0.85"/>
                    <stop offset="100%" stopColor={theme.accentRose} stopOpacity="0.85"/>
                  </linearGradient>
                  <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={theme.accentRose} stopOpacity="0.85"/>
                    <stop offset="100%" stopColor={theme.accentPurple} stopOpacity="0.85"/>
                  </linearGradient>
                </defs>

                {/* Central Indian Hubs (Bangalore, Mumbai, Delhi) */}
                <circle cx="320" cy="220" r="16" fill={theme.accentPurple} fillOpacity="0.25" className="animate-pulse" />
                <circle cx="320" cy="220" r="6" fill={theme.accentPurple} />
                
                <circle cx="280" cy="200" r="14" fill={theme.accentRose} fillOpacity="0.25" className="animate-pulse" />
                <circle cx="280" cy="200" r="5" fill={theme.accentRose} />

                <circle cx="300" cy="180" r="14" fill={theme.accentPurple} fillOpacity="0.25" className="animate-pulse" />
                <circle cx="300" cy="180" r="5" fill={theme.accentPurple} />

                {/* Global Remote Nodes */}
                <circle cx="100" cy="120" r="12" fill={theme.accentPurple} fillOpacity="0.15" />
                <circle cx="100" cy="120" r="4.5" fill={theme.accentPurple} />

                <circle cx="700" cy="100" r="12" fill={theme.accentPurple} fillOpacity="0.15" />
                <circle cx="700" cy="100" r="4.5" fill={theme.accentPurple} />

                <circle cx="120" cy="240" r="12" fill={theme.accentRose} fillOpacity="0.15" />
                <circle cx="120" cy="240" r="4.5" fill={theme.accentRose} />

                <circle cx="680" cy="280" r="12" fill={theme.accentRose} fillOpacity="0.15" />
                <circle cx="680" cy="280" r="4.5" fill={theme.accentRose} />
              </svg>

              {/* Float Cards */}
              <div style={{
                position: "absolute",
                left: "28%",
                top: "60%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                borderRadius: "999px",
                backgroundColor: isDarkMode ? "rgba(10,10,10,0.85)" : "rgba(255,255,255,0.9)",
                border: `1px solid ${theme.accentPurple}`,
                boxShadow: `0 4px 12px ${isDarkMode ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.1)"}`,
                fontSize: "12px",
                fontWeight: 700,
              }}>
                <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: theme.accentPurple, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px" }}>B</div>
                <span>Bangalore (HQ Hub)</span>
              </div>

              <div style={{
                position: "absolute",
                left: "3%",
                top: "18%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 10px",
                borderRadius: "999px",
                backgroundColor: isDarkMode ? "rgba(10,10,10,0.8)" : "rgba(255,255,255,0.95)",
                border: `1px solid ${theme.border}`,
                fontSize: "11px",
                fontWeight: 600,
              }}>
                <span>London Node</span>
              </div>

              <div style={{
                position: "absolute",
                right: "4%",
                top: "14%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 10px",
                borderRadius: "999px",
                backgroundColor: isDarkMode ? "rgba(10,10,10,0.8)" : "rgba(255,255,255,0.95)",
                border: `1px solid ${theme.border}`,
                fontSize: "11px",
                fontWeight: 600,
              }}>
                <span>Tokyo Node</span>
              </div>

              <div style={{
                position: "absolute",
                right: "6%",
                bottom: "16%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 10px",
                borderRadius: "999px",
                backgroundColor: isDarkMode ? "rgba(10,10,10,0.8)" : "rgba(255,255,255,0.95)",
                border: `1px solid ${theme.border}`,
                fontSize: "11px",
                fontWeight: 600,
              }}>
                <span>Singapore Node</span>
              </div>
            </div>
          </div>
        </section>

        {/* Accordion FAQ Section */}
        <section id="faq" style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "96px 24px",
        }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: isMobile ? "32px" : "40px", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: "16px" }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: "17px", color: theme.textSecondary }}>
              Answers to common questions about the workspace architecture.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {faqData.map((item, i) => (
              <div 
                key={i} 
                style={{
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: "20px",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
              >
                <button
                  onClick={() => setFaqOpenIndex(faqOpenIndex === i ? null : i)}
                  style={{
                    width: "100%",
                    padding: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "none",
                    border: "none",
                    color: theme.textPrimary,
                    fontSize: "16px",
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <span>{item.question}</span>
                  <ArrowDownIcon isOpen={faqOpenIndex === i} />
                </button>
                <AnimatePresence initial={false}>
                  {faqOpenIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div style={{
                        padding: "0 24px 24px",
                        color: theme.textSecondary,
                        fontSize: "15px",
                        lineHeight: 1.6,
                      }}>
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner Section */}
        <section style={{
          maxWidth: "1200px",
          margin: "0 auto 96px",
          padding: "0 24px",
        }}>
          <div style={{
            position: "relative",
            borderRadius: "44px",
            background: isDarkMode 
              ? "linear-gradient(135deg, #0c0b10 0%, #16151f 100%)" 
              : "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
            border: `1px solid ${theme.border}`,
            padding: isMobile ? "56px 24px" : "80px 48px",
            textAlign: "center",
            overflow: "hidden",
            boxShadow: isDarkMode 
              ? "0 25px 50px rgba(0,0,0,0.5)" 
              : "0 25px 50px rgba(0,0,0,0.03)",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "75%",
              height: "45%",
              background: `radial-gradient(circle, ${isDarkMode ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.04)"} 0%, transparent 65%)`,
              pointerEvents: "none",
            }} />

            <h2 style={{
              fontSize: isMobile ? "34px" : "48px",
              fontWeight: 900,
              letterSpacing: "-1.5px",
              marginBottom: "24px",
              lineHeight: 1.1,
            }}>
              Bring Your Organization<br />To Kizuno Today
            </h2>
            <p style={{
              fontSize: "18px",
              color: theme.textSecondary,
              maxWidth: "580px",
              margin: "0 auto 40px",
              lineHeight: 1.6,
            }}>
              Verify your custom academic, enterprise, or startup domain. Claim your organizational feed and build connected workspaces now.
            </p>

            <div style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "center",
              gap: "18px",
            }}>
              <Link href="/register" style={{
                backgroundColor: isDarkMode ? "#ffffff" : "#0f172a",
                color: isDarkMode ? "#09090b" : "#ffffff",
                padding: "16px 36px",
                borderRadius: "14px",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: 700,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                transition: "opacity 0.2s",
              }} className="hover:opacity-90">
                Create User Profile
              </Link>
              <Link href="/organization/register" style={{
                backgroundColor: theme.accentPurple,
                color: "#ffffff",
                padding: "16px 36px",
                borderRadius: "14px",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: 700,
                boxShadow: `0 4px 12px ${isDarkMode ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.1)"}`,
                transition: "opacity 0.2s",
              }} className="hover:opacity-90">
                Register Workspace
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Premium Footer */}
      <footer style={{
        borderTop: `1px solid ${theme.border}`,
        backgroundColor: isDarkMode ? "rgba(12, 11, 16, 0.75)" : "rgba(248, 250, 252, 0.85)",
        padding: "80px 24px 48px",
        transition: "background-color 0.4s ease, border-color 0.4s ease",
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto 64px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
          gap: "48px",
        }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: `linear-gradient(135deg, ${theme.accentPurple} 0%, ${theme.accentRose} 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#ffffff", fontWeight: 900, fontSize: "16px", fontStyle: "italic", letterSpacing: "-1px" }}>K</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: "20px", letterSpacing: "-0.5px", color: theme.textPrimary }}>KIZUNO</span>
            </div>
            <p style={{ fontSize: "14px", color: theme.textSecondary, lineHeight: 1.65, margin: 0 }}>
              Connecting campuses, enterprises, and communities beyond physical borders.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>Product</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <a href="#features" style={{ color: theme.textSecondary, textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} className="hover:text-[#8b5cf6]">Features</a>
              <a href="#connections" style={{ color: theme.textSecondary, textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} className="hover:text-[#8b5cf6]">Global Networks</a>
              <Link href="/register" style={{ color: theme.textSecondary, textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} className="hover:text-[#8b5cf6]">User Profiles</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>Security</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <a href="#" style={{ color: theme.textSecondary, textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} className="hover:text-[#8b5cf6]">Domain Verification</a>
              <a href="#" style={{ color: theme.textSecondary, textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} className="hover:text-[#8b5cf6]">Data Privacy</a>
              <a href="#" style={{ color: theme.textSecondary, textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} className="hover:text-[#8b5cf6]">Terms of Service</a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>Kizuno Global</h4>
            <p style={{ fontSize: "14px", color: theme.textSecondary, lineHeight: 1.6, marginBottom: "16px", margin: 0 }}>
              Subscribe to global connectivity updates and product releases.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input 
                type="email" 
                placeholder="Email Address" 
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: `1px solid ${theme.border}`,
                  backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "#ffffff",
                  color: theme.textPrimary,
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button style={{
                backgroundColor: theme.accentPurple,
                color: "#ffffff",
                border: "none",
                padding: "0 16px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 650,
                cursor: "pointer",
                transition: "opacity 0.2s",
              }} className="hover:opacity-90">
                Join
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          paddingTop: "32px",
          borderTop: `1px solid ${theme.border}`,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}>
          <p style={{ fontSize: "12px", color: theme.textSecondary, margin: 0 }}>
            © 2026 Kizuno. All rights reserved. Premium Community Network.
          </p>
          <div style={{ display: "flex", gap: "24px" }}>
            <a href="#" style={{ fontSize: "12px", color: theme.textSecondary, textDecoration: "none" }} className="hover:underline">Privacy Policy</a>
            <a href="#" style={{ fontSize: "12px", color: theme.textSecondary, textDecoration: "none" }} className="hover:underline">Terms of Service</a>
            <a href="#" style={{ fontSize: "12px", color: theme.textSecondary, textDecoration: "none" }} className="hover:underline">Cookie Settings</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
