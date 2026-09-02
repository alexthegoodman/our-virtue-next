import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserFromRequest } from "@/lib/auth";
import { moderateContent, checkRateLimit, detectSpam } from "@/lib/moderation";
import { notifyMentions } from "@/lib/mentionNotifications";
import { SITE_URL } from "@/lib/verses";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; postId: string } }
) {
  try {
    const post = await prisma.churchPost.findFirst({
      where: {
        id: params.postId,
        church: { slug: params.slug }
      },
      select: { id: true }
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const comments = await prisma.churchPostComment.findMany({
      where: { postId: post.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching church post comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string; postId: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const post = await prisma.churchPost.findFirst({
      where: {
        id: params.postId,
        church: { slug: params.slug }
      },
      select: {
        id: true,
        title: true,
        churchId: true,
        church: { select: { name: true } }
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const membership = await prisma.churchMember.findUnique({
      where: {
        churchId_userId: {
          churchId: post.churchId,
          userId: user.userId
        }
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You must be a member to comment in this church" },
        { status: 403 }
      );
    }

    if (!checkRateLimit(user.userId, 60000, 10)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before posting another comment." },
        { status: 429 }
      );
    }

    const spamCheck = detectSpam(content);
    if (spamCheck.isSpam) {
      return NextResponse.json(
        { error: `Content rejected: ${spamCheck.reason}` },
        { status: 400 }
      );
    }

    const moderationResult = await moderateContent(content);
    if (!moderationResult.isAppropriate) {
      return NextResponse.json(
        { error: `Content not appropriate: ${moderationResult.reason}` },
        { status: 400 }
      );
    }

    const comment = await prisma.churchPostComment.create({
      data: {
        content: content.trim(),
        postId: post.id,
        authorId: user.userId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    await notifyMentions({
      content: comment.content,
      mentionerName: user.username,
      mentionerUserId: user.userId,
      contextLabel: `${user.username} mentioned you in a comment in ${post.church.name}`,
      url: `${SITE_URL}/churches/${params.slug}#post-${post.id}`,
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating church post comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
