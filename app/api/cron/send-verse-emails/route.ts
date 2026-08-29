import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResendClient, EMAIL_FROM } from "@/lib/resend";
import { getRandomVerse, SITE_URL } from "@/lib/verses";
import { computeNextVerseEmailTime } from "@/lib/scheduleVerseEmail";
import VerseEmail from "@/emails/VerseEmail";

export const dynamic = "force-dynamic";

// Resend's batch endpoint accepts up to 100 emails per call.
const BATCH_SIZE = 100;

// Polled by Vercel Cron (see vercel.json). Sends the recurring "verse from
// Our Virtue" email to every subscriber whose cadence window has come due,
// batching sends via Resend instead of one call per subscriber.
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const due = await prisma.emailSubscriber.findMany({
    where: {
      unsubscribedAt: null,
      nextVerseEmailAt: { lte: new Date() },
    },
    orderBy: { nextVerseEmailAt: "asc" },
    take: BATCH_SIZE,
  });

  if (due.length === 0) {
    return NextResponse.json({ checked: 0, sent: 0, failed: 0 });
  }

  const payload = due.map((subscriber) => {
    const verse = getRandomVerse();
    return {
      from: EMAIL_FROM,
      to: subscriber.email,
      subject: `A verse from Our Virtue: ${verse.poemTitle}`,
      react: VerseEmail({
        verseText: verse.text,
        poemTitle: verse.poemTitle,
        categoryTitle: verse.categoryTitle,
        readMoreUrl: `${SITE_URL}${verse.path}`,
        unsubscribeUrl: `${SITE_URL}/api/unsubscribe?id=${subscriber.id}`,
      }),
    };
  });

  let sent = 0;
  let failed = 0;

  try {
    const { error } = await getResendClient().batch.send(payload);
    if (error) {
      throw new Error(error.message);
    }

    const now = new Date();
    await prisma.emailSubscriber.updateMany({
      where: { id: { in: due.map((s) => s.id) } },
      data: {
        lastVerseEmailAt: now,
        nextVerseEmailAt: computeNextVerseEmailTime(now),
      },
    });
    sent = due.length;
  } catch (error) {
    // Batch sends are all-or-nothing, so on failure leave nextVerseEmailAt
    // untouched — these subscribers stay due and get picked up next run.
    failed = due.length;
    console.error("Verse email batch send failed:", error);
  }

  return NextResponse.json({ checked: due.length, sent, failed });
}
