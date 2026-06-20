interface OrgContextChipProps {
  org: {
    id: string;
    name: string;
  };
}

export default function OrgContextChip({ org }: OrgContextChipProps) {
  if (!org) return null;

  return (
    <div style={{ marginBottom: "4px", display: "flex", alignItems: "center" }}>
      <span 
        style={{ 
          display: "inline-flex", alignItems: "center", gap: "4px",
          color: "#a1a1aa", fontSize: "12px", fontWeight: 600,
          background: "#262626",
          padding: "2px 8px", borderRadius: "4px"
        }}
      >
        <span style={{ fontSize: "10px" }}>🏛</span>
        {org.name}
      </span>
    </div>
  );
}
