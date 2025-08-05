import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { threadId, commentId, isUpvote } = await request.json();
    
    if (!threadId && !commentId) {
      return NextResponse.json(
        { error: 'Either threadId or commentId is required' },
        { status: 400 }
      );
    }

    if (threadId && commentId) {
      return NextResponse.json(
        { error: 'Cannot vote on both thread and comment simultaneously' },
        { status: 400 }
      );
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: user.userId,
        ...(threadId ? { threadId } : { commentId })
      }
    });

    if (existingVote) {
      if (existingVote.isUpvote === isUpvote) {
        // Same vote - remove it (toggle off)
        await prisma.vote.delete({
          where: { id: existingVote.id }
        });
        return NextResponse.json({ action: 'removed', voteChange: isUpvote ? -1 : 1 });
      } else {
        // Different vote - update it
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { isUpvote }
        });
        return NextResponse.json({ action: 'updated', voteChange: isUpvote ? 2 : -2 });
      }
    } else {
      // No existing vote - create new one
      await prisma.vote.create({
        data: {
          userId: user.userId,
          isUpvote,
          ...(threadId ? { threadId } : { commentId })
        }
      });
      return NextResponse.json({ action: 'created', voteChange: isUpvote ? 1 : -1 });
    }
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}