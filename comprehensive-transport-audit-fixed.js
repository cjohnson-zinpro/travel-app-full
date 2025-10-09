import fs from 'fs';

console.log('🌍 COMPREHENSIVE TRANSPORT AUDIT - ALL CITIES (FIXED)');

const fileContent = fs.readFileSync('shared/data/claude-daily-costs.ts', 'utf8');

// Split into city sections
const cityLines = fileContent.split('\n');
const cities = [];
let currentCity = null;
let inBreakdown = false;
let currentTier = null;

for (let i = 0; i < cityLines.length; i++) {
  const line = cityLines[i].trim();
  
  // Start of a new city
  if (line.match(/^'([^']+)':\s*{/)) {
    const cityName = line.match(/^'([^']+)':/)[1];
    currentCity = {
      name: cityName,
      budget: null,
      midRange: null,
      luxury: null
    };
  }
  
  // Start of breakdown section
  if (line.includes('breakdown:') && currentCity) {
    inBreakdown = true;
  }
  
  // End of city section
  if (line.includes('confidence:') && currentCity && inBreakdown) {
    if (currentCity.budget !== null && currentCity.midRange !== null && currentCity.luxury !== null) {
      cities.push({
        ...currentCity,
        meetsMidRange: currentCity.midRange >= 20,
        meetsLuxury: currentCity.luxury >= 40
      });
    }
    currentCity = null;
    inBreakdown = false;
  }
  
  // Extract transport costs from each tier
  if (inBreakdown && currentCity) {
    if (line.includes('budget:') && line.includes('transport:')) {
      const match = line.match(/transport:\s*(\d+)/);
      if (match) currentCity.budget = parseInt(match[1]);
    }
    if (line.includes('midRange:') && line.includes('transport:')) {
      const match = line.match(/transport:\s*(\d+)/);
      if (match) currentCity.midRange = parseInt(match[1]);
    }
    if (line.includes('luxury:') && line.includes('transport:')) {
      const match = line.match(/transport:\s*(\d+)/);
      if (match) currentCity.luxury = parseInt(match[1]);
    }
  }
}

console.log(`\n📊 FOUND ${cities.length} CITIES WITH COMPLETE DATA\n`);

if (cities.length === 0) {
  console.log('⚠️  No cities found. Debug: checking file structure...');
  const lines = fileContent.split('\n').slice(0, 20);
  lines.forEach((line, i) => console.log(`${i+1}: ${line.substring(0, 100)}...`));
  process.exit(1);
}

// Count status
const goodCities = cities.filter(c => c.meetsMidRange && c.meetsLuxury);
const needFixes = cities.filter(c => !c.meetsMidRange || !c.meetsLuxury);

console.log(`✅ Cities Meeting Standards: ${goodCities.length}/${cities.length}`);
console.log(`🔧 Cities Needing Fixes: ${needFixes.length}`);

if (needFixes.length > 0) {
  console.log('\n🔧 CITIES STILL NEEDING FIXES:');
  needFixes.slice(0, 15).forEach(city => {
    const issues = [];
    if (!city.meetsMidRange) issues.push(`mid-range $${city.midRange} < $20`);
    if (!city.meetsLuxury) issues.push(`luxury $${city.luxury} < $40`);
    console.log(`   ${city.name}: $${city.budget}/$${city.midRange}/$${city.luxury} | ${issues.join(', ')}`);
  });
  
  if (needFixes.length > 15) {
    console.log(`   ... and ${needFixes.length - 15} more cities`);
  }
} else {
  console.log('\n🎉 ALL CITIES HAVE REALISTIC TRANSPORT COSTS!');
}

console.log(`\n📈 SUCCESS RATE: ${Math.round((goodCities.length / cities.length) * 100)}%`);