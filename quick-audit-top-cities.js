/**
 * QUICK AUDIT OF TOP 10 CITIES - REALITY CHECK
 * Check actual transport costs vs. claimed success metrics
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Top 10 most important cities to verify
const TOP_CITIES = [
  'new-york', 'los-angeles', 'london', 'paris', 'tokyo', 
  'sydney', 'rome', 'barcelona', 'phoenix', 'miami'
];

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

function auditTopCities() {
  console.log('🔍 QUICK AUDIT: TOP 10 CITIES TRANSPORT REALITY CHECK\n');
  
  const results = [];
  const problematicCities = [];
  
  TOP_CITIES.forEach((cityKey, index) => {
    const cityData = CLAUDE_DAILY_COSTS_DATABASE[cityKey];
    
    if (!cityData) {
      console.log(`❌ ${(index + 1).toString().padStart(2)}. ${cityKey.padEnd(15)} | DATA MISSING`);
      return;
    }
    
    const budget = cityData.breakdown.budget.transport;
    const midRange = cityData.breakdown.midRange.transport;
    const luxury = cityData.breakdown.luxury.transport;
    
    // Check if meets our realistic standards
    const meetsStandards = budget >= 8 && midRange >= 20 && luxury >= 40;
    const status = meetsStandards ? '✅' : '🔧';
    
    if (!meetsStandards) {
      problematicCities.push({
        city: cityKey,
        current: { budget, midRange, luxury },
        issues: []
      });
      
      // Identify specific issues
      if (budget < 8) problematicCities[problematicCities.length - 1].issues.push('budget < $8');
      if (midRange < 20) problematicCities[problematicCities.length - 1].issues.push('mid-range < $20');
      if (luxury < 40) problematicCities[problematicCities.length - 1].issues.push('luxury < $40');
    }
    
    results.push({
      city: cityKey,
      budget,
      midRange,
      luxury,
      meetsStandards
    });
    
    console.log(`${status} ${(index + 1).toString().padStart(2)}. ${cityKey.padEnd(15)} | $${budget.toString().padStart(2)}/$${midRange.toString().padStart(2)}/$${luxury.toString().padStart(2)} | ${meetsStandards ? 'GOOD' : 'NEEDS FIX'}`);
  });
  
  console.log(`\n📊 AUDIT SUMMARY:`);
  const goodCities = results.filter(r => r.meetsStandards).length;
  console.log(`Cities Meeting Standards: ${goodCities}/${TOP_CITIES.length}`);
  console.log(`Cities Needing Fixes: ${problematicCities.length}`);
  console.log(`Reality vs Summary: ${goodCities === TOP_CITIES.length ? 'MATCHES' : 'DISCONNECT'}`);
  
  if (problematicCities.length > 0) {
    console.log(`\n🔧 CITIES NEEDING FIXES:`);
    problematicCities.forEach(city => {
      console.log(`   ${city.city}: ${city.issues.join(', ')}`);
    });
    
    console.log(`\n💡 RECOMMENDED FIXES:`);
    problematicCities.forEach(city => {
      const newBudget = Math.max(city.current.budget, 8);
      const newMidRange = Math.max(city.current.midRange, 20);
      const newLuxury = Math.max(city.current.luxury, 40);
      
      console.log(`   ${city.city}: $${newBudget}/$${newMidRange}/$${newLuxury} (was $${city.current.budget}/$${city.current.midRange}/$${city.current.luxury})`);
    });
  }
  
  return {
    total: TOP_CITIES.length,
    good: goodCities,
    needsFix: problematicCities.length,
    problematicCities
  };
}

// Run the audit
const auditResult = auditTopCities();

if (auditResult.needsFix === 0) {
  console.log(`\n🎉 EXCELLENT! All top cities already have realistic transport costs!`);
  console.log(`Your summary document is accurate for these major destinations.`);
} else {
  console.log(`\n⚠️  REALITY CHECK: ${auditResult.needsFix} cities need fixes before summary is accurate.`);
  console.log(`Let's fix these now to make your success claims 100% true!`);
}

export default auditResult;