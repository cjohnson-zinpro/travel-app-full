const fs = require('fs');

// Read the cost data file
const costData = fs.readFileSync('shared/data/claude-daily-costs.ts', 'utf8');

// Extract all city names
const cityMatches = costData.match(/'([a-z\-]+)':\s*\{/g);
const cities = [...new Set(cityMatches.map(m => m.match(/'([a-z\-]+)'/)[1]))];

// Count cities with detailed breakdown
const withDetailed = cities.filter(city => {
  const regex = new RegExp(`'${city}':[^}]*detailedBreakdown`, 's');
  return regex.test(costData);
});

console.log('=== COST BREAKDOWN ANALYSIS ===');
console.log('Total cities:', cities.length);
console.log('With detailed breakdown:', withDetailed.length);
console.log('Missing detailed breakdown:', cities.length - withDetailed.length);

// Check priority cities
const priority = [
  'new-york','los-angeles','san-francisco','chicago','miami','las-vegas',
  'london','paris','rome','barcelona','amsterdam','berlin','vienna',
  'tokyo','seoul','hong-kong','shanghai','beijing',
  'dubai','bangkok','kuala-lumpur','singapore',
  'sydney','melbourne','rio-de-janeiro','buenos-aires'
];

const priorityMissing = priority.filter(c => !withDetailed.includes(c));

console.log('\nPriority cities missing detailed breakdown:');
priorityMissing.forEach(c => console.log('-', c));

// Check cultural data
const culturalData = fs.readFileSync('client/src/components/city-modal.tsx', 'utf8');
const culturalMatches = culturalData.match(/\s([a-z\-]+):\s*\{/g);
const withCultural = culturalMatches ? culturalMatches.map(m => m.match(/\s([a-z\-]+):/)[1]) : [];

console.log('\n=== CULTURAL DATA ANALYSIS ===');
console.log('Cities with cultural data:', withCultural.length);
console.log('Cities missing cultural data:', cities.length - withCultural.length);

const priorityMissingCultural = priority.filter(c => !withCultural.includes(c));
console.log('\nPriority cities missing cultural data:');
priorityMissingCultural.forEach(c => console.log('-', c));

// Show all cities for reference
console.log('\n=== ALL CITIES ===');
cities.slice(0, 30).forEach((city, i) => {
  const hasDetailed = withDetailed.includes(city);
  const hasCultural = withCultural.includes(city);
  console.log(`${i + 1}. ${city} | Detailed: ${hasDetailed ? '✓' : '✗'} | Cultural: ${hasCultural ? '✓' : '✗'}`);
});

if (cities.length > 30) {
  console.log(`... and ${cities.length - 30} more cities`);
}