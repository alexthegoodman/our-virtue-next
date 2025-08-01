import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const user = getUserFromRequest(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { status, adminNotes } = await request.json();
    const { id } = params;

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (status) {
      updateData.status = status;
      // Set shippedAt when status changes to SHIPPED
      if (status === 'SHIPPED') {
        updateData.shippedAt = new Date();
      }
    }
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    // Update book request
    const updatedRequest = await prisma.bookRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      bookRequest: updatedRequest,
    });
  } catch (error: any) {
    console.error('Update book request error:', error);
    
    // Handle record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Book request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const user = getUserFromRequest(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Get book request
    const bookRequest = await prisma.bookRequest.findUnique({
      where: { id },
    });

    if (!bookRequest) {
      return NextResponse.json(
        { error: 'Book request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ bookRequest });
  } catch (error) {
    console.error('Get book request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}