// app/api/send-message/route.ts - Next.js 16 with async cookies() API
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendMessageToContact } from "../../../lib/messaging";
import { saveMessage, initDB } from "../../../lib/db";
import { getContactByName } from "../../../lib/contacts";
import { findUserByPassword } from "../../../lib/user-management";

export async function POST(request: NextRequest) {
  await initDB();

  // Get auth token from cookie using async cookies() API
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

  const { message, contactName } = await request.json();

  if (!message || message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (!contactName) {
    return NextResponse.json({ error: "Contact is required" }, { status: 400 });
  }

  // Find the contact
  const contact = await getContactByName(contactName);
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
    // Send via all available methods
    const results = await sendMessageToContact({
      contact,
      message,
      senderName: user.name, // Use actual user name
    });

    // Count successful deliveries
    const successfulMethods = results.filter((r) => r.success);
    const failedMethods = results.filter((r) => !r.success);

    // Save to database for each successful method
    for (const result of successfulMethods) {
      if (result.method === "sms") {
        await saveMessage(
          message,
          "outgoing",
          process.env.TWILIO_PHONE_NUMBER!,
          contact.phone,
          contact.name
        );
      } else if (result.method === "email") {
        await saveMessage(
          message,
          "outgoing",
          "noreply@pait.in", // From email
          contact.email!,
          contact.name
        );
      }
    }

    // Prepare response message
    let responseMessage = "";
    let status = 200;

    if (successfulMethods.length > 0) {
      const methods = successfulMethods
        .map((r) => r.method.toUpperCase())
        .join(" & ");
      responseMessage = `Message sent to ${contact.name} via ${methods}! 📱📧`;
    }

    if (failedMethods.length > 0) {
      const failedMethodNames = failedMethods
        .map((r) => r.method.toUpperCase())
        .join(" & ");
      if (successfulMethods.length === 0) {
        responseMessage = `Failed to send message via ${failedMethodNames} 😞`;
        status = 500;
      } else {
        responseMessage += ` (${failedMethodNames} failed)`;
      }
    }

    return NextResponse.json(
      {
        success: successfulMethods.length > 0,
        message: responseMessage,
        contact: contact.name,
        results: results,
        methodsAttempted: results.length,
        methodsSuccessful: successfulMethods.length,
      },
      { status }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
