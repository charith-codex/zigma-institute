import React from "react";
import { APP_NAME } from "@/lib/constants";

interface PasswordResetEmailProps {
  resetUrl: string;
}

export const PasswordResetEmail = ({ resetUrl }: PasswordResetEmailProps) => {
  return (
    <div style={{ fontFamily: "Inter, Arial, sans-serif", lineHeight: 1.6 }}>
      <h2 style={{ marginBottom: "12px" }}>Reset your password</h2>
      <p style={{ margin: "8px 0" }}>
        We received a request to reset your {APP_NAME} password.
      </p>
      <p style={{ margin: "8px 0" }}>
        Click the button below to choose a new password. This link is valid for 30
        minutes.
      </p>
      <a
        href={resetUrl}
        style={{
          display: "inline-block",
          padding: "10px 16px",
          backgroundColor: "#111827",
          color: "#ffffff",
          borderRadius: "8px",
          textDecoration: "none",
          marginTop: "12px",
        }}
      >
        Reset Password
      </a>
      <p style={{ marginTop: "16px", color: "#6b7280" }}>
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  );
};
