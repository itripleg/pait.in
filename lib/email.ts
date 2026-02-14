// lib/email.ts - Resend email service with dreamy aesthetic
import { Resend } from "resend";

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  text,
  from,
  replyTo,
}: EmailOptions) {
  // Verify API key is configured
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const fromAddress = from || "Paitin <paitin@pait.in>";
  const replyToAddress = replyTo || "pai@pait.in";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 50%, #f0f9ff 100%); min-height: 100vh;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 50%, #f0f9ff 100%);">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 500px; background: rgba(255, 255, 255, 0.95); border-radius: 24px; box-shadow: 0 4px 30px rgba(168, 85, 247, 0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="padding: 30px 30px 20px 30px; text-align: center;">
                  <div style="font-size: 32px; margin-bottom: 15px;">✨</div>
                  <h1 style="margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 24px; font-weight: 600; color: #a855f7;">
                    Message from Paitin
                  </h1>
                </td>
              </tr>
              <!-- Message Content -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <div style="background: rgba(250, 245, 255, 0.6); border-radius: 16px; padding: 25px; border-left: 4px solid #a855f7;">
                    <p style="margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #3f3f46; white-space: pre-wrap;">${text}</p>
                  </div>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 30px 30px 30px; border-top: 1px solid rgba(168, 85, 247, 0.1);">
                  <p style="margin: 0 0 8px 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #a1a1aa; text-align: center;">
                    Sent with <span style="color: #ec4899;">&#9829;</span> via pait.in
                  </p>
                  <p style="margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #d4d4d8; text-align: center;">
                    Reply to this email to send a message back
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: subject,
      html: htmlContent,
      text: text,
      replyTo: replyToAddress,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(error.message || "Resend API error");
    }

    console.log("Email sent successfully via Resend:", data?.id);
    return {
      success: true,
      id: data?.id || "sent",
      messageId: data?.id || "sent",
    };
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}
