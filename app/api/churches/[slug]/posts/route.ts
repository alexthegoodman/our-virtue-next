import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserFromRequest } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    // Find church by slug
    const church = await prisma.church.findFirst({
      where: {
        slug: slug,
        isActive: true
      },
      select: {
        id: true
      }
    });

    if (!church) {
      return NextResponse.json(
        { error: "Church not found" },
        { status: 404 }
      );
    }

    // Fetch posts for this church
    const posts = await prisma.churchPost.findMany({
      where: {
        churchId: church.id
      },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' }, // Pinned posts first
        { createdAt: 'desc' }  // Then by newest
      ]
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching church posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Verify authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = user.userId;
    const slug = params.slug;

    // Find church by slug
    const church = await prisma.church.findFirst({
      where: {
        slug: slug,
        isActive: true
      },
      select: {
        id: true
      }
    });

    if (!church) {
      return NextResponse.json(
        { error: "Church not found" },
        { status: 404 }
      );
    }

    // Check if user is a member of this church
    const membership = await prisma.churchMember.findUnique({
      where: {
        churchId_userId: {
          churchId: church.id,
          userId: userId
        }
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You must be a member to post in this church" },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { title, content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Post content is required" },
        { status: 400 }
      );
    }

    // Create the post
    const post = await prisma.churchPost.create({
      data: {
        title: title?.trim() || null,
        content: content.trim(),
        churchId: church.id,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error creating church post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}