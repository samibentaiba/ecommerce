import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static instance: EmailService;
  private resend: Resend;

  private constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.resend.emails.send({
        from:
          options.from ||
          process.env.RESEND_FROM_EMAIL ||
          "noreply@yourstore.com",
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    } catch (error) {
      console.error("Email sending failed:", error);
      throw new Error("Failed to send email");
    }
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
        <p style="color: #666; line-height: 1.6;">
          You requested a password reset for your account. Click the button below to reset your password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; line-height: 1.6;">
          This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: "Password Reset Request",
      html,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Welcome to Our Store!</h1>
        <p style="color: #666; line-height: 1.6;">
          Hi ${name},
        </p>
        <p style="color: #666; line-height: 1.6;">
          Thank you for creating an account with us. We're excited to have you as part of our community!
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/admin/signin" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Sign In to Your Account
          </a>
        </div>
        <p style="color: #666; line-height: 1.6;">
          If you have any questions, feel free to reach out to our support team.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: "Welcome to Our Store!",
      html,
    });
  }

  async sendOrderConfirmationEmail(
    email: string,
    orderId: string,
    orderDetails: any
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Order Confirmation</h1>
        <p style="color: #666; line-height: 1.6;">
          Thank you for your order! Your order has been confirmed and is being processed.
        </p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Total:</strong> $${orderDetails.total}</p>
          <p><strong>Status:</strong> ${orderDetails.status}</p>
        </div>
        <p style="color: #666; line-height: 1.6;">
          We'll send you an email when your order ships. You can track your order status in your account.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: `Order Confirmation - ${orderId}`,
      html,
    });
  }
}

// Export a singleton instance
export const emailService = EmailService.getInstance();
