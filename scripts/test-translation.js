#!/usr/bin/env node

const { translatePoem } = require('./translate-poems');
const path = require('path');

async function testTranslation() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  // Test with one poem to Hindi
  const testPoemPath = path.join(__dirname, '..', 'app', '(poems)', 'salvation', 'love-one-another', 'page.mdx');
  
  console.log('Testing translation of "Love One Another" to Hindi...');
  const success = await translatePoem(testPoemPath, 'hi', 'Hindi');
  
  if (success) {
    console.log('✓ Test translation successful!');
    console.log('Check app/(poems-hi)/salvation/love-one-another/page.mdx for the result');
  } else {
    console.log('✗ Test translation failed');
  }
}

testTranslation().catch(console.error);