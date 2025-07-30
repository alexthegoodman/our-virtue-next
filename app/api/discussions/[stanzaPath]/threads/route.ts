import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { moderateContent, checkRateLimit, detectSpam } from '@/lib/moderation';

export async function GET(
  request: NextRequest,
  { params }: { params: { stanzaPath: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    
    const skip = (page - 1) * limit;
    const decodedStanzaPath = `/${decodeURIComponent(params.stanzaPath)}`;

    const where: any = {
      stanzaPath: decodedStanzaPath,
    };

    if (type) {
      where.type = type;
    }

    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
            }
          },
          _count: {
            select: {
              comments: true,
              votes: true,
            }
          },
          votes: {
            select: {
              isUpvote: true,
            }
          }
        },
        orderBy: [
          { isSticky: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      prisma.thread.count({ where })
    ]);

    // Calculate vote scores for each thread
    const threadsWithScores = threads.map(thread => ({
      ...thread,
      voteScore: thread.votes.reduce((score, vote) => {
        return score + (vote.isUpvote ? 1 : -1);
      }, 0),
      votes: undefined, // Remove raw votes from response
    }));

    return NextResponse.json({
      threads: threadsWithScores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Get threads error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { stanzaPath: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, content, type, tags } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Rate limiting check
    if (!checkRateLimit(user.userId, 60000, 3)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before creating another thread.' },
        { status: 429 }
      );
    }

    // Spam detection
    const spamCheck = detectSpam(title + ' ' + content);
    if (spamCheck.isSpam) {
      return NextResponse.json(
        { error: `Content rejected: ${spamCheck.reason}` },
        { status: 400 }
      );
    }

    // AI moderation
    const moderationResult = await moderateContent(title + '\n\n' + content);
    if (!moderationResult.isAppropriate) {
      return NextResponse.json(
        { error: `Content not appropriate: ${moderationResult.reason}` },
        { status: 400 }
      );
    }

    const decodedStanzaPath = `/${decodeURIComponent(params.stanzaPath)}`;

    const thread = await prisma.thread.create({
      data: {
        title,
        content,
        stanzaPath: decodedStanzaPath,
        type: type || 'DISCUSSION',
        tags: tags || [],
        authorId: user.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          }
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          }
        }
      }
    });

    return NextResponse.json({
      ...thread,
      voteScore: 0,
    });
  } catch (error) {
    console.error('Create thread error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}