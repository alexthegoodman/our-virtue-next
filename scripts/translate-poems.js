#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LANGUAGES = {
  // initial set
  hi: "Hindi",
  id: "Indonesian",
  ur: "Urdu",
  bn: "Bengali",
  // additional languages
  es: "Spanish",
  fr: "French",
  // de: "German",
  // it: "Italian",
  // pt: "Portuguese",
  // ru: "Russian",
  // ja: "Japanese",
  ko: "Korean",
  zh: "Chinese (Simplified)",
  ar: "Arabic",
  // tr: "Turkish",
  // pl: "Polish",
  // nl: "Dutch",
  // sv: "Swedish",
  // da: "Danish",
  // no: "Norwegian",
  // fi: "Finnish",
  // he: "Hebrew",
  // th: "Thai",
};

const POEMS_DIR = path.join(__dirname, "..", "app", "(poems)");

async function translateText(text, targetLanguage, languageName) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a skilled translator specializing in religious and spiritual poetry. Translate the following poem from English to ${languageName}. Maintain the spiritual meaning, poetic structure, and emotional depth. Keep HTML tags and markdown formatting exactly as they appear. Preserve line breaks and spacing. Do not translate the "Supporting Verses" section title or Bible verse references.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(`Error translating to ${languageName}:`, error.message);
    return null;
  }
}

async function translatePoem(poemPath, targetLang, languageName) {
  try {
    const content = fs.readFileSync(poemPath, "utf-8");
    console.log(`Translating ${poemPath} to ${languageName}...`);

    const translatedContent = await translateText(
      content,
      targetLang,
      languageName
    );

    if (!translatedContent) {
      console.error(`Failed to translate ${poemPath} to ${languageName}`);
      return false;
    }

    // Create the target directory structure
    const relativePath = path.relative(POEMS_DIR, poemPath);
    const targetPath = path.join(
      __dirname,
      "..",
      "app",
      `(poems-${targetLang})`,
      targetLang,
      relativePath
    );
    const targetDir = path.dirname(targetPath);

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetPath, translatedContent);

    console.log(`✓ Translated and saved to ${targetPath}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${poemPath}:`, error.message);
    return false;
  }
}

async function getAllPoemFiles() {
  const poemFiles = [];

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item === "page.mdx") {
        poemFiles.push(fullPath);
      }
    }
  }

  scanDirectory(POEMS_DIR);
  return poemFiles;
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY environment variable is required");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const targetLanguages = args.length > 0 ? args : Object.keys(LANGUAGES);

  console.log(
    `Starting translation for languages: ${targetLanguages.join(", ")}`
  );

  const poemFiles = await getAllPoemFiles();
  console.log(`Found ${poemFiles.length} poems to translate`);

  for (const lang of targetLanguages) {
    if (!LANGUAGES[lang]) {
      console.error(`Unknown language code: ${lang}`);
      continue;
    }

    console.log(`\n--- Translating to ${LANGUAGES[lang]} (${lang}) ---`);

    let successCount = 0;
    let failCount = 0;

    for (const poemFile of poemFiles) {
      const success = await translatePoem(poemFile, lang, LANGUAGES[lang]);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(
      `\n${LANGUAGES[lang]} translation complete: ${successCount} success, ${failCount} failed`
    );
  }

  console.log("\nAll translations complete!");
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { translatePoem, getAllPoemFiles, LANGUAGES };
