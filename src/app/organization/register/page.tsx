"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useOrgRegistrationStore } from "@/store/org-registration.store";
import { useAuthStore } from "@/store/auth.store";
import { apiClient } from "@/services/api-client";
import { profileService } from "@/services/profile.service";
import Link from "next/link";

export default function OrganizationRegistrationPage() {
  const router = useRouter();
  const state = useOrgRegistrationStore();
  const { isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [success, setSuccess] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await profileService.uploadImage(formData, "avatar");
      state.setField("logoUrl", res.data.url);
    } catch (err) {
      alert("Failed to upload logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append("image", file); // We use avatar type for file upload via existing API
      const res = await profileService.uploadImage(formData, "avatar");
      state.setField("proofFileUrl", res.data.url);
    } catch (err) {
      alert("Failed to upload proof document.");
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSubmit = async () => {
    if (!state.reviewed) {
      alert("Please confirm you have reviewed the details before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real scenario, handle file uploads to S3 first here

      const payload = {
        name: state.name,
        type: state.type,
        description: state.description,
        website: state.website,
        officialEmail: state.officialEmail,
        location: state.location,
        domains: state.domains,
        applicantName: state.adminName,
        applicantPhone: state.adminPhone,
        orgAccountUsername: state.orgAccountUsername,
        orgAccountName: state.orgAccountName,
        logoUrl: state.logoUrl,
        proofFileUrl: state.proofFileUrl,
        expectedUsers: state.expectedUsers ? Number(state.expectedUsers) : undefined,
      };

      await apiClient.post("/organizations/apply", payload);
      setSuccess(true);
      state.reset();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit organization registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (state.currentStep) {
      case 1:
        return isAuthenticated;
      case 2:
        return !!state.adminName && !!state.officialEmail && !!state.proofFileUrl;
      case 3:
        return !!state.name && !!state.type && !!state.logoUrl;
      case 4:
        return state.domains.length > 0 && !!state.expectedUsers && !!state.orgAccountUsername && !!state.orgAccountName;
      case 5:
        return state.reviewed;
      default:
        return false;
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ maxWidth: "500px", width: "100%", backgroundColor: "#171717", padding: "40px", borderRadius: "24px", border: "1px solid #262626", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", backgroundColor: "#10b981", borderRadius: "32px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#fafafa", marginBottom: "16px" }}>Application Submitted!</h2>
          <p style={{ color: "#a1a1aa", lineHeight: 1.5, marginBottom: "32px" }}>
            Thank you for registering your organization. Our team will review your application shortly.
            You will receive an email at <strong>{state.officialEmail}</strong> once approved.
          </p>
          <Link href="/" style={{ display: "inline-block", backgroundColor: "#fafafa", color: "#0a0a0a", padding: "12px 24px", borderRadius: "9999px", textDecoration: "none", fontWeight: 600 }}>
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#fafafa", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ padding: "16px 24px", borderBottom: "1px solid #262626", display: "flex", alignItems: "center" }}>
        <Link href="/" style={{ color: "#a1a1aa", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", fontWeight: 500 }} className="hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back
        </Link>
        <div style={{ flex: 1, textAlign: "center", fontWeight: 600, fontSize: "16px" }}>Organization Registration</div>
        <div style={{ width: "65px" }}></div>
      </header>

      <main style={{ flex: 1, display: "flex", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
        <div style={{ maxWidth: "640px", width: "100%" }}>

          {/* Step Indicator */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            {[1, 2, 3, 4, 5].map(step => (
              <div key={step} style={{
                flex: 1, height: "4px", borderRadius: "2px",
                backgroundColor: state.currentStep >= step ? "#fafafa" : "#262626",
                transition: "background-color 0.3s"
              }} />
            ))}
          </div>

          <div style={{ backgroundColor: "#0a0a0a", padding: "0" }}>

            {/* Step 1: Pre-requisite info */}
            {state.currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 20px", background: "#121212", borderRadius: "20px", border: "1px solid #262626" }}>
                  <div style={{ width: "56px", height: "56px", backgroundColor: "rgba(245, 166, 35, 0.1)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </div>
                  <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px", textAlign: "center" }}>Before we begin...</h2>
                  <div style={{ color: "#a1a1aa", marginBottom: "0", fontSize: "14px", lineHeight: 1.6, textAlign: "center", maxWidth: "480px" }}>
                    <p style={{ marginBottom: "12px" }}>
                      To register your organization, you must first create a standard user account with the organization name, which will later be promoted to an organization account once approved. <strong>Please note that the username and account name of your account will be needed for verification.</strong>
                    </p>
                    <p>
                      If you haven't created the account yet, please register, complete the onboarding, and then return to this page<strong> without logging out </strong> to complete your organization application.
                    </p>
                  </div>

                  {!isAuthenticated && (
                    <div style={{ marginTop: "24px", padding: "12px 16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      <span style={{ fontSize: "13px", color: "#fca5a5", fontWeight: 500, textAlign: "left" }}>
                        You must be logged in to proceed. Please <Link href="/login" style={{ color: "#fafafa", textDecoration: "underline", fontWeight: 600 }}>Log In</Link> first.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Administrator Details */}
            {state.currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Administrator Details</h2>
                <p style={{ color: "#a1a1aa", marginBottom: "24px", fontSize: "14px" }}>Who is applying for this organization registration?</p>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Personal Details</h3>
                </div>

                <div style={{ padding: "20px", background: "#121212", borderRadius: "16px", border: "1px solid #262626", display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px", color: "#e4e4e7" }}>Full Name *</label>
                      <input type="text" value={state.adminName} onChange={(e) => state.setField("adminName", e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #3f3f46", background: "#0a0a0a", color: "#fafafa", outline: "none", transition: "border-color 0.2s", fontSize: "14px" }}
                        className="focus:border-emerald-500"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px", color: "#e4e4e7" }}>Phone Number</label>
                      <input type="text" value={state.adminPhone} onChange={(e) => state.setField("adminPhone", e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #3f3f46", background: "#0a0a0a", color: "#fafafa", outline: "none", transition: "border-color 0.2s", fontSize: "14px" }}
                        className="focus:border-emerald-500"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px", color: "#e4e4e7" }}>Active Email ID *</label>
                    <input type="email" value={state.officialEmail} onChange={(e) => state.setField("officialEmail", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #3f3f46", background: "#0a0a0a", color: "#fafafa", outline: "none", transition: "border-color 0.2s", fontSize: "14px" }}
                      className="focus:border-emerald-500"
                      placeholder="jane.doe@stanford.edu"
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Proof of Affiliation *</h3>
                </div>

                <div
                  onClick={() => proofInputRef.current?.click()}
                  style={{ padding: "24px", background: "#121212", borderRadius: "16px", border: "1px dashed #3f3f46", textAlign: "center", transition: "border-color 0.2s", opacity: uploadingProof ? 0.5 : 1 }}
                  className="hover:border-emerald-500 cursor-pointer"
                >
                  {state.proofFileUrl ? (
                    <div style={{ color: "#10b981", fontWeight: 600 }}>Document Uploaded Successfully ✓</div>
                  ) : (
                    <>
                      <div style={{ width: "40px", height: "40px", background: "#0a0a0a", borderRadius: "20px", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #262626" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={uploadingProof ? "#10b981" : "#a1a1aa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "#fafafa", marginBottom: "6px" }}>
                        {uploadingProof ? "Uploading..." : "Click to upload document"}
                      </div>
                      <p style={{ fontSize: "12px", color: "#71717a", maxWidth: "300px", margin: "0 auto", lineHeight: 1.5 }}>Upload your Organization ID card, an official letter, or a screenshot of your internal dashboard.</p>
                    </>
                  )}
                </div>
                <input type="file" ref={proofInputRef} onChange={handleProofUpload} accept="image/*,.pdf" style={{ display: "none" }} />
              </div>
            )}

            {/* Step 3: Organization Details */}
            {state.currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Organization Details</h2>
                <p style={{ color: "#a1a1aa", marginBottom: "24px", fontSize: "14px" }}>Tell us about the network you are creating.</p>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(56, 189, 248, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Core Identity</h3>
                </div>

                <div style={{ padding: "20px", background: "#121212", borderRadius: "16px", border: "1px solid #262626", display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      style={{ width: "80px", height: "80px", borderRadius: "20px", border: "1px dashed #3f3f46", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: uploadingLogo ? "wait" : "pointer", transition: "border-color 0.2s", flexShrink: 0, overflow: "hidden", opacity: uploadingLogo ? 0.5 : 1 }}
                      className="hover:border-sky-400"
                    >
                      {state.logoUrl ? (
                        <img src={state.logoUrl} alt="Logo preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "6px" }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                          <span style={{ fontSize: "11px", color: "#a1a1aa", fontWeight: 500 }}>{uploadingLogo ? "..." : "Logo *"}</span>
                        </>
                      )}
                    </div>
                    <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" style={{ display: "none" }} />

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px", color: "#e4e4e7" }}>Organization Name *</label>
                        <input type="text" value={state.name} onChange={(e) => state.setField("name", e.target.value)}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #3f3f46", background: "#0a0a0a", color: "#fafafa", outline: "none", transition: "border-color 0.2s", fontSize: "14px" }}
                          className="focus:border-sky-500"
                          placeholder="e.g. Stanford University"
                        />
                      </div>
                      <div style={{ display: "flex", gap: "16px" }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px", color: "#e4e4e7" }}>Type *</label>
                          <select value={state.type} onChange={(e) => state.setField("type", e.target.value)}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #3f3f46", background: "#0a0a0a", color: "#fafafa", outline: "none", appearance: "none", transition: "border-color 0.2s", fontSize: "14px" }}
                            className="focus:border-sky-500"
                          >
                            <option value="UNIVERSITY">University / College</option>
                            <option value="COMPANY">Company / Startup</option>
                            <option value="NGO">Non-Profit / NGO</option>
                            <option value="COMMUNITY">Community</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px", color: "#e4e4e7" }}>Location</label>
                          <input type="text" value={state.location} onChange={(e) => state.setField("location", e.target.value)}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #3f3f46", background: "#0a0a0a", color: "#fafafa", outline: "none", transition: "border-color 0.2s", fontSize: "14px" }}
                            className="focus:border-sky-500"
                            placeholder="Stanford, CA"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px", color: "#e4e4e7" }}>Website URL</label>
                    <input type="url" value={state.website} onChange={(e) => state.setField("website", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #3f3f46", background: "#0a0a0a", color: "#fafafa", outline: "none", transition: "border-color 0.2s", fontSize: "14px" }}
                      className="focus:border-sky-500"
                      placeholder="https://stanford.edu"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px", color: "#e4e4e7" }}>Short Description</label>
                    <textarea value={state.description} onChange={(e) => state.setField("description", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #3f3f46", background: "#0a0a0a", color: "#fafafa", outline: "none", minHeight: "80px", resize: "none", transition: "border-color 0.2s", fontSize: "14px" }}
                      className="focus:border-sky-500"
                      placeholder="A short bio about your organization..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Administration & Access */}
            {state.currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Administration & Access</h2>
                <p style={{ color: "#a1a1aa", marginBottom: "24px", fontSize: "14px" }}>Set up your platform administrator and configure network access.</p>

                {/* Section 1: Administrator Link */}
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(245, 166, 35, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Platform Administrator Link</h3>
                  </div>
                  <div style={{ padding: "20px", background: "#121212", borderRadius: "16px", border: "1px solid #262626" }}>
                    <p style={{ fontSize: "13px", color: "#a1a1aa", marginBottom: "16px", lineHeight: 1.5 }}>
                      Please provide the details of the user account that will be designated as the primary Platform Administrator for this organization.
                    </p>
                    <div style={{ display: "flex", gap: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px", color: "#e4e4e7" }}>Admin Account Name *</label>
                        <input type="text" value={state.orgAccountName} onChange={(e) => state.setField("orgAccountName", e.target.value)}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #3f3f46", background: "#0a0a0a", color: "#fafafa", outline: "none", transition: "border-color 0.2s", fontSize: "14px" }}
                          className="focus:border-indigo-500"
                          placeholder="e.g. TechNova Admin"
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px", color: "#e4e4e7" }}>Admin Account Username *</label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#71717a", fontWeight: 500, fontSize: "14px" }}>@</span>
                          <input type="text" value={state.orgAccountUsername} onChange={(e) => state.setField("orgAccountUsername", e.target.value)}
                            style={{ width: "100%", padding: "10px 14px 10px 30px", borderRadius: "10px", border: "1px solid #3f3f46", background: "#0a0a0a", color: "#fafafa", outline: "none", transition: "border-color 0.2s", fontSize: "14px" }}
                            className="focus:border-indigo-500"
                            placeholder="technova_admin"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Network Configuration */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(79, 70, 229, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Network Access & Scale</h3>
                  </div>

                  <div style={{ padding: "20px", background: "#121212", borderRadius: "16px", border: "1px solid #262626", display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px", color: "#e4e4e7" }}>Approved Email Domains *</label>
                      <p style={{ fontSize: "12px", color: "#71717a", marginBottom: "12px", lineHeight: 1.5 }}>Users who register with these email domains will bypass manual approval and automatically join your organization's private network.</p>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                        <div style={{ position: "relative", flex: 1 }}>
                          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#71717a", fontWeight: 500, fontSize: "14px" }}>@</span>
                          <input type="text" value={domainInput} onChange={(e) => setDomainInput(e.target.value)}
                            style={{ width: "100%", padding: "10px 14px 10px 30px", borderRadius: "10px", border: "1px solid #3f3f46", background: "#0a0a0a", color: "#fafafa", outline: "none", transition: "border-color 0.2s", fontSize: "14px" }}
                            className="focus:border-indigo-500"
                            placeholder="students.university.edu"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (domainInput && !state.domains.includes(domainInput)) {
                                  state.addDomain(domainInput.toLowerCase());
                                  setDomainInput("");
                                }
                              }
                            }}
                          />
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (domainInput && !state.domains.includes(domainInput)) {
                              state.addDomain(domainInput.toLowerCase());
                              setDomainInput("");
                            }
                          }}
                          style={{ background: "#fafafa", color: "#0a0a0a", border: "none", padding: "0 16px", borderRadius: "10px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s", fontSize: "13px" }}
                          className="hover:bg-gray-200"
                        >
                          Add Domain
                        </button>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {state.domains.length === 0 ? (
                          <div style={{ width: "100%", padding: "12px", textAlign: "center", color: "#71717a", border: "1px dashed #3f3f46", borderRadius: "10px", fontSize: "13px" }}>No domains added yet.</div>
                        ) : (
                          state.domains.map(d => (
                            <div key={d} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", background: "rgba(79, 70, 229, 0.1)", border: "1px solid rgba(79, 70, 229, 0.2)", borderRadius: "999px", color: "#e0e7ff" }}>
                              <span style={{ fontWeight: 500, fontSize: "13px" }}>@{d}</span>
                              <button onClick={() => state.removeDomain(d)} style={{ background: "none", border: "none", color: "#818cf8", cursor: "pointer", display: "flex", padding: 0 }} className="hover:text-indigo-300">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px", color: "#e4e4e7" }}>Expected Number of Members *</label>
                      <p style={{ fontSize: "12px", color: "#71717a", marginBottom: "12px", lineHeight: 1.5 }}>Help us prepare the right infrastructure and caching policies for your network size.</p>
                      <input type="number" value={state.expectedUsers} onChange={(e) => state.setField("expectedUsers", e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #3f3f46", background: "#0a0a0a", color: "#fafafa", outline: "none", transition: "border-color 0.2s", fontSize: "14px" }}
                        className="focus:border-indigo-500"
                        placeholder="e.g. 5000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {state.currentStep === 5 && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Review Application</h2>
                <p style={{ color: "#a1a1aa", marginBottom: "24px", fontSize: "14px" }}>Please verify your application dossier before submitting.</p>

                {/* Premium PDF Report Style Container */}
                <div style={{
                  background: "#ffffff",
                  color: "#1e293b",
                  borderRadius: "4px",
                  padding: "32px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1)",
                  marginBottom: "24px",
                  fontFamily: "'Inter', sans-serif",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  {/* Subtle Background Watermark */}
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-45deg)", fontSize: "80px", fontWeight: 900, color: "rgba(0,0,0,0.03)", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none", zIndex: 0 }}>
                    KIZUNO OFFICIAL
                  </div>

                  <div style={{ position: "relative", zIndex: 1 }}>
                    {/* Document Letterhead */}
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
                        <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>REF: APP-{new Date().getFullYear()}-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</div>
                        <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace", marginTop: "2px" }}>DATE: {new Date().toLocaleDateString()}</div>
                      </div>
                    </div>

                    {/* Section: Applicant Details */}
                    <div style={{ marginBottom: "24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", marginBottom: "12px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px" }}>1. Applicant Details</div>
                        <button onClick={() => state.setField("currentStep", 2)} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: "11px", fontWeight: 600, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.5px" }} className="hover:underline">Edit</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Full Name</div>
                          <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{state.adminName || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Contact Email</div>
                          <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{state.officialEmail || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Phone Number</div>
                          <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{state.adminPhone || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Proof of Affiliation</div>
                          <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{state.proofFileUrl ? "Provided ✓" : "Not Provided"}</div>
                        </div>
                      </div>
                    </div>

                    {/* Section: Organization Identity */}
                    <div style={{ marginBottom: "24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", marginBottom: "12px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px" }}>2. Organization Identity</div>
                        <button onClick={() => state.setField("currentStep", 3)} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: "11px", fontWeight: 600, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.5px" }} className="hover:underline">Edit</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Organization Name</div>
                          <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 600 }}>{state.name || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Entity Type</div>
                          <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{state.type || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Location</div>
                          <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{state.location || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Website URL</div>
                          <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{state.website || "—"}</div>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Short Description</div>
                          <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500, lineHeight: 1.5 }}>{state.description || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Organization Logo</div>
                          <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{state.logoUrl ? "Provided ✓" : "Not Provided"}</div>
                        </div>
                      </div>
                    </div>

                    {/* Section: Platform Linkage */}
                    <div style={{ marginBottom: "24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", marginBottom: "12px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px" }}>3. Platform Linkage</div>
                        <button onClick={() => state.setField("currentStep", 4)} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: "11px", fontWeight: 600, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.5px" }} className="hover:underline">Edit</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Admin Account Name</div>
                          <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{state.orgAccountName || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Admin Username</div>
                          <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500, fontFamily: "monospace", padding: "2px 6px", background: "#f1f5f9", borderRadius: "4px", display: "inline-block" }}>{state.orgAccountUsername ? `@${state.orgAccountUsername}` : "—"}</div>
                        </div>
                      </div>
                    </div>

                    {/* Section: Network Access */}
                    <div style={{ marginBottom: "32px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", marginBottom: "12px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px" }}>4. Network Access</div>
                        <button onClick={() => state.setField("currentStep", 4)} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: "11px", fontWeight: 600, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.5px" }} className="hover:underline">Edit</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "6px" }}>Approved Email Domains</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {state.domains.length > 0 ? state.domains.map(d => (
                              <div key={d} style={{ fontSize: "12px", padding: "2px 8px", background: "#f1f5f9", color: "#334155", borderRadius: "4px", border: "1px solid #e2e8f0", fontFamily: "monospace", fontWeight: 500 }}>
                                @{d}
                              </div>
                            )) : <span style={{ color: "#94a3b8", fontSize: "12px" }}>None added</span>}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>Expected Users</div>
                          <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{state.expectedUsers || "—"}</div>
                        </div>
                      </div>
                    </div>

                    {/* Document Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #0f172a", paddingTop: "12px", fontSize: "9px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>
                      <div>System Generated Document // Highly Confidential</div>
                      <div>&copy; {new Date().getFullYear()} Kizuno Inc.</div>
                    </div>
                  </div>
                </div>

                <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", background: state.reviewed ? "rgba(16, 185, 129, 0.05)" : "#121212", padding: "16px", borderRadius: "12px", border: `1px solid ${state.reviewed ? "rgba(16, 185, 129, 0.3)" : "#262626"}`, transition: "all 0.2s" }} className={!state.reviewed ? "hover:border-gray-600" : ""}>
                  <input
                    type="checkbox"
                    checked={state.reviewed}
                    onChange={(e) => state.setField("reviewed", e.target.checked)}
                    style={{ marginTop: "2px", width: "18px", height: "18px", accentColor: "#10b981", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "13px", color: state.reviewed ? "#fafafa" : "#a1a1aa", lineHeight: 1.5, fontWeight: state.reviewed ? 500 : 400 }}>
                    I have reviewed the application dossier above. I certify that all information provided is accurate and I am authorized to register this organization on the Kizuno platform.
                  </span>
                </label>
              </div>
            )}

            {/* Navigation Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #262626" }}>
              <button
                onClick={state.prevStep}
                disabled={state.currentStep === 1 || isSubmitting}
                style={{
                  background: "transparent", border: "1px solid #3f3f46", color: state.currentStep === 1 ? "#3f3f46" : "#fafafa",
                  padding: "10px 24px", borderRadius: "9999px", fontWeight: 600, cursor: state.currentStep === 1 ? "not-allowed" : "pointer",
                  transition: "all 0.2s", fontSize: "14px"
                }}
                className={state.currentStep > 1 ? "hover:border-gray-400 hover:text-white" : ""}
              >
                Back
              </button>

              {state.currentStep < 5 ? (
                <button
                  onClick={state.nextStep}
                  disabled={!isStepValid()}
                  style={{
                    background: !isStepValid() ? "#262626" : "#fafafa",
                    color: !isStepValid() ? "#71717a" : "#0a0a0a", border: "none",
                    padding: "10px 24px", borderRadius: "9999px", fontWeight: 600, cursor: !isStepValid() ? "not-allowed" : "pointer",
                    transition: "all 0.2s", fontSize: "14px"
                  }}
                  className={isStepValid() ? "hover:bg-gray-200" : ""}
                >
                  {state.currentStep === 1 ? "Continue" : "Next Step"}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!state.reviewed || isSubmitting}
                  style={{
                    background: (!state.reviewed || isSubmitting) ? "#262626" : "#10b981",
                    color: (!state.reviewed || isSubmitting) ? "#71717a" : "#ffffff", border: "none",
                    padding: "10px 24px", borderRadius: "9999px", fontWeight: 600, cursor: (!state.reviewed || isSubmitting) ? "wait" : "pointer",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: "8px", fontSize: "14px"
                  }}
                  className={state.reviewed && !isSubmitting ? "hover:bg-emerald-600 shadow-lg shadow-emerald-500/20" : ""}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                  {!isSubmitting && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
                </button>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
