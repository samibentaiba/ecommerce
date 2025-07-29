import React from "react";

interface EmailTemplateProps {
  children: React.ReactNode;
  title?: string;
}

export function EmailTemplate({ children, title }: EmailTemplateProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      {title && (
        <h1 style={{ color: "#333", textAlign: "center" }}>{title}</h1>
      )}
      {children}
      <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "30px 0" }} />
      <p style={{ color: "#999", fontSize: "12px", textAlign: "center" }}>
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  );
}

export function PasswordResetTemplate({ resetUrl }: { resetUrl: string }) {
  return (
    <EmailTemplate title="Password Reset Request">
      <p style={{ color: "#666", lineHeight: "1.6" }}>
        You requested a password reset for your account. Click the button below to reset your password:
      </p>
      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <a
          href={resetUrl}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "12px 24px",
            textDecoration: "none",
            borderRadius: "5px",
            display: "inline-block",
          }}
        >
          Reset Password
        </a>
      </div>
      <p style={{ color: "#666", lineHeight: "1.6" }}>
        This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
      </p>
    </EmailTemplate>
  );
}

export function WelcomeTemplate({ name }: { name: string }) {
  return (
    <EmailTemplate title="Welcome to Our Store!">
      <p style={{ color: "#666", lineHeight: "1.6" }}>Hi {name},</p>
      <p style={{ color: "#666", lineHeight: "1.6" }}>
        Thank you for creating an account with us. We're excited to have you as part of our community!
      </p>
      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <a
          href="/admin/signin"
          style={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "12px 24px",
            textDecoration: "none",
            borderRadius: "5px",
            display: "inline-block",
          }}
        >
          Sign In to Your Account
        </a>
      </div>
      <p style={{ color: "#666", lineHeight: "1.6" }}>
        If you have any questions, feel free to reach out to our support team.
      </p>
    </EmailTemplate>
  );
}

export function OrderConfirmationTemplate({ orderId, orderDetails }: { orderId: string; orderDetails: any }) {
  return (
    <EmailTemplate title="Order Confirmation">
      <p style={{ color: "#666", lineHeight: "1.6" }}>
        Thank you for your order! Your order has been confirmed and is being processed.
      </p>
      <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "5px", margin: "20px 0" }}>
        <h3 style={{ color: "#333", marginTop: "0" }}>Order Details</h3>
        <p>
          <strong>Order ID:</strong> {orderId}
        </p>
        <p>
          <strong>Total:</strong> ${orderDetails.total}
        </p>
        <p>
          <strong>Status:</strong> {orderDetails.status}
        </p>
      </div>
      <p style={{ color: "#666", lineHeight: "1.6" }}>
        We'll send you an email when your order ships. You can track your order status in your account.
      </p>
    </EmailTemplate>
  );
} 