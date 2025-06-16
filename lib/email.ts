// lib/email.ts - SendGrid email service with pait.in reply support
import sgMail from "@sendgrid/mail";

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  from?: string;
  replyTo?: string;
}

// Initialize SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail({
  to,
  subject,
  text,
  from,
  replyTo,
}: EmailOptions) {
  const msg = {
    to: to,
    // from: from || "joshua.bell.828@gmail.com", // Your verified sender
    from: from || "Paitin@pait.in",
    replyTo: replyTo || "pai@pait.in", // Replies go to your domain!
    // replyTo: replyTo || "paitin@mail.pait.in", // Replies go to your domain!
    subject: subject,
    text: text,
    html: `
      <div style="font-family: monospace; background: #000; color: #00ff41; padding: 20px; border-radius: 8px; max-width: 600px;">
        <h2 style="color: #00ff41; margin: 0 0 20px 0;">📟 PAIT MESSAGE</h2>
        <div style="background: #1a1a1a; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 3px solid #00ff41;">
          <p style="margin: 0; white-space: pre-wrap; color: #00ff41; line-height: 1.4;">${text}</p>
        </div>
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #00ff4130;">
          <small style="color: #00ff4150;">Sent via PAIT - Personal Assistant & Information Terminal</small>
          <br>
          <small style="color: #00ff4130;">Reply to this email to respond via PAIT</small>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
    return {
      success: true,
      id: "sent",
      messageId: "sent",
    };
  } catch (error) {
    console.error("SendGrid error:", error);
    throw error;
  }
}

// Alternative: Using SendGrid (also very easy)
export async function sendEmailSendGrid({ to, subject, text }: EmailOptions) {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: "noreply@pait.in", name: "PAIT" },
        subject: subject,
        content: [
          {
            type: "text/plain",
            value: text,
          },
          {
            type: "text/html",
            value: `
              <div style="font-family: monospace; background: #000; color: #00ff41; padding: 20px; border-radius: 8px;">
                <h2 style="color: #00ff41;">📟 PAIT MESSAGE</h2>
                <div style="background: #1a1a1a; padding: 15px; border-radius: 5px; margin: 10px 0;">
                  <p style="margin: 0; white-space: pre-wrap;">${text}</p>
                </div>
                <small style="color: #00ff4150;">Sent via PAIT - Personal Assistant & Information Terminal</small>
              </div>
            `,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid failed: ${error}`);
    }

    console.log("Email sent via SendGrid");
    return { success: true };
  } catch (error) {
    console.error("SendGrid error:", error);
    throw error;
  }
}
