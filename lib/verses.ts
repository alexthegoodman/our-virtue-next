import stanzasData from "@/content/stanzas.json";
import { poemList } from "@/content/poems";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://our-virtue.com";

export interface Verse {
  text: string;
  poemTitle: string;
  categoryTitle: string;
  path: string;
}

interface StanzasJson {
  [categoryKey: string]: {
    [poemKey: string]: {
      title: string;
      stanzas: { slug: string; text: string }[];
    };
  };
}

const stanzas = stanzasData as StanzasJson;

function findPoemMeta(categoryKey: string, poemKey: string) {
  const chapter = poemList.find((c) => c.key === categoryKey);
  const item = chapter?.items.find((i) => i.path.endsWith(`/${poemKey}`));
  return item && chapter ? { path: item.path, categoryTitle: chapter.title } : null;
}

// Built once at module load: every stanza that reads as an actual poem
// stanza rather than a "### Supporting Verses" citation block, paired with
// the page it lives on. Used to pick a verse for the recurring email.
const VERSES: Verse[] = [];
for (const categoryKey of Object.keys(stanzas)) {
  for (const poemKey of Object.keys(stanzas[categoryKey])) {
    const poem = stanzas[categoryKey][poemKey];
    const meta = findPoemMeta(categoryKey, poemKey);
    if (!meta) continue;
    for (const stanza of poem.stanzas) {
      if (stanza.text.includes("Supporting Verses")) continue;
      VERSES.push({
        text: stanza.text.replace(/\r\n/g, "\n"),
        poemTitle: poem.title,
        categoryTitle: meta.categoryTitle,
        path: meta.path,
      });
    }
  }
}

export function getRandomVerse(): Verse {
  return VERSES[Math.floor(Math.random() * VERSES.length)];
}
