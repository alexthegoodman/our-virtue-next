import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserFromRequest } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Get user from request if authenticated
  const user = getUserFromRequest(request);

  try {
    const userId = user?.userId || null;

    const slug = params.slug;

    // Fetch church by slug
    const church = await prisma.church.findFirst({
      where: {
        slug: slug,
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
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // Format the response
    const formattedChurch = {
      id: church.id,
      name: church.name,
      description: church.description,
      slug: church.slug,
      imageUrl: church.imageUrl,
      category: church.category,
      memberCount: church._count.members,
      isJoined: userId ? (church.members as any)?.length > 0 : false,
      isCreator: userId ? church.creator.id === userId : false,
      creator: church.creator,
    };

    return NextResponse.json(formattedChurch);
  } catch (error) {
    console.error("Error fetching church:", error);
    return NextResponse.json(
      { error: "Failed to fetch church" },
      { status: 500 }
    );
  }
}
