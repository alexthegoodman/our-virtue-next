import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// Powers the "@" mention autocomplete menu in the discussion and church
// composer boxes. Requires auth since subscriber emails (even truncated to
// their local part) shouldn't be enumerable by anonymous visitors.
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  if (q.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const [users, subscribers] = await Promise.all([
    prisma.user.findMany({
      where: {
        isActive: true,
        username: { contains: q, mode: "insensitive" },
      },
      select: { id: true, username: true, email: true },
      orderBy: { username: "asc" },
      take: 5,
    }),
    prisma.emailSubscriber.findMany({
      where: {
        unsubscribedAt: null,
        email: { contains: q, mode: "insensitive" },
      },
      select: { id: true, email: true },
      orderBy: { email: "asc" },
      take: 8,
    }),
  ]);

  const userEmails = new Set(users.map((u) => u.email.toLowerCase()));

  const userResults = users
    .filter((u) => u.id !== user.userId)
    .map((u) => ({ type: "user" as const, id: u.id, label: u.username }));

  // Only expose the local part of the email (before "@"), and only when the
  // query actually matched that local part rather than the domain.
  const lowerQ = q.toLowerCase();
  const subscriberResults = subscribers
    .filter((s) => !userEmails.has(s.email.toLowerCase()))
    .map((s) => ({ id: s.id, localPart: s.email.split("@")[0] }))
    .filter((s) => s.localPart.toLowerCase().includes(lowerQ))
    .map((s) => ({
      type: "subscriber" as const,
      id: s.id,
      label: s.localPart,
    }));

  const results = [...userResults, ...subscriberResults].slice(0, 8);

  return NextResponse.json({ results });
}
