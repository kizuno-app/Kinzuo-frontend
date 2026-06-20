"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useEffect, useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
  portalType: "PLATFORM" | "ORGANIZATION";
  orgName?: string;
}

export default function AdminLayout({ children, portalType, orgName }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (portalType === "PLATFORM" && user?.role !== "PLATFORM_ADMIN") {
      router.push("/discover"); // Redirect normal users away
    }

    if (portalType === "ORGANIZATION" && user?.role !== "ORGANIZATION_ADMIN") {
      router.push("/discover");
    }
  }, [isMounted, isAuthenticated, user, portalType, router, pathname]);

  // If not mounted, not authenticated or wrong role, don't render to prevent UI flicker
  if (!isMounted || !isAuthenticated || (portalType === "PLATFORM" && user?.role !== "PLATFORM_ADMIN") || (portalType === "ORGANIZATION" && user?.role !== "ORGANIZATION_ADMIN")) {
    return null;
  }

  const platformNav = [
    { label: "Dashboard", href: "/platform-admin" },
    { label: "Organizations", href: "/platform-admin/organizations" },
    { label: "Moderation Queue", href: "/platform-admin/reports" },
  ];

  const orgNav = [
    { label: "Dashboard", href: "/org-admin" },
  ];

  const navItems = portalType === "PLATFORM" ? platformNav : orgNav;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#fafafa" }}>
      {/* Sidebar */}
      <aside style={{ 
        width: "260px", backgroundColor: "#171717", borderRight: "1px solid #262626", 
        display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" 
      }}>
        <div style={{ padding: "24px" }}>
          <div style={{ 
            background: "linear-gradient(90deg, #4f46e5 0%, #d4af37 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px",
            marginBottom: "4px"
          }}>
            KIZUNO
          </div>
          <div style={{ fontSize: "12px", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>
            {portalType === "PLATFORM" ? "Platform Admin" : `${orgName} Admin`}
          </div>
        </div>

        <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", padding: "12px 16px",
                  borderRadius: "12px", textDecoration: "none",
                  color: isActive ? "#fafafa" : "#a1a1aa",
                  background: isActive ? "#262626" : "transparent",
                  fontWeight: isActive ? 600 : 500,
                  transition: "background 0.2s"
                }}
                className="hover:bg-[#262626]"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "24px" }}>
          <Link 
            href="/"
            style={{
              display: "flex", alignItems: "center", gap: "8px", color: "#a1a1aa", 
              textDecoration: "none", fontSize: "14px", fontWeight: 500
            }}
            className="hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Exit Portal
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <header style={{ 
          height: "72px", borderBottom: "1px solid #262626", display: "flex", 
          alignItems: "center", justifyContent: "space-between", padding: "0 32px",
          backgroundColor: "#0a0a0a"
        }}>
          <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#fafafa", margin: 0 }}>
            {navItems.find(n => n.href === pathname)?.label || "Portal"}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#262626", border: "1px solid #3f3f46" }} />
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
