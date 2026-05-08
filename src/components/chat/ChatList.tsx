import React from "react";

import type { ApiResponse } from "../../lib/apiResponse";
import axiosInstance from "../../lib/axios";
import socket from "../../lib/socket";
import type { Me } from "../types/me.type";
import type { Chats } from "../types/chat.type";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ChatModel from "./ChatModel";

/* ── Avatar helpers ───────────────────────────────────────── */
const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

const AVATAR_COLORS = [
  "#6c63ff", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6",
];
const avatarColor = (str: string) =>
  AVATAR_COLORS[
    str.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  ];

/* ── ChatListChatBox ──────────────────────────────────────── */
interface ChatListProps {
  chat: Chats;
  me: Me;
  setChats: React.Dispatch<React.SetStateAction<Chats[]>>;
  handleSelectedChat: (chatId: string) => void;
  isSelected: boolean;
}

const ChatListChatBox: React.FC<ChatListProps> = React.memo(
  ({ chat, handleSelectedChat, me, setChats, isSelected }) => {
    const chatName = React.useMemo(() => {
      if (chat.type === "group") {
        return chat.name || "Group";
      } else if (chat.type === "private") {
        return (
          chat.participants.filter(
            (p) => p.userId._id.toString() !== me._id?.toString(),
          )[0]?.userId.fullName ||
          chat.name ||
          "User"
        );
      }
      return "Chat";
    }, [chat.type, chat.name, chat.participants, me]);

    const handleDeleteChat = async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const res = await axiosInstance.delete(`/chats/delete-chat?chatId=${chat._id}`);
        if (res.data.success) {
          setChats((prev) => prev.filter((c) => c._id !== chat._id));
        }
      } catch (err: any) {
        alert(err.response?.data?.message || err.message || "Something went wrong");
      }
    };

    const name = chatName ?? "Chat";
    const color = avatarColor(name);
    const lastMsg = chat?.lastMessage?.text || "No messages yet";
    const hasUnseen = (chat?.unseenCount ?? 0) > 0;

    return (
      <div
        onClick={() => handleSelectedChat(chat._id)}
        className="group flex items-center gap-3 w-full cursor-pointer"
        style={{
          padding: "10px 12px",
          borderRadius: 14,
          background: isSelected ? "var(--accent-dim)" : "transparent",
          border: `1px solid ${isSelected ? "rgba(108,99,255,0.28)" : "transparent"}`,
          transition: "all 0.14s ease",
          marginBottom: 2,
        }}
        onMouseEnter={(e) => {
          if (!isSelected)
            (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
        }}
        onMouseLeave={(e) => {
          if (!isSelected)
            (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 15,
              color: "#fff",
              letterSpacing: "0.03em",
              flexShrink: 0,
            }}
          >
            {getInitials(name)}
          </div>
          {/* Online dot */}
          <div
            style={{
              position: "absolute",
              bottom: 1,
              right: 1,
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: "var(--success)",
              border: "2px solid var(--bg-surface)",
            }}
          />
          {/* Unseen badge */}
          {hasUnseen && (
            <div
              style={{
                position: "absolute",
                top: -3,
                left: -3,
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                background: "var(--accent)",
                boxShadow: "0 0 8px var(--accent-glow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: "#fff",
                padding: "0 4px",
              }}
            >
              {chat.unseenCount}
            </div>
          )}
        </div>

        {/* Text content */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </span>
            {/* Delete - hover only */}
            <button
              onClick={handleDeleteChat}
              title="Delete chat"
              className="group-hover:opacity-100"
              style={{
                opacity: 0,
                flexShrink: 0,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 4,
                borderRadius: 6,
                color: "var(--danger)",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "1";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <span
            style={{
              fontSize: 12.5,
              color: "var(--text-secondary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {lastMsg}
          </span>
        </div>
      </div>
    );
  },
);

/* ── Skeleton rows ────────────────────────────────────────── */
const SkeletonRow = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px" }}>
    <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--bg-elevated)", flexShrink: 0 }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ height: 12, width: "55%", borderRadius: 6, background: "var(--bg-elevated)" }} />
      <div style={{ height: 10, width: "75%", borderRadius: 6, background: "var(--bg-elevated)" }} />
    </div>
  </div>
);

/* ── ChatList ─────────────────────────────────────────────── */
const ChatList: React.FC<{
  me: Me;
  setSelectedChat: React.Dispatch<React.SetStateAction<string>>;
  selectedChat: string;
  mobileOpen?: boolean;
  setMobileOpen?: (v: boolean) => void;
}> = ({ me, setSelectedChat, selectedChat, mobileOpen, setMobileOpen }) => {
  const [newChatModalOpen, setNewChatModalOpen] = React.useState(false);
  const [chatsLoading, setChatsLoading] = React.useState(false);
  const { chats, setChats } = useChat();
  const auth = useAuth();
  const navigate = useNavigate();

  const getChats = async () => {
    setChatsLoading(true);
    try {
      const res = await axiosInstance.get<ApiResponse<Chats[]>>("/chats/get-chats", { timeout: 5000 });
      if (res.data.success) setChats(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to load chats");
    } finally {
      setChatsLoading(false);
    }
  };

  React.useEffect(() => { getChats(); }, []);

  React.useEffect(() => {
    const handler = ({ chatId, updatedChat }: { chatId: string; updatedChat: Chats }) => {
      setChats((prev) => [
        {
          ...prev.find((c) => c._id === chatId),
          ...updatedChat,
          unseenCount: selectedChat === chatId ? 0 : (prev.find((c) => c._id === chatId)?.unseenCount || 0) + 1,
        },
        ...prev.filter((c) => c._id !== chatId),
      ]);
    };
    socket.on("chat-update", handler);
    return () => { socket.off("chat-update", handler); };
  }, [selectedChat, setChats]);

  React.useEffect(() => {
    const handler = ({ chatId, updatedChat }: { chatId: string; updatedChat: Chats }) => {
      setChats((prev) => prev.map((c) => c._id === chatId ? { ...c, ...updatedChat } : c));
    };
    socket.on("message-unsend", handler);
    return () => { socket.off("message-unsend", handler); };
  }, [selectedChat, setChats]);

  const handleSelectedChat = (chatId: string) => {
    setSelectedChat(chatId);
    setChats((prev) => prev.map((c) => c._id === chatId ? { ...c, unseenCount: 0 } : c));
    if (setMobileOpen) setMobileOpen(false);
  };

  const handleLogout = async () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    // Navigate immediately, then sign out in background
    navigate("/signin", { replace: true });
    try {
      await axiosInstance.get("/auth/sign-out");
    } catch (err: any) {
      // ignore network errors here
    } finally {
      auth?.refreshAuth?.();
    }
  };

  const handleSearchChats = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (value.trim() === "") { getChats(); return; }
    try {
      const res = await axiosInstance.get<ApiResponse<Chats[]>>("/chats/search-chats?q=" + value, { timeout: 3000 });
      if (res.data.success) setChats(res.data.data);
    } catch {}
  };

  const myInitials = getInitials(me?.fullName || "U");
  const myColor = avatarColor(me?.fullName || "U");

  // On mobile this panel slides in using transform
  const sidebarStyle: React.CSSProperties = {
    width: 300,
    minWidth: 260,
    maxWidth: 320,
    height: "100vh",
    background: "var(--bg-surface)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    flexShrink: 0,
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen && setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      <aside
        style={{
          ...sidebarStyle,
          position: mobileOpen !== undefined ? "fixed" : "relative",
          left: mobileOpen !== undefined ? (mobileOpen ? 0 : -320) : "auto",
          top: 0,
          zIndex: mobileOpen !== undefined ? 50 : "auto",
          transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: myColor, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14, color: "#fff",
            }}
          >
            {myInitials}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {me?.fullName || "Loading…"}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success)", flexShrink: 0 }} />
              <span style={{ color: "var(--success)", fontSize: 11.5, fontWeight: 500 }}>Online</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              flexShrink: 0, width: 34, height: 34, borderRadius: 10,
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-muted)", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--danger)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(248,113,113,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── Search + New Chat ── */}
        <div style={{ padding: "12px 12px 8px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
          {/* Search */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "9px 14px", borderRadius: 12,
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              onChange={handleSearchChats}
              type="text"
              placeholder="Search conversations…"
              name="search"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "var(--text-primary)", fontSize: 13,
              }}
            />
          </div>

          {/* New Chat button */}
          <button
            id="new-chat-btn"
            onClick={() => setNewChatModalOpen(true)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              width: "100%", padding: "10px 0", borderRadius: 12, border: "none",
              background: "var(--accent)", color: "#fff",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
              boxShadow: "0 0 16px var(--accent-glow)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--accent-light)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px var(--accent-glow)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--accent)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px var(--accent-glow)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="5" y1="12" x2="19" y2="12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            New Chat
          </button>

          {newChatModalOpen && (
            <ChatModel setSelectedChat={setSelectedChat} setNewChatModalOpen={setNewChatModalOpen} />
          )}
        </div>

        {/* ── Nav Tabs ── */}
        <div
          style={{
            display: "flex", gap: 6, padding: "10px 12px",
            borderBottom: "1px solid var(--border)", flexShrink: 0,
          }}
        >
          {["Chats", "Calls", "Groups"].map((tab, i) => (
            <button
              key={tab}
              style={{
                padding: "6px 14px", borderRadius: 9, border: "none",
                background: i === 0 ? "var(--accent-dim)" : "transparent",
                color: i === 0 ? "var(--accent-light)" : "var(--text-secondary)",
                fontWeight: 500, fontSize: 13, cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (i !== 0) (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                if (i !== 0) (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Chat list ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
          {chatsLoading ? (
            <><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
          ) : chats.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 16px", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-muted)" }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>No chats yet.<br />Start a new conversation!</span>
            </div>
          ) : (
            chats.map((chat) => (
              <ChatListChatBox
                key={chat._id}
                setChats={setChats}
                me={me}
                handleSelectedChat={handleSelectedChat}
                chat={chat}
                isSelected={selectedChat === chat._id}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
};

export default React.memo(ChatList);
