import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSignupVariantKey } from "@/lib/signupVariants";

// Called once per browser session (from useSignupVariant) to count a
// signup-form view for the assigned variant, so conversion rate can be
// computed as submissions / views per variant.
export async function POST(request: NextRequest) {
  try {
    const { variant } = await request.json();

    if (!isSignupVariantKey(variant)) {
      return NextResponse.json({ error: "Invalid variant" }, { status: 400 });
    }

    await prisma.signupVariantStat.upsert({
      where: { variant },
      update: { views: { increment: 1 } },
      create: { variant, views: 1, submissions: 0 },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signup variant view error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
