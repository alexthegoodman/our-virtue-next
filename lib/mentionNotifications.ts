import { prisma } from "@/lib/db";
import { getResendClient, EMAIL_FROM } from "@/lib/resend";
import { extractMentions, toPlainText } from "@/lib/mentions";
import { SITE_URL } from "@/lib/verses";
import MentionNotificationEmail from "@/emails/MentionNotification";

interface NotifyMentionsParams {
  content: string;
  mentionerName: string;
  mentionerUserId: string;
  contextLabel: string;
  url: string;
}

function buildExcerpt(content: string): string {
  const plain = toPlainText(content).trim();
  return plain.length > 200 ? `${plain.slice(0, 200)}…` : plain;
}

// Emails everyone mentioned in newly-created content. Never throws — a
// failed notification shouldn't fail the comment/post/thread creation it's
// attached to.
export async function notifyMentions({
  content,
  mentionerName,
  mentionerUserId,
  contextLabel,
  url,
}: NotifyMentionsParams): Promise<void> {
  try {
    const mentions = extractMentions(content);
    if (mentions.length === 0) return;

    const userIds = Array.from(
      new Set(
        mentions
          .filter((m) => m.type === "user" && m.id !== mentionerUserId)
          .map((m) => m.id)
      )
    );
    const subscriberIds = Array.from(
      new Set(mentions.filter((m) => m.type === "subscriber").map((m) => m.id))
    );

    if (userIds.length === 0 && subscriberIds.length === 0) return;

    const [users, subscribers] = await Promise.all([
      userIds.length
        ? prisma.user.findMany({
            where: { id: { in: userIds }, isActive: true },
            select: { email: true },
          })
        : Promise.resolve([]),
      subscriberIds.length
        ? prisma.emailSubscriber.findMany({
            where: { id: { in: subscriberIds }, unsubscribedAt: null },
            select: { id: true, email: true },
          })
        : Promise.resolve([]),
    ]);

    if (users.length === 0 && subscribers.length === 0) return;

    const excerpt = buildExcerpt(content);
    const subject = `${mentionerName} mentioned you on Our Virtue`;

    const payload = [
      ...users.map((u) => ({
        from: EMAIL_FROM,
        to: u.email,
        subject,
        react: MentionNotificationEmail({
          mentionerName,
          contextLabel,
          excerpt,
          url,
        }),
      })),
      ...subscribers.map((s) => ({
        from: EMAIL_FROM,
        to: s.email,
        subject,
        react: MentionNotificationEmail({
          mentionerName,
          contextLabel,
          excerpt,
          url,
          unsubscribeUrl: `${SITE_URL}/api/unsubscribe?id=${s.id}`,
        }),
      })),
    ];

    if (payload.length === 1) {
      await getResendClient().emails.send(payload[0]);
    } else {
      await getResendClient().batch.send(payload);
    }
  } catch (error) {
    console.error("Mention notification error:", error);
  }
}
