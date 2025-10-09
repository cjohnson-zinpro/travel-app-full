// Transport Cost Analysis Script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the Claude daily costs data
const claudeDataPath = path.join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
const claudeDataContent = fs.readFileSync(claudeDataPath, 'utf8');

// Extract all transport costs from breakdown sections
const transportMatches = claudeDataContent.match(/budget: { total: \d+, meals: \d+, transport: (\d+), activities: \d+, drinks: \d+, incidentals: \d+ },\s*midRange: { total: \d+, meals: \d+, transport: (\d+), activities: \d+, drinks: \d+, incidentals: \d+ },\s*luxury: { total: \d+, meals: \d+, transport: (\d+), activities: \d+, drinks: \d+, incidentals: \d+ }/g);

// Extract all city names and their transport costs
const cityTransportData = [];
let match;
const cityPattern = /'([^']+)':\s*{\s*dailyCost:[^}]+},?\s*accommodation:[^}]+},?\s*[^}]*breakdown:\s*{\s*budget:\s*{\s*total:\s*\d+,\s*meals:\s*\d+,\s*transport:\s*(\d+),[^}]+},\s*midRange:\s*{\s*total:\s*\d+,\s*meals:\s*\d+,\s*transport:\s*(\d+),[^}]+},\s*luxury:\s*{\s*total:\s*\d+,\s*meals:\s*\d+,\s*transport:\s*(\d+),[^}]+}/g;

while ((match = cityPattern.exec(claudeDataContent)) !== null) {
  const [, cityName, budgetTransport, midTransport, luxuryTransport] = match;
  cityTransportData.push({
    city: cityName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    budget: parseInt(budgetTransport),
    midRange: parseInt(midTransport),
    luxury: parseInt(luxuryTransport)
  });
}

console.log('🚗 TRANSPORT COST ANALYSIS ACROSS ALL CITIES\n');
console.log('=' * 60);

// Sort by city name for easier reading
cityTransportData.sort((a, b) => a.city.localeCompare(b.city));

// Display all transport costs
console.log('| City | Budget | Mid-Range | Luxury | Budget→Mid | Mid→Luxury |');
console.log('|------|--------|-----------|--------|------------|------------|');

const stats = {
  budget: [],
  midRange: [],
  luxury: [],
  budgetToMid: [],
  midToLuxury: []
};

cityTransportData.forEach(city => {
  const budgetToMid = ((city.midRange - city.budget) / city.budget * 100).toFixed(0);
  const midToLuxury = ((city.luxury - city.midRange) / city.midRange * 100).toFixed(0);
  
  console.log(`| ${city.city.padEnd(20)} | $${city.budget.toString().padStart(2)} | $${city.midRange.toString().padStart(2)} | $${city.luxury.toString().padStart(2)} | +${budgetToMid}% | +${midToLuxury}% |`);
  
  stats.budget.push(city.budget);
  stats.midRange.push(city.midRange);
  stats.luxury.push(city.luxury);
  stats.budgetToMid.push(parseFloat(budgetToMid));
  stats.midToLuxury.push(parseFloat(midToLuxury));
});

console.log('\n📊 TRANSPORT COST STATISTICS\n');

const calculateStats = (arr, label) => {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const avg = (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
  const range = max - min;
  
  console.log(`${label}:`);
  console.log(`  Range: $${min} - $${max} (difference: $${range})`);
  console.log(`  Average: $${avg}`);
  console.log(`  Variation: ${((range / min) * 100).toFixed(0)}%\n`);
};

calculateStats(stats.budget, 'BUDGET Transport');
calculateStats(stats.midRange, 'MID-RANGE Transport');
calculateStats(stats.luxury, 'LUXURY Transport');

console.log('📈 TRAVEL STYLE PROGRESSION ANALYSIS\n');

const avgBudgetToMid = (stats.budgetToMid.reduce((a, b) => a + b, 0) / stats.budgetToMid.length).toFixed(0);
const avgMidToLuxury = (stats.midToLuxury.reduce((a, b) => a + b, 0) / stats.midToLuxury.length).toFixed(0);

console.log(`Average Budget → Mid-Range increase: ${avgBudgetToMid}%`);
console.log(`Average Mid-Range → Luxury increase: ${avgMidToLuxury}%`);

// Find cities with problematic transport scaling
console.log('\n⚠️  POTENTIAL ISSUES:\n');

const lowVariationCities = cityTransportData.filter(city => {
  const range = city.luxury - city.budget;
  const variation = (range / city.budget) * 100;
  return variation < 100; // Less than 100% variation from budget to luxury
});

if (lowVariationCities.length > 0) {
  console.log('Cities with LOW transport variation (< 100% budget to luxury):');
  lowVariationCities.forEach(city => {
    const variation = (((city.luxury - city.budget) / city.budget) * 100).toFixed(0);
    console.log(`  • ${city.city}: ${variation}% variation ($${city.budget} → $${city.luxury})`);
  });
} else {
  console.log('✅ All cities have good transport variation (100%+ budget to luxury)');
}

// Check for cities where luxury transport is too low
const lowLuxuryTransport = cityTransportData.filter(city => city.luxury < 25);
if (lowLuxuryTransport.length > 0) {
  console.log('\nCities with potentially LOW luxury transport (< $25/day):');
  lowLuxuryTransport.forEach(city => {
    console.log(`  • ${city.city}: $${city.luxury}/day (budget: $${city.budget}, mid: $${city.midRange})`);
  });
}

// Mexican cities specific analysis
console.log('\n🇲🇽 MEXICAN CITIES TRANSPORT COMPARISON:\n');

const mexicanCities = cityTransportData.filter(city => 
  ['Mexico City', 'Cancun', 'Puerto Vallarta', 'Acapulco', 'Guadalajara'].includes(city.city)
);

mexicanCities.forEach(city => {
  console.log(`${city.city}:`);
  console.log(`  Budget: $${city.budget}/day | Mid: $${city.midRange}/day | Luxury: $${city.luxury}/day`);
  console.log(`  Progression: ${city.budget} → ${city.midRange} → ${city.luxury}`);
  console.log('');
});

console.log('🎯 ANALYSIS COMPLETE!');