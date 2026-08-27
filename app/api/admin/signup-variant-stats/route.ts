import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { SIGNUP_VARIANT_KEYS, SIGNUP_VARIANTS } from "@/lib/signupVariants";
import { SIGNUP_TEST_CONFIG, getSignupTestEndDate } from "@/lib/signupTestConfig";

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const [stats, answerCounts] = await Promise.all([
    prisma.signupVariantStat.findMany(),
    prisma.emailSubscriber.groupBy({
      by: ["variant", "answer"],
      where: { variant: { not: null }, answer: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const statsByVariant = new Map(stats.map((s) => [s.variant, s]));

  const variants = SIGNUP_VARIANT_KEYS.map((variant) => {
    const stat = statsByVariant.get(variant);
    const views = stat?.views ?? 0;
    const submissions = stat?.submissions ?? 0;
    const conversionRate = views > 0 ? submissions / views : 0;

    const optionCounts = answerCounts
      .filter((row) => row.variant === variant)
      .reduce<Record<string, number>>((acc, row) => {
        if (row.answer) acc[row.answer] = row._count._all;
        return acc;
      }, {});

    const distribution = SIGNUP_VARIANTS[variant].options.map((option) => ({
      option,
      count: optionCounts[option] ?? 0,
    }));

    return {
      variant,
      question: SIGNUP_VARIANTS[variant].question,
      views,
      submissions,
      conversionRate,
      progressToTarget: Math.min(
        1,
        submissions / SIGNUP_TEST_CONFIG.sampleSizePerVariant
      ),
      distribution,
    };
  });

  return NextResponse.json({
    variants,
    config: {
      sampleSizePerVariant: SIGNUP_TEST_CONFIG.sampleSizePerVariant,
      startDate: SIGNUP_TEST_CONFIG.startDate,
      endDate: getSignupTestEndDate().toISOString(),
    },
  });
}
