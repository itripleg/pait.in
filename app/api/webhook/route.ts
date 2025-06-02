// app/api/webhook/route.ts - Secure version with Twilio signature verification
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "twilio";
import { saveMessage, initDB } from "../../../lib/db";
import { getContactByPhone } from "../../../lib/contacts";

export async function POST(request: NextRequest) {
  console.log("📨 Incoming webhook at:", new Date().toISOString());

  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("x-twilio-signature");
    const url = request.url;

    // SECURITY: Verify the request is actually from Twilio
    if (process.env.NODE_ENV === "production") {
      if (!signature) {
        console.error("❌ Missing Twilio signature header");
        return new NextResponse("Unauthorized - Missing signature", {
          status: 401,
        });
      }

      // Parse form data for validation
      const params: { [key: string]: string } = {};
      const formData = new URLSearchParams(body);
      for (const [key, value] of formData.entries()) {
        params[key] = value;
      }

      // Validate the request signature
      const isValidRequest = validateRequest(
        process.env.TWILIO_AUTH_TOKEN!,
        signature,
        url,
        params
      );

      if (!isValidRequest) {
        console.error("❌ Invalid Twilio signature - potential attack");
        return new NextResponse("Unauthorized - Invalid signature", {
          status: 401,
        });
      }

      console.log("✅ Twilio signature verified");
    } else {
      console.log("⚠️ Development mode - skipping signature verification");
    }

    // Initialize database
    await initDB();

    // Parse the verified form data
    const formData = new URLSearchParams(body);
    const Body = formData.get("Body");
    const From = formData.get("From");
    const To = formData.get("To");
    const MessageSid = formData.get("MessageSid");

    console.log("📱 Verified SMS:", { From, To, Body, MessageSid });

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

    // Additional validation: Check if From number is in approved contacts
    const contact = getContactByPhone(From);
    if (!contact) {
      console.log("⚠️ Message from unknown number:", From);
      // You can choose to reject or allow unknown numbers
      // For family safety, you might want to only allow known contacts
    }

    const contactName = contact ? contact.name : "Unknown";

    // Save to database
    const savedMessage = await saveMessage(
      Body,
      "incoming",
      From,
      To,
      contactName
    );
    console.log("💾 Message saved:", savedMessage.id);

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

// Remove GET method in production or secure it
export async function GET(request: NextRequest) {
  // Only allow GET in development
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Method not allowed", { status: 405 });
  }

  return NextResponse.json({
    message: "Webhook endpoint active",
    environment: "development",
    timestamp: new Date().toISOString(),
  });
}
