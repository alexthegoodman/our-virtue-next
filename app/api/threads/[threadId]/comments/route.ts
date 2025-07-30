import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { moderateContent, checkRateLimit, detectSpam } from '@/lib/moderation';

export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content, parentId } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Rate limiting check
    if (!checkRateLimit(user.userId, 60000, 10)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before posting another comment.' },
        { status: 429 }
      );
    }

    // Spam detection
    const spamCheck = detectSpam(content);
    if (spamCheck.isSpam) {
      return NextResponse.json(
        { error: `Content rejected: ${spamCheck.reason}` },
        { status: 400 }
      );
    }

    // AI moderation
    const moderationResult = await moderateContent(content);
    if (!moderationResult.isAppropriate) {
      return NextResponse.json(
        { error: `Content not appropriate: ${moderationResult.reason}` },
        { status: 400 }
      );
    }

    // Verify thread exists
    const thread = await prisma.thread.findUnique({
      where: { id: params.threadId },
      select: { id: true, isLocked: true }
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    if (thread.isLocked && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Thread is locked' },
        { status: 403 }
      );
    }

    // If parentId is provided, verify the parent comment exists and belongs to this thread
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { threadId: true }
      });

      if (!parentComment || parentComment.threadId !== params.threadId) {
        return NextResponse.json(
          { error: 'Invalid parent comment' },
          { status: 400 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        threadId: params.threadId,
        authorId: user.userId,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          }
        }
      }
    });

    return NextResponse.json({
      ...comment,
      voteScore: 0,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}