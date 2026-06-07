const suggestedUsers = [
  { name: "Alex Chen", dept: "CS • Junior", interests: "AI, Coding", avatarClass: "avatar-gradient" },
  { name: "Sarah Kim", dept: "Design • Senior", interests: "UX, Art", avatarClass: "avatar-gradient-2" },
  { name: "Michael Ross", dept: "Business • Sophomore", interests: "Startups, Gym", avatarClass: "avatar-gradient-3" },
];

const trendingCircles = [
  { name: "Gym Buddies", emoji: "🏋", members: "234 members" },
  { name: "Coding Club", emoji: "💻", members: "189 members" },
  { name: "Design Community", emoji: "🎨", members: "156 members" },
];

export default function RightSidebar() {
  return (
    <aside
      style={{
        width: "320px",
        height: "100vh",
        position: "sticky",
        top: 0,
        padding: "24px 0 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
      }}
    >
      <section>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa", marginBottom: "16px" }}>
          Suggested for you
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {suggestedUsers.map((user) => (
            <div key={user.name} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "12px", transition: "background 0.2s cursor-pointer", cursor: "pointer" }} className="hover:bg-[#171717]">
              <div
                className={user.avatarClass}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    bottom: "0",
                    right: "0",
                    width: "10px",
                    height: "10px",
                    background: "#22c55e",
                    borderRadius: "50%",
                    border: "2px solid #0a0a0a",
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#fafafa", lineHeight: 1.2 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: "12px", color: "#a1a1aa", marginTop: "2px" }}>{user.dept}</div>
                <div style={{ fontSize: "12px", color: "#71717a", marginTop: "1px" }}>{user.interests}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa", marginBottom: "16px" }}>
          Trending Circles
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {trendingCircles.map((circle) => (
            <div key={circle.name} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "12px", transition: "background 0.2s cursor-pointer", cursor: "pointer" }} className="hover:bg-[#171717]">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#1f1f22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#fafafa", lineHeight: 1.2 }}>
                  <span style={{ marginRight: "6px" }}>{circle.emoji}</span> {circle.name}
                </div>
                <div style={{ fontSize: "12px", color: "#71717a", marginTop: "2px" }}>{circle.members}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
