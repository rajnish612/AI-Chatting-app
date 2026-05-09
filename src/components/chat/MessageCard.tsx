import React from "react";
import type { Me } from "../types/me.type";
import type { Participant } from "../types/participant.type";
import type { Message } from "../types/message.type";

interface Props {
  participants: Participant[];
  me: Me;
  message: Message;
  onUnsendMessage?: (messageId: string) => Promise<void> | void;
  unsendingMessageId?: string | null;
}

const MessageCard: React.FC<Props> = ({
  me,
  message,
  participants,
  onUnsendMessage,
  unsendingMessageId,
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const filteredParticipants = participants.filter(
    (p) => p.userId._id != me._id,
  );
  const isSeen = filteredParticipants.some(
    (p) => p.lastSeen >= message.createdAt,
  );

  const isOwn = me._id == message.senderId;
  const isUnsending = unsendingMessageId === message._id;

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
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
          padding: message.type === "image" ? "0" : "10px 14px",
          borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: message.type === "image" ? "transparent" : (isOwn ? "var(--bubble-out)" : "var(--bubble-in)"),
          color: isOwn ? "var(--bubble-out-txt)" : "var(--bubble-in-txt)",
          fontSize: 14,
          lineHeight: 1.55,
          wordBreak: "break-word",
          boxShadow: message.type === "image" ? "none" : (isOwn
            ? "0 2px 12px rgba(108,99,255,0.28)"
            : "0 1px 4px rgba(0,0,0,0.3)"),
          position: "relative",
          overflow: "hidden",
        }}
      >
        {message.type === "image" ? (
          <img
            src={message.image}
            alt="Message"
            style={{
              width: "100%",
              height: "auto",
              maxWidth: 280,
              maxHeight: 350,
              borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              display: "block",
              boxShadow: isOwn
                ? "0 2px 12px rgba(108,99,255,0.28)"
                : "0 1px 4px rgba(0,0,0,0.3)",
            }}
          />
        ) : (
          <>
            <span style={{ display: "block" }}>{message.text}</span>

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
                  <svg width="18" height="11" viewBox="0 0 18 11" fill="none">
                    <path d="M1 5.5l3.5 3.5L11 2" stroke="rgba(255,255,255,0.55)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 5.5l3.5 3.5L16 2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
                    <path d="M1 5.5l3.5 3.5L11.5 2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Unsend button — only for own messages, shown on hover */}
      {isOwn && (
        <button
          onClick={() => onUnsendMessage?.(message._id)}
          disabled={isUnsending}
          title="Unsend message"
          style={{
            marginTop: 4,
            padding: "3px 10px",
            borderRadius: 8,
            border: "1px solid rgba(248,113,113,0.25)",
            background: "rgba(248,113,113,0.08)",
            color: "var(--danger)",
            fontSize: 11,
            fontWeight: 500,
            cursor: isUnsending ? "not-allowed" : "pointer",
            opacity: isUnsending ? 0.6 : showActions ? 1 : 0,
            transition: "opacity 0.18s",
          }}
        >
          {isUnsending ? "Deleting..." : "Unsend"}
        </button>
      )}
    </div>
  );
};

export default React.memo(MessageCard);
