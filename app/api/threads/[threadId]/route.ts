import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const thread = await prisma.thread.findUnique({
      where: { id: params.threadId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              }
            },
            votes: {
              select: {
                isUpvote: true,
              }
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                  }
                },
                votes: {
                  select: {
                    isUpvote: true,
                  }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          where: {
            parentId: null, // Only get top-level comments
          },
          orderBy: { createdAt: 'desc' }
        },
        votes: {
          select: {
            isUpvote: true,
          }
        }
      }
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Calculate vote scores
    const threadVoteScore = thread.votes.reduce((score, vote) => {
      return score + (vote.isUpvote ? 1 : -1);
    }, 0);

    const commentsWithScores = thread.comments.map(comment => ({
      ...comment,
      voteScore: comment.votes.reduce((score, vote) => {
        return score + (vote.isUpvote ? 1 : -1);
      }, 0),
      replies: comment.replies.map(reply => ({
        ...reply,
        voteScore: reply.votes.reduce((score, vote) => {
          return score + (vote.isUpvote ? 1 : -1);
        }, 0),
        votes: undefined,
      })),
      votes: undefined,
    }));

    return NextResponse.json({
      ...thread,
      voteScore: threadVoteScore,
      comments: commentsWithScores,
      votes: undefined,
    });
  } catch (error) {
    console.error('Get thread error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const { title, content, tags } = await request.json();

    // Check if user owns the thread or is admin
    const existingThread = await prisma.thread.findUnique({
      where: { id: params.threadId },
      select: { authorId: true }
    });

    if (!existingThread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    if (existingThread.authorId !== user.userId && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const updatedThread = await prisma.thread.update({
      where: { id: params.threadId },
      data: {
        title,
        content,
        tags: tags || undefined,
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

    return NextResponse.json(updatedThread);
  } catch (error) {
    console.error('Update thread error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if user owns the thread or is admin
    const existingThread = await prisma.thread.findUnique({
      where: { id: params.threadId },
      select: { authorId: true }
    });

    if (!existingThread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    if (existingThread.authorId !== user.userId && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await prisma.thread.delete({
      where: { id: params.threadId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete thread error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}