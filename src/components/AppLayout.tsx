"use client";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import { useNotificationStore } from "@/store/notification.store";
import Sidebar, { MobileNav } from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { authService } from "@/services/auth.service";

import NotificationsPanel from "@/components/NotificationsPanel";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const { socket, connectSocket, disconnectSocket } = useChatStore();
  const { fetchUnreadCount, incrementUnreadCount, isDrawerOpen, closeDrawer } = useNotificationStore();
  const [mounted, setMounted] = useState(false);

  const isChatsRoute = pathname.startsWith("/chats");

  useEffect(() => {
    if (isAuthenticated) {
      authService.getMe()
        .then((res) => {
          if (res.status === 'success' && res.data?.user) {
            updateUser(res.data.user);
          }
        })
        .catch((err) => {
          if (err?.code !== 'ERR_NETWORK') {
            console.error("Failed to sync current user session:", err);
          }
        });
    }
  }, [isAuthenticated, updateUser]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated) {
        if (pathname !== "/") {
          router.push("/");
        }
      } else if (user && !user.emailVerified) {
        if (pathname !== "/verify-email") {
          router.push("/verify-email");
        }
      } else if (user && !user.onboardingCompleted) {
        if (pathname !== "/onboarding") {
          router.push("/onboarding");
        }
      }
    }
  }, [isAuthenticated, user, router, mounted, pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
      fetchUnreadCount();
    } else {
      disconnectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, connectSocket, disconnectSocket, fetchUnreadCount]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (notificationPayload: any) => {
        incrementUnreadCount();
        
        // Push real-time notification directly into the React Query cache
        if (notificationPayload) {
          queryClient.setQueryData(['notifications'], (oldData: any) => {
            if (!oldData) return [notificationPayload];
            // Prevent duplicates
            if (oldData.find((n: any) => n.id === notificationPayload.id)) return oldData;
            return [notificationPayload, ...oldData];
          });
        }
      };
      
      socket.on('new_notification', handleNewNotification);
      
      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [socket, incrementUnreadCount, queryClient]);

  const needsVerification = user && !user.emailVerified;
  const needsOnboarding = user && !user.onboardingCompleted;

  if (!mounted || !isAuthenticated || (needsVerification && pathname !== "/verify-email") || (needsOnboarding && pathname !== "/onboarding")) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", minHeight: "100vh", background: "#0a0a0a" }}>
      <div 
        className={isChatsRoute ? "pl-0 md:pl-6 pr-0" : "px-0 md:px-6"}
        style={{ display: "flex", width: "100%", maxWidth: isChatsRoute ? "100%" : "1400px", justifyContent: "space-between" }}
      >
        
        {/* Left Sidebar (Desktop Only) */}
        <div 
          className="hidden md:block"
          style={{ marginLeft: isChatsRoute ? "max(0px, calc(50vw - 700px))" : "0px", height: "100%" }}
        >
          <Sidebar />
        </div>

        {/* Center Main Content */}
        <main
          className={`md:border-l border-[#262626] ${!isChatsRoute ? "md:border-r" : ""}`}
          style={{
            flex: 1,
            minWidth: 0,
            maxWidth: isChatsRoute ? "100%" : "600px",
            borderRight: isChatsRoute ? "none" : "1px solid #262626",
            minHeight: "100vh",
            paddingBottom: isChatsRoute ? "0px" : "80px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {user && !user.emailVerified && (
            <div style={{
              background: "linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)",
              borderBottom: "1px solid rgba(124, 58, 237, 0.2)",
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              position: "sticky",
              top: 0,
              zIndex: 50,
              backdropFilter: "blur(12px)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "16px" }}>✉️</span>
                <span style={{ color: "#cbd5e1", fontSize: "13px", fontWeight: 500 }}>
                  Please verify your email address to secure your account.
                </span>
              </div>
              <button
                onClick={async () => {
                  try {
                    await authService.resendVerification(user.email);
                    alert("Verification code sent! Check your inbox.");
                  } catch (err: any) {
                    alert(err.response?.data?.message || "Failed to resend verification email");
                  }
                }}
                style={{
                  background: "#7c3aed",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "opacity 0.2s"
                }}
              >
                Resend Email
              </button>
            </div>
          )}
          {children}
        </main>

        {/* Right Sidebar */}
        {!isChatsRoute && (
          <div style={{ width: "320px", flexShrink: 0 }} className="hidden lg:block">
            <RightSidebar />
          </div>
        )}

      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Mobile Notifications Drawer */}
      <div 
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "400px",
          background: "#0a0a0a",
          zIndex: 200,
          transform: isDrawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "-10px 0 25px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto"
        }}
        className="md:hidden"
      >
        <NotificationsPanel onClose={() => closeDrawer()} />
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          onClick={() => closeDrawer()}
          className="md:hidden"
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 199
          }}
        />
      )}
    </div>
  );
}
