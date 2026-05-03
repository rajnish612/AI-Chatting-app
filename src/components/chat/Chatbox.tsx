import React from "react";
import axiosInstance from "../../lib/axios";
import type { ApiResponse } from "../../lib/apiResponse";
import socket from "../../lib/socket";
import type { Participant } from "../types/participant.type";
import type { Me } from "../types/me.type";
import type { Message } from "../types/message.type";
import { useChat } from "../../hooks/useChat";
import MessageCard from "./MessageCard";

const Chatbox: React.FC<{
  selectedChat: string;
  me: Me;
  onMenuClick?: () => void;
}> = ({ selectedChat, me, onMenuClick }) => {
  const [err, setError] = React.useState<string>("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [textMessage, setTextMessage] = React.useState<string>("");
  const [sendingMessage, setSendingMessage] = React.useState<boolean>(false);
  const { setChats } = useChat();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  React.useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      setError("");
      try {
        const res = await axiosInstance.get<ApiResponse<Message[]>>(
          `/message/get-messages?chatId=${selectedChat}`,
        );
        if (res.data.success) setMessages(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to load messages");
      }
    };
    fetchMessages();
  }, [selectedChat]);

  const sendTextMessage = async () => {
    if (!textMessage.trim() || sendingMessage) return;
    const draft = textMessage;
    setSendingMessage(true);
    setTextMessage("");
    if (inputRef.current) inputRef.current.value = "";
    try {
      const res = await axiosInstance.post("/message/send/text-message", {
        chatId: selectedChat,
        message: draft,
      });
      if (res.data.success) {
        socket.emit("send-message", { message: res.data.data, chatId: selectedChat });
        setChats((prev) =>
          prev.map((c) =>
            c._id === selectedChat ? { ...c, lastMessage: res.data.data, unseenCount: 0 } : c,
          ),
        );
        setMessages((prev) => [...prev, res.data.data]);
      }
    } catch (err) {
      console.log("send error", err);
    } finally {
      setSendingMessage(false);
    }
  };

  const updateLastSeen = React.useCallback(async () => {
    try {
      await axiosInstance.patch<ApiResponse<string>>(
        `/chats/update-lastseen?chatId=${selectedChat}`,
      );
    } catch {}
  }, [selectedChat]);

  React.useEffect(() => {
    if (selectedChat) socket.emit("join-chat", { chatId: selectedChat });
  }, [selectedChat]);

  React.useEffect(() => {
    const handler = ({ message }: { message: Message }) => {
      updateLastSeen();
      setMessages((prev) => [...prev, message]);
    };
    socket.on("receive-message", handler);
    return () => { socket.off("receive-message", handler); };
  }, [updateLastSeen]);

  React.useEffect(() => {
    const handler = ({ userId, lastSeen }: { userId: string; lastSeen: Date }) => {
      if (!selectedChat) return;
      setParticipants((prev) =>
        prev.map((p) =>
          p.userId._id.toString() === userId ? { ...p, lastSeen } : { ...p },
        ),
      );
    };
    socket.on("message-seen", handler);
    return () => { socket.off("message-seen", handler); };
  }, [selectedChat]);

  React.useEffect(() => {
    if (selectedChat) updateLastSeen();
  }, [updateLastSeen, selectedChat]);

  React.useEffect(() => {
    const getParticipants = async () => {
      if (!selectedChat) return;
      try {
        const res = await axiosInstance.get<ApiResponse<Participant[]>>(
          `/chats/get-participants?chatId=${selectedChat}`,
        );
        if (res.data.success) setParticipants(res.data.data);
      } catch (err: any) {
        console.log("participants err", err?.response?.data);
      }
    };
    getParticipants();
  }, [selectedChat]);

  React.useEffect(() => {
    const handler = ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };
    socket.on("message-unsent", handler);
    return () => { socket.off("message-unsent", handler); };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  /* ── Empty / no chat selected ── */
  if (!selectedChat) {
    return (
      <div
        style={{
          flex: 1, height: "100%", display: "flex", flexDirection: "column",
          background: "var(--bg-base)",
        }}
      >
        {/* Mobile top bar */}
        <div
          className="flex md:hidden"
          style={{
            padding: "14px 16px",
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border)",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <button
            onClick={onMenuClick}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-secondary)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Nexus Chat</span>
        </div>

        {/* Empty state */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 72, height: 72, borderRadius: 22,
                background: "var(--accent-dim)",
                border: "1px solid rgba(108,99,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent-light)" }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)", marginBottom: 8 }}>
                Your Messages
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: 13.5, lineHeight: 1.6, maxWidth: 240 }}>
                Select a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-base)", overflow: "hidden" }}>

      {/* ── Chat Header ── */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 20px",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        {/* Hamburger on mobile */}
        <button
          className="flex md:hidden"
          onClick={onMenuClick}
          style={{
            width: 34, height: 34, borderRadius: 9,
            background: "var(--bg-elevated)", border: "1px solid var(--border)",
            alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--text-secondary)", flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Avatar */}
        <div
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "var(--accent)", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 14, color: "#fff", flexShrink: 0,
          }}
        >
          C
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>Chat</span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success)", flexShrink: 0 }} />
            <span style={{ color: "var(--success)", fontSize: 11.5, fontWeight: 500 }}>Online</span>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "var(--bg-base)",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "16px 20px",
            flexGrow: 1,
          }}
        >
          {err && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 16px", borderRadius: 12, margin: "0 auto",
              background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
              color: "var(--danger)", fontSize: 13, maxWidth: 380,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {err}
            </div>
          )}

          {messages.length === 0 && !err && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, marginTop: 24 }}>
              No messages yet. Say hello! 👋
            </div>
          )}

          {messages.map((message, idx) => (
            <MessageCard
              setMessages={setMessages}
              participants={participants}
              key={idx}
              message={message}
              me={me}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Composer ── */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px",
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            flex: 1, display: "flex", alignItems: "center", gap: 12,
            padding: "11px 16px", borderRadius: 16,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-active)",
          }}
        >
          <input
            ref={inputRef}
            onChange={(e) => setTextMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Type a message…"
            name="message"
            style={{
              flex: 1, background: "transparent", border: "none",
              outline: "none", color: "var(--text-primary)", fontSize: 14,
            }}
          />
        </div>

        <button
          id="send-message-btn"
          disabled={sendingMessage}
          onClick={sendTextMessage}
          style={{
            width: 46, height: 46, borderRadius: 14, border: "none",
            background: sendingMessage ? "var(--text-muted)" : "var(--accent)",
            boxShadow: sendingMessage ? "none" : "0 0 16px var(--accent-glow)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: sendingMessage ? "not-allowed" : "pointer",
            flexShrink: 0, transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!sendingMessage) {
              (e.currentTarget as HTMLElement).style.background = "var(--accent-light)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px var(--accent-glow)";
            }
          }}
          onMouseLeave={(e) => {
            if (!sendingMessage) {
              (e.currentTarget as HTMLElement).style.background = "var(--accent)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px var(--accent-glow)";
            }
          }}
        >
          {sendingMessage ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: "white" }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <line x1="22" y1="2" x2="11" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default React.memo(Chatbox);
