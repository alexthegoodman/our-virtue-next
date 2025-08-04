import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserFromRequest } from "@/lib/auth";

const prisma = new PrismaClient();

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

    // Check if church exists and is active
    const church = await prisma.church.findFirst({
      where: {
        slug: slug,
        isActive: true
      }
    });

    if (!church) {
      return NextResponse.json(
        { error: "Church not found" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMembership = await prisma.churchMember.findUnique({
      where: {
        churchId_userId: {
          churchId: church.id,
          userId: userId
        }
      }
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "Already a member of this church" },
        { status: 400 }
      );
    }

    // Create membership
    const membership = await prisma.churchMember.create({
      data: {
        churchId: church.id,
        userId: userId,
        role: "MEMBER"
      }
    });

    return NextResponse.json({
      success: true,
      membership: {
        id: membership.id,
        churchId: membership.churchId,
        userId: membership.userId,
        role: membership.role,
        joinedAt: membership.joinedAt
      }
    });
  } catch (error) {
    console.error("Error joining church:", error);
    return NextResponse.json(
      { error: "Failed to join church" },
      { status: 500 }
    );
  }
}