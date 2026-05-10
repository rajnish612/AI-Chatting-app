import React from "react";
import ChatList from "./ChatList";
import Chatbox from "./Chatbox";
import ChatDetails from "./ChatDetails";
import { useAuth } from "../../hooks/useAuth";
import { ChatProvider } from "../../providers/chat.provider";

import CallOverlay from "../call/CallOverlay";
const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = React.useState<string>("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [mobileDetailsOpen, setMobileDetailsOpen] = React.useState(false);
 
  const authContext = useAuth();
  const { loading, me, error } = authContext;

  React.useEffect(() => {
    setMobileDetailsOpen(false);
  }, [selectedChat]);
  
  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "var(--bg-base)",
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
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse-ring 1.4s infinite",
              boxShadow: "0 0 20px var(--accent-glow)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                fill="white"
              />
            </svg>
          </div>
          <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Loading Nexus Chat…
          </span>
        </div>
      </div>
    );

  if (error?.err)
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "var(--bg-base)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "28px 32px",
            borderRadius: 20,
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: "var(--danger)" }}
          >
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
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            {error.message}
          </span>
        </div>
      </div>
    );

  return (
    <ChatProvider>
      <CallOverlay />
      <div
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          overflow: "hidden",
          background: "var(--bg-base)",
        }}
      >
        {/* Desktop sidebar — always visible at md+ */}
        <div className="hidden md:flex" style={{ flexShrink: 0 }}>
          <ChatList
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            me={me}
          />
        </div>

        {/* Mobile sidebar — slide-in */}
        <div className="md:hidden">
          <ChatList
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            me={me}
            mobileOpen={mobileSidebarOpen}
            setMobileOpen={setMobileSidebarOpen}
          />
        </div>

        {/* Main chat area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <Chatbox
            me={me}
            selectedChat={selectedChat}
            onMenuClick={() => setMobileSidebarOpen(true)}
            onDetailsClick={() => setMobileDetailsOpen(true)}
          />
        </div>

        {/* Mobile details panel */}
        {selectedChat && mobileDetailsOpen && (
          <div
            className="lg:hidden"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              background: "rgba(0,0,0,0.45)",
            }}
            onClick={() => setMobileDetailsOpen(false)}
          >
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                height: "100%",
                width: "min(88vw, 320px)",
                background: "var(--bg-surface)",
                borderLeft: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  Chat Details
                </span>
                <button
                  onClick={() => setMobileDetailsOpen(false)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--bg-elevated)",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                  aria-label="Close chat details"
                >
                  ×
                </button>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ChatDetails selectedChat={selectedChat} />
              </div>
            </div>
          </div>
        )}

        {/* Right details panel — hidden on small screens */}
        {selectedChat && (
          <div className="hidden lg:flex" style={{ flexShrink: 0 }}>
            <ChatDetails selectedChat={selectedChat} />
          </div>
        )}
      </div>
    </ChatProvider>
  );
};

export default React.memo(Chat);
