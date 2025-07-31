import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET - List all poverty data sources with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const dataType = searchParams.get('dataType');
    const geographicScope = searchParams.get('geographicScope');
    const verified = searchParams.get('verified');

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sourceOrg: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dataType) {
      where.dataType = { contains: dataType, mode: 'insensitive' };
    }

    if (geographicScope) {
      where.geographicScope = { contains: geographicScope, mode: 'insensitive' };
    }

    if (verified === 'true') {
      where.isVerified = true;
    }

    const skip = (page - 1) * limit;

    const [dataSources, total] = await Promise.all([
      prisma.povertyDataSource.findMany({
        where,
        skip,
        take: limit,
        include: {
          submitter: {
            select: {
              id: true,
              username: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.povertyDataSource.count({ where })
    ]);

    return NextResponse.json({
      dataSources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get poverty data sources error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new poverty data source
export async function POST(request: NextRequest) {
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
      submissionNotes
    } = await request.json();

    // Validate required fields
    if (!title || !sourceUrl || !dataTable || !geographicScope || !dataType) {
      return NextResponse.json(
        { error: 'Missing required fields: title, sourceUrl, dataTable, geographicScope, dataType' },
        { status: 400 }
      );
    }

    // Validate dataTable is valid JSON
    if (typeof dataTable !== 'object') {
      return NextResponse.json(
        { error: 'dataTable must be a valid JSON object' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(sourceUrl);
    } catch {
      return NextResponse.json(
        { error: 'sourceUrl must be a valid URL' },
        { status: 400 }
      );
    }

    const povertyDataSource = await prisma.povertyDataSource.create({
      data: {
        title,
        description,
        sourceUrl,
        sourceOrg,
        dataTable,
        geographicScope,
        timeRange,
        dataType,
        submissionNotes,
        submitterId: user.userId,
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

    return NextResponse.json(povertyDataSource, { status: 201 });
  } catch (error) {
    console.error('Create poverty data source error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}