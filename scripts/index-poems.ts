#!/usr/bin/env node

/**
 * Script to index all poems in Meilisearch with embeddings
 * Usage: npx tsx scripts/index-poems.ts
 */

import 'dotenv/config';
import { indexAllPoems } from '../lib/poem-indexer';

async function main() {
  try {
    console.log('🚀 Starting poem indexing process...');
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    if (!process.env.MEILISEARCH_HOST && !process.env.MEILISEARCH_API_KEY) {
      console.warn('⚠️  Meilisearch environment variables not set, using defaults');
    }
    
    const result = await indexAllPoems();
    
    console.log('✅ Poem indexing completed successfully!');
    console.log('📊 Result:', result);
    
  } catch (error) {
    console.error('❌ Error during indexing:', error);
    process.exit(1);
  }
}

main();