import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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

    // Fetch members for this church
    const members = await prisma.churchMember.findMany({
      where: {
        churchId: church.id
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: [
        { role: 'asc' }, // Admins and moderators first
        { joinedAt: 'asc' } // Then by join date
      ]
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching church members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}