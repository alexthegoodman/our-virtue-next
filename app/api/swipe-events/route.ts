import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { poemSlug, stanzaSlug, direction } = body;

    if (!poemSlug || !stanzaSlug || !direction) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const event = await prisma.swipeEvent.create({
      data: {
        poemSlug,
        stanzaSlug,
        direction,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error recording swipe event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
