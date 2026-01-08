
import fs from 'fs';
import path from 'path';

const POEMS_DIR = path.join(process.cwd(), 'app', '(poems)');
const OUTPUT_FILE = path.join(process.cwd(), 'content', 'stanzas.json');

interface Stanza {
  slug: string;
  text: string;
}

interface Poem {
  title: string;
  stanzas: Stanza[];
}

interface StanzaData {
  [category: string]: {
    [poemSlug: string]: Poem;
  };
}

async function extractStanzas() {
  const stanzaData: StanzaData = {};

  if (!fs.existsSync(POEMS_DIR)) {
    console.error(`Directory not found: ${POEMS_DIR}`);
    process.exit(1);
  }

  const categories = fs.readdirSync(POEMS_DIR).filter(item => {
    return fs.statSync(path.join(POEMS_DIR, item)).isDirectory();
  });

  for (const category of categories) {
    const categoryDir = path.join(POEMS_DIR, category);
    const poems = fs.readdirSync(categoryDir).filter(item => {
      return fs.statSync(path.join(categoryDir, item)).isDirectory();
    });

    stanzaData[category] = {};

    for (const poemSlug of poems) {
      const poemDir = path.join(categoryDir, poemSlug);
      const filePath = path.join(poemDir, 'page.mdx');

      if (!fs.existsSync(filePath)) {
        console.warn(`No page.mdx found in ${poemDir}`);
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Extract Title
      const lines = content.split('\n');
      const titleLine = lines.find(line => line.startsWith('# '));
      const title = titleLine ? titleLine.replace('# ', '').trim() : poemSlug;

      // Extract Stanzas
      // Split by <br />
      const parts = content.split('<br />');
      const stanzas: Stanza[] = [];

      parts.forEach((part, index) => {
        // Remove title line if it's in the first part
        let text = part;
        if (index === 0 && titleLine) {
          text = text.replace(titleLine, '');
        }

        // Remove <p></p> tags
        text = text.replace(/<p><\/p>/g, '');

        // Trim whitespace and empty lines
        text = text.trim();

        if (text) {
           // Basic cleanup of multiple newlines to single newlines if desired, 
           // but preserving line breaks is usually important for poems.
           // However, Markdown usually ignores single line breaks unless they end with two spaces.
           // The sample showed empty lines between lines of text. 
           // Let's clean up excessive newlines.
           text = text.replace(/\n{3,}/g, '\n\n'); 
           
           const stanzaSlug = `${category}-${poemSlug}-${(stanzas.length + 1).toString().padStart(2, '0')}`;
           stanzas.push({
             slug: stanzaSlug,
             text: text
           });
        }
      });

      stanzaData[category][poemSlug] = {
        title,
        stanzas
      };
    }
  }

  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(stanzaData, null, 2));
  console.log(`Stanzas extracted to ${OUTPUT_FILE}`);
}

extractStanzas();
