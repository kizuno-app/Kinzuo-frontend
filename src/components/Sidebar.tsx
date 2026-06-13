"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { apiClient } from "@/services/api-client";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "#fafafa" : "none"} stroke={active ? "#fafafa" : "#a1a1aa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    label: "Discover",
    href: "/discover",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#fafafa" : "#a1a1aa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={active ? "#fafafa" : "none"} />
      </svg>
    ),
  },
  {
    label: "Create",
    href: "/create",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#fafafa" : "#a1a1aa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "#fafafa" : "none"} stroke={active ? "#fafafa" : "#a1a1aa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
  {
    label: "Chats",
    href: "/chats",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#fafafa" : "#a1a1aa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#fafafa" : "#a1a1aa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

import { useNotificationStore } from "@/store/notification.store";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await apiClient.delete('/users/me');
        logout();
        router.push("/register");
      } catch (err) {
        alert("Failed to delete account");
      }
    }
  };

  return (
    <>
      <aside
        style={{
          width: "240px",
          height: "100vh",
          position: "sticky",
          top: 0,
          flexDirection: "column",
          padding: "24px 24px 24px 0",
        }}
        className="hidden md:flex shrink-0"
      >
        <div style={{ padding: "0 16px 32px" }}>
          <span style={{ 
            background: "linear-gradient(90deg, #ff4b4b 0%, #4f46e5 50%, #fbbf24 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "22px", 
            fontWeight: 800, 
            letterSpacing: "-0.5px" 
          }}>
            KIZUNO
          </span>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isNotification = item.label === "Notifications";
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "12px 16px",
                  color: isActive ? "#fafafa" : "#a1a1aa",
                  textDecoration: "none",
                  background: isActive ? "#262626" : "transparent",
                  borderRadius: "12px",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "15px",
                  transition: "background 0.2s ease",
                  position: "relative",
                }}
              >
                <div style={{ position: "relative" }}>
                  {item.icon(isActive)}
                  {isNotification && unreadCount > 0 && (
                    <div style={{
                      position: "absolute",
                      top: "-2px",
                      right: "-2px",
                      background: "#ef4444",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: "bold",
                      height: "16px",
                      minWidth: "16px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                      border: "2px solid #0a0a0a"
                    }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                </div>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ position: "relative", marginTop: "auto", paddingTop: "24px" }}>
          {showSettings && (
            <div style={{
              position: "absolute",
              bottom: "100%",
              left: "0",
              marginBottom: "8px",
              width: "200px",
              background: "#171717",
              border: "1px solid #262626",
              borderRadius: "12px",
              padding: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
              zIndex: 50
            }}>
              <button 
                onClick={handleLogout}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  width: "100%", padding: "10px 12px", background: "transparent",
                  border: "none", borderRadius: "8px", color: "#fafafa",
                  fontSize: "14px", fontWeight: 500, cursor: "pointer", textAlign: "left",
                  transition: "background 0.2s"
                }}
                className="hover:bg-[#262626]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
              <button 
                onClick={handleDeleteAccount}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  width: "100%", padding: "10px 12px", background: "transparent",
                  border: "none", borderRadius: "8px", color: "#ef4444",
                  fontSize: "14px", fontWeight: 500, cursor: "pointer", textAlign: "left",
                  transition: "background 0.2s"
                }}
                className="hover:bg-[#451a1a]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Delete Account
              </button>
            </div>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              display: "flex", alignItems: "center", gap: "16px",
              width: "100%", padding: "12px 16px", background: "transparent",
              border: "none", borderRadius: "12px", color: "#a1a1aa",
              fontSize: "15px", fontWeight: 500, cursor: "pointer",
              transition: "background 0.2s, color 0.2s"
            }}
            className="hover:bg-[#262626] hover:text-[#fafafa]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Settings
          </button>
        </div>
      </aside>

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#0a0a0a",
          borderTop: "1px solid #262626",
          justifyContent: "space-around",
          padding: "12px 0 24px",
          zIndex: 100,
        }}
        className="flex md:hidden"
      >
        {navItems.filter(item => item.label !== "Notifications").map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                color: isActive ? "#fafafa" : "#71717a",
                textDecoration: "none",
                fontSize: "11px",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {item.icon(isActive)}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
