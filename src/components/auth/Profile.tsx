import React, { useState, useRef } from "react";
import axiosInstance from "../../lib/axios";
import type { ApiResponse } from "../../lib/apiResponse";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useAuth();
  const { me, loading } = authContext;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: me?.fullName || "",
    email: me?.email || "",
    profilePic: me?.profilePic || "",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [emailVerification, setEmailVerification] = useState({
    step: "idle", // idle, sending, verifying
    newEmail: "",
    otp: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleProfilePicClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePic: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccess("");

    // Check if email has changed
    const emailChanged = formData.email !== me?.email;

    if (emailChanged) {
      // If email changed, start verification process
      try {
        const response = await axiosInstance.post<ApiResponse<any>>(
          "/auth/send-email-verification-otp",
          { newEmail: formData.email }
        );

        if (response.data.success) {
          setSuccess("OTP sent to your new email!");
          setEmailVerification({
            step: "verifying",
            newEmail: formData.email,
            otp: "",
          });
          setFormData((prev) => ({ ...prev, email: me?.email || "" }));
        }
      } catch (error: any) {
        const message =
          error.response?.data?.message || "Failed to send OTP";
        setErrors({ submit: message });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // If only fullName or profilePic changed, update directly
    try {
      const response = await axiosInstance.put<ApiResponse<any>>(
        "/auth/update-user-profile",
        {
          fullName: formData.fullName !== me?.fullName ? formData.fullName : undefined,
          profilePic: formData.profilePic !== me?.profilePic ? formData.profilePic : undefined,
        }
      );

      if (response.data.success) {
        setSuccess("Profile updated successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to update profile";
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    if (!emailVerification.otp) {
      setErrors({ otp: "OTP is required" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        "/auth/verify-and-update-email",
        {
          newEmail: emailVerification.newEmail,
          otp: emailVerification.otp,
        }
      );

      if (response.data.success) {
        setSuccess("Email updated successfully!");
        setEmailVerification({ step: "idle", newEmail: "", otp: "" });
        setFormData((prev) => ({ ...prev, email: emailVerification.newEmail }));
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to verify email";
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setErrors({ newPassword: "Password must be at least 6 characters" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.put<ApiResponse<any>>(
        "/auth/change-password",
        {
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        }
      );

      if (response.data.success) {
        setSuccess("Password changed successfully!");
        setPasswords({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          navigate("/app/chat");
        }, 1500);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to change password";
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)" }}>
        <div style={{ fontSize: 18, color: "var(--text-secondary)" }}>Loading...</div>
      </div>
    );
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? "")
      .join("");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          background: "var(--bg-surface)",
          borderRadius: 16,
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Settings</h1>
          <button
            onClick={() => navigate("/app/chat")}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-hover)",
          }}
        >
          <button
            onClick={() => setActiveTab("profile")}
            style={{
              flex: 1,
              padding: "12px",
              background: activeTab === "profile" ? "var(--bg-surface)" : "transparent",
              border: "none",
              borderBottom: activeTab === "profile" ? "2px solid var(--accent)" : "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: activeTab === "profile" ? 600 : 500,
              color: activeTab === "profile" ? "var(--accent)" : "var(--text-secondary)",
              transition: "all 0.2s",
            }}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            style={{
              flex: 1,
              padding: "12px",
              background: activeTab === "password" ? "var(--bg-surface)" : "transparent",
              border: "none",
              borderBottom: activeTab === "password" ? "2px solid var(--accent)" : "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: activeTab === "password" ? 600 : 500,
              color: activeTab === "password" ? "var(--accent)" : "var(--text-secondary)",
              transition: "all 0.2s",
            }}
          >
            Password
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {emailVerification.step === "verifying" ? (
            <form onSubmit={handleVerifyEmailOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <p style={{ margin: "0 0 4px 0", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  Verify Your New Email
                </p>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
                  OTP sent to {emailVerification.newEmail}
                </p>
              </div>

              {/* OTP Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={emailVerification.otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setEmailVerification((prev) => ({ ...prev, otp: val }));
                    if (errors.otp) setErrors((prev) => ({ ...prev, otp: "" }));
                  }}
                  placeholder="0000"
                  maxLength={4}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: errors.otp ? "1px solid var(--danger)" : "1px solid var(--border)",
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
                {isSubmitting ? "Verifying..." : "Verify Email"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmailVerification({ step: "idle", newEmail: "", otp: "" });
                  setFormData((prev) => ({ ...prev, email: me?.email || "" }));
                  setErrors({});
                  setSuccess("");
                }}
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
                Cancel
              </button>
            </form>
          ) : activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Profile Picture */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Profile Picture
                </label>
                <div style={{ position: "relative", width: 80, height: 80 }}>
                  <div
                    onClick={handleProfilePicClick}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "var(--accent)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      border: "2px solid var(--accent)",
                      fontSize: 32,
                      fontWeight: 700,
                      color: "#fff",
                      transition: "all 0.2s",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = "0.8";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = "1";
                    }}
                  >
                    {!formData.profilePic && getInitials(formData.fullName)}
                    {formData.profilePic && (
                      <img
                        src={formData.profilePic}
                        alt="avatar"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        draggable={false}
                      />
                    )}
                  </div>

                  {formData.profilePic && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, profilePic: "" }))}
                      style={{
                        position: "absolute",
                        right: -6,
                        bottom: -6,
                        background: "var(--danger)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Click to change picture
                </span>
              </div>

              {/* Full Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: errors.fullName
                      ? "1px solid var(--danger)"
                      : "1px solid var(--border)",
                    background: "var(--bg-base)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    if (!errors.fullName) {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.fullName) {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    }
                  }}
                />
                {errors.fullName && (
                  <span style={{ fontSize: 12, color: "var(--danger)" }}>
                    {errors.fullName}
                  </span>
                )}
              </div>

              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: errors.email ? "1px solid var(--danger)" : "1px solid var(--border)",
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
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}

          {activeTab === "password" && (
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Old Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Current Password
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwords.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: errors.oldPassword
                      ? "1px solid var(--danger)"
                      : "1px solid var(--border)",
                    background: "var(--bg-base)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    if (!errors.oldPassword) {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.oldPassword) {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    }
                  }}
                />
                {errors.oldPassword && (
                  <span style={{ fontSize: 12, color: "var(--danger)" }}>
                    {errors.oldPassword}
                  </span>
                )}
              </div>

              {/* New Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
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

              {/* Confirm Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
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
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
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
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-dim)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                Forgot Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
