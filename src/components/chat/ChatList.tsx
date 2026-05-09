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

type ChatWithOptionalMedia = Chats & { profilePic?: string };

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error as { response?: { data?: { message?: string } } };
    return response.response?.data?.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return (parts[0][0] || "").toUpperCase();
  const first = parts[0][0] || "";
  const last = parts[parts.length - 1][0] || "";
  return (first + last).toUpperCase();
};

const AVATAR_COLORS = [
  "#6c63ff", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6",
];
const avatarColor = (str: string) =>
  AVATAR_COLORS[
    str.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  ];

interface ChatListProps {
  chat: Chats;
  me: Me;
  onlineUserIds: Set<string>;
  setChats: React.Dispatch<React.SetStateAction<Chats[]>>;
  handleSelectedChat: (chatId: string) => void;
  handleDeleteChat: (chatId: string) => void;
  deletingChatId: string | null;
  isSelected: boolean;
}

const ChatListChatBox: React.FC<ChatListProps> = React.memo(
  ({ chat, handleSelectedChat, handleDeleteChat, deletingChatId, me, onlineUserIds, isSelected }) => {
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

    const handleDeleteClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      handleDeleteChat(chat._id);
    };

    const name = chatName ?? "Chat";
    const color = avatarColor(name);
    const lastMessageObj = chat.lastMessage;
    let lastMsg = "No messages yet";
    if (lastMessageObj) {
      if (lastMessageObj.text && lastMessageObj.text.trim() !== "") {
        lastMsg = lastMessageObj.text;
      } else if (lastMessageObj.type === "image") {
        lastMsg = "Image";
      } else if (lastMessageObj.type === "video") {
        lastMsg = "Video";
      } else if (lastMessageObj.type === "audio") {
        lastMsg = "Audio";
      } else {
        lastMsg = "Message";
      }
    }
    const hasUnseen = (chat?.unseenCount ?? 0) > 0;
    const otherParticipant =
      chat.type === "private"
        ? chat.participants.find((p) => p.userId._id.toString() !== me._id?.toString())
        : undefined;
    const isOnline = otherParticipant
      ? onlineUserIds.has(otherParticipant.userId._id.toString())
      : false;

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
              overflow: "hidden",
            }}
          >
            {(() => {
              const avatarUrl = chat.type === "private"
                ? chat.participants.find((p) => p.userId._id.toString() !== me._id?.toString())?.userId?.profilePic
                : (chat as ChatWithOptionalMedia).profilePic;
              if (avatarUrl) {
                return (
                  <img src={avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                );
              }
              return getInitials(name);
            })()}
          </div>
          {isOnline && (
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
          )}
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
            <button
              onClick={handleDeleteClick}
              title="Delete chat"
              className="group-hover:opacity-100"
              style={{
                opacity: deletingChatId === chat._id ? 0.7 : 0,
                flexShrink: 0,
                background: "transparent",
                border: "none",
                cursor: deletingChatId === chat._id ? "not-allowed" : "pointer",
                padding: 4,
                borderRadius: 6,
                color: "var(--danger)",
                transition: "opacity 0.15s",
              }}
              disabled={deletingChatId === chat._id}
              onMouseEnter={(e) => {
                if (deletingChatId !== chat._id) {
                  (e.currentTarget as HTMLElement).style.opacity = "1";
                }
              }}
            >
              {deletingChatId === chat._id ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.9s linear infinite" }}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="56" strokeDashoffset="18" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
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

const SkeletonRow = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px" }}>
    <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--bg-elevated)", flexShrink: 0 }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ height: 12, width: "55%", borderRadius: 6, background: "var(--bg-elevated)" }} />
      <div style={{ height: 10, width: "75%", borderRadius: 6, background: "var(--bg-elevated)" }} />
    </div>
  </div>
);

