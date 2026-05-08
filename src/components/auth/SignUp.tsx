import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axios";
import { useAuth } from "../../hooks/useAuth";
interface credentials {
  fullname?: string;
  email?: string;
  password?: string;
}
const SignUp = () => {
  const context = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = React.useState<credentials>({
    fullname: "",
    email: "",
    password: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof credentials;
    const value: string = e.target.value;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };
  const handleSignUp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/auth/sign-up", credentials);
      if (res.data?.success) {
        // Store token in localStorage
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        navigate("/app/chat", { replace: true });
        context?.refreshAuth?.();
      }
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("Sign up failed");
    }
  };
  if (!context) return;
  const { error } = context;
  if (error) {
    // alert(error);
  }

  return (
    <div
      className="min-h-screen w-full flex justify-center items-center relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Background glow orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108,99,255,0.16) 0%, transparent 70%)",
          top: "-160px",
          right: "-100px",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,131,255,0.1) 0%, transparent 70%)",
          bottom: "-80px",
          left: "-60px",
          filter: "blur(40px)",
        }}
      />

      <div
        className="anim-scaleIn relative w-full mx-4 flex flex-col gap-6 p-8 rounded-2xl"
        style={{
          maxWidth: 440,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-active)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)",
              boxShadow: "var(--shadow-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white" />
            </svg>
          </div>
          <div className="text-center">
            <h1
              className="font-bold tracking-tight"
              style={{ fontSize: 24, color: "var(--text-primary)" }}
            >
              Create your account
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
              Get started with Nexus Chat for free
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSignUp}
          className="flex w-full flex-col gap-4"
        >
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="fullName"
              style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", letterSpacing: "0.02em" }}
            >
              Full Name
            </label>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: "var(--text-muted)" }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
              <input
                onChange={handleChange}
                className="w-full"
                id="fullName"
                type="text"
                name="fullName"
                placeholder="John Doe"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", letterSpacing: "0.02em" }}
            >
              Email address
            </label>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: "var(--text-muted)" }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" />
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" />
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
              style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", letterSpacing: "0.02em" }}
            >
              Password
            </label>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: "var(--text-muted)" }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" />
              </svg>
              <input
                onChange={handleChange}
                id="password"
                type="password"
                name="email"
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
            id="signup-submit"
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 mt-1"
            style={{
              background: "var(--accent)",
              boxShadow: "var(--shadow-accent)",
              fontSize: 15,
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-light)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 28px var(--accent-glow)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--accent)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-accent)";
            }}
          >
            Create Account
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Link */}
          <p className="text-center" style={{ color: "var(--text-secondary)", fontSize: 13 }}>
            Already have an account?{" "}
            <Link
              to="/signin"
              style={{ color: "var(--accent-light)", fontWeight: 600, textDecoration: "none" }}
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
