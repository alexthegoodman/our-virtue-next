import { MeiliSearch } from 'meilisearch';

export const meiliClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY,
});

export const POEMS_INDEX = 'poems';

export interface PoemDocument {
  id: string;
  title: string;
  content: string;
  chapter: string;
  language: string;
  path: string;
  embedding?: number[];
  _vectors?: { default: number[] };
}

export async function initializeMeilisearch() {
  try {
    // Create poems index if it doesn't exist
    await meiliClient.createIndex(POEMS_INDEX, { primaryKey: 'id' });
  } catch (error) {
    // Index might already exist
    console.log('Poems index may already exist:', error);
  }

  const index = meiliClient.index(POEMS_INDEX);

  // Configure searchable attributes
  await index.updateSearchableAttributes([
    'title',
    'content',
    'chapter'
  ]);

  // Configure filterable attributes
  await index.updateFilterableAttributes([
    'language',
    'chapter'
  ]);

  // Configure sortable attributes
  await index.updateSortableAttributes([
    'title',
    'chapter'
  ]);

  // Configure embeddings for vector search
  await index.updateEmbedders({
    default: {
      source: "userProvided",
      dimensions: 1536 // text-embedding-3-small dimensions
    }
  });

  return index;
}