import fs from "fs/promises";
import path from "path";
import {
  meiliClient,
  POEMS_INDEX,
  PoemDocument,
  initializeMeilisearch,
} from "./meilisearch";
import { generateEmbeddingsBatch, generateEmbedding } from "./embeddings";
import { poemList } from "../content/poems";

const LANGUAGE_MAP = {
  "(poems)": "en",
  "(poems-ar)": "ar",
  "(poems-bn)": "bn",
  "(poems-es)": "es",
  "(poems-fr)": "fr",
  "(poems-hi)": "hi",
  "(poems-id)": "id",
  "(poems-ko)": "ko",
  "(poems-ur)": "ur",
  "(poems-zh)": "zh",
};

function extractTextFromMdx(content: string): string {
  // Remove MDX frontmatter
  content = content.replace(/^---[\s\S]*?---\n/, "");

  // Remove HTML tags but keep the text content
  content = content.replace(/<[^>]*>/g, " ");

  // Remove extra whitespace and normalize
  content = content.replace(/\s+/g, " ").trim();

  return content;
}

export async function clearIndex() {
  console.log("Clearing existing poems index...");
  const index = meiliClient.index(POEMS_INDEX);
  
  try {
    await index.deleteAllDocuments();
    console.log("✅ Index cleared successfully");
  } catch (error) {
    console.log("Index may not exist yet:", error);
  }
}

export async function indexAllPoems() {
  console.log("Starting poem indexing...");

  // Clear existing documents first
  await clearIndex();

  // Initialize Meilisearch
  await initializeMeilisearch();
  const index = meiliClient.index(POEMS_INDEX);

  const documents: PoemDocument[] = [];
  const textsForEmbedding: string[] = [];

  // Process each language
  for (const [routeGroup, langCode] of Object.entries(LANGUAGE_MAP)) {
    const basePath = path.join(process.cwd(), "app", routeGroup);

    // Skip if directory doesn't exist
    try {
      await fs.access(basePath);
    } catch {
      console.log(`Skipping ${langCode} - directory not found: ${basePath}`);
      continue;
    }

    console.log(`Processing ${langCode} poems...`);

    // Process each chapter
    for (const chapter of poemList) {
      const chapterPath =
        langCode === "en"
          ? path.join(basePath, chapter.key)
          : path.join(basePath, langCode, chapter.key);

      try {
        await fs.access(chapterPath);
      } catch {
        console.log(`Skipping chapter ${chapter.key} for ${langCode}`);
        continue;
      }

      // Process each poem in the chapter
      for (const poem of chapter.items) {
        // Extract poem slug from path
        const poemSlug = poem.path.split("/").pop();
        const poemPath = path.join(chapterPath, poemSlug as string, "page.mdx");

        try {
          const content = await fs.readFile(poemPath, "utf-8");
          const cleanText = extractTextFromMdx(content);

          const document: PoemDocument = {
            id: `${langCode}-${chapter.key}-${poemSlug}`,
            title: poem.title,
            content: cleanText,
            chapter: chapter.title,
            language: langCode,
            path: langCode === "en" ? poem.path : `/${langCode}${poem.path}`,
            _vectors: { default: [] }, // Will be filled with embeddings
          };

          documents.push(document);
          textsForEmbedding.push(`${poem.title} ${cleanText}`);
        } catch (error) {
          console.log(`Error reading poem ${poemSlug} in ${langCode}:`, error);
        }
      }
    }
  }

  console.log(`Found ${documents.length} poems to index`);

  // Generate embeddings in batches
  const BATCH_SIZE = 100;
  for (let i = 0; i < textsForEmbedding.length; i += BATCH_SIZE) {
    const batch = textsForEmbedding.slice(i, i + BATCH_SIZE);
    const embeddings = await generateEmbeddingsBatch(batch);

    // Add embeddings to corresponding documents
    for (let j = 0; j < embeddings.length; j++) {
      documents[i + j].embedding = embeddings[j];
      documents[i + j]._vectors = { default: embeddings[j] };
    }

    console.log(
      `Generated embeddings for batch ${Math.floor(i / BATCH_SIZE) + 1}`
    );
  }

  // Index documents in Meilisearch
  console.log("Indexing documents in Meilisearch...");
  const result = await index.addDocuments(documents);
  console.log("Indexing result:", result);

  return result;
}

export async function searchPoems(
  query: string,
  language?: string,
  chapter?: string
) {
  const index = meiliClient.index(POEMS_INDEX);

  let filter = "";
  const filters = [];

  if (language) {
    filters.push(`language = "${language}"`);
  }

  if (chapter) {
    filters.push(`chapter = "${chapter}"`);
  }

  if (filters.length > 0) {
    filter = filters.join(" AND ");
  }

  // Generate embedding for the search query
  const queryEmbedding = await generateEmbedding(query);

  const searchParams: any = {
    limit: 20,
    attributesToHighlight: ["title", "content"],
    highlightPreTag: "<mark>",
    highlightPostTag: "</mark>",
    hybrid: {
      semanticRatio: 0.7, // 70% semantic, 30% keyword search
      embedder: "default"
    },
    vector: queryEmbedding,
  };

  if (filter) {
    searchParams.filter = filter;
  }

  return await index.search(query, searchParams);
}
