import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResendClient, EMAIL_FROM } from "@/lib/resend";
import { getEmailSequenceCopy } from "@/lib/emailSequenceCopy";
import { isSignupVariantKey } from "@/lib/signupVariants";
import SignupFollowUpEmail from "@/emails/SignupFollowUp";

export const dynamic = "force-dynamic";

const BATCH_SIZE = 25;

// Polled by Vercel Cron (see vercel.json). Sends any personalized
// follow-up emails whose scheduled daytime send window has arrived.
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const due = await prisma.scheduledEmail.findMany({
    where: { status: "PENDING", scheduledFor: { lte: new Date() } },
    include: { subscriber: true },
    orderBy: { scheduledFor: "asc" },
    take: BATCH_SIZE,
  });

  let sent = 0;
  let failed = 0;

  for (const scheduled of due) {
    if (!isSignupVariantKey(scheduled.variant)) {
      failed++;
      await prisma.scheduledEmail.update({
        where: { id: scheduled.id },
        data: { status: "FAILED", lastError: "Unknown variant" },
      });
      continue;
    }

    const copy = getEmailSequenceCopy(scheduled.variant, scheduled.answer);
    if (!copy) {
      failed++;
      await prisma.scheduledEmail.update({
        where: { id: scheduled.id },
        data: { status: "FAILED", lastError: "No copy for variant/answer" },
      });
      continue;
    }

    try {
      const { error } = await getResendClient().emails.send({
        from: EMAIL_FROM,
        to: scheduled.subscriber.email,
        subject: copy.subject,
        react: SignupFollowUpEmail({
          heading: copy.heading,
          paragraphs: copy.paragraphs,
          previewText: copy.subject,
        }),
      });

      if (error) {
        throw new Error(error.message);
      }

      await prisma.scheduledEmail.update({
        where: { id: scheduled.id },
        data: { status: "SENT", sentAt: new Date() },
      });
      sent++;
    } catch (error) {
      failed++;
      await prisma.scheduledEmail.update({
        where: { id: scheduled.id },
        data: {
          status: "FAILED",
          lastError: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  return NextResponse.json({ checked: due.length, sent, failed });
}
