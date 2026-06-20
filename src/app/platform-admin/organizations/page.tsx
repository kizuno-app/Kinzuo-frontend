"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/services/api-client";
import AdminLayout from "@/components/AdminLayout";

export default function OrganizationsReviewPage() {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/_sys/x-org-ops/_q/all');
      setApplications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    if (!confirm(`Are you sure you want to ${action} this application?`)) return;
    try {
      await apiClient.post(`/_sys/x-org-ops/_q/${id}/resolve`, { status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' });
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${action} application`);
    }
  };

  const filteredOrgs = applications.filter(app => {
    if (activeTab === "PENDING") return app.status === "PENDING";
    if (activeTab === "ACTIVE") return app.status === "APPROVED";
    if (activeTab === "REJECTED") return app.status === "REJECTED";
    return true;
  });

  return (
    <AdminLayout portalType="PLATFORM">
      <div style={{ display: "flex", gap: "24px", marginBottom: "32px", borderBottom: "1px solid #262626" }}>
        {["PENDING", "ACTIVE", "REJECTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "12px 0", background: "none", border: "none",
              borderBottom: activeTab === tab ? "2px solid #4f46e5" : "2px solid transparent",
              color: activeTab === tab ? "#fafafa" : "#a1a1aa",
              fontSize: "14px", fontWeight: activeTab === tab ? 600 : 500,
              cursor: "pointer", transition: "color 0.2s"
            }}
          >
            {tab} {tab === "PENDING" && `(${applications.filter(a => a.status === 'PENDING').length})`}
          </button>
        ))}
      </div>

      <div style={{ background: "#171717", borderRadius: "16px", border: "1px solid #262626", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #262626", background: "#0a0a0a" }}>
              <th style={{ padding: "16px 24px", color: "#a1a1aa", fontSize: "13px", fontWeight: 500 }}>Organization</th>
              <th style={{ padding: "16px 24px", color: "#a1a1aa", fontSize: "13px", fontWeight: 500 }}>Type</th>
              <th style={{ padding: "16px 24px", color: "#a1a1aa", fontSize: "13px", fontWeight: 500 }}>Domain</th>
              <th style={{ padding: "16px 24px", color: "#a1a1aa", fontSize: "13px", fontWeight: 500 }}>Submitted</th>
              <th style={{ padding: "16px 24px", color: "#a1a1aa", fontSize: "13px", fontWeight: 500, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "#a1a1aa" }}>Loading...</td>
              </tr>
            ) : filteredOrgs.length > 0 ? (
              filteredOrgs.map((org) => (
                <tr key={org.id} style={{ borderBottom: "1px solid #262626", transition: "background 0.2s" }} className="hover:bg-[#222]">
                  <td style={{ padding: "16px 24px", color: "#fafafa", fontWeight: 600, fontSize: "14px" }}>{org.name}</td>
                  <td style={{ padding: "16px 24px", color: "#a1a1aa", fontSize: "14px" }}>{org.type}</td>
                  <td style={{ padding: "16px 24px", color: "#a1a1aa", fontSize: "14px" }}>{org.domains.join(", ")}</td>
                  <td style={{ padding: "16px 24px", color: "#a1a1aa", fontSize: "14px" }}>{new Date(org.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <button 
                      onClick={() => window.location.href = `/platform-admin/organizations/${org.id}`}
                      style={{ background: "#3f3f46", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: 600, fontSize: "13px", cursor: "pointer", marginRight: "8px" }}
                      className="hover:bg-gray-600"
                    >
                      View Details
                    </button>
                    {org.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleAction(org.id, 'APPROVE')} style={{ background: "#10b981", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: 600, fontSize: "13px", marginRight: "8px", cursor: "pointer" }}>Approve</button>
                        <button onClick={() => handleAction(org.id, 'REJECT')} style={{ background: "transparent", color: "#ef4444", border: "1px solid #ef4444", padding: "6px 12px", borderRadius: "6px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "#a1a1aa" }}>No organizations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
