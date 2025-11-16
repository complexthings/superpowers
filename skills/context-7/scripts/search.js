#!/usr/bin/env node

/**
 * Context-7 Library Search
 * Searches for library documentation on context7.com
 */

const apiKey = process.env.CONTEXT7_API_KEY;

if (!apiKey) {
  console.error('Error: CONTEXT7_API_KEY environment variable not set');
  console.error('');
  console.error('Setup instructions:');
  console.error('  export CONTEXT7_API_KEY="your-api-key"');
  console.error('');
  console.error('Or create a .env file with:');
  console.error('  CONTEXT7_API_KEY=your-api-key');
  process.exit(1);
}

const query = process.argv[2];

if (!query) {
  console.error('Usage: node search.js <query>');
  console.error('Example: node search.js "react hook form"');
  process.exit(1);
}

const url = `https://context7.com/api/v1/search?query=${encodeURIComponent(query)}`;

async function search() {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Error: Invalid API key');
        process.exit(2);
      }
      if (response.status === 429) {
        console.error('Error: Rate limit exceeded. Please wait and try again.');
        process.exit(2);
      }
      console.error(`Error: API returned status ${response.status}`);
      process.exit(2);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log('No results found for query:', query);
      process.exit(0);
    }

    // Format results as text
    console.log(`Found ${data.results.length} results for "${query}":\n`);

    data.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.title}`);
      console.log(`   ID: ${result.id}`);
      console.log(`   Description: ${result.description}`);
      console.log(`   Tokens: ${result.totalTokens}`);
      console.log(`   Snippets: ${result.totalSnippets}`);
      console.log(`   Stars: ${result.stars}`);
      console.log(`   Trust Score: ${result.trustScore}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(2);
  }
}

search();
