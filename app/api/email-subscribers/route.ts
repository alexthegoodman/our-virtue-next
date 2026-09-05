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
import { signToken } from '@/lib/auth';
import { generateUniqueUsername } from '@/lib/generateUsername';

const MAX_INTRO_LENGTH = 2000;

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      source,
      variant,
      answer,
      studyGroupPreference,
      emailPreference,
      churchId,
      introContent,
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

    // The study-group/email-preference survey has been retired from the
    // form (the vast majority of respondents picked "Online" + "Verses to
    // my inbox" anyway), but the fields are still accepted for back-compat.
    // Every new subscriber is now auto-subscribed to Verses emails by
    // default instead of being asked.
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

    // Validate the optional church selection made right in the form.
    let church: { id: string; name: string; slug: string } | null = null;
    if (churchId !== undefined && churchId !== null && churchId !== '') {
      if (typeof churchId !== 'string') {
        return NextResponse.json({ error: 'Invalid church' }, { status: 400 });
      }
      church = await prisma.church.findFirst({
        where: { id: churchId, isActive: true },
        select: { id: true, name: true, slug: true },
      });
      if (!church) {
        return NextResponse.json(
          { error: 'That group could not be found' },
          { status: 400 }
        );
      }
      // Picking a group implies wanting group involvement, matching what
      // the retired survey used to ask directly.
      if (!validatedStudyGroupPreference) {
        validatedStudyGroupPreference = 'ONLINE';
      }
    }

    let trimmedIntro = '';
    if (typeof introContent === 'string') {
      trimmedIntro = introContent.trim().slice(0, MAX_INTRO_LENGTH);
    }

    const existing = await prisma.emailSubscriber.findUnique({
      where: { email },
    });

    // Only the recurring verse email is automated. It's sent unless the
    // subscriber asked for direct outreach or nothing instead; unspecified
    // now explicitly defaults to VERSES for every new subscriber.
    const wantsVerses =
      validatedEmailPreference === null ||
      validatedEmailPreference === 'VERSES';
    const emailPreferenceToStore = validatedEmailPreference ?? 'VERSES';

    const subscriber = await prisma.emailSubscriber.upsert({
      where: { email },
      update: {
        ...(hasVariant ? { variant: validatedVariant } : {}),
        ...(hasVariant && answer ? { answer } : {}),
        ...(validatedStudyGroupPreference
          ? { studyGroupPreference: validatedStudyGroupPreference }
          : {}),
        emailPreference: emailPreferenceToStore,
        nextVerseEmailAt: wantsVerses
          ? (existing?.nextVerseEmailAt ?? computeFirstVerseEmailTime())
          : null,
      },
      create: {
        email,
        source: source || 'landing_gate',
        nextVerseEmailAt: wantsVerses ? computeFirstVerseEmailTime() : null,
        emailPreference: emailPreferenceToStore,
        ...(hasVariant ? { variant: validatedVariant } : {}),
        ...(hasVariant && answer ? { answer } : {}),
        ...(validatedStudyGroupPreference
          ? { studyGroupPreference: validatedStudyGroupPreference }
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

    // New subscribers also become new (passwordless) user accounts, so they
    // can pick a church and post right from this form. We only do this for
    // emails that don't already belong to a real account — a public,
    // unauthenticated endpoint must never be able to join a group or post as
    // an existing user just because it was given their email address.
    let account: {
      token: string;
      user: {
        id: string;
        email: string;
        username: string;
        isAdmin: boolean;
        createdAt: Date;
      };
    } | null = null;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
      const username = await generateUniqueUsername(email);
      const newUser = await prisma.user.create({
        data: {
          email,
          username,
          password: null,
        },
      });

      if (church) {
        await prisma.churchMember.upsert({
          where: { churchId_userId: { churchId: church.id, userId: newUser.id } },
          update: {},
          create: { churchId: church.id, userId: newUser.id, role: 'MEMBER' },
        });

        if (trimmedIntro) {
          await prisma.churchPost.create({
            data: {
              title: 'Introducing myself',
              content: trimmedIntro,
              churchId: church.id,
              authorId: newUser.id,
            },
          });
        }
      }

      const token = signToken({
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
        isAdmin: newUser.isAdmin,
      });

      account = {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          isAdmin: newUser.isAdmin,
          createdAt: newUser.createdAt,
        },
      };
    }

    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error('Email subscriber error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
