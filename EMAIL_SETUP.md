# Email Configuration with Resend

This project uses [Resend](https://resend.com) for sending transactional emails. Resend is a modern email API that provides excellent deliverability and developer experience.

## Setup Instructions

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. In your Resend dashboard, go to the API Keys section
2. Create a new API key
3. Copy the API key (it starts with `re_`)

### 3. Verify Your Domain (Recommended)

For production use, you should verify your domain:

1. In your Resend dashboard, go to Domains
2. Add your domain (e.g., `yourstore.com`)
3. Follow the DNS configuration instructions
4. Wait for verification (usually takes a few minutes)

### 4. Environment Variables

Add these environment variables to your `.env` file:

```env
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourstore.com

# NextAuth.js Configuration
NEXTAUTH_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"
```

### 5. Test Your Setup

1. Start your development server: `bun run dev`
2. Navigate to `/admin/email-preview` to test email templates
3. Try sending test emails to verify everything works

## Email Templates

The application includes several email templates:

### Password Reset Email

- **Trigger**: User requests password reset
- **Template**: `PasswordResetTemplate`
- **API Route**: `/api/auth/forgot-password`

### Welcome Email

- **Trigger**: New user registration
- **Template**: `WelcomeTemplate`
- **API Route**: `/api/auth/register`

### Order Confirmation Email

- **Trigger**: Order placement
- **Template**: `OrderConfirmationTemplate`
- **API Route**: `/api/orders/confirmation`

## Email Service Architecture

### EmailService Class

The `EmailService` class provides a centralized way to send emails:

```typescript
import { emailService } from "@/lib/email";

// Send a custom email
await emailService.sendEmail({
  to: "user@example.com",
  subject: "Custom Subject",
  html: "<h1>Custom HTML</h1>",
});

// Send a password reset email
await emailService.sendPasswordResetEmail(email, resetUrl);

// Send a welcome email
await emailService.sendWelcomeEmail(email, name);

// Send an order confirmation email
await emailService.sendOrderConfirmationEmail(email, orderId, orderDetails);
```

### React Email Templates

React components are available for previewing and testing email templates:

```typescript
import { PasswordResetTemplate, WelcomeTemplate, OrderConfirmationTemplate } from "@/components/email/EmailTemplate";

// Use in your React components
<PasswordResetTemplate resetUrl="https://example.com/reset?token=abc123" />
<WelcomeTemplate name="John Doe" />
<OrderConfirmationTemplate orderId="ORD-123" orderDetails={{ total: "99.99", status: "Processing" }} />
```

## Development vs Production

### Development

- Use your verified domain or Resend's sandbox domain
- Test emails are sent to real email addresses
- Monitor delivery in Resend dashboard

### Production

- Always use a verified domain
- Set up proper SPF, DKIM, and DMARC records
- Monitor email analytics in Resend dashboard
- Consider setting up webhooks for delivery tracking

## Best Practices

### 1. Error Handling

Always wrap email sending in try-catch blocks:

```typescript
try {
  await emailService.sendPasswordResetEmail(email, resetUrl);
} catch (error) {
  console.error("Failed to send email:", error);
  // Don't fail the main operation if email fails
}
```

### 2. Rate Limiting

Resend has rate limits:

- Free tier: 100 emails/day
- Paid tiers: Higher limits
- Monitor usage in dashboard

### 3. Email Content

- Use responsive HTML
- Include plain text alternatives
- Test across different email clients
- Keep subject lines under 50 characters

### 4. Security

- Never expose API keys in client-side code
- Validate email addresses before sending
- Use environment variables for configuration
- Implement proper authentication for email endpoints

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check API key is correct
   - Verify domain is configured
   - Check rate limits

2. **Emails going to spam**
   - Verify your domain properly
   - Set up SPF, DKIM, and DMARC records
   - Use consistent "from" addresses

3. **Template rendering issues**
   - Test templates in the preview page
   - Check HTML syntax
   - Verify all variables are passed correctly

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=resend:*
```

## Monitoring and Analytics

Resend provides comprehensive analytics:

- Delivery rates
- Open rates
- Click rates
- Bounce rates
- Spam complaints

Access these in your Resend dashboard under the Analytics section.

## Migration from Nodemailer

This project was migrated from Nodemailer to Resend for:

- Better deliverability
- Modern API
- Better developer experience
- Edge Runtime compatibility
- Built-in analytics

The migration removed the following dependencies:

- `nodemailer`
- `@types/nodemailer`

## Support

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Email Best Practices](https://resend.com/docs/best-practices)
