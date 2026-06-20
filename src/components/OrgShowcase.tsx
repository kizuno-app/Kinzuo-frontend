"use client";

import { useQuery } from "@tanstack/react-query";
import { organizationService } from "@/services/organization.service";
import Link from "next/link";
import VerificationBadge from "./VerificationBadge";

export default function OrgShowcase() {
  const { data: orgAccounts = [], isLoading } = useQuery({
    queryKey: ['trending-org-accounts'],
    queryFn: () => organizationService.getTrendingOrganizations(),
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading || orgAccounts.length === 0) return null;

  return (
    <div style={{ marginBottom: "32px", padding: "0 24px" }}>
      <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", marginBottom: "16px" }}>Trending Organizations</h2>
      <div style={{ 
        display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "16px",
        scrollSnapType: "x mandatory", msOverflowStyle: "none", scrollbarWidth: "none" 
      }} className="hide-scrollbar">
        {orgAccounts.map((org: any) => (
          <Link 
            key={org.userId} 
            href={`/profile/${org.userId}`}
            style={{
              minWidth: "280px", maxWidth: "280px", background: "#171717", 
              borderRadius: "20px", padding: "20px", border: "1px solid #262626",
              textDecoration: "none", scrollSnapAlign: "start",
              display: "flex", flexDirection: "column", transition: "transform 0.2s"
            }}
            className="hover:-translate-y-1"
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
              <div className={!org.avatar ? "avatar-gradient" : ""} style={{ width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0, backgroundImage: org.avatar ? `url(${org.avatar})` : undefined, backgroundSize: "cover" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "16px", color: "#fafafa", display: "flex", alignItems: "center" }}>
                  {org.firstName} {org.lastName}
                  {org.verified && <VerificationBadge width={14} height={14} />}
                </div>
                <div style={{ fontSize: "12px", color: "#a1a1aa", marginTop: "2px" }}>@{org.username || `${org.firstName?.toLowerCase() || ''}${org.lastName?.toLowerCase() || ''}`}</div>
              </div>
            </div>
            
            <p style={{ fontSize: "14px", color: "#d4d4d8", lineHeight: 1.4, marginBottom: "16px", flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {org.bio || "Organization account"}
            </p>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #262626" }}>
              <div style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: 500 }}>
                {org.location || ""}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#10b981", fontWeight: 600 }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                Verified
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
