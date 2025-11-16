#!/usr/bin/env node

/**
 * Context-7 Documentation Retrieval
 * Fetches documentation for a specific library
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

const library = process.argv[2];

if (!library) {
  console.error('Usage: node get-docs.js <library> [--topic=<topic>] [--tokens=<limit>]');
  console.error('Example: node get-docs.js vercel/next.js --topic=ssr --tokens=5000');
  process.exit(1);
}

// Parse optional arguments
const args = process.argv.slice(3);
let topic = '';
let tokens = 5000;

args.forEach(arg => {
  if (arg.startsWith('--topic=')) {
    topic = arg.substring(8);
  }
  if (arg.startsWith('--tokens=')) {
    tokens = parseInt(arg.substring(9), 10);
  }
});

// Build URL
let url = `https://context7.com/api/v1${library}?type=txt`;
if (topic) {
  url += `&topic=${encodeURIComponent(topic)}`;
}
if (tokens) {
  url += `&tokens=${tokens}`;
}

async function getDocs() {
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
      if (response.status === 404) {
        console.error(`Error: Library not found: ${library}`);
        console.error('Tip: Use search.js first to find the correct library ID');
        process.exit(2);
      }
      console.error(`Error: API returned status ${response.status}`);
      process.exit(2);
    }

    const text = await response.text();
    console.log(text);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(2);
  }
}

getDocs();
