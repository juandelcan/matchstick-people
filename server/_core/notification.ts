import { TRPCError } from "@trpc/server";
import { Resend } from "resend";
import { ENV } from "./env";

/**
 * Owner notifications.
 *
 * The original Manus build POSTed these to Manus's internal "forge" notification
 * service. That service disappears with Manus, so this sends the same payload as
 * an email through Resend, which the site already uses for order confirmations.
 *
 * Set OWNER_EMAIL and RESEND_API_KEY. FROM_ADDRESS must be a domain you've
 * verified in Resend, or the Resend sandbox sender.
 */

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

function validatePayload(input: NotificationPayload): NotificationPayload {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Notification title is required." });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Notification content is required." });
  }
  const title = input.title.trim();
  const content = input.content.trim();
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.` });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.` });
  }
  return { title, content };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function notifyOwner(payload: NotificationPayload): Promise<boolean> {
  const { title, content } = validatePayload(payload);

  if (!ENV.resendApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service is not configured (RESEND_API_KEY missing).",
    });
  }
  if (!ENV.ownerEmail) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service is not configured (OWNER_EMAIL missing).",
    });
  }

  try {
    const resend = new Resend(ENV.resendApiKey);
    const { error } = await resend.emails.send({
      from: ENV.fromAddress,
      to: ENV.ownerEmail,
      replyTo: ENV.ownerEmail,
      subject: title,
      text: content,
      html: `<div style="font-family:-apple-system,Segoe UI,sans-serif;font-size:14px;line-height:1.6;color:#0D0C0A">
  <h2 style="font-family:Georgia,serif;font-size:18px;margin:0 0 16px">${escapeHtml(title)}</h2>
  <pre style="white-space:pre-wrap;font-family:inherit;margin:0">${escapeHtml(content)}</pre>
  <p style="margin-top:24px;font-size:12px;color:#6B6560">Sent from thematchstickpeople.com</p>
</div>`,
    });

    if (error) {
      console.warn("[Notification] Resend rejected the message:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[Notification] Error sending notification:", err);
    return false;
  }
}
