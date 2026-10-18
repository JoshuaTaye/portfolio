import type { Inquiry } from "./inquiry";

/** True when SENDGRID_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL are all set. */
export function isInquiryEmailConfigured(): boolean {
  return Boolean(
    process.env.SENDGRID_API_KEY && process.env.CONTACT_TO_EMAIL && process.env.CONTACT_FROM_EMAIL
  );
}

/** Emails a contact-form message to CONTACT_TO_EMAIL; replying goes straight to the sender. */
export async function sendInquiryEmail(inquiry: Inquiry): Promise<void> {
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: process.env.CONTACT_TO_EMAIL }] }],
      from: { email: process.env.CONTACT_FROM_EMAIL, name: "Portfolio contact form" },
      reply_to: { email: inquiry.email, name: inquiry.name },
      subject: `Portfolio message from ${inquiry.name}`,
      content: [
        {
          type: "text/plain",
          value: `${inquiry.message}\n\n— ${inquiry.name} <${inquiry.email}>`,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`SendGrid responded ${res.status}: ${await res.text()}`);
  }
}
