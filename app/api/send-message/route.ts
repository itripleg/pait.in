// app/api/send-message/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "../../../lib/twilio";
import { saveMessage, initDB } from "../../../lib/db";
import { getContactByName } from "../../../lib/contacts";

export async function POST(request: NextRequest) {
  await initDB();

  // Get auth token from cookie instead of request body
  const authToken = request.cookies.get("pait_auth")?.value;

  if (!authToken || authToken !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, contactName } = await request.json(); // Remove password from body

  if (!message || message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (!contactName) {
    return NextResponse.json({ error: "Contact is required" }, { status: 400 });
  }

  // Find the contact
  const contact = getContactByName(contactName);
  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 400 });
  }

  if (!contact.approved) {
    return NextResponse.json(
      { error: "Contact not approved" },
      { status: 403 }
    );
  }

  try {
    // Send SMS to the contact
    const twilioMessage = await sendSMS(contact.phone, message);

    // Save to database with contact name
    await saveMessage(
      message,
      "outgoing",
      process.env.TWILIO_PHONE_NUMBER!,
      contact.phone,
      contact.name
    );

    return NextResponse.json({
      success: true,
      messageId: twilioMessage.sid,
      message: `Message sent to ${contact.name}! 📱`,
      contact: contact.name,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
