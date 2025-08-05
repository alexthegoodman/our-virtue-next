import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      notes
    } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !address || !city || !state || !zipCode) {
      return NextResponse.json(
        { error: 'First name, last name, email, address, city, state, and zip code are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Create book request
    const bookRequest = await prisma.bookRequest.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        address,
        city,
        state,
        zipCode,
        country: country || 'United States',
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your request for a free book has been submitted successfully! We will process your request and ship your book within 2-4 weeks.',
      id: bookRequest.id,
    });
  } catch (error) {
    console.error('Book request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = getUserFromRequest(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Get book requests with pagination
    const [bookRequests, total] = await Promise.all([
      prisma.bookRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.bookRequest.count({ where }),
    ]);

    return NextResponse.json({
      bookRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get book requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}