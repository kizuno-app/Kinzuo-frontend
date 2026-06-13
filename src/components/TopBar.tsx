"use client";

export default function TopBar() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "44px",
        background: "#1a1a1a",
        borderBottom: "1px solid #2a2a2a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        zIndex: 60,
      }}
      className="hidden md:flex"
    >
      {/* Left icons */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "170px" }}>
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            background: "#2a2a2a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#888",
            background: "#2a2a2a",
            padding: "3px 8px",
            borderRadius: "4px",
          }}
        >
          AI
        </span>
      </div>

      {/* Center title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          cursor: "pointer",
        }}
      >
        <span style={{ 
          background: "linear-gradient(90deg, #ff4b4b 0%, #4f46e5 50%, #fbbf24 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: "14px", 
          fontWeight: 700 
        }}>
          KIZUNO
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#777"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Right icons */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "6px",
            background: "#2a2a2a",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="14" y2="12" />
            <line x1="4" y1="18" x2="18" y2="18" />
            <circle cx="18" cy="6" r="2" />
            <circle cx="10" cy="12" r="2" />
            <circle cx="14" cy="18" r="2" />
          </svg>
        </button>
        <button
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            background: "#2563eb",
            border: "none",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Share
        </button>
      </div>
    </header>
  );
}
