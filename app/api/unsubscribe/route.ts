import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Unsubscribe links use the subscriber's id directly (an unguessable cuid)
// rather than a separate token, to keep the schema and this route simple.
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.emailSubscriber.updateMany({
    where: { id },
    data: { unsubscribedAt: new Date() },
  });

  return NextResponse.redirect(new URL("/unsubscribed", request.url));
}
