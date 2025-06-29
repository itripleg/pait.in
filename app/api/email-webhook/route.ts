// app/api/email-webhook/route.ts - Email webhook handler for SendGrid
import { NextRequest, NextResponse } from "next/server";
import { saveMessage, initDB } from "../../../lib/db";
import { getContactByEmail } from "../../../lib/contacts";

export async function POST(request: NextRequest) {
  console.log("📧 Incoming email webhook at:", new Date().toISOString());

  try {
    await initDB();

    const formData = await request.formData();

    const from = formData.get("from") as string;
    const to = formData.get("to") as string;
    const subject = formData.get("subject") as string;
    const text = formData.get("text") as string;
    const html = formData.get("html") as string;

    console.log("📧 Email Details:", { from, to, subject });

    // Extract sender email from "from" field (usually in format: "Name <email@domain.com>")
    const emailMatch = from.match(/<([^>]+)>/);
    const senderEmail = emailMatch ? emailMatch[1] : from;

    console.log("👤 Sender email extracted:", senderEmail);

    // Find contact by email
    const contact = getContactByEmail(senderEmail);
    const contactName = contact ? contact.name : extractNameFromEmail(from);

    console.log("👤 Contact:", contactName);

    // Use text content, fallback to HTML if needed
    let emailContent = text || "";
    if (!emailContent && html) {
      // Basic HTML to text conversion (remove tags)
      emailContent = html.replace(/<[^>]*>/g, "").trim();
    }

    // Clean up the content (remove quoted replies)
    const cleanContent = cleanEmailContent(emailContent);

    if (!cleanContent || cleanContent.trim().length === 0) {
      console.log("⚠️ Empty email content after cleaning");
      return new NextResponse("OK", { status: 200 });
    }

    // Save to database as incoming message
    const savedMessage = await saveMessage(
      cleanContent,
      "incoming",
      senderEmail, // from_number (email in this case)
      to, // to_number
      contactName
    );

    console.log("💾 Saved email message ID:", savedMessage.id);

    // Return 200 to acknowledge receipt
    return new NextResponse("Email received successfully", { status: 200 });
  } catch (error) {
    console.error("❌ Email webhook error:", error);
    return new NextResponse("Error processing email", { status: 200 });
  }
}

// Extract name from email address or "From" field
function extractNameFromEmail(fromField: string): string {
  // Try to extract name from "John Doe <john@example.com>" format
  const nameMatch = fromField.match(/^([^<]+)</);
  if (nameMatch) {
    return nameMatch[1].trim().replace(/"/g, "");
  }

  // Fallback: use part before @ as name
  const emailMatch = fromField.match(/([^@<\s]+)/);
  return emailMatch ? emailMatch[1] : "Unknown";
}

// Clean email content by removing quoted replies and signatures
function cleanEmailContent(content: string): string {
  if (!content) return "";

  // Common reply indicators to split on
  const replyIndicators = [
    /^On .* wrote:$/m,
    /^From:.*$/m,
    /^Sent:.*$/m,
    /^To:.*$/m,
    /^Subject:.*$/m,
    /^-----Original Message-----/m,
    /^> .*/m, // Quoted lines
    /^-{3,}/m, // Horizontal lines
  ];

  let cleanedContent = content;

  // Remove everything after reply indicators
  for (const indicator of replyIndicators) {
    const match = cleanedContent.search(indicator);
    if (match !== -1) {
      cleanedContent = cleanedContent.substring(0, match);
    }
  }

  // Remove common email signatures
  const signatureIndicators = [
    /^--\s*$/m,
    /^Sent from my/m,
    /^Best regards/m,
    /^Thanks/m,
    /^Thank you/m,
  ];

  for (const indicator of signatureIndicators) {
    const match = cleanedContent.search(indicator);
    if (match !== -1) {
      cleanedContent = cleanedContent.substring(0, match);
    }
  }

  return cleanedContent.trim();
}

export async function GET() {
  return NextResponse.json({
    message: "Email webhook endpoint is working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
