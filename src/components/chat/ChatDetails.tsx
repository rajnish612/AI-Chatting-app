import React from "react";
import axiosInstance from "../../lib/axios";
import type { ApiResponse } from "../../lib/apiResponse";
import type { Participant } from "../types/participant.type";
import type { Message } from "../types/message.type";

const ChatDetails: React.FC<{ selectedChat?: string }> = ({ selectedChat }) => {
  const [participant, setParticipant] = React.useState<Participant["userId"] | null>(null);
  const [images, setImages] = React.useState<Message[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const limit = 18;
  const skipRef = React.useRef(0);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const fetchParticipant = React.useCallback(async () => {
    if (!selectedChat) return;
    try {
      const res = await axiosInstance.get<ApiResponse<Participant[]>>(
        `/chats/get-participants?chatId=${selectedChat}`,
      );
      if (res.data.success && res.data.data?.length) {
        setParticipant(res.data.data[0].userId);
      }
    } catch {
      setParticipant(null);
    }
  }, [selectedChat]);

  const fetchImages = React.useCallback(async (next = false) => {
    if (!selectedChat) return;
    setLoading(true);
    try {
      const pageSkip = next ? skipRef.current : 0;
      const res = await axiosInstance.get<ApiResponse<Message[]>>(
        `/message/shared-media?chatId=${selectedChat}&skip=${pageSkip}&limit=${limit}`,
      );

      if (res.data.success) {
        setImages((prev) => (next ? [...prev, ...res.data.data] : res.data.data));
        skipRef.current = pageSkip + res.data.data.length;

        const responseWithCount = res.data as ApiResponse<Message[]> & { totalCount?: number };
        if (typeof responseWithCount.totalCount === "number") {
          setTotalCount(responseWithCount.totalCount);
        }
      }
    } catch {
      if (!next) {
        setImages([]);
        setTotalCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [limit, selectedChat]);

  React.useEffect(() => {
    setParticipant(null);
    setImages([]);
    skipRef.current = 0;
    setTotalCount(0);
    setExpanded(false);
    fetchParticipant();
    fetchImages(false);
  }, [selectedChat, fetchParticipant, fetchImages]);

  React.useEffect(() => {
    if (!expanded) return;

    const onScroll = () => {
      const el = containerRef.current;
      if (!el || loading) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) {
        fetchImages(true);
      }
    };

    const el = containerRef.current;
    if (el) el.addEventListener("scroll", onScroll);
    return () => {
      if (el) el.removeEventListener("scroll", onScroll);
    };
  }, [expanded, loading, fetchImages]);

  const previewImages = images.slice(0, 5);
  const remainingCount = Math.max(totalCount - previewImages.length, 0);

  const getMediaSrc = (img: Message) => {
    const media = img as Message & {
      imageUrl?: string;
      secure_url?: string;
      url?: string;
    };

    return img.image || media.imageUrl || media.secure_url || media.url || "";
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");

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
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            overflow: "hidden",
            background: "var(--bg-elevated)",
            flexShrink: 0,
          }}
        >
          {participant?.profilePic ? (
            <img
              src={participant.profilePic}
              alt={participant.fullName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              {initials(participant?.fullName || "?")}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", textAlign: "center" }}>
            {participant?.fullName || "Details"}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "center" }}>
            Shared media
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <div style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Shared Media
            </span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {expanded ? "Hide" : "View all"}
            </span>
          </div>
        </div>

        <div style={{ padding: "0 12px 20px" }}>
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {previewImages.length ? (
              previewImages.map((img, index) => (
                <div
                  key={img._id || index}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 8,
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    background: "#000",
                    position: "relative",
                  }}
                >
                  <img
                    src={getMediaSrc(img)}
                    alt="shared"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  {index === 4 && remainingCount > 0 && !expanded && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                    >
                      +{remainingCount}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: 12,
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  border: "1px dashed var(--border)",
                  borderRadius: 8,
                }}
              >
                No shared media yet
              </div>
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div ref={containerRef} style={{ overflowY: "auto", padding: "0 12px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {images.map((img) => (
              <div
                key={img._id}
                style={{
                  aspectRatio: "1",
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  background: "#000",
                }}
              >
                <img
                  src={getMediaSrc(img)}
                  alt="shared"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
            ))}
          </div>

          {loading && (
            <div style={{ padding: 12, textAlign: "center", color: "var(--text-secondary)" }}>
              Loading…
            </div>
          )}

          {!loading && images.length === 0 && (
            <div style={{ padding: 12, textAlign: "center", color: "var(--text-secondary)" }}>
              No shared media yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatDetails;