const ChatList: React.FC<{
  me: Me;
  setSelectedChat: React.Dispatch<React.SetStateAction<string>>;
  selectedChat: string;
  mobileOpen?: boolean;
  setMobileOpen?: (v: boolean) => void;
}> = ({ me, setSelectedChat, selectedChat, mobileOpen, setMobileOpen }) => {
  const [newChatModalOpen, setNewChatModalOpen] = React.useState(false);
  const [chatsLoading, setChatsLoading] = React.useState(false);
  const [chatsError, setChatsError] = React.useState<string>("");
  const [deletingChatId, setDeletingChatId] = React.useState<string | null>(null);
  const [botSaving, setBotSaving] = React.useState(false);
  const [onlineUserIds, setOnlineUserIds] = React.useState<Set<string>>(new Set());
  const { chats, setChats } = useChat();
  const auth = useAuth();
  const navigate = useNavigate();

  const getChats = React.useCallback(async () => {
    setChatsLoading(true);
    setChatsError("");
    try {
      const res = await axiosInstance.get<ApiResponse<Chats[]>>("/chats/get-chats", { timeout: 5000 });
      if (res.data.success) setChats(res.data.data);
    } catch (error: unknown) {
      setChatsError(getErrorMessage(error, "Failed to load chats"));
    } finally {
      setChatsLoading(false);
    }
  }, [setChats]);

  const handleDeleteChat = React.useCallback(
    async (chatId: string) => {
      setDeletingChatId(chatId);
      setChatsError("");
      try {
        const res = await axiosInstance.delete(`/chats/delete-chat?chatId=${chatId}`);
        if (res.data.success) {
          setChats((prev) => prev.filter((c) => c._id !== chatId));
          if (selectedChat === chatId) setSelectedChat("");
        }
      } catch (error: unknown) {
        setChatsError(getErrorMessage(error, "Something went wrong"));
      } finally {
        setDeletingChatId(null);
      }
    },
    [selectedChat, setChats, setSelectedChat],
  );

  React.useEffect(() => { getChats(); }, [getChats]);

  React.useEffect(() => {
    const handler = ({ chatId, updatedChat }: { chatId: string; updatedChat: Chats }) => {
      setChats((prev) => {
        const previousChat = prev.find((c) => c._id === chatId);

        return [
          {
            ...previousChat,
            ...updatedChat,
            unseenCount:
              selectedChat === chatId
                ? 0
                : typeof updatedChat.unseenCount === "number"
                  ? updatedChat.unseenCount
                  : previousChat?.unseenCount || 0,
          },
          ...prev.filter((c) => c._id !== chatId),
        ];
      });
    };
    socket.on("chat-update", handler);
    return () => { socket.off("chat-update", handler); };
  }, [selectedChat, setChats]);

  React.useEffect(() => {
    const onOnlineUsers = (userIds: string[]) => {
      setOnlineUserIds(new Set(userIds.map((id) => id.toString())));
    };

    const onPresenceUpdate = ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      setOnlineUserIds((previous) => {
        const next = new Set(previous);
        if (isOnline) next.add(userId.toString());
        else next.delete(userId.toString());
        return next;
      });
    };

    socket.on("online-users", onOnlineUsers);
    socket.on("presence-update", onPresenceUpdate);
    return () => {
      socket.off("online-users", onOnlineUsers);
      socket.off("presence-update", onPresenceUpdate);
    };
  }, []);

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
    localStorage.removeItem('token');
    navigate("/signin", { replace: true });
    try {
      await axiosInstance.get("/auth/sign-out");
    } finally {
      auth?.refreshAuth?.();
    }
  };

  const handleBotToggle = async (nextValue: boolean) => {
    setBotSaving(true);
    try {
      await axiosInstance.put("/user/bot", { botOn: nextValue });
      await auth?.refreshAuth?.();
    } finally {
      setBotSaving(false);
    }
  };

  const handleSearchChats = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (value.trim() === "") {
      getChats();
      return;
    }
    setChatsError("");
    try {
      const res = await axiosInstance.get<ApiResponse<Chats[]>>("/chats/search-chats?q=" + value, { timeout: 3000 });
      if (res.data.success) setChats(res.data.data);
    } catch (error: unknown) {
      setChatsError(getErrorMessage(error, "Search failed"));
    }
  };

  const myInitials = getInitials(me?.fullName || "U");
  const myColor = avatarColor(me?.fullName || "U");

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
            onClick={() => navigate("/app/profile")}
            title="Settings"
            style={{
              flexShrink: 0, width: 34, height: 34, borderRadius: 10,
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-muted)", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--accent)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M 6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
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

        <div style={{ padding: "12px 12px 8px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
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

        <div
          style={{
            display: "flex", gap: 6, padding: "10px 12px",
            borderBottom: "1px solid var(--border)", flexShrink: 0,
          }}
        >
         
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
          {chatsError && (
            <div
              style={{
                marginBottom: 10,
                padding: "10px 12px",
                borderRadius: 12,
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.25)",
                color: "var(--danger)",
                fontSize: 12.5,
                lineHeight: 1.45,
              }}
            >
              {chatsError}
            </div>
          )}

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
                onlineUserIds={onlineUserIds}
                handleSelectedChat={handleSelectedChat}
                handleDeleteChat={handleDeleteChat}
                deletingChatId={deletingChatId}
                chat={chat}
                isSelected={selectedChat === chat._id}
              />
            ))
          )}
        </div>

        <div
          style={{
            padding: "12px 14px 14px",
            borderTop: "1px solid var(--border)",
            background: "var(--bg-surface)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 12px",
              borderRadius: 14,
              border: "1px solid var(--border)",
              background: "var(--bg-elevated)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                Bot replies
              </span>
              <span style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>
                Enable or disable AI responses
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleBotToggle(!me?.botOn)}
              disabled={botSaving}
              aria-pressed={!!me?.botOn}
              style={{
                width: 48,
                height: 28,
                borderRadius: 999,
                border: "1px solid transparent",
                background: me?.botOn ? "var(--accent)" : "var(--border)",
                position: "relative",
                cursor: botSaving ? "not-allowed" : "pointer",
                transition: "all 0.18s ease",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: me?.botOn ? 24 : 3,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  transition: "left 0.18s ease",
                }}
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default React.memo(ChatList);
