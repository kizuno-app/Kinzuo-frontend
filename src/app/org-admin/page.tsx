"use client";

import AdminLayout from "@/components/AdminLayout";

export default function OrgAdminDashboard() {
  return (
    <AdminLayout portalType="ORGANIZATION" orgName="TechNova Corp">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        
        <div style={{ background: "#171717", padding: "24px", borderRadius: "16px", border: "1px solid #262626" }}>
          <div style={{ color: "#a1a1aa", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>Total Members</div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>320</div>
          <div style={{ fontSize: "13px", color: "#10b981", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            +12 this week
          </div>
        </div>

        <div style={{ background: "#171717", padding: "24px", borderRadius: "16px", border: "1px solid #262626" }}>
          <div style={{ color: "#a1a1aa", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>Posts Published</div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>84</div>
          <div style={{ fontSize: "13px", color: "#a1a1aa", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
            Total active posts
          </div>
        </div>

        <div style={{ background: "#171717", padding: "24px", borderRadius: "16px", border: "1px solid #262626" }}>
          <div style={{ color: "#a1a1aa", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>Network Reach</div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>12.4k</div>
          <div style={{ fontSize: "13px", color: "#10b981", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            +5.2%
          </div>
        </div>

      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div style={{ background: "#171717", borderRadius: "16px", border: "1px solid #262626", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #262626" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fafafa", margin: 0 }}>Recent Members</h2>
          </div>
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#333" }} />
                <div>
                  <div style={{ color: "#fafafa", fontSize: "14px", fontWeight: 600 }}>Jane Doe</div>
                  <div style={{ color: "#a1a1aa", fontSize: "13px" }}>jane.doe@technova.com</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: "12px", color: "#a1a1aa" }}>Today</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#171717", borderRadius: "16px", border: "1px solid #262626", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #262626" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fafafa", margin: 0 }}>Recent Posts</h2>
          </div>
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ paddingBottom: "16px", borderBottom: i < 3 ? "1px solid #262626" : "none", marginBottom: i < 3 ? "0" : "-16px" }}>
                <div style={{ color: "#fafafa", fontSize: "14px", marginBottom: "4px" }}>We are excited to announce our Q3 results and new product lineup...</div>
                <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#a1a1aa" }}>
                  <span>❤️ 42 Likes</span>
                  <span>💬 12 Comments</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
