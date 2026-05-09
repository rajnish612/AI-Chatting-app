import React, { useState } from "react";
import axiosInstance from "../../lib/axios";
import type { ApiResponse } from "../../lib/apiResponse";
import { useNavigate } from "react-router-dom";

type ForgotPasswordStep = "email" | "verify" | "reset";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        "/auth/forgot-password",
        { email }
      );

      if (response.data.success) {
        setSuccess("OTP sent to your email!");
        setTimeout(() => {
          setStep("verify");
          setSuccess("");
        }, 1500);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to send OTP";
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!otp) {
      setErrors({ otp: "OTP is required" });
      return;
    }

    if (otp.length !== 4) {
      setErrors({ otp: "OTP must be 4 digits" });
      return;
    }

    setStep("reset");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setErrors({ submit: "All fields are required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      setErrors({ newPassword: "Password must be at least 6 characters" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        "/auth/reset-password",
        {
          email,
          otp,
          newPassword,
        }
      );

      if (response.data.success) {
        setSuccess("Password reset successfully! Redirecting to sign in...");
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to reset password";
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          background: "var(--bg-surface)",
          borderRadius: 16,
          border: "1px solid var(--border)",
          padding: "32px 24px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ margin: "0 0 8px 0", fontSize: 24, fontWeight: 700 }}>
            Reset Password
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>
            {step === "email" && "Enter your email to receive an OTP"}
            {step === "verify" && "Enter the OTP sent to your email"}
            {step === "reset" && "Create your new password"}
          </p>
        </div>

        {/* Step Indicator */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            justifyContent: "center",
          }}
        >
          {(["email", "verify", "reset"] as ForgotPasswordStep[]).map((s, i) => (
            <div
              key={s}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  s === step || (step === "verify" && s !== "reset") || (step === "reset" && s !== "email")
                    ? "var(--accent)"
                    : "var(--border)",
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>

        {/* Forms */}
        {step === "email" && (
          <form onSubmit={handleRequestOTP} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                placeholder="your@email.com"
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: errors.email
                    ? "1px solid var(--danger)"
                    : "1px solid var(--border)",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  }
                }}
                onBlur={(e) => {
                  if (!errors.email) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  }
                }}
              />
              {errors.email && (
                <span style={{ fontSize: 12, color: "var(--danger)" }}>
                  {errors.email}
                </span>
              )}
            </div>

            {errors.submit && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid var(--danger)",
                  color: "var(--danger)",
                  fontSize: 13,
                }}
              >
                {errors.submit}
              </div>
            )}

            {success && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid var(--success)",
                  color: "var(--success)",
                  fontSize: 13,
                }}
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                fontSize: 14,
                fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              {isSubmitting ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={handleVerifyOTP} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setOtp(val);
                  if (errors.otp) setErrors({ ...errors, otp: "" });
                }}
                placeholder="0000"
                maxLength={4}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: errors.otp
                    ? "1px solid var(--danger)"
                    : "1px solid var(--border)",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  textAlign: "center",
                  letterSpacing: "8px",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  if (!errors.otp) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  }
                }}
                onBlur={(e) => {
                  if (!errors.otp) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  }
                }}
              />
              {errors.otp && (
                <span style={{ fontSize: 12, color: "var(--danger)" }}>
                  {errors.otp}
                </span>
              )}
            </div>

            <button
              type="submit"
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Verify OTP
            </button>

            <button
              type="button"
              onClick={() => setStep("email")}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                background: "transparent",
                color: "var(--accent)",
                border: "1px solid var(--accent)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Back
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors({ ...errors, newPassword: "" });
                }}
                placeholder="Enter new password"
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: errors.newPassword
                    ? "1px solid var(--danger)"
                    : "1px solid var(--border)",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  if (!errors.newPassword) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  }
                }}
                onBlur={(e) => {
                  if (!errors.newPassword) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  }
                }}
              />
              {errors.newPassword && (
                <span style={{ fontSize: 12, color: "var(--danger)" }}>
                  {errors.newPassword}
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                }}
                placeholder="Confirm password"
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: errors.confirmPassword
                    ? "1px solid var(--danger)"
                    : "1px solid var(--border)",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  if (!errors.confirmPassword) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  }
                }}
                onBlur={(e) => {
                  if (!errors.confirmPassword) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  }
                }}
              />
              {errors.confirmPassword && (
                <span style={{ fontSize: 12, color: "var(--danger)" }}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {errors.submit && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid var(--danger)",
                  color: "var(--danger)",
                  fontSize: 13,
                }}
              >
                {errors.submit}
              </div>
            )}

            {success && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid var(--success)",
                  color: "var(--success)",
                  fontSize: 13,
                }}
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                fontSize: 14,
                fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => setStep("verify")}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                background: "transparent",
                color: "var(--accent)",
                border: "1px solid var(--accent)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Back
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button
            onClick={() => navigate("/signin")}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--accent)",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
