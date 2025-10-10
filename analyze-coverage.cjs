/**
 * Simple analysis script to check city pricing data coverage
 */

const fs = require('fs');

// Read the Claude daily costs file
const claudeDataContent = fs.readFileSync('./shared/data/claude-daily-costs.ts', 'utf8');

// Extract city keys
const cityMatches = claudeDataContent.match(/^\s*'([^']+)':\s*{/gm);
const totalCities = cityMatches ? cityMatches.length : 0;

console.log(`🔍 CITY DATA COVERAGE ANALYSIS`);
console.log('='.repeat(50));
console.log(`Total cities found: ${totalCities}\n`);

// Count cities with complete data
let completeData = 0;
let hasAccommodation = 0;
let hasDetailedBreakdown = 0;
let missingAccommodation = [];
let verifiedCities = [];

if (cityMatches) {
  cityMatches.forEach(match => {
    const cityName = match.match(/'([^']+)'/)[1];
    
    // Look for the city's data block
    const cityRegex = new RegExp(`'${cityName}':\\s*{([\\s\\S]*?)(?=\\n\\s*},?\\s*\\n\\s*'[^']+':)|'${cityName}':\\s*{([\\s\\S]*?)(?=\\n\\s*}\\s*};?\\s*$)`, 'm');
    const cityDataMatch = claudeDataContent.match(cityRegex);
    
    if (cityDataMatch) {
      const cityData = cityDataMatch[0];
      
      const hasDailyCost = cityData.includes('dailyCost:');
      const hasAccommodationData = cityData.includes('accommodation:');
      const hasDetailedData = cityData.includes('detailedBreakdown:');
      
      if (hasDailyCost && hasAccommodationData) {
        completeData++;
        verifiedCities.push(cityName);
      }
      
      if (hasAccommodationData) {
        hasAccommodation++;
      } else {
        missingAccommodation.push(cityName);
      }
      
      if (hasDetailedData) {
        hasDetailedBreakdown++;
      }
    }
  });
}

console.log(`✅ COMPLETE VERIFIED PRICING: ${completeData} cities (${Math.round(completeData/totalCities*100)}%)`);
console.log(`🏨 Have accommodation data: ${hasAccommodation} cities (${Math.round(hasAccommodation/totalCities*100)}%)`);
console.log(`📋 Have detailed breakdowns: ${hasDetailedBreakdown} cities (${Math.round(hasDetailedBreakdown/totalCities*100)}%)`);
console.log(`❌ Missing accommodation: ${totalCities - hasAccommodation} cities (${Math.round((totalCities - hasAccommodation)/totalCities*100)}%)\n`);

console.log(`🎯 CITIES WITH VERIFIED PRICING (first 20):`);
console.log('='.repeat(50));
verifiedCities.slice(0, 20).forEach((city, i) => {
  console.log(`${i + 1}. ${city}`);
});

if (verifiedCities.length > 20) {
  console.log(`... and ${verifiedCities.length - 20} more`);
}

console.log(`\n⚠️  CITIES NEEDING ACCOMMODATION DATA (first 15):`);
console.log('='.repeat(50));
missingAccommodation.slice(0, 15).forEach((city, i) => {
  console.log(`${i + 1}. ${city}`);
});

if (missingAccommodation.length > 15) {
  console.log(`... and ${missingAccommodation.length - 15} more`);
}

// Check popular destinations
const popularDestinations = [
  'tokyo', 'london', 'paris', 'new-york', 'bangkok', 'singapore', 
  'dubai', 'barcelona', 'rome', 'amsterdam', 'istanbul', 'berlin',
  'prague', 'vienna', 'budapest', 'madrid', 'lisbon', 'mexico-city',
  'buenos-aires', 'rio-de-janeiro', 'sydney', 'melbourne', 'mumbai',
  'delhi', 'seoul', 'hong-kong', 'taipei', 'kuala-lumpur'
];

console.log(`\n🌟 POPULAR DESTINATIONS STATUS:`);
console.log('='.repeat(50));
popularDestinations.forEach(dest => {
  const isVerified = verifiedCities.some(city => city.toLowerCase().includes(dest.toLowerCase()) || dest.toLowerCase().includes(city.toLowerCase()));
  console.log(`${isVerified ? '✅' : '❌'} ${dest}`);
});