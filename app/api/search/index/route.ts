import { NextRequest, NextResponse } from 'next/server';
import { indexAllPoems } from '../../../../lib/poem-indexer';

export async function POST(request: NextRequest) {
  try {
    // Basic auth check - in production you'd want proper authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting poem indexing...');
    const result = await indexAllPoems();

    return NextResponse.json({
      success: true,
      message: 'Poems indexed successfully',
      result
    });
  } catch (error) {
    console.error('Indexing error:', error);
    return NextResponse.json(
      { error: 'Failed to index poems', details: error.message },
      { status: 500 }
    );
  }
}