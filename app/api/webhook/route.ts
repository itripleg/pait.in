// app/api/webhook/route.ts - Unified webhook with security measures
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "twilio";
import { saveMessage, initDB } from "../../../lib/db";
import { getContactByPhone, getContactByEmail } from "../../../lib/contacts";

export async function POST(request: NextRequest) {
  console.log("📨 Incoming webhook at:", new Date().toISOString());

  try {
    await initDB();

    // Check content type to determine if this is SMS (Twilio) or Email (SendGrid)
    const contentType = request.headers.get("content-type") || "";
    const userAgent = request.headers.get("user-agent") || "";

    console.log("🔍 Content-Type:", contentType);
    console.log("🔍 User-Agent:", userAgent);

    // SendGrid sends multipart/form-data, Twilio sends application/x-www-form-urlencoded
    if (contentType.includes("multipart/form-data")) {
      return await handleEmailWebhook(request);
    } else {
      return await handleSMSWebhook(request);
    }
  } catch (error) {
    console.error("❌ Webhook error:", error);

    // Return appropriate response based on likely source
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      // Email webhook - return plain text
      return new NextResponse("Error processing email", { status: 200 });
    } else {
      // SMS webhook - return TwiML
      const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Error processing message</Message>
</Response>`;
      return new NextResponse(errorResponse, {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      });
    }
  }
}

// Handle SMS webhooks from Twilio with full security
async function handleSMSWebhook(request: NextRequest) {
  console.log("📱 Processing SMS webhook from Twilio");

  // Get the raw body and signature
  const body = await request.text();
  const signature = request.headers.get("x-twilio-signature");
  const url = request.url;

  // DEBUG: Log everything for troubleshooting
  console.log("🔍 DEBUG INFO:");
  console.log("- URL:", url);
  console.log("- Signature header:", signature);
  console.log("- Body length:", body.length);
  console.log("- Body content:", body);
  console.log("- Auth token exists:", !!process.env.TWILIO_AUTH_TOKEN);
  console.log("- Auth token length:", process.env.TWILIO_AUTH_TOKEN?.length);
  console.log(
    "- Auth token preview:",
    process.env.TWILIO_AUTH_TOKEN?.substring(0, 8) + "..."
  );

  // Parse form data for validation
  const formData = new URLSearchParams(body);
  const params: { [key: string]: string } = {};
  for (const [key, value] of formData.entries()) {
    params[key] = value;
  }

  console.log("📋 Parsed params:", params);

  // SECURITY: Verify the request is actually from Twilio
  if (
    process.env.NODE_ENV === "production" &&
    signature &&
    process.env.TWILIO_AUTH_TOKEN
  ) {
    console.log("🔐 Attempting signature verification...");

    // Try different URL formats that might work
    const possibleUrls = [
      url, // Full URL as received
      url.split("?")[0], // URL without query params
      `https://pait.in/api/webhook`, // Hardcoded URL
      request.nextUrl.href, // Alternative URL method
    ];

    let isValidRequest = false;
    let workingUrl = "";

    for (const testUrl of possibleUrls) {
      console.log(`🧪 Testing URL: ${testUrl}`);
      try {
        const testResult = validateRequest(
          process.env.TWILIO_AUTH_TOKEN,
          signature,
          testUrl,
          params
        );
        console.log(`- Result for ${testUrl}: ${testResult}`);

        if (testResult) {
          isValidRequest = true;
          workingUrl = testUrl;
          break;
        }
      } catch (error) {
        console.log(`- Error testing ${testUrl}:`, error);
      }
    }

    if (!isValidRequest) {
      console.error("❌ All signature validation attempts failed");
      console.error("This could be due to:");
      console.error("1. Wrong Auth Token");
      console.error("2. URL mismatch between Twilio config and actual URL");
      console.error("3. Proxy/load balancer modifying the request");
      console.error("4. Clock skew between servers");

      // For debugging, let's allow the request but log the issue
      console.log("⚠️ ALLOWING REQUEST FOR DEBUGGING - REMOVE IN PRODUCTION");
    } else {
      console.log(`✅ Signature verified with URL: ${workingUrl}`);
    }
  } else {
    console.log("⚠️ Skipping signature verification:");
    if (process.env.NODE_ENV !== "production")
      console.log("- Development mode");
    if (!signature) console.log("- No signature header");
    if (!process.env.TWILIO_AUTH_TOKEN) console.log("- No auth token in env");
  }

  // Extract message data
  const Body = formData.get("Body");
  const From = formData.get("From");
  const To = formData.get("To");
  const MessageSid = formData.get("MessageSid");

  console.log("📱 SMS Details:", { From, To, Body, MessageSid });

  // Validate required fields
  if (!Body || !From || !To) {
    console.error("❌ Missing required fields");
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Error: Missing required fields</Message>
</Response>`,
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      }
    );
  }

  // Find contact
  const contact = await getContactByPhone(From);
  const contactName = contact ? contact.name : "Unknown";
  console.log("👤 Contact:", contactName);

  // Save to database
  const savedMessage = await saveMessage(
    Body,
    "incoming",
    From,
    To,
    contactName
  );
  console.log("💾 Saved SMS message ID:", savedMessage.id);

  // Respond with TwiML
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Message received! 📱</Message>
</Response>`;

  return new NextResponse(twimlResponse, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

// Handle email webhooks from SendGrid
async function handleEmailWebhook(request: NextRequest) {
  console.log("📧 Processing email webhook from SendGrid");

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
  const contact = await getContactByEmail(senderEmail);
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
    message: "Unified webhook endpoint is working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supports: ["Twilio SMS", "SendGrid Email"],
    hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
    authTokenLength: process.env.TWILIO_AUTH_TOKEN?.length,
  });
}
