# Poem Translation Scripts

This directory contains scripts to translate all poems using OpenAI's API.

## Setup

1. Set your OpenAI API key:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

2. Make sure you have the `openai` package installed (already in package.json)

## Usage

### Test Translation
Test with a single poem to Hindi:
```bash
node scripts/test-translation.js
```

### Translate to Specific Languages
```bash
# Translate to Hindi only
node scripts/translate-poems.js hi

# Translate to multiple specific languages
node scripts/translate-poems.js hi es fr de

# Translate to all supported languages (20 languages)
node scripts/translate-poems.js
```

## Supported Languages

The script supports 20 popular languages:
- `hi` - Hindi
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `ru` - Russian
- `ja` - Japanese
- `ko` - Korean
- `zh` - Chinese (Simplified)
- `ar` - Arabic
- `tr` - Turkish
- `pl` - Polish
- `nl` - Dutch
- `sv` - Swedish
- `da` - Danish
- `no` - Norwegian
- `fi` - Finnish
- `he` - Hebrew
- `th` - Thai

## Output Structure

Translated poems are saved in directories like:
- `app/(poems-hi)/` - Hindi translations
- `app/(poems-es)/` - Spanish translations
- `app/(poems-fr)/` - French translations
- etc.

The folder structure mirrors the original `app/(poems)/` directory.

## Features

- Preserves MDX formatting and HTML tags
- Maintains poetic structure and spiritual meaning
- Includes rate limiting to avoid API limits
- Progress tracking and error handling
- Keeps Supporting Verses section titles and Bible references in English
- Uses GPT-4 for high-quality translations

## Cost Estimation

With ~50 poems averaging ~500 tokens each:
- Total tokens per language: ~25,000 tokens
- Estimated cost per language: ~$0.75
- All 20 languages: ~$15 total