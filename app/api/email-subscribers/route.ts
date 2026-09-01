import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  isSignupVariantKey,
  isValidSignupAnswer,
  SignupVariantKey,
} from '@/lib/signupVariants';
import {
  isStudyGroupPreference,
  isEmailPreference,
  StudyGroupPreferenceKey,
  EmailPreferenceKey,
} from '@/lib/subscriberPreferences';
import { computeFirstVerseEmailTime } from '@/lib/scheduleVerseEmail';

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      source,
      variant,
      answer,
      studyGroupPreference,
      emailPreference,
    } = await request.json();

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

    // Both preference fields are optional.
    let validatedStudyGroupPreference: StudyGroupPreferenceKey | null = null;
    if (studyGroupPreference !== undefined && studyGroupPreference !== null) {
      if (!isStudyGroupPreference(studyGroupPreference)) {
        return NextResponse.json(
          { error: 'Invalid study group preference' },
          { status: 400 }
        );
      }
      validatedStudyGroupPreference = studyGroupPreference;
    }

    let validatedEmailPreference: EmailPreferenceKey | null = null;
    if (emailPreference !== undefined && emailPreference !== null) {
      if (!isEmailPreference(emailPreference)) {
        return NextResponse.json(
          { error: 'Invalid email preference' },
          { status: 400 }
        );
      }
      validatedEmailPreference = emailPreference;
    }

    const existing = await prisma.emailSubscriber.findUnique({
      where: { email },
    });

    // Only the recurring verse email is automated. It's sent unless the
    // subscriber asked for direct outreach or nothing instead; unspecified
    // defaults to verses, matching prior behavior.
    const wantsVerses =
      validatedEmailPreference === null ||
      validatedEmailPreference === 'VERSES';

    const subscriber = await prisma.emailSubscriber.upsert({
      where: { email },
      update: {
        ...(hasVariant ? { variant: validatedVariant } : {}),
        ...(hasVariant && answer ? { answer } : {}),
        ...(validatedStudyGroupPreference
          ? { studyGroupPreference: validatedStudyGroupPreference }
          : {}),
        ...(validatedEmailPreference
          ? {
              emailPreference: validatedEmailPreference,
              nextVerseEmailAt: wantsVerses
                ? (existing?.nextVerseEmailAt ?? computeFirstVerseEmailTime())
                : null,
            }
          : {}),
      },
      create: {
        email,
        source: source || 'landing_gate',
        nextVerseEmailAt: wantsVerses ? computeFirstVerseEmailTime() : null,
        ...(hasVariant ? { variant: validatedVariant } : {}),
        ...(hasVariant && answer ? { answer } : {}),
        ...(validatedStudyGroupPreference
          ? { studyGroupPreference: validatedStudyGroupPreference }
          : {}),
        ...(validatedEmailPreference
          ? { emailPreference: validatedEmailPreference }
          : {}),
      },
    });

    // Only count first-time signups toward the conversion-rate denominator.
    // The personalized intro-email sequence has been retired in favor of
    // manual outreach + the recurring verse email above.
    if (!existing && validatedVariant) {
      await prisma.signupVariantStat.upsert({
        where: { variant: validatedVariant },
        update: { submissions: { increment: 1 } },
        create: { variant: validatedVariant, views: 0, submissions: 1 },
      });
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
