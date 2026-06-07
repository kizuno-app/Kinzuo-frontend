"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { connectSocket, disconnectSocket } = useChatStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router, mounted]);

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, connectSocket, disconnectSocket]);

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
            maxWidth: "500px",
            borderLeft: "1px solid #262626",
            borderRight: "1px solid #262626",
            minHeight: "100vh",
            paddingBottom: "80px"
          }}
        >
          {children}
        </main>

        {/* Right Sidebar */}
        <div style={{ width: "320px", flexShrink: 0 }} className="hidden lg:block">
          <RightSidebar />
        </div>

      </div>
    </div>
  );
}
