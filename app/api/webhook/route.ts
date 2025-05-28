// Updated app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { saveMessage, initDB } from "../../../lib/db";
import { getContactByPhone } from "../../../lib/contacts";

export async function POST(request: NextRequest) {
  await initDB();

  const formData = await request.formData();
  const Body = formData.get("Body") as string;
  const From = formData.get("From") as string;
  const To = formData.get("To") as string;

  try {
    // Find the contact who sent the message
    const contact = getContactByPhone(From);
    const contactName = contact ? contact.name : "Unknown";

    // Save incoming message to database
    await saveMessage(Body, "incoming", From, To, contactName);

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
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
