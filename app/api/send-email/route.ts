// app/api/send-email/route.ts - Send email to any address
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserByPassword } from "@/lib/user-management";
import { sendEmail } from "@/lib/email";
import { getContactByEmail } from "@/lib/contacts";

export async function POST(request: NextRequest) {
  // Get auth token from cookie
  const cookieStore = await cookies();
  const authToken = cookieStore.get("pait_auth")?.value;

  if (!authToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate using user management system
  const user = findUserByPassword(authToken);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid authentication" },
      { status: 401 }
    );
  }

  try {
    const { to, subject, message } = await request.json();

    // Validate inputs
    if (!to || !message) {
      return NextResponse.json(
        { error: "Recipient email and message are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Try to find contact name for this email (fallback to email if lookup fails)
    let contactName = to;
    try {
      const contact = await getContactByEmail(to);
      if (contact?.name) {
        contactName = contact.name;
      }
    } catch (e) {
      // Contact lookup failed, use email as name
      console.log("Contact lookup failed, using email as name");
    }

    // Format subject line
    const emailSubject = subject
      ? `[${user.name}] ${subject}`
      : `Message from ${user.name}`;

    // Format message with sender name
    const formattedMessage = `[${user.name}] ${message}`;

    // Send the email first - this is the primary action
    await sendEmail({
      to,
      subject: emailSubject,
      text: formattedMessage,
    });

    console.log(`Email sent from ${user.name} to ${to}`);

    // Try to save to database (non-blocking, don't fail if DB has issues)
    try {
      const { saveMessage, initDB } = await import("@/lib/db");
      await initDB();
      await saveMessage(
        message,
        "outgoing",
        "paitin@pait.in",
        to,
        contactName
      );
      console.log("Message saved to database");
    } catch (dbError) {
      // Log but don't fail - email was already sent
      console.error("Failed to save message to database:", dbError);
    }

    return NextResponse.json({
      success: true,
      message: `Email sent to ${contactName}`,
      to,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to send email: ${errorMessage}` },
      { status: 500 }
    );
  }
}
