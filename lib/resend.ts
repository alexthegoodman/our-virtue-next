import { Resend } from "resend";

export const EMAIL_FROM =
  process.env.RESEND_FROM_EMAIL || "Our Virtue <hello@our-virtue.com>";

let client: Resend | null = null;

// Lazily constructed so importing this module (e.g. during Next.js build
// analysis) doesn't require RESEND_API_KEY to be set — the Resend SDK
// throws in its constructor if the key is missing.
export function getResendClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}
