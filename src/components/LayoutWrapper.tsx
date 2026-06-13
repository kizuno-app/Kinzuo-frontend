"use client";

import { usePathname } from "next/navigation";
import AppLayout from "./AppLayout";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // List of routes that should NOT have the sidebar/bottom bar
  const noLayoutRoutes = ["/login", "/register", "/onboarding"];
  
  // Also check if pathname starts with any of the noLayoutRoutes
  // just in case they have sub-routes
  if (noLayoutRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
}
