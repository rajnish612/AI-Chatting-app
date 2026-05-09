import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../lib/axios";
import { useNavigate } from "react-router-dom";
interface credentials {
  email?: string;
  password?: string;
}
const SignIn = () => {
  const navigate = useNavigate();
  const context = useAuth();
  const { me, loading } = context || { me: {}, loading: false };

  const [credentials, setCredentials] = React.useState<credentials>({
    email: "",
    password: "",
  });
  const [submitError, setSubmitError] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof credentials;
    const value: string = e.target.value;
    if (submitError) setSubmitError("");
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await axiosInstance.post("/auth/sign-in", credentials);
      if (res.data.success == true) {
        // Store token in localStorage
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        navigate("/app/chat", { replace: true });
        context?.refreshAuth?.();
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!loading && me?._id) {
      navigate("/app/chat", { replace: true });
    }
  }, [me, loading, navigate]);
  return (
    <div
      className="min-h-screen w-full flex justify-center items-center relative overflow-hidden  px-4 py-8 sm:py-10"
      style={{
        background: "var(--bg-base)",
        padding: "clamp(16px, 4vw, 28px)",
      }}
    >
      {/* Background glow orbs */}
      <div
        className="absolute  pointer-events-none"
        style={{
          width: 520,
          height: 520,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)",

          top: "-120px",
          left: "-120px",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
          bottom: "-100px",
          right: "-80px",
          filter: "blur(40px)",
        }}
      />

      <div
        className="anim-scaleIn relative w-full flex flex-col gap-6 p-5  sm:p-8 rounded-2xl"
        style={{
          width: "min(100%, 440px)",
          padding: "clamp(18px, 3.8vw, 34px)",

          maxWidth: 440,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-active)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Logo / Brand */}
        <div className="flex flex-col   items-center gap-3 mb-2">
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "var(--accent)",
              boxShadow: "var(--shadow-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                fill="white"
              />
            </svg>
          </div>
          <div className="text-center">
            <h1
              className="font-bold tracking-tight"
              style={{ fontSize: 24, color: "var(--text-primary)" }}
            >
              Welcome back
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                marginTop: 4,
              }}
            >
              Sign in to continue to Nexus Chat
            </p>
          </div>
        </div>

        <form onSubmit={handleSignIn} className="flex w-full flex-col gap-4">
          {submitError && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.25)",
                color: "var(--danger)",
                fontSize: 12.5,
                lineHeight: 1.45,
              }}
            >
              {submitError}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-secondary)",
                letterSpacing: "0.02em",
              }}
            >
              Email address
            </label>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--accent)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{ flexShrink: 0, color: "var(--text-muted)" }}
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <polyline
                  points="22,6 12,13 2,6"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <input
                onChange={handleChange}
                id="email"
                type="text"
                name="email"
                placeholder="john@example.com"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-secondary)",
                letterSpacing: "0.02em",
              }}
            >
              Password
            </label>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--accent)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{ flexShrink: 0, color: "var(--text-muted)" }}
              >
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  ry="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M7 11V7a5 5 0 0 1 10 0v4"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <input
                onChange={handleChange}
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            id="signin-submit"
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 mt-1"
            style={{
              background: submitting ? "var(--text-muted)" : "var(--accent)",
              boxShadow: submitting ? "none" : "var(--shadow-accent)",
              fontSize: 15,
              letterSpacing: "0.01em",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--accent-light)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 28px var(--accent-glow)";
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--accent)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "var(--shadow-accent)";
              }
            }}
          >
            {submitting ? "Signing In..." : "Sign In"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Link */}
          <p
            className="text-center"
            style={{ color: "var(--text-secondary)", fontSize: 13 }}
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{
                color: "var(--accent-light)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Create one
            </Link>
          </p>

          {/* Forgot Password */}
          <p
            className="text-center"
            style={{ color: "var(--text-secondary)", fontSize: 13 }}
          >
            Forgot your password?{" "}
            <Link
              to="/forgot-password"
              style={{
                color: "var(--accent-light)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Reset it
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
