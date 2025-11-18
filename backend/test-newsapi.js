// Quick test script for NewsAPI.org integration
require('dotenv').config();
const { fetchNewsAPIData, fetchNewsData } = require('./services/externalAPIs');

async function testNewsAPI() {
  console.log('Testing NewsAPI.org Integration...\n');

  // Test 1: Fetch news using NewsAPI.org
  console.log('Test 1: Fetching Bitcoin news from NewsAPI.org...');
  const bitcoinNews = await fetchNewsAPIData('bitcoin', { pageSize: 5 });
  
  if (bitcoinNews.status === 'ok') {
    console.log(`✓ Success! Found ${bitcoinNews.totalResults} total results`);
    console.log(`✓ Retrieved ${bitcoinNews.articles.length} articles\n`);
    
    bitcoinNews.articles.forEach((article, index) => {
      console.log(`Article ${index + 1}:`);
      console.log(`  Source: ${article.source.name}`);
      console.log(`  Title: ${article.title}`);
      console.log(`  Author: ${article.author || 'N/A'}`);
      console.log(`  Published: ${article.publishedAt}`);
      console.log(`  URL: ${article.url}\n`);
    });
  } else {
    console.log('✗ Failed to fetch from NewsAPI.org');
  }

  // Test 2: Fetch news using the unified function (tries NewsAPI first, then GNews)
  console.log('\nTest 2: Fetching earthquake news using unified function...');
  const earthquakeNews = await fetchNewsData('earthquake');
  
  console.log(`✓ Retrieved ${earthquakeNews.length} articles`);
  if (earthquakeNews.length > 0) {
    console.log(`First article: ${earthquakeNews[0].title}`);
  }

  // Test 3: Fetch news with different parameters
  console.log('\nTest 3: Fetching climate news sorted by relevancy...');
  const climateNews = await fetchNewsAPIData('climate change', {
    sortBy: 'relevancy',
    pageSize: 3
  });
  
  if (climateNews.status === 'ok') {
    console.log(`✓ Found ${climateNews.totalResults} total results`);
    climateNews.articles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title}`);
    });
  }

  console.log('\n✓ All tests completed!');
}

// Run tests
testNewsAPI().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
