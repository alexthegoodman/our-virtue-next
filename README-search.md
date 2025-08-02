The system supports all 10 languages:

- English (en), Arabic (ar), Bengali (bn), Spanish (es), French (fr)
- Hindi (hi), Indonesian (id), Korean (ko), Urdu (ur), Chinese (zh)

🚀 Setup Instructions

1. Environment Variables (add to your .env.local):
   OPENAI_API_KEY=your_openai_api_key
   MEILISEARCH_HOST=http://localhost:7700
   MEILISEARCH_API_KEY=your_meilisearch_key

2. Start Meilisearch (if running locally):
   curl -L https://install.meilisearch.com | sh
   ./meilisearch

3. Index Your Poems:
   npx tsx scripts/index-poems.ts

📖 Usage Examples

Search API:
// Search in specific language
fetch('/api/search?q=faith&language=ar')

// Search in specific chapter
fetch('/api/search?q=salvation&chapter=Salvation')

// General search
fetch('/api/search?q=love')

React Component:
import SearchBar from '@/components/SearchBar';

<SearchBar
    currentLanguage="ar"
    placeholder="Search in Arabic..."
  />

The system automatically filters by language based on the URL, indexes content with OpenAI embeddings for semantic search, and provides
real-time search with highlighted results!
