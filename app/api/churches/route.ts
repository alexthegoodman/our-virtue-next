import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserFromRequest } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  // Get user from request if authenticated
  const user = getUserFromRequest(request);

  try {
    const userId = user?.userId || null;

    // Fetch all active churches with member counts
    const churches = await prisma.church.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
        members: userId
          ? {
              where: {
                userId: userId,
              },
              select: {
                id: true,
              },
            }
          : false,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Get user's church creation count if logged in
    let userChurchCount = 0;
    if (userId) {
      userChurchCount = await prisma.church.count({
        where: {
          creatorId: userId,
          isActive: true,
        },
      });
    }

    // Format the response
    const formattedChurches = churches.map((church) => ({
      id: church.id,
      name: church.name,
      description: church.description,
      slug: church.slug,
      imageUrl: church.imageUrl,
      category: church.category,
      memberCount: church._count.members,
      isJoined: userId ? (church.members as any)?.length > 0 : false,
    }));

    return NextResponse.json({
      churches: formattedChurches,
      userChurchCount,
    });
  } catch (error) {
    console.error("Error fetching churches:", error);
    return NextResponse.json(
      { error: "Failed to fetch churches" },
      { status: 500 }
    );
  }
}
