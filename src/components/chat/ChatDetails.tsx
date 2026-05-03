import React from "react";

const ChatDetails: React.FC = () => {
  return (
    <div
      style={{
        width: 260,
        minWidth: 220,
        height: "100vh",
        background: "var(--bg-surface)",
        borderLeft: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
          Details
        </span>
      </div>

      {/* Contact info skeleton */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          padding: "28px 20px 20px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            background: "var(--bg-elevated)",
            border: "2px solid var(--border-active)",
            flexShrink: 0,
          }}
        />
        {/* Name line */}
        <div style={{ height: 13, width: "60%", borderRadius: 8, background: "var(--bg-elevated)" }} />
        {/* Status line */}
        <div style={{ height: 10, width: "40%", borderRadius: 8, background: "var(--bg-elevated)" }} />
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "20px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {[
          {
            label: "Call",
            path: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12 19.79 19.79 0 0 1 1.08 3.35 2 2 0 0 1 3.07 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
          },
          {
            label: "Video",
            path: "M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.89L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z",
          },
          {
            label: "More",
            path: "M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0",
          },
        ].map(({ label, path }) => (
          <button
            key={label}
            title={label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              padding: "10px 14px",
              borderRadius: 12,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              color: "var(--text-secondary)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--accent-dim)";
              (e.currentTarget as HTMLElement).style.color = "var(--accent-light)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(108,99,255,0.3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d={path} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 10.5, fontWeight: 500 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Shared media section heading */}
      <div style={{ padding: "16px 20px 8px" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Shared Media
        </span>
      </div>

      {/* Empty media grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 4,
          padding: "0 20px",
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              aspectRatio: "1",
              borderRadius: 8,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatDetails;
