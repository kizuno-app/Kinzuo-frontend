"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import { useNotificationStore } from "@/store/notification.store";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const { socket, connectSocket, disconnectSocket } = useChatStore();
  const { fetchUnreadCount, incrementUnreadCount } = useNotificationStore();
  const [mounted, setMounted] = useState(false);

  const isChatsRoute = pathname.startsWith("/chats");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user && !user.onboardingCompleted) {
        if (window.location.pathname !== "/onboarding") {
          router.push("/onboarding");
        }
      }
    }
  }, [isAuthenticated, user, router, mounted]);

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

  useEffect(() => {
    if (socket) {
      const handleNewNotification = () => {
        incrementUnreadCount();
      };
      
      socket.on('new_notification', handleNewNotification);
      
      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [socket, incrementUnreadCount]);

  if (!mounted || !isAuthenticated) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", minHeight: "100vh", background: "#0a0a0a" }}>
      <div style={{ display: "flex", width: "100%", maxWidth: "1400px", justifyContent: "space-between", padding: "0 24px" }}>
        
        {/* Left Sidebar (handles its own responsive display) */}
        <Sidebar />

        {/* Center Main Content */}
        <main
          style={{
            flex: 1,
            maxWidth: isChatsRoute ? "100%" : "550px",
            borderLeft: "1px solid #262626",
            borderRight: isChatsRoute ? "none" : "1px solid #262626",
            minHeight: "100vh",
            paddingBottom: "80px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </main>

        {/* Right Sidebar */}
        {!isChatsRoute && (
          <div style={{ width: "320px", flexShrink: 0 }} className="hidden lg:block">
            <RightSidebar />
          </div>
        )}

      </div>
    </div>
  );
}
