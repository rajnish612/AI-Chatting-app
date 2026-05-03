import React from "react";
import type { Me } from "../types/me.type";
import type { Participant } from "../types/participant.type";
import type { Message } from "../types/message.type";
import axiosInstance from "../../lib/axios";

interface Props {
  participants: Participant[];
  me: Me;
  message: Message;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const MessageCard: React.FC<Props> = ({ me, message, participants, setMessages }) => {
  const filteredParticipants = participants.filter(
    (p) => p.userId._id != me._id,
  );
  const isSeen = filteredParticipants.some(
    (p) => p.lastSeen >= message.createdAt,
  );

  const handleUnsendMessage = async () => {
    try {
      const res = await axiosInstance.post(`/message/unsend?_id=${message._id}`);
      if (res.data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== message._id));
      }
    } catch (err: any) {
      console.error("Unsend error:", err?.response);
    }
  };

  const isOwn = me._id == message.senderId;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isOwn ? "flex-end" : "flex-start",
        width: "100%",
        marginBottom: 4,
        animation: "fadeSlideUp 0.22s ease both",
      }}
    >
      {/* Bubble */}
      <div
        style={{
          maxWidth: "65%",
          padding: "10px 14px",
          borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isOwn ? "var(--bubble-out)" : "var(--bubble-in)",
          color: isOwn ? "var(--bubble-out-txt)" : "var(--bubble-in-txt)",
          fontSize: 14,
          lineHeight: 1.55,
          wordBreak: "break-word",
          boxShadow: isOwn
            ? "0 2px 12px rgba(108,99,255,0.28)"
            : "0 1px 4px rgba(0,0,0,0.3)",
          position: "relative",
        }}
      >
        <span style={{ display: "block" }}>{message.text}</span>

        {/* Seen ticks for own messages */}
        {isOwn && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 5,
              gap: 1,
            }}
          >
            {isSeen ? (
              /* Double tick — seen */
              <svg width="18" height="11" viewBox="0 0 18 11" fill="none">
                <path d="M1 5.5l3.5 3.5L11 2" stroke="rgba(255,255,255,0.55)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 5.5l3.5 3.5L16 2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              /* Single tick — sent */
              <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
                <path d="M1 5.5l3.5 3.5L11.5 2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Unsend button — only for own messages, shown on hover */}
      {isOwn && (
        <button
          onClick={handleUnsendMessage}
          style={{
            marginTop: 4,
            padding: "3px 10px",
            borderRadius: 8,
            border: "1px solid rgba(248,113,113,0.25)",
            background: "rgba(248,113,113,0.08)",
            color: "var(--danger)",
            fontSize: 11,
            fontWeight: 500,
            cursor: "pointer",
            opacity: 0,
            transition: "opacity 0.18s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0")}
          onFocus={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          onBlur={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0")}
        >
          Unsend
        </button>
      )}
    </div>
  );
};

export default React.memo(MessageCard);
