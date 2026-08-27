import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  isSignupVariantKey,
  isValidSignupAnswer,
  SignupVariantKey,
} from '@/lib/signupVariants';
import { computeRandomDaytimeSendTime } from '@/lib/scheduleEmail';

export async function POST(request: NextRequest) {
  try {
    const { email, source, variant, answer } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // variant/answer are optional (e.g. subscribers captured elsewhere),
    // but if a variant is present it must be a real variant, and the
    // answer must be one of that variant's own options.
    let validatedVariant: SignupVariantKey | null = null;
    if (variant !== undefined && variant !== null) {
      if (!isSignupVariantKey(variant)) {
        return NextResponse.json({ error: 'Invalid variant' }, { status: 400 });
      }
      validatedVariant = variant;

      if (
        answer !== undefined &&
        answer !== null &&
        !isValidSignupAnswer(validatedVariant, answer)
      ) {
        return NextResponse.json(
          { error: 'Invalid answer for variant' },
          { status: 400 }
        );
      }
    }
    const hasVariant = validatedVariant !== null;

    const existing = await prisma.emailSubscriber.findUnique({
      where: { email },
    });

    const subscriber = await prisma.emailSubscriber.upsert({
      where: { email },
      update: {
        ...(hasVariant ? { variant: validatedVariant } : {}),
        ...(hasVariant && answer ? { answer } : {}),
      },
      create: {
        email,
        source: source || 'landing_gate',
        ...(hasVariant ? { variant: validatedVariant } : {}),
        ...(hasVariant && answer ? { answer } : {}),
      },
    });

    // Only count first-time signups toward the conversion-rate denominator,
    // and only queue one follow-up email per subscriber.
    if (!existing && validatedVariant) {
      await prisma.signupVariantStat.upsert({
        where: { variant: validatedVariant },
        update: { submissions: { increment: 1 } },
        create: { variant: validatedVariant, views: 0, submissions: 1 },
      });

      if (answer) {
        await prisma.scheduledEmail.create({
          data: {
            subscriberId: subscriber.id,
            variant: validatedVariant,
            answer,
            scheduledFor: computeRandomDaytimeSendTime(),
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email subscriber error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
