/**
 * Analysis script to check which cities have complete pricing data
 */

const fs = require('fs');
const path = require('path');

// Read the Claude daily costs file
const claudeDataPath = path.join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
const claudeDataContent = fs.readFileSync(claudeDataPath, 'utf8');

// Extract city data by parsing the file content
const cityMatches = claudeDataContent.match(/^\s*'([^']+)':\s*{/gm);
const cities = cityMatches ? cityMatches.map(match => {
  const cityName = match.match(/'([^']+)'/)[1];
  return cityName;
}) : [];

console.log(`🔍 Found ${cities.length} cities in Claude database\n`);

// Analyze each city's data completeness
const citiesWithCompleteData = [];
const citiesWithPartialData = [];
const citiesWithNoAccommodation = [];

cities.forEach(cityKey => {
  // Extract the data for this city
  const cityRegex = new RegExp(`'${cityKey}':\\s*{([\\s\\S]*?)(?=\\n\\s*},?\\s*\\n\\s*'[^']+':)|'${cityKey}':\\s*{([\\s\\S]*?)(?=\\n\\s*}\\s*};?\\s*$)`, 'm');
  const cityMatch = claudeDataContent.match(cityRegex);
  
  if (cityMatch) {
    const cityData = cityMatch[0];
    
    // Check for presence of key data
    const hasDailyCost = cityData.includes('dailyCost:');
    const hasAccommodation = cityData.includes('accommodation:');
    const hasBreakdown = cityData.includes('breakdown:');
    const hasDetailedBreakdown = cityData.includes('detailedBreakdown:');
    
    // Check for all three travel styles in dailyCost
    const hasBudget = cityData.includes('budget:') && cityData.match(/dailyCost:\s*{\s*budget:/);
    const hasMidRange = cityData.includes('midRange:') && cityData.match(/dailyCost:\s*{[^}]*midRange:/);
    const hasLuxury = cityData.includes('luxury:') && cityData.match(/dailyCost:\s*{[^}]*luxury:/);
    
    const cityInfo = {
      name: cityKey,
      hasDailyCost,
      hasAccommodation,
      hasBreakdown,
      hasDetailedBreakdown,
      hasBudget,
      hasMidRange,
      hasLuxury,
      isComplete: hasDailyCost && hasAccommodation && hasBudget && hasMidRange && hasLuxury
    };
    
    if (cityInfo.isComplete) {
      citiesWithCompleteData.push(cityInfo);
    } else if (hasDailyCost || hasAccommodation) {
      citiesWithPartialData.push(cityInfo);
    }
    
    if (!hasAccommodation) {
      citiesWithNoAccommodation.push(cityInfo);
    }
  }
});

// Print results
console.log(`✅ CITIES WITH COMPLETE VERIFIED PRICING (${citiesWithCompleteData.length}):`);
console.log('='.repeat(60));
citiesWithCompleteData.forEach((city, index) => {
  const features = [];
  if (city.hasDetailedBreakdown) features.push('Detailed');
  if (city.hasBreakdown) features.push('Breakdown');
  console.log(`${index + 1}. ${city.name} ${features.length ? `(${features.join(', ')})` : ''}`);
});

console.log(`\n⚠️  CITIES WITH PARTIAL DATA (${citiesWithPartialData.length}):`);
console.log('='.repeat(60));
citiesWithPartialData.forEach((city, index) => {
  const missing = [];
  if (!city.hasDailyCost) missing.push('Daily Cost');
  if (!city.hasAccommodation) missing.push('Accommodation');
  if (!city.hasBudget) missing.push('Budget');
  if (!city.hasMidRange) missing.push('Mid-Range');
  if (!city.hasLuxury) missing.push('Luxury');
  
  console.log(`${index + 1}. ${city.name} - Missing: ${missing.join(', ')}`);
});

console.log(`\n🏨 CITIES WITHOUT ACCOMMODATION DATA (${citiesWithNoAccommodation.length}):`);
console.log('='.repeat(60));
citiesWithNoAccommodation.slice(0, 20).forEach((city, index) => {
  console.log(`${index + 1}. ${city.name}`);
});
if (citiesWithNoAccommodation.length > 20) {
  console.log(`... and ${citiesWithNoAccommodation.length - 20} more`);
}

// Summary statistics
console.log(`\n📊 SUMMARY:`);
console.log('='.repeat(60));
console.log(`Total cities in database: ${cities.length}`);
console.log(`✅ Complete data (all travel styles + accommodation): ${citiesWithCompleteData.length} (${Math.round(citiesWithCompleteData.length / cities.length * 100)}%)`);
console.log(`⚠️  Partial data: ${citiesWithPartialData.length} (${Math.round(citiesWithPartialData.length / cities.length * 100)}%)`);
console.log(`❌ Missing accommodation: ${citiesWithNoAccommodation.length} (${Math.round(citiesWithNoAccommodation.length / cities.length * 100)}%)`);

// Popular destinations check
const popularDestinations = [
  'tokyo', 'london', 'paris', 'new-york', 'bangkok', 'singapore', 
  'dubai', 'barcelona', 'rome', 'amsterdam', 'istanbul', 'berlin',
  'prague', 'vienna', 'budapest', 'madrid', 'lisbon', 'mexico-city',
  'buenos-aires', 'rio-de-janeiro', 'sydney', 'melbourne', 'mumbai',
  'delhi', 'seoul', 'hong-kong', 'taipei', 'kuala-lumpur'
];

console.log(`\n🌟 POPULAR DESTINATIONS STATUS:`);
console.log('='.repeat(60));
popularDestinations.forEach(dest => {
  const cityData = citiesWithCompleteData.find(c => c.name.toLowerCase() === dest.toLowerCase()) ||
                   citiesWithPartialData.find(c => c.name.toLowerCase() === dest.toLowerCase());
  
  if (cityData && cityData.isComplete) {
    console.log(`✅ ${dest}: Complete`);
  } else if (cityData) {
    console.log(`⚠️  ${dest}: Partial`);
  } else {
    console.log(`❌ ${dest}: Missing`);
  }
});