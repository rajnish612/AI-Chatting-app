import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axios";
import { useAuth } from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../lib/error";
interface credentials {
  fullname?: string;
  email?: string;
  password?: string;
}
const SignUp = () => {
  const context = useAuth();
  const navigate = useNavigate();
  const { me, loading } = context || { me: {}, loading: false };
  const [step, setStep] = React.useState<"signup" | "otp">("signup");
  const [credentials, setCredentials] = React.useState<credentials>({
    fullname: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = React.useState<string>("");
  const [submitError, setSubmitError] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof credentials;
    const value: string = e.target.value;
    if (submitError) setSubmitError("");
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
    if (submitError) setSubmitError("");
    setOtp(value);
  };

  const handleSignUp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await axiosInstance.post("/auth/sign-up", credentials);
      if (res.data?.success) {
        setStep("otp");
      }
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, "Sign up failed");
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await axiosInstance.post("/auth/verify-otp", {
        email: credentials.email,
        otp,
      });
      if (res.data?.success && res.data?.token) {
        // Store token in localStorage
        localStorage.setItem("token", res.data.token);
        navigate("/app/chat", { replace: true });
        context?.refreshAuth?.();
      }
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, "OTP verification failed");
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!loading && me?._id) {
      navigate("/app/chat", { replace: true });
    }
  }, [me, loading, navigate]);
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
          background:
            "radial-gradient(circle, rgba(108,99,255,0.16) 0%, transparent 70%)",
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
          background:
            "radial-gradient(circle, rgba(139,131,255,0.1) 0%, transparent 70%)",
          bottom: "-80px",
          left: "-60px",
          filter: "blur(40px)",
        }}
      />

      <div
        className="anim-scaleIn relative w-full mx-4 flex flex-col gap-6 p-8 sm:p-10 rounded-2xl"
        style={{
          maxWidth: 440,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-active)",
          boxShadow: "var(--shadow-lg)",
          padding: 32, // explicit fallback in case Tailwind utilities aren't applied
        }}
      >
        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)",
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
              {step === "signup" ? "Create your account" : "Verify your email"}
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                marginTop: 4,
              }}
            >
              {step === "signup"
                ? "Get started with Nexus Chat for free"
                : "Enter the 4-digit code we sent to your email"}
            </p>
          </div>
        </div>

        <form
          onSubmit={step === "signup" ? handleSignUp : handleVerifyOtp}
          className="flex w-full flex-col gap-4"
        >
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

          {step === "signup" ? (
            <>
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="fullName"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    letterSpacing: "0.02em",
                  }}
                >
                  Full Name
                </label>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    padding: "12px 16px",
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
                      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <input
                    onChange={handleChange}
                    className="w-full p-4"
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
                      padding: "8px 0",
                    }}
                  />
                </div>
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
                    padding: "12px 16px",
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
                      padding: "8px 0",
                    }}
                  />
                </div>
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
                    padding: "12px 16px",
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
                      padding: "8px 0",
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* OTP Verification Step */}
              <div className="flex flex-col gap-3 text-center mb-2">
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                  We've sent a 4-digit code to
                </p>
                <p
                  style={{
                    color: "var(--text-primary)",
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  {credentials.email}
                </p>
              </div>

              {/* OTP Input */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="otp"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    letterSpacing: "0.02em",
                  }}
                >
                  Enter OTP
                </label>
                <div
                  className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    padding: "12px 16px",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border)")
                  }
                >
                  <input
                    onChange={handleOtpChange}
                    value={otp}
                    id="otp"
                    type="text"
                    placeholder="0000"
                    maxLength={4}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "var(--text-primary)",
                      fontSize: 24,
                      fontWeight: 600,
                      textAlign: "center",
                      letterSpacing: "0.5em",
                      padding: "8px 0",
                    }}
                  />
                </div>
              </div>

              {/* Resend OTP Link */}
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  textAlign: "center",
                  marginTop: 2,
                }}
              >
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={() => setStep("signup")}
                  style={{
                    color: "var(--accent-light)",
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "none",
                  }}
                >
                  Try again
                </button>
              </p>
            </>
          )}

          {/* Submit */}
          <button
            id="signup-submit"
            type="submit"
            disabled={submitting || (step === "otp" && otp.length !== 4)}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 mt-1"
            style={{
              background:
                submitting || (step === "otp" && otp.length !== 4)
                  ? "var(--text-muted)"
                  : "var(--accent)",
              boxShadow: submitting ? "none" : "var(--shadow-accent)",
              fontSize: 15,
              letterSpacing: "0.01em",
              cursor:
                submitting || (step === "otp" && otp.length !== 4)
                  ? "not-allowed"
                  : "pointer",
              padding: "12px 16px",
            }}
            onMouseEnter={(e) => {
              if (!submitting && (step === "signup" || otp.length === 4)) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--accent-light)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 28px var(--accent-glow)";
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting && (step === "signup" || otp.length === 4)) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--accent)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "var(--shadow-accent)";
              }
            }}
          >
            {submitting
              ? step === "signup"
                ? "Creating Account..."
                : "Verifying OTP..."
              : step === "signup"
                ? "Create Account"
                : "Verify & Sign In"}
          </button>

          {step === "signup" && (
            <>
              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div
                  style={{ flex: 1, height: 1, background: "var(--border)" }}
                />
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  OR
                </span>
                <div
                  style={{ flex: 1, height: 1, background: "var(--border)" }}
                />
              </div>

              {/* Link */}
              <p
                className="text-center"
                style={{ color: "var(--text-secondary)", fontSize: 13 }}
              >
                Already have an account?{" "}
                <Link
                  to="/signin"
                  style={{
                    color: "var(--accent-light)",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default SignUp;
