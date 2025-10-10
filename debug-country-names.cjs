const fs = require('fs');

// Read the progressive-results.tsx file to extract the getCountryImage function
const progressiveResultsPath = './client/src/components/progressive-results.tsx';
const content = fs.readFileSync(progressiveResultsPath, 'utf8');

// Extract the country mapping from getCountryImage function
const countryImageMatch = content.match(/const countryImages:\s*{[^}]+\}\s*=\s*{([^}]+)}/s);
if (!countryImageMatch) {
  console.log('❌ Could not find countryImages mapping');
  process.exit(1);
}

// Extract country names from the mapping
const mappingText = countryImageMatch[1];
const countryMatches = mappingText.match(/"([^"]+)":/g);
const mappedCountries = countryMatches ? countryMatches.map(match => match.slice(1, -2)) : [];

console.log('🗺️ Countries mapped in getCountryImage function:');
mappedCountries.forEach(country => {
  console.log(`  - "${country}"`);
});

console.log('\n🔍 Checking for specific missing countries:');
const checkCountries = ['France', 'Croatia', 'Belgium', 'Romania'];
checkCountries.forEach(country => {
  const found = mappedCountries.includes(country);
  console.log(`  ${found ? '✅' : '❌'} ${country}: ${found ? 'MAPPED' : 'NOT FOUND'}`);
});

// Now let's see what countries are actually being used in the data
console.log('\n🏙️ Checking cities data for country names...');

// Extract the cities data from the same file
const citiesMatch = content.match(/const cities\s*=\s*{([^}]+)}/s);
if (citiesMatch) {
  const citiesText = citiesMatch[1];
  const countryMatches = citiesText.match(/country:\s*'([^']+)'/g);
  const usedCountries = countryMatches ? countryMatches.map(match => match.slice(10, -1)) : [];
  
  const uniqueCountries = [...new Set(usedCountries)].sort();
  console.log('Countries used in cities data:');
  uniqueCountries.forEach(country => {
    const mapped = mappedCountries.includes(country);
    console.log(`  ${mapped ? '✅' : '❌'} "${country}": ${mapped ? 'MAPPED' : 'MISSING IMAGE'}`);
  });
}

console.log('\n🔍 Alternative name formats in mapping:');
const alternativeCountries = mappedCountries.filter(name => 
  name.includes('Republic') || 
  name.includes('Kingdom') || 
  name.includes('United') ||
  name.includes('People')
);
alternativeCountries.forEach(alt => {
  console.log(`  - "${alt}"`);
});