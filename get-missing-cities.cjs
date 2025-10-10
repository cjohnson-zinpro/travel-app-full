const fs = require('fs');
const path = require('path');

// Read the Claude data file
const claudeDataPath = path.join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
const claudeDataContent = fs.readFileSync(claudeDataPath, 'utf8');

// Extract city keys from the CLAUDE_DAILY_COSTS_DATABASE
const cityKeysMatch = claudeDataContent.match(/export const CLAUDE_DAILY_COSTS_DATABASE[\s\S]*?= {([\s\S]*?)};/);
if (!cityKeysMatch) {
  console.log('Could not find CLAUDE_DAILY_COSTS_DATABASE');
  process.exit(1);
}

const databaseContent = cityKeysMatch[1];
const cityKeys = [];
const lines = databaseContent.split('\n');

for (const line of lines) {
  const match = line.match(/^\s*'([^']+)':\s*{/);
  if (match) {
    cityKeys.push(match[1]);
  }
}

console.log('Cities WITH accommodation data:');
const citiesWithAccommodation = cityKeys.filter(city => {
  const cityDataMatch = databaseContent.match(new RegExp(`'${city}':\\s*{([\\s\\S]*?)(?=\\n\\s*(?:'[^']*':|\\s*}\\s*$))`, 'm'));
  if (cityDataMatch) {
    return cityDataMatch[1].includes('accommodation:');
  }
  return false;
});

console.log(`Found ${citiesWithAccommodation.length} cities with accommodation data:`);
citiesWithAccommodation.forEach((city, i) => console.log(`${i + 1}. ${city}`));

console.log('\n\nCities WITHOUT accommodation data:');
const citiesWithoutAccommodation = cityKeys.filter(city => !citiesWithAccommodation.includes(city));
console.log(`Found ${citiesWithoutAccommodation.length} cities without accommodation data:`);
citiesWithoutAccommodation.forEach((city, i) => console.log(`${i + 1}. ${city}`));

// Show some examples of the missing ones
console.log('\n\nFirst 10 cities needing accommodation data:');
const priorityCities = citiesWithoutAccommodation.slice(0, 10);
priorityCities.forEach((city, i) => console.log(`${i + 1}. ${city}`));