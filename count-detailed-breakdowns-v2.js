import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the claude-daily-costs.ts file
const filePath = path.join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// Split content by city definitions using a more specific pattern
const lines = content.split('\n');
let currentCity = null;
let cityData = {};
let cities = [];
let inCity = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Look for city name pattern: "City Name": {
  const cityMatch = line.match(/^"([^"]+)":\s*{/);
  if (cityMatch) {
    currentCity = cityMatch[1];
    cityData = { name: currentCity, hasDetailedBreakdown: false };
    inCity = true;
    braceCount = 1;
    continue;
  }
  
  if (inCity) {
    // Count braces to track nesting
    braceCount += (line.match(/{/g) || []).length;
    braceCount -= (line.match(/}/g) || []).length;
    
    // Check for detailedBreakdown
    if (line.includes('detailedBreakdown:')) {
      cityData.hasDetailedBreakdown = true;
    }
    
    // End of city when braces balance out
    if (braceCount === 0) {
      cities.push(cityData);
      inCity = false;
      currentCity = null;
    }
  }
}

// Filter out non-city entries
const validCities = cities.filter(city => 
  city.name && 
  !city.name.includes('NORTH AMERICA') && 
  !city.name.includes('EUROPE') && 
  !city.name.includes('ASIA') &&
  !city.name.includes('OCEANIA') &&
  !city.name.includes('AFRICA') &&
  !city.name.includes('SOUTH AMERICA') &&
  !city.name.includes('MAJOR CITIES') &&
  !city.name.includes('COMMENT') &&
  city.name.length > 2
);

const citiesWithDetailedBreakdown = validCities.filter(city => city.hasDetailedBreakdown);

console.log(`\n=== DETAILED BREAKDOWN ANALYSIS ===`);
console.log(`Total cities analyzed: ${validCities.length}`);
console.log(`Cities with detailed breakdowns: ${citiesWithDetailedBreakdown.length}`);
console.log(`Percentage with detailed breakdowns: ${((citiesWithDetailedBreakdown.length / validCities.length) * 100).toFixed(1)}%`);

console.log(`\n=== CITIES WITH DETAILED BREAKDOWNS ===`);
citiesWithDetailedBreakdown.forEach((city, index) => {
  console.log(`${index + 1}. ${city.name}`);
});

console.log(`\n=== FIRST 10 CITIES WITHOUT DETAILED BREAKDOWNS ===`);
const citiesWithoutDetailed = validCities.filter(city => !city.hasDetailedBreakdown);
citiesWithoutDetailed.slice(0, 10).forEach((city, index) => {
  console.log(`${index + 1}. ${city.name}`);
});

console.log(`\n=== SUMMARY ===`);
console.log(`Cities lacking detailed breakdowns: ${citiesWithoutDetailed.length}`);
console.log(`\nNote: A detailed breakdown includes specific local examples and tips for each cost category.`);