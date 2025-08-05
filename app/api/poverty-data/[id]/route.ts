import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET - Get specific poverty data source
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const povertyDataSource = await prisma.povertyDataSource.findUnique({
      where: { 
        id: params.id,
        isActive: true 
      },
      include: {
        submitter: {
          select: {
            id: true,
            username: true,
          }
        }
      }
    });

    if (!povertyDataSource) {
      return NextResponse.json(
        { error: 'Poverty data source not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(povertyDataSource);
  } catch (error) {
    console.error('Get poverty data source error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update poverty data source
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      title,
      description,
      sourceUrl,
      sourceOrg,
      dataTable,
      geographicScope,
      timeRange,
      dataType,
      submissionNotes,
      isVerified,
      adminNotes
    } = await request.json();

    // Check if user owns the data source or is admin
    const existingDataSource = await prisma.povertyDataSource.findUnique({
      where: { id: params.id },
      select: { submitterId: true }
    });

    if (!existingDataSource) {
      return NextResponse.json(
        { error: 'Poverty data source not found' },
        { status: 404 }
      );
    }

    if (existingDataSource.submitterId !== user.userId && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Validate URL format if provided
    if (sourceUrl) {
      try {
        new URL(sourceUrl);
      } catch {
        return NextResponse.json(
          { error: 'sourceUrl must be a valid URL' },
          { status: 400 }
        );
      }
    }

    // Only admins can set verification status and admin notes
    const updateData: any = {
      title,
      description,
      sourceUrl,
      sourceOrg,
      dataTable,
      geographicScope,
      timeRange,
      dataType,
      submissionNotes,
    };

    if (user.isAdmin) {
      if (isVerified !== undefined) updateData.isVerified = isVerified;
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    }

    const updatedDataSource = await prisma.povertyDataSource.update({
      where: { id: params.id },
      data: updateData,
      include: {
        submitter: {
          select: {
            id: true,
            username: true,
          }
        }
      }
    });

    return NextResponse.json(updatedDataSource);
  } catch (error) {
    console.error('Update poverty data source error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete poverty data source (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user owns the data source or is admin
    const existingDataSource = await prisma.povertyDataSource.findUnique({
      where: { id: params.id },
      select: { submitterId: true }
    });

    if (!existingDataSource) {
      return NextResponse.json(
        { error: 'Poverty data source not found' },
        { status: 404 }
      );
    }

    if (existingDataSource.submitterId !== user.userId && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.povertyDataSource.update({
      where: { id: params.id },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete poverty data source error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}