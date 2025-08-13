import { NextRequest, NextResponse } from 'next/server';
import { meiliClient, POEMS_INDEX } from '@/lib/meilisearch';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const moodToSearchQuery: Record<string, string> = {
  "Joyful": "joy happiness celebration praise gratitude blessing triumph",
  "Peaceful": "peace calm tranquil serenity rest quiet stillness",
  "Hopeful": "hope future promise faith trust belief expectation",
  "Grateful": "gratitude thankfulness blessing appreciation praise",
  "Loving": "love compassion kindness mercy grace caring",
  "Anxious": "worry anxiety fear concern trouble distress",
  "Sad": "sadness sorrow grief mourning affliction pain",
  "Angry": "anger wrath justice judgment righteousness",
  "Confused": "confusion uncertainty guidance wisdom understanding",
  "Lonely": "loneliness isolation fellowship community together",
  "Overwhelmed": "burden struggle strength endurance perseverance",
  "Seeking": "seeking search truth wisdom guidance direction"
};

export async function POST(request: NextRequest) {
  try {
    const { mood } = await request.json();

    if (!mood || typeof mood !== 'string') {
      return NextResponse.json({ error: 'Invalid mood provided' }, { status: 400 });
    }

    const searchQuery = moodToSearchQuery[mood] || mood;

    // Get embedding for the mood/search query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: searchQuery,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Search for poems using vector similarity
    const index = meiliClient.index(POEMS_INDEX);
    
    // Get selected language from request or default to English
    const language = request.headers.get('x-selected-language') || 'en';
    
    const searchResults = await index.search('', {
      vector: embedding,
      hybrid: {
        semanticRatio: 0.8,
        embedder: 'default'
      },
      limit: 5,
      filter: `language = "${language}"`
    });

    if (searchResults.hits.length === 0) {
      // Fallback to keyword search if no vector results
      const fallbackResults = await index.search(searchQuery, {
        limit: 5,
        filter: `language = "${language}"`
      });

      if (fallbackResults.hits.length === 0) {
        return NextResponse.json({ error: 'No matching poems found' }, { status: 404 });
      }

      const randomPoem = fallbackResults.hits[Math.floor(Math.random() * fallbackResults.hits.length)];
      return NextResponse.json({ poemPath: (randomPoem as any).path });
    }

    // Return the best matching poem
    const bestMatch = searchResults.hits[0];
    return NextResponse.json({ poemPath: (bestMatch as any).path });

  } catch (error) {
    console.error('Error matching poem:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}