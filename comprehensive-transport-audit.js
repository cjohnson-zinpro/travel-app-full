import fs from 'fs';

console.log('🌍 COMPREHENSIVE TRANSPORT AUDIT - ALL CITIES');

const fileContent = fs.readFileSync('shared/data/claude-daily-costs.ts', 'utf8');

// Extract all cities with complete breakdown data
const cities = [];
const cityMatches = fileContent.match(/'([^']+)':\s*{[^}]*breakdown:/g);

if (cityMatches) {
  cityMatches.forEach(match => {
    const cityName = match.match(/'([^']+)':/)[1];
    
    // Find the breakdown section for this city
    const cityStart = fileContent.indexOf(match);
    const breakdownStart = fileContent.indexOf('breakdown:', cityStart);
    const cityEnd = fileContent.indexOf('\n  },', breakdownStart);
    const citySection = fileContent.substring(breakdownStart, cityEnd);
    
    // Extract transport costs
    const budgetMatch = citySection.match(/budget:\s*{[^}]*transport:\s*(\d+)/);
    const midRangeMatch = citySection.match(/midRange:\s*{[^}]*transport:\s*(\d+)/);
    const luxuryMatch = citySection.match(/luxury:\s*{[^}]*transport:\s*(\d+)/);
    
    if (budgetMatch && midRangeMatch && luxuryMatch) {
      const budget = parseInt(budgetMatch[1]);
      const midRange = parseInt(midRangeMatch[1]);
      const luxury = parseInt(luxuryMatch[1]);
      
      cities.push({
        name: cityName,
        budget,
        midRange,
        luxury,
        meetsMidRange: midRange >= 20,
        meetsLuxury: luxury >= 40
      });
    }
  });
}

console.log(`\n📊 FOUND ${cities.length} CITIES WITH COMPLETE DATA\n`);

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