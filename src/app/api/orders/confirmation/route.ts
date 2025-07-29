import { NextRequest, NextResponse } from "next/server";
import { emailService } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email, orderId, orderDetails } = await request.json();

    if (!email || !orderId || !orderDetails) {
      return NextResponse.json(
        { error: "Email, order ID, and order details are required" },
        { status: 400 }
      );
    }

    // Send order confirmation email
    await emailService.sendOrderConfirmationEmail(email, orderId, orderDetails);

    return NextResponse.json(
      { message: "Order confirmation email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order confirmation email error:", error);
    return NextResponse.json(
      { error: "Failed to send order confirmation email" },
      { status: 500 }
    );
  }
}
