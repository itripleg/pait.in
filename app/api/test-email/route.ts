// app/api/test-email/route.ts - Debug test following SendGrid recommendations
import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export async function POST(request: NextRequest) {
  try {
    // Check if API key exists
    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json(
        { error: "SENDGRID_API_KEY not found" },
        { status: 500 }
      );
    }

    // Set API key exactly as recommended
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Follow SendGrid's exact pattern
    const msg = {
      to: "joshua.bell.828@gmail.com", // Change to your recipient
      from: "joshua.bell.828@gmail.com", // Change to your verified sender
      subject: "PAIT Email Test - SendGrid Working!",
      text: "This is a test email from PAIT. If you receive this, SendGrid is working correctly!",
      html: "<strong>This is a test email from PAIT. If you receive this, SendGrid is working correctly!</strong>",
    };

    console.log("Sending email with SendGrid...");

    // Use SendGrid pattern with async/await
    await sgMail.send(msg);
    console.log("Email sent");

    return NextResponse.json({
      success: true,
      message: "Email sent successfully using SendGrid recommendations",
      to: msg.to,
      from: msg.from,
    });
  } catch (error: any) {
    console.error("SendGrid error:", error);

    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: error.message,
        sendgridError: error.response?.body || error,
      },
      { status: 500 }
    );
  }
}
