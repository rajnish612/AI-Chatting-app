import React from "react";
import axiosInstance from "../../lib/axios";
import type { ApiResponse } from "../../lib/apiResponse";
import socket from "../../lib/socket";
import type { Participant } from "../types/participant.type";
import type { Me } from "../types/me.type";
import type { Message } from "../types/message.type";
import { useChat } from "../../hooks/useChat";
import MessageCard from "./MessageCard";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/Chat.context";

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

const Chatbox: React.FC<{
  selectedChat: string;
  me: Me;
  onMenuClick?: () => void;
}> = ({ selectedChat, me, onMenuClick }) => {
  const skipRef = React.useRef(0);
  const [err, setError] = React.useState<string>("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [initialLoad, setInitialLoad] = React.useState<boolean>(true);
  const [textMessage, setTextMessage] = React.useState<string>("");
  const [sendingMessage, setSendingMessage] = React.useState<boolean>(false);
  const [unsendingMessageId, setUnsendingMessageId] = React.useState<
    string | null
  >(null);
  const [messagesLoading, setMessagesLoading] = React.useState<boolean>(false);
  const [participantsLoading, setParticipantsLoading] =
    React.useState<boolean>(false);
  const [sendingImage, setSendingImage] = React.useState<boolean>(false);
  const { setChats } = useChat();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const context = React.useContext(AuthContext);
  const peer = context?.peer;
  const chatContext = React.useContext(ChatContext);
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 0);
  };

  React.useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      skipRef.current = 0;
      setError("");
      setMessagesLoading(true);
      try {
        const res = await axiosInstance.get<ApiResponse<Message[]>>(
          `/message/get-messages?chatId=${selectedChat}&skip=${skipRef.current}`,
        );
        if (res.data.success) setMessages(res.data.data);
        setTimeout(() => {
          scrollToBottom();
          setInitialLoad(false);
        }, 500);
      } catch (error: unknown) {
        setError(getErrorMessage(error, "Failed to load messages"));
      } finally {
        setMessagesLoading(false);
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
        socket.emit("send-message", {
          message: res.data.data,
          chatId: selectedChat,
        });
        setChats((prev) =>
          prev.map((c) =>
            c._id === selectedChat
              ? { ...c, lastMessage: res.data.data, unseenCount: 0 }
              : c,
          ),
        );
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data.data._id)) return prev;
          return [...prev, res.data.data];
        });
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to send message"));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleUnsendMessage = React.useCallback(
    async (messageId: string) => {
      if (!messageId || unsendingMessageId) return;

      const confirmed = window.confirm("Delete this message for everyone?");
      if (!confirmed) return;

      setUnsendingMessageId(messageId);
      try {
        const res = await axiosInstance.post(
          `/message/unsend?_id=${messageId}`,
        );
        if (res.data.success) {
          setMessages((prev) => prev.filter((m) => m._id !== messageId));
        }
      } catch (error: unknown) {
        setError(getErrorMessage(error, "Failed to delete message"));
      } finally {
        setUnsendingMessageId(null);
      }
    },
    [unsendingMessageId],
  );

  const updateLastSeen = React.useCallback(async () => {
    try {
      await axiosInstance.patch<ApiResponse<string>>(
        `/chats/update-lastseen?chatId=${selectedChat}`,
      );
    } catch (error: unknown) {
      void error;
    }
  }, [selectedChat]);

  React.useEffect(() => {
    if (selectedChat) socket.emit("join-chat", { chatId: selectedChat });
  }, [selectedChat]);

  React.useEffect(() => {
    const handler = ({ message }: { message: Message }) => {
      updateLastSeen();
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };
    socket.on("receive-message", handler);
    return () => {
      socket.off("receive-message", handler);
    };
  }, [updateLastSeen]);

  React.useEffect(() => {
    const handler = ({
      userId,
      lastSeen,
    }: {
      userId: string;
      lastSeen: Date;
    }) => {
      if (!selectedChat) return;
      setParticipants((prev) =>
        prev.map((p) =>
          p.userId._id.toString() === userId ? { ...p, lastSeen } : { ...p },
        ),
      );
    };
    socket.on("message-seen", handler);
    return () => {
      socket.off("message-seen", handler);
    };
  }, [selectedChat]);

  React.useEffect(() => {
    if (selectedChat) updateLastSeen();
  }, [updateLastSeen, selectedChat]);

  React.useEffect(() => {
    const getParticipants = async () => {
      if (!selectedChat) return;
      setParticipantsLoading(true);
      try {
        const res = await axiosInstance.get<ApiResponse<Participant[]>>(
          `/chats/get-participants?chatId=${selectedChat}`,
        );
        if (res.data.success) setParticipants(res.data.data);
      } catch (error: unknown) {
        setError(getErrorMessage(error, "Failed to load participants"));
      } finally {
        setParticipantsLoading(false);
      }
    };
    getParticipants();
  }, [selectedChat]);

  React.useEffect(() => {
    const handler = ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };
    socket.on("message-unsent", handler);
    return () => {
      socket.off("message-unsent", handler);
    };
  }, []);

  React.useEffect(() => {
    const handler = ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      setParticipants((prev) =>
        prev.map((participant) =>
          participant.userId._id.toString() === userId
            ? { ...participant, userId: { ...participant.userId, isOnline } }
            : participant,
        ),
      );
    };

    socket.on("presence-update", handler);
    return () => {
      socket.off("presence-update", handler);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSendingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const imageBase64 = reader.result as string;
          const res = await axiosInstance.post("/message/send/image-message", {
            chatId: selectedChat,
            imageBase64,
          });

          if (res.data.success) {
            socket.emit("send-message", {
              message: res.data.data,
              chatId: selectedChat,
            });
            setChats((prev) =>
              prev.map((c) =>
                c._id === selectedChat
                  ? { ...c, lastMessage: res.data.data, unseenCount: 0 }
                  : c,
              ),
            );
            setMessages((prev) => {
              if (prev.some((m) => m._id === res.data.data._id)) return prev;
              return [...prev, res.data.data];
            });
          }
        } catch (error: unknown) {
          setError(getErrorMessage(error, "Failed to send image"));
        } finally {
          setSendingImage(false);
          if (imageInputRef.current) imageInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to process image"));
      setSendingImage(false);
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };
  const chatPartner = participants[0]?.userId;
  const chatPartnerStatus = chatPartner?.isOnline ? "Online" : "Offline";
  const botStatusLabel = chatPartner?.botOn ? "Bot enabled" : "Bot disabled";
  const createCall = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const calleeId = participants?.[0]?.userId?._id?.toString();
    if (!calleeId || !peer) return;

    const call = peer.call(calleeId, mediaStream, {
      metadata: {
        user: {
          _id: me._id,
          fullName: me.fullName,
          email: me.email,
          profilePic: me.profilePic,
        },
      },
    });

    // Save call to context so overlay and other UI can access it
    chatContext?.setLocalStream?.(mediaStream);
    chatContext?.setCurrentCall?.(call);
    chatContext?.setOnCall?.(true);
    chatContext?.setIsOutgoing?.(true);
    chatContext?.setCaller?.({
      fullName: participants?.[0]?.userId?.fullName,
      profilePic: participants?.[0]?.userId?.profilePic,
    });

    call.on("stream", async (stream) => {
      chatContext?.setRemoteStream?.(stream);
    });

    call.on("close", () => {
      chatContext?.setCurrentCall?.(null);
      chatContext?.setOnCall?.(false);
      chatContext?.setIsOutgoing?.(false);
      chatContext?.setRemoteStream?.(null);
   
      if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
      chatContext?.setLocalStream?.(null);
    });
  };
  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const div = e.currentTarget;

        if (div.scrollTop <= 0 && !messagesLoading && !initialLoad) {
      const newSkip = skipRef.current + 10;
      const previousHeight = div.scrollHeight;
      setMessagesLoading(true);
      try {
        const res = await axiosInstance.get<ApiResponse<Message[]>>(
          `/message/get-messages?chatId=${selectedChat}&skip=${newSkip}`,
        );
        if (res.data.success) {
          skipRef.current = newSkip;
          setMessages((prev) => [...res.data.data, ...prev]);
        }
        setTimeout(() => {
          div.scrollTop = div.scrollHeight - previousHeight;
        }, 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load more messages");
      } finally {
        setMessagesLoading(false);
      }
    }
  };
  if (!selectedChat) {
    return (
      <div
        style={{
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
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
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <line
                x1="3"
                y1="6"
                x2="21"
                y2="6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="3"
                y1="12"
                x2="21"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="3"
                y1="18"
                x2="21"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <span
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: "var(--text-primary)",
            }}
          >
            Nexus Chat
          </span>
        </div>

        {/* Empty state */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                background: "var(--accent-dim)",
                border: "1px solid rgba(108,99,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: "var(--accent-light)" }}
              >
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  color: "var(--text-primary)",
                  marginBottom: 8,
                }}
              >
                Your Messages
              </p>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  maxWidth: 240,
                }}
              >
                Select a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-base)",
        overflow: "hidden",
      }}
    >
      {/* ── Chat Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
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
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <line
              x1="3"
              y1="6"
              x2="21"
              y2="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="3"
              y1="12"
              x2="21"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="3"
              y1="18"
              x2="21"
              y2="18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Avatar */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 14,
            color: "#fff",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {(() => {
            const name = chatPartner?.fullName || "U";
            const avatarUrl = chatPartner?.profilePic;
            const parts = name.trim().split(/\s+/).filter(Boolean);
            const initials = parts.length === 1 ? (parts[0][0] || "").toUpperCase() : ((parts[0][0] || "") + (parts[parts.length - 1][0] || "")).toUpperCase();
            if (avatarUrl) {
              return (
                <img src={avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} draggable={false} />
              );
            }
            return initials;
          })()}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            flex: 1,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 14.5,
              color: "var(--text-primary)",
            }}
          >
            {chatPartner?.fullName || "Chat"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: chatPartner?.isOnline ? "var(--success)" : "var(--text-muted)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: chatPartner?.isOnline ? "var(--success)" : "var(--text-secondary)",
                fontSize: 11.5,
                fontWeight: 500,
              }}
            >
              {chatPartnerStatus}
            </span>
          </div>
          <div
            style={{
              marginTop: 4,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              alignSelf: "flex-start",
              padding: "4px 10px",
              borderRadius: 999,
              background: chatPartner?.botOn ? "rgba(108,99,255,0.12)" : "rgba(148,163,184,0.12)",
              border: `1px solid ${chatPartner?.botOn ? "rgba(108,99,255,0.25)" : "rgba(148,163,184,0.25)"}`,
              color: chatPartner?.botOn ? "var(--accent-light)" : "var(--text-secondary)",
              fontSize: 11.5,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: chatPartner?.botOn ? "var(--accent-light)" : "var(--text-muted)",
                flexShrink: 0,
              }}
            />
            {botStatusLabel}
          </div>
        </div>
        <button onClick={createCall}>Call</button>
      </div>

      {/* ── Messages ── */}
      <div
        onScroll={handleScroll}
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
          {messagesLoading && !err && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                justifyContent: "center",
                padding: "12px 0",
                color: "var(--text-muted)",
                fontSize: 13,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{ animation: "spin 0.9s linear infinite" }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="54"
                  strokeDashoffset="18"
                  strokeLinecap="round"
                />
              </svg>
              Loading messages...
            </div>
          )}

          {err && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 12,
                margin: "0 auto",
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.3)",
                color: "var(--danger)",
                fontSize: 13,
                maxWidth: 380,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="12"
                  y1="8"
                  x2="12"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="12"
                  y1="16"
                  x2="12.01"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {err}
            </div>
          )}

          {messages.length === 0 && !err && !messagesLoading && (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: 13,
                marginTop: 24,
              }}
            >
              {participantsLoading
                ? "Loading conversation..."
                : "No messages yet. Say hello! 👋"}
            </div>
          )}

          {messages.map((message, idx) => (
            <MessageCard
              participants={participants}
              key={message._id || idx}
              message={message}
              me={me}
              onUnsendMessage={handleUnsendMessage}
              unsendingMessageId={unsendingMessageId}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Composer ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: "none" }}
        />
        <button
          onClick={handleImageClick}
          disabled={sendingImage}
          title="Send image"
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            border: "1px solid var(--border)",
            background: "var(--bg-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: sendingImage ? "not-allowed" : "pointer",
            flexShrink: 0,
            transition: "all 0.15s",
            color: sendingImage ? "var(--text-muted)" : "var(--accent)",
          }}
          onMouseEnter={(e) => {
            if (!sendingImage) {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
            }
          }}
          onMouseLeave={(e) => {
            if (!sendingImage) {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            }
          }}
        >
          {sendingImage ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              style={{ animation: "spin 0.9s linear infinite" }}
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="60"
                strokeDashoffset="20"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="9" cy="9" r="2" fill="currentColor" />
              <polyline
                points="21 15 16 10 3 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "11px 16px",
            borderRadius: 16,
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
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: 14,
            }}
          />
        </div>

        <button
          id="send-message-btn"
          disabled={sendingMessage}
          onClick={sendTextMessage}
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            border: "none",
            background: sendingMessage ? "var(--text-muted)" : "var(--accent)",
            boxShadow: sendingMessage ? "none" : "0 0 16px var(--accent-glow)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: sendingMessage ? "not-allowed" : "pointer",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!sendingMessage) {
              (e.currentTarget as HTMLElement).style.background =
                "var(--accent-light)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 24px var(--accent-glow)";
            }
          }}
          onMouseLeave={(e) => {
            if (!sendingMessage) {
              (e.currentTarget as HTMLElement).style.background =
                "var(--accent)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 16px var(--accent-glow)";
            }
          }}
        >
          {sendingMessage ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: "white" }}
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="60"
                strokeDashoffset="20"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <line
                x1="22"
                y1="2"
                x2="11"
                y2="13"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default React.memo(Chatbox);
