import React from "react";
import type { MediaConnection } from "peerjs";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/Chat.context";

type CallerInfo = {
  fullName?: string;
  profilePic?: string;
};

const CallOverlay: React.FC = () => {
  const authContext = React.useContext(AuthContext);
  const chatContext = React.useContext(ChatContext);
  const peer = authContext?.peer;
  const onCall = chatContext?.onCall ?? false;
  const setOnCall = chatContext?.setOnCall;

  const callRef = React.useRef<MediaConnection | null>(null);
  const localStreamRef = React.useRef<MediaStream | null>(null);
  const [muted, setMuted] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [caller, setCaller] = React.useState<CallerInfo>({});

  const closeOverlay = React.useCallback(() => {
    callRef.current?.close();
    callRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setMuted(false);
    setIsConnecting(false);
    setCaller({});
    setOnCall?.(false);
  }, [setOnCall]);

  React.useEffect(() => {
    if (!peer) return;

    const handleCall = (call: MediaConnection) => {
      callRef.current = call;

      const metadata = call.metadata as { user?: CallerInfo } | undefined;
      setCaller(metadata?.user ?? {});
      setOnCall?.(true);
      setIsConnecting(false);
    };

    peer.on("call", handleCall);

    return () => {
      peer.off("call", handleCall);
    };
  }, [peer, setOnCall]);

  React.useEffect(() => {
    if (!onCall) {
      setIsConnecting(false);
    }
  }, [onCall]);

  const handleAccept = async () => {
    if (!callRef.current || isConnecting) return;

    setIsConnecting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      stream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });

      callRef.current.answer(stream);
      callRef.current.on("close", closeOverlay);
      callRef.current.on("error", closeOverlay);
    } catch {
      closeOverlay();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDecline = () => {
    closeOverlay();
  };

  const handleToggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);

    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
  };

  if (!onCall) return null;

  const remoteName = caller.fullName?.trim() || "Unknown caller";
  const initials = remoteName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "grid",
        placeItems: "center",
        padding: 20,
        background:
          "radial-gradient(circle at top, rgba(108,99,255,0.22), transparent 30%), rgba(6,8,12,0.88)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
      }}
    >
      <div
        className="glass-strong anim-scaleIn"
        style={{
          width: "min(380px, 100%)",
          borderRadius: 26,
          padding: 24,
          border: "1px solid rgba(255,255,255,0.12)",
          background:
            "linear-gradient(180deg, rgba(20,24,34,0.98) 0%, rgba(12,15,22,0.98) 100%)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "grid",
              placeItems: "center",
            }}
          >
            {caller.profilePic ? (
              <img
                src={caller.profilePic}
                alt={remoteName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
                {initials}
              </span>
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-light)" }}>
              Incoming call
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
              {remoteName}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-secondary)" }}>
              {isConnecting ? "Connecting…" : "Ready to answer"}
            </div>
          </div>
        </div>

        <div
          style={{
            marginBottom: 20,
            padding: 14,
            borderRadius: 18,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--text-secondary)",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          Accept to join the call, decline to dismiss it, or mute your microphone before speaking.
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={handleAccept}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 16,
              border: "1px solid rgba(52,211,153,0.35)",
              background: "rgba(52,211,153,0.14)",
              color: "#d1fae5",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Accept
          </button>

          <button
            type="button"
            onClick={handleDecline}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 16,
              border: "1px solid rgba(248,113,113,0.35)",
              background: "rgba(248,113,113,0.14)",
              color: "#fee2e2",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Decline
          </button>
        </div>

        <button
          type="button"
          onClick={handleToggleMute}
          style={{
            width: "100%",
            marginTop: 10,
            padding: "12px 14px",
            borderRadius: 16,
            border: `1px solid ${muted ? "rgba(251,191,36,0.35)" : "var(--border)"}`,
            background: muted ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.04)",
            color: muted ? "#fef3c7" : "var(--text-primary)",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {muted ? "Unmute" : "Mute"}
        </button>
      </div>
    </div>
  );
};

export default CallOverlay;