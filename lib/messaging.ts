// lib/messaging.ts - Combined SMS + Email messaging service
import { sendSMS } from "./twilio";
import { sendEmail } from "./email";
import { EnhancedContact } from "./contacts";

export interface MessageResult {
  method: "sms" | "email";
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SendMessageOptions {
  contact: EnhancedContact;
  message: string;
  senderName?: string;
}

/**
 * Sends message via all available methods for the contact
 * This keeps it simple - fire and forget to all methods simultaneously
 */
export async function sendMessageToContact({
  contact,
  message,
  senderName = "PAIT",
}: SendMessageOptions): Promise<MessageResult[]> {
  const results: MessageResult[] = [];
  const promises: Promise<void>[] = [];

  // Format the message with sender info
  const formattedMessage = `[${senderName}] ${message}`;

  // SMS attempt
  if (contact.methods.includes("sms") && contact.phone) {
    const smsPromise = sendSMS(contact.phone, formattedMessage)
      .then((twilioMessage) => {
        results.push({
          method: "sms",
          success: true,
          messageId: twilioMessage.sid,
        });
      })
      .catch((error) => {
        console.error(`SMS failed for ${contact.name}:`, error);
        results.push({
          method: "sms",
          success: false,
          error: error.message,
        });
      });

    promises.push(smsPromise);
  }

  // Email attempt
  if (contact.methods.includes("email") && contact.email) {
    const emailPromise = sendEmail({
      to: contact.email,
      subject: `📟 PAIT Message from ${senderName}`,
      text: message, // Don't double-format for email subject line
    })
      .then((emailResult) => {
        results.push({
          method: "email",
          success: true,
          messageId: emailResult.id,
        });
      })
      .catch((error) => {
        console.error(`Email failed for ${contact.name}:`, error);
        results.push({
          method: "email",
          success: false,
          error: error.message,
        });
      });

    promises.push(emailPromise);
  }

  // Wait for all attempts to complete (don't fail if one method fails)
  await Promise.allSettled(promises);

  return results;
}

/**
 * Simple wrapper that tries SMS first, falls back to email if SMS fails
 * Alternative approach if you prefer fallback behavior
 */
export async function sendMessageWithFallback({
  contact,
  message,
  senderName = "PAIT",
}: SendMessageOptions): Promise<MessageResult> {
  const formattedMessage = `[${senderName}] ${message}`;

  // Try SMS first
  if (contact.methods.includes("sms") && contact.phone) {
    try {
      const twilioMessage = await sendSMS(contact.phone, formattedMessage);
      return {
        method: "sms",
        success: true,
        messageId: twilioMessage.sid,
      };
    } catch (error) {
      console.error(`SMS failed for ${contact.name}, trying email:`, error);
    }
  }

  // Fallback to email
  if (contact.methods.includes("email") && contact.email) {
    try {
      const emailResult = await sendEmail({
        to: contact.email,
        subject: `📟 PAIT Message from ${senderName}`,
        text: message,
      });
      return {
        method: "email",
        success: true,
        messageId: emailResult.id,
      };
    } catch (error) {
      console.error(`Email also failed for ${contact.name}:`, error);
      return {
        method: "email",
        success: false,
        error: (error as Error).message,
      };
    }
  }

  return {
    method: "sms",
    success: false,
    error: "No available communication methods",
  };
}
