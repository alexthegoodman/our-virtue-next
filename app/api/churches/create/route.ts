import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ChurchCategory } from "@prisma/client";
import { getUserFromRequest } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  // Verify authentication
  const user = getUserFromRequest(request);

  try {
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = user.userId;

    // Check if user already has a church
    const existingChurch = await prisma.church.count({
      where: {
        creatorId: userId,
        isActive: true,
      },
    });

    if (existingChurch >= 1) {
      return NextResponse.json(
        { error: "You can only create 1 church per account" },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, description, category, slug, imageUrl } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Church name is required" },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "Church description is required" },
        { status: 400 }
      );
    }

    if (!category || !Object.values(ChurchCategory).includes(category)) {
      return NextResponse.json(
        { error: "Valid category is required" },
        { status: 400 }
      );
    }

    if (!slug || !slug.trim()) {
      return NextResponse.json(
        { error: "Church slug is required" },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const existingSlug = await prisma.church.findUnique({
      where: { slug: slug.trim() },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Church name already taken, please choose a different name" },
        { status: 400 }
      );
    }

    // Create the church
    const church = await prisma.church.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        category: category as ChurchCategory,
        slug: slug.trim(),
        imageUrl: imageUrl || null,
        creatorId: userId,
      },
    });

    // Automatically make the creator a member with ADMIN role
    await prisma.churchMember.create({
      data: {
        churchId: church.id,
        userId: userId,
        role: "ADMIN",
      },
    });

    // Create a welcome post
    await prisma.churchPost.create({
      data: {
        title: `Welcome to ${church.name}! 🎉`,
        content: `## Getting Started

Welcome to our community! We're so glad you're here. Here are a few ways to get started:

### 1. Introduce Yourself
Share a bit about yourself in a new post. Tell us what brought you here and what you're hoping to find in our community.

### 2. Browse and Engage
Look through existing posts and conversations. Feel free to comment, ask questions, and share your thoughts.

### 3. Share Your Story
Don't hesitate to start new discussions about topics that matter to you. Your experiences and insights are valuable to our community.

### 4. Be Respectful
We're all here to grow and learn together. Please be kind, respectful, and considerate in all your interactions.

---

*This is a pinned post to help new members get oriented. Welcome to the community!*`,
        isPinned: true,
        churchId: church.id,
        authorId: userId,
      },
    });

    return NextResponse.json({
      id: church.id,
      name: church.name,
      description: church.description,
      slug: church.slug,
      category: church.category,
      imageUrl: church.imageUrl,
      createdAt: church.createdAt,
    });
  } catch (error) {
    console.error("Error creating church:", error);
    return NextResponse.json(
      { error: "Failed to create church" },
      { status: 500 }
    );
  }
}
