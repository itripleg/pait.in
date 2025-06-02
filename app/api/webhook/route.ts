// Updated app/api/webhook/route.ts - Just add logging
import { NextRequest, NextResponse } from "next/server";
import { saveMessage, initDB } from "../../../lib/db";
import { getContactByPhone } from "../../../lib/contacts";

export async function POST(request: NextRequest) {
  console.log("📨 Incoming SMS webhook called"); // Add this

  await initDB();

  const formData = await request.formData();
  const Body = formData.get("Body") as string;
  const From = formData.get("From") as string;
  const To = formData.get("To") as string;

  console.log("SMS Details:", { From, To, Body }); // Add this

  try {
    // Find the contact who sent the message
    const contact = getContactByPhone(From);
    const contactName = contact ? contact.name : "Unknown";

    console.log("Contact found:", contactName); // Add this

    // Save incoming message to database
    await saveMessage(Body, "incoming", From, To, contactName);

    console.log("✅ Message saved to database"); // Add this

    // Respond with TwiML
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Message received! 📱</Message>
</Response>`;

    return new NextResponse(twimlResponse, {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (error) {
    console.error("❌ Error handling webhook:", error);

    // Return TwiML even on error (don't return JSON to Twilio)
    const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Error processing message</Message>
</Response>`;

    return new NextResponse(errorResponse, {
      status: 200, // Still return 200 to Twilio
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }
}
