/**
 * Contact-form validation shared by the client forms and the /api/inquiry route.
 */

export const INQUIRY_LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Inquiry = {
  name: string;
  email: string;
  message: string;
};

export type InquiryValidation =
  | { ok: true; inquiry: Inquiry }
  | { ok: false; error: string };

/** Trims and checks a raw inquiry. `description` is the field name the API has always accepted. */
export function validateInquiry(input: {
  name?: unknown;
  email?: unknown;
  description?: unknown;
}): InquiryValidation {
  const name = typeof input.name === "string" ? input.name.replace(/\s+/g, " ").trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const message = typeof input.description === "string" ? input.description.trim() : "";

  if (!name || !email || !message) {
    return { ok: false, error: "Please fill in your name, email, and message." };
  }
  if (!EMAIL_RE.test(email) || email.length > INQUIRY_LIMITS.email) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (name.length > INQUIRY_LIMITS.name) {
    return { ok: false, error: `Please keep your name under ${INQUIRY_LIMITS.name} characters.` };
  }
  if (message.length > INQUIRY_LIMITS.message) {
    return { ok: false, error: `Please keep your message under ${INQUIRY_LIMITS.message} characters.` };
  }
  return { ok: true, inquiry: { name, email, message } };
}
