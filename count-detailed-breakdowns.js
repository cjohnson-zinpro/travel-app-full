import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the claude-daily-costs.ts file
const filePath = path.join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// Extract city objects by splitting on city names and analyzing structure
const cityMatches = content.match(/([A-Z][a-zA-Z\s,'-]+):\s*{\s*dailyCost[\s\S]*?(?=\n\s*[A-Z][a-zA-Z\s,'-]+:\s*{|\n};|\nconst|\nexport)/g);

let citiesWithDetailedBreakdown = [];
let totalCities = 0;

if (cityMatches) {
  cityMatches.forEach(cityBlock => {
    totalCities++;
    
    // Extract city name
    const cityNameMatch = cityBlock.match(/^([A-Z][a-zA-Z\s,'-]+):/);
    const cityName = cityNameMatch ? cityNameMatch[1].trim() : 'Unknown';
    
    // Check if this city has detailedBreakdown
    if (cityBlock.includes('detailedBreakdown: {')) {
      citiesWithDetailedBreakdown.push(cityName);
    }
  });
}

console.log(`\n=== DETAILED BREAKDOWN ANALYSIS ===`);
console.log(`Total cities analyzed: ${totalCities}`);
console.log(`Cities with detailed breakdowns: ${citiesWithDetailedBreakdown.length}`);
console.log(`Percentage with detailed breakdowns: ${((citiesWithDetailedBreakdown.length / totalCities) * 100).toFixed(1)}%`);

console.log(`\n=== CITIES WITH DETAILED BREAKDOWNS ===`);
citiesWithDetailedBreakdown.forEach((city, index) => {
  console.log(`${index + 1}. ${city}`);
});

console.log(`\n=== SUMMARY ===`);
console.log(`Cities lacking detailed breakdowns: ${totalCities - citiesWithDetailedBreakdown.length}`);