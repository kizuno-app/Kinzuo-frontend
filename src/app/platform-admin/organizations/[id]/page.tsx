"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/services/api-client";
import AdminLayout from "@/components/AdminLayout";
import Link from "next/link";

export default function OrganizationReviewDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      // In PlatformAdminController listApplications we have /_sys/x-org-ops/_q/all 
      // Need an endpoint for specific ID if it exists, or just filter from all.
      const res = await apiClient.get('/_sys/x-org-ops/_q/all');
      const found = res.data.data.find((a: any) => a.id === id);
      setApp(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!confirm(`Are you sure you want to ${action} this application?`)) return;
    try {
      await apiClient.post(`/_sys/x-org-ops/_q/${id}/resolve`, { status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' });
      alert(`Application ${action.toLowerCase()} successfully`);
      router.push('/platform-admin/organizations');
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${action} application`);
    }
  };

  if (loading) {
    return (
      <AdminLayout portalType="PLATFORM">
        <div style={{ color: "#a1a1aa", padding: "40px", textAlign: "center" }}>Loading dossier...</div>
      </AdminLayout>
    );
  }

  if (!app) {
    return (
      <AdminLayout portalType="PLATFORM">
        <div style={{ color: "#a1a1aa", padding: "40px", textAlign: "center" }}>Application not found.</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout portalType="PLATFORM">
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center" }}>
        <Link href="/platform-admin/organizations" style={{ color: "#a1a1aa", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", fontWeight: 500 }} className="hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Applications
        </Link>
      </div>

      <div style={{ 
        background: "#ffffff", 
        color: "#1e293b", 
        borderRadius: "4px", 
        padding: "40px", 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1)", 
        marginBottom: "24px",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
        maxWidth: "800px",
        margin: "0 auto 40px"
      }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-45deg)", fontSize: "80px", fontWeight: 900, color: "rgba(0,0,0,0.03)", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none", zIndex: 0 }}>
          KIZUNO OFFICIAL
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #0f172a", paddingBottom: "16px", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", background: "#0f172a", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px", color: "#0f172a" }}>KIZUNO</div>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600 }}>Enterprise Network Solutions</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "2px" }}>Application Dossier</div>
              <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>ID: {app.id.substring(0, 8).toUpperCase()}</div>
              <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace", marginTop: "2px" }}>DATE: {new Date(app.createdAt || app.submittedAt || Date.now()).toLocaleDateString()}</div>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", marginBottom: "12px" }}>
              1. Applicant Details
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Full Name</div>
                <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{app.applicantName || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Contact Email</div>
                <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{app.officialEmail || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Phone Number</div>
                <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{app.applicantPhone || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Proof of Affiliation</div>
                <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{app.proofFileUrl ? "Provided ✓" : "Not Provided"}</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", marginBottom: "12px" }}>
              2. Organization Identity
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Organization Name</div>
                <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 600 }}>{app.name || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Entity Type</div>
                <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{app.type || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Location</div>
                <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{app.location || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Website URL</div>
                <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{app.website || "—"}</div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Short Description</div>
                <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500, lineHeight: 1.5 }}>{app.description || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Organization Logo</div>
                {app.logoUrl ? (
                  <img src={app.logoUrl} alt="Logo" style={{ width: "64px", height: "64px", borderRadius: "12px", border: "1px solid #e2e8f0", objectFit: "cover", marginTop: "4px" }} />
                ) : (
                  <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>Not Provided</div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", marginBottom: "12px" }}>
              3. Platform Linkage
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Admin Account Name</div>
                <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{app.orgAccountName || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Admin Username</div>
                <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500, fontFamily: "monospace", padding: "2px 6px", background: "#f1f5f9", borderRadius: "4px", display: "inline-block" }}>{app.orgAccountUsername ? `@${app.orgAccountUsername}` : "—"}</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", marginBottom: "12px" }}>
              4. Network Access
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "6px" }}>Approved Email Domains</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {app.domains && app.domains.length > 0 ? app.domains.map((d: string) => (
                    <div key={d} style={{ fontSize: "12px", padding: "2px 8px", background: "#f1f5f9", color: "#334155", borderRadius: "4px", border: "1px solid #e2e8f0", fontFamily: "monospace", fontWeight: 500 }}>
                      @{d}
                    </div>
                  )) : <span style={{ color: "#94a3b8", fontSize: "12px" }}>None added</span>}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Expected Users</div>
                <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{app.expectedUsers || "—"}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #0f172a", paddingTop: "12px", fontSize: "9px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>
            <div>System Generated Document // Highly Confidential</div>
            <div>&copy; {new Date().getFullYear()} Kizuno Inc.</div>
          </div>
        </div>
      </div>

      {app.status === 'PENDING' && (
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", gap: "16px", justifyContent: "center" }}>
          <button 
            onClick={() => handleAction('APPROVE')} 
            style={{ 
              background: "#10b981", color: "#fff", border: "none", 
              padding: "16px 32px", borderRadius: "12px", fontWeight: 700, fontSize: "16px", 
              cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.4)",
              transition: "transform 0.1s"
            }}
            className="hover:scale-105 active:scale-95"
          >
            Approve Organization
          </button>
          <button 
            onClick={() => handleAction('REJECT')} 
            style={{ 
              background: "transparent", color: "#ef4444", border: "2px solid #ef4444", 
              padding: "16px 32px", borderRadius: "12px", fontWeight: 700, fontSize: "16px", 
              cursor: "pointer", transition: "all 0.1s"
            }}
            className="hover:bg-red-50 hover:text-red-600 active:scale-95"
          >
            Reject Application
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
