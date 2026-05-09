import React from "react";
import axiosInstance from "../../lib/axios";
import type { ApiResponse } from "../../lib/apiResponse";
import type { Chats } from "../types/chat.type";
import type { User } from "../types/user.type";

const AVATAR_COLORS = [
  "#6c63ff", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6",
];
const avatarColor = (str: string) =>
  AVATAR_COLORS[
    str.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  ];
const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return (parts[0][0] || "").toUpperCase();
  const first = parts[0][0] || "";
  const last = parts[parts.length - 1][0] || "";
  return (first + last).toUpperCase();
};

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

/* ── UserCard ─────────────────────────────────────────────── */
interface UserProps extends User {
  setSelectedChat: React.Dispatch<React.SetStateAction<string>>;
  setNewChatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
}
const UserCard: React.FC<UserProps> = ({
  setSelectedChat,
  fullName,
  _id,
  setNewChatModalOpen,
  setError,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleSelectChat = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get<ApiResponse<Chats>>(
        "/chats/create-or-get-private-chat?userId=" + _id,
        { timeout: 3000 },
      );
      if (res.data.success) {
        setNewChatModalOpen(false);
        setSelectedChat(res.data.data._id);
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to open conversation"));
    } finally {
      setLoading(false);
    }
  };

  const color = avatarColor(fullName || "U");
  const initials = getInitials(fullName || "User");

  return (
    <div
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer"
      style={{ border: "1px solid transparent" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
        (e.currentTarget as HTMLElement).style.borderColor = "transparent";
      }}
      onClick={handleSelectChat}
    >
      <div
        className="flex items-center justify-center rounded-full font-semibold text-white shrink-0"
        style={{ width: 38, height: 38, background: color, fontSize: 14 }}
      >
        {initials}
      </div>
      <span
        className="flex-1 font-medium truncate"
        style={{ color: "var(--text-primary)", fontSize: 14 }}
      >
        {fullName}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); handleSelectChat(); }}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-150 shrink-0"
        style={{
          background: "var(--accent-dim)",
          color: "var(--accent-light)",
          border: "1px solid rgba(108,99,255,0.25)",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
        Message
      </button>
    </div>
  );
};

/* ── ChatModel ────────────────────────────────────────────── */
interface ChatModelProps {
  setNewChatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedChat: React.Dispatch<React.SetStateAction<string>>;
}
const ChatModel: React.FC<ChatModelProps> = ({
  setNewChatModalOpen,
  setSelectedChat,
}) => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get<ApiResponse<User[]>>("/user");
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center anim-fadeIn p-4 sm:p-6"
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        padding: "clamp(14px, 3.5vw, 28px)",
      }}
      onClick={() => setNewChatModalOpen(false)}
    >
      <div
        className="anim-scaleIn flex flex-col w-full rounded-2xl overflow-hidden"
        style={{
          width: "min(100%, 420px)",
          maxWidth: 420,
          maxHeight: "min(560px, 88vh)",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-active)",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <h2
              className="font-bold"
              style={{ color: "var(--text-primary)", fontSize: 16 }}
            >
              New Conversation
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 12.5, marginTop: 2 }}>
              Select a person to message
            </p>
          </div>
          <button
            onClick={() => setNewChatModalOpen(false)}
            className="flex items-center justify-center rounded-xl p-2 transition-all duration-150"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Users list */}
        <div className="px-3 py-3 flex flex-col gap-1 overflow-y-auto" style={{ flex: 1, minHeight: 120 }}>
          {error && (
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
              {error}
            </div>
          )}

          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--bg-elevated)" }} />
                <div style={{ height: 13, width: "55%", borderRadius: 6, background: "var(--bg-elevated)" }} />
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-muted)" }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                <line x1="19" y1="8" x2="19" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="22" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>No users found</span>
            </div>
          ) : (
            users.map((user) => (
              <UserCard
                setNewChatModalOpen={setNewChatModalOpen}
                key={user._id}
                {...user}
                setSelectedChat={setSelectedChat}
                setError={setError}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatModel;
