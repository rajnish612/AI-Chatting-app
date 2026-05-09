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
