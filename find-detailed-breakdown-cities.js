/**
 * FIND CITIES WITH DETAILED BREAKDOWN DATA
 * Identify which cities have cost breakdown tabs in popup modals
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 FINDING CITIES WITH DETAILED BREAKDOWN DATA');
console.log('These are the cities that show cost breakdown tabs in popup modals\n');

// Read and parse the database
const claudeCostsPath = join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
const claudeCostsContent = readFileSync(claudeCostsPath, 'utf-8');
const databaseMatch = claudeCostsContent.match(/export const CLAUDE_DAILY_COSTS_DATABASE: Record<string, CityDailyCosts> = ({[\s\S]*?});(?=\s*\/\*\*|\s*export|\s*$)/);

if (!databaseMatch) {
  console.error('❌ Could not find database in file');
  process.exit(1);
}

const databaseContent = databaseMatch[1];
const CLAUDE_DAILY_COSTS_DATABASE = eval(`(${databaseContent})`);

const citiesWithDetailedBreakdown = [];
const citiesWithoutDetailedBreakdown = [];

Object.keys(CLAUDE_DAILY_COSTS_DATABASE).forEach((cityKey) => {
  const cityData = CLAUDE_DAILY_COSTS_DATABASE[cityKey];
  
  if (cityData.detailedBreakdown) {
    citiesWithDetailedBreakdown.push({
      city: cityKey,
      hasDetails: true,
      breakdown: cityData.breakdown,
      detailedBreakdown: cityData.detailedBreakdown
    });
  } else {
    citiesWithoutDetailedBreakdown.push({
      city: cityKey,
      hasDetails: false,
      breakdown: cityData.breakdown
    });
  }
});

console.log(`📊 SUMMARY:`);
console.log(`Cities WITH detailed breakdown tabs: ${citiesWithDetailedBreakdown.length}`);
console.log(`Cities WITHOUT detailed breakdown tabs: ${citiesWithoutDetailedBreakdown.length}`);
console.log(`Total cities: ${citiesWithDetailedBreakdown.length + citiesWithoutDetailedBreakdown.length}`);

console.log(`\n✅ CITIES WITH COST BREAKDOWN TABS IN POPUP MODALS:`);
console.log('─'.repeat(60));

citiesWithDetailedBreakdown.forEach((city, index) => {
  const budget = city.breakdown?.budget;
  const midRange = city.breakdown?.midRange;
  const luxury = city.breakdown?.luxury;
  
  console.log(`${(index + 1).toString().padStart(2)}. ${city.city.padEnd(20)} | Budget: $${budget?.total || 'N/A'} | Mid: $${midRange?.total || 'N/A'} | Luxury: $${luxury?.total || 'N/A'}`);
});

console.log(`\n❌ CITIES WITHOUT DETAILED BREAKDOWN TABS (first 20):`);
console.log('─'.repeat(60));

citiesWithoutDetailedBreakdown.slice(0, 20).forEach((city, index) => {
  const budget = city.breakdown?.budget;
  const midRange = city.breakdown?.midRange;
  const luxury = city.breakdown?.luxury;
  
  console.log(`${(index + 1).toString().padStart(2)}. ${city.city.padEnd(20)} | Budget: $${budget?.total || 'N/A'} | Mid: $${midRange?.total || 'N/A'} | Luxury: $${luxury?.total || 'N/A'}`);
});

if (citiesWithoutDetailedBreakdown.length > 20) {
  console.log(`   ... and ${citiesWithoutDetailedBreakdown.length - 20} more cities without detailed breakdowns`);
}

console.log(`\n🎯 WHAT THIS MEANS FOR THE UI:`);
console.log(`✅ ${citiesWithDetailedBreakdown.length} cities show rich cost breakdown tabs with:`);
console.log(`   • Detailed category explanations`);
console.log(`   • Examples and tips for each cost category`);
console.log(`   • Enhanced mobile-friendly breakdown display`);
console.log(`   • Smart insights and recommendations`);

console.log(`\n❌ ${citiesWithoutDetailedBreakdown.length} cities show simplified breakdown:`);
console.log(`   • Basic cost totals only`);
console.log(`   • No detailed category explanations`);
console.log(`   • Fallback display for cities without enhanced data`);

// Show examples of what detailed breakdown contains
if (citiesWithDetailedBreakdown.length > 0) {
  const firstCity = citiesWithDetailedBreakdown[0];
  console.log(`\n💡 EXAMPLE: ${firstCity.city.toUpperCase()} DETAILED BREAKDOWN STRUCTURE:`);
  console.log('─'.repeat(60));
  
  const detailed = firstCity.detailedBreakdown;
  console.log('Budget tier detailed categories:');
  if (detailed.budget) {
    Object.keys(detailed.budget).forEach(category => {
      const categoryData = detailed.budget[category];
      if (categoryData && typeof categoryData === 'object') {
        console.log(`  • ${category}: Has examples, tips, cost ranges`);
      }
    });
  }
}