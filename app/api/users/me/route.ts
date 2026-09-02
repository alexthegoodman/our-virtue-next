import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

const MAX_BIO_LENGTH = 500;

export async function PATCH(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data: { avatarUrl?: string | null; bio?: string | null } = {};

    if ("avatarUrl" in body) {
      data.avatarUrl = body.avatarUrl ? String(body.avatarUrl).trim() : null;
    }

    if ("bio" in body) {
      const bio = body.bio ? String(body.bio).trim() : null;
      if (bio && bio.length > MAX_BIO_LENGTH) {
        return NextResponse.json(
          { error: `Bio must be ${MAX_BIO_LENGTH} characters or fewer` },
          { status: 400 }
        );
      }
      data.bio = bio;
    }

    const updated = await prisma.user.update({
      where: { id: user.userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        bio: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
