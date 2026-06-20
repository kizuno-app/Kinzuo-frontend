"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { platformAdminService } from "@/services/platform-admin.service";

export default function PlatformAdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await platformAdminService.getMetrics();
        setMetrics(response.data.data);
      } catch (err) {
        console.error("Failed to fetch metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <AdminLayout portalType="PLATFORM">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        
        <div style={{ background: "#171717", padding: "24px", borderRadius: "16px", border: "1px solid #262626" }}>
          <div style={{ color: "#a1a1aa", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>Total Users</div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>
            {loading ? "..." : (metrics?.totalUsers?.toLocaleString() || "0")}
          </div>
          <div style={{ fontSize: "13px", color: "#10b981", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            Up to date
          </div>
        </div>

        <div style={{ background: "#171717", padding: "24px", borderRadius: "16px", border: "1px solid #262626" }}>
          <div style={{ color: "#a1a1aa", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>Active Organizations</div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "#fafafa", marginBottom: "8px" }}>
            {loading ? "..." : (metrics?.activeOrganizations?.toLocaleString() || "0")}
          </div>
          <div style={{ fontSize: "13px", color: "#10b981", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            Up to date
          </div>
        </div>

        <div style={{ background: "#171717", padding: "24px", borderRadius: "16px", border: "1px solid #262626" }}>
          <div style={{ color: "#a1a1aa", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>Pending Approvals</div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: loading ? "#fafafa" : (metrics?.pendingApprovals > 0 ? "#eab308" : "#10b981"), marginBottom: "8px" }}>
            {loading ? "..." : (metrics?.pendingApprovals || "0")}
          </div>
          <div style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: 500 }}>
            {metrics?.pendingApprovals > 0 ? "Requires review" : "All caught up"}
          </div>
        </div>

      </div>

      <div style={{ background: "#171717", borderRadius: "16px", border: "1px solid #262626", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #262626" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fafafa", margin: 0 }}>Recent Activity</h2>
        </div>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {loading ? (
            <div style={{ color: "#a1a1aa", fontSize: "14px" }}>Loading activity...</div>
          ) : metrics?.recentActivity?.length > 0 ? (
            metrics.recentActivity.map((activity: any) => (
              <div key={activity.id} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: activity.status === 'APPROVED' ? "#10b981" : "#ef4444", marginTop: "6px" }} />
                <div>
                  <div style={{ color: "#fafafa", fontSize: "15px", marginBottom: "4px" }}>
                    Organization <span style={{ fontWeight: 600 }}>{activity.name}</span> was <span style={{ color: activity.status === 'APPROVED' ? "#10b981" : "#ef4444" }}>{activity.status.toLowerCase()}</span>.
                  </div>
                  <div style={{ color: "#a1a1aa", fontSize: "13px" }}>
                    {new Date(activity.reviewedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: "#a1a1aa", fontSize: "14px" }}>No recent activity to display.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
