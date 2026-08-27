import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const subscribers = await prisma.emailSubscriber.findMany({
    where: { variant: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { email: true, variant: true, answer: true, createdAt: true },
  });

  const header = ["email", "variant", "answer", "submitted_at"];
  const rows = subscribers.map((s) =>
    [s.email, s.variant ?? "", s.answer ?? "", s.createdAt.toISOString()]
      .map((v) => csvEscape(String(v)))
      .join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="signup-variant-test.csv"`,
    },
  });
}
