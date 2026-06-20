"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import AppLayout from "./AppLayout";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  
  // List of routes that should NOT have the sidebar/bottom bar
  const noLayoutRoutes = ["/login", "/register", "/onboarding", "/welcome", "/organization", "/org-admin", "/platform-admin", "/verify-email", "/forgot-password", "/reset-password", "/otp", "/share"];
  
  // Root route "/" for guests should not render the AppLayout (sidebar)
  const isGuestRoot = pathname === "/" && !isAuthenticated;

  // Also check if pathname starts with any of the noLayoutRoutes
  // just in case they have sub-routes
  if (isGuestRoot || noLayoutRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
}
