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
  const currentCall = chatContext?.currentCall ?? null;
  const setCurrentCall = chatContext?.setCurrentCall;
  const remoteStream = chatContext?.remoteStream ?? null;
  const setRemoteStream = chatContext?.setRemoteStream;
  const setIsOutgoing = chatContext?.setIsOutgoing;
  const isOutgoing = chatContext?.isOutgoing ?? false;
  const localStreamContext = chatContext?.localStream ?? null;

  const localStreamRef = React.useRef<MediaStream | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [caller, setCaller] = React.useState<CallerInfo>({});

  const closeOverlay = React.useCallback(() => {
    currentCall?.close?.();
    setCurrentCall?.(null);
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setMuted(false);
    setIsConnecting(false);
    setCaller({});
    setRemoteStream?.(null);
    setIsOutgoing?.(false);
    setOnCall?.(false);
  }, [currentCall, setOnCall, setCurrentCall, setIsOutgoing, setRemoteStream]);

  React.useEffect(() => {
    if (!peer) return;

    const handleCall = (call: MediaConnection) => {
      const metadata = call.metadata as { user?: CallerInfo } | undefined;
      setCaller(metadata?.user ?? {});
      setCurrentCall?.(call);
      setOnCall?.(true);
      setIsOutgoing?.(false);
      setIsConnecting(false);

      // ensure we clean up if caller cancels before the receiver answers
      call.on("close", closeOverlay);
      call.on("error", closeOverlay);
    };

    peer.on("call", handleCall);

    return () => {
      peer.off("call", handleCall);
    };
  }, [peer, setOnCall, setCurrentCall, closeOverlay, setIsOutgoing]);

  React.useEffect(() => {
    if (!onCall) {
      setIsConnecting(false);
    }
  }, [onCall]);

  const handleAccept = async () => {
    const call = currentCall;
    if (!call || isConnecting) return;

    setIsConnecting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      stream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });

      call.answer(stream);
      call.on("stream", (s: MediaStream) => {
        setRemoteStream?.(s);
      });
      call.on("close", closeOverlay);
      call.on("error", closeOverlay);
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

    // support both caller (context) and receiver (local ref)
    if (localStreamContext) {
      localStreamContext.getAudioTracks().forEach((track) => (track.enabled = !nextMuted));
      // also update context reference if needed
      chatContext?.setLocalStream?.(localStreamContext);
    }
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
  };

  if (!onCall) return null;

  const remoteName = (chatContext?.caller?.fullName ?? caller.fullName)?.trim() || "Unknown caller";
  const initials = remoteName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

  // determine whether call is answered/connected
  const answered = isOutgoing ? !!remoteStream : !!localStreamRef.current;

  const handleEndCall = () => closeOverlay();

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
            {(chatContext?.caller?.profilePic ?? caller.profilePic) ? (
              <img
                src={chatContext?.caller?.profilePic ?? caller.profilePic}
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
              {isOutgoing ? "Calling" : "Incoming call"}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
              {remoteName}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-secondary)" }}>
              {isOutgoing ? (remoteStream ? "Connected" : "Ringing…") : (isConnecting ? "Connecting…" : answered ? "In call" : "Ready to answer")}
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
          {!isOutgoing && !answered && (
            <>
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
            </>
          )}

          {isOutgoing && !answered && (
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
              Cancel
            </button>
          )}

          {answered && (
            <button
              type="button"
              onClick={handleEndCall}
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
              End call
            </button>
          )}
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
        {/* hidden audio element to play the remote stream for both caller and receiver */}
        <audio ref={audioRef} autoPlay style={{ display: "none" }} />
        {remoteStream && (
          (() => {
            if (audioRef.current && audioRef.current.srcObject !== remoteStream) {
              try {
                audioRef.current.srcObject = remoteStream;
              } catch {
                /* ignore */
              }
            }
            return null;
          })()
        )}
      </div>
    </div>
  );
};

export default CallOverlay;