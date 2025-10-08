import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the claude-daily-costs.ts file
const filePath = path.join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// Find all city entries by looking for pattern: 'city-name': {
const cityPattern = /'([^']+)':\s*{/g;
const detailedBreakdownPattern = /detailedBreakdown:\s*{/g;

// Get all city names
let cityMatches = [];
let match;
while ((match = cityPattern.exec(content)) !== null) {
  cityMatches.push(match[1]);
}

// Get all detailedBreakdown occurrences
let detailedBreakdownMatches = [];
while ((match = detailedBreakdownPattern.exec(content)) !== null) {
  detailedBreakdownMatches.push(match.index);
}

console.log(`\n=== DETAILED BREAKDOWN ANALYSIS ===`);
console.log(`Total cities found: ${cityMatches.length}`);
console.log(`Cities with detailed breakdowns: ${detailedBreakdownMatches.length}`);
console.log(`Percentage with detailed breakdowns: ${((detailedBreakdownMatches.length / cityMatches.length) * 100).toFixed(1)}%`);

// Now let's find which specific cities have detailed breakdowns
let citiesWithDetailedBreakdown = [];
let position = 0;

for (let i = 0; i < cityMatches.length; i++) {
  const cityName = cityMatches[i];
  
  // Find the start of this city's definition
  const cityStart = content.indexOf(`'${cityName}': {`, position);
  
  // Find the next city's start or end of file
  let cityEnd;
  if (i < cityMatches.length - 1) {
    const nextCity = cityMatches[i + 1];
    cityEnd = content.indexOf(`'${nextCity}': {`, cityStart + 1);
  } else {
    cityEnd = content.length;
  }
  
  // Check if this city section contains detailedBreakdown
  const citySection = content.substring(cityStart, cityEnd);
  if (citySection.includes('detailedBreakdown:')) {
    citiesWithDetailedBreakdown.push(cityName);
  }
  
  position = cityStart + 1;
}

console.log(`\n=== CITIES WITH DETAILED BREAKDOWNS ===`);
citiesWithDetailedBreakdown.forEach((city, index) => {
  console.log(`${index + 1}. ${city}`);
});

const citiesWithoutDetailed = cityMatches.filter(city => !citiesWithDetailedBreakdown.includes(city));

console.log(`\n=== FIRST 10 CITIES WITHOUT DETAILED BREAKDOWNS ===`);
citiesWithoutDetailed.slice(0, 10).forEach((city, index) => {
  console.log(`${index + 1}. ${city}`);
});

console.log(`\n=== SUMMARY ===`);
console.log(`Cities lacking detailed breakdowns: ${citiesWithoutDetailed.length}`);
console.log(`\nNote: A detailed breakdown includes specific local examples and tips for each cost category.`);