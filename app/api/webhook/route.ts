// app/api/webhook/route.ts - Debug version to troubleshoot signature issues
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "twilio";
import { saveMessage, initDB } from "../../../lib/db";
import { getContactByPhone } from "../../../lib/contacts";

export async function POST(request: NextRequest) {
  console.log("📨 Incoming webhook at:", new Date().toISOString());

  try {
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

    // Initialize database
    await initDB();

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
    const contact = getContactByPhone(From);
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
    console.log("💾 Saved message ID:", savedMessage.id);

    // Respond with TwiML
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Message received! 📱</Message>
</Response>`;

    return new NextResponse(twimlResponse, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);

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

export async function GET() {
  return NextResponse.json({
    message: "Webhook endpoint is working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
    authTokenLength: process.env.TWILIO_AUTH_TOKEN?.length,
  });
}
