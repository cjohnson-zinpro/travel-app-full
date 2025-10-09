/**
 * COMPREHENSIVE AUDIT - ALL CITIES TRANSPORT REALITY CHECK
 * Check all cities in database for realistic transport costs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

function auditAllCities() {
  console.log('🌍 COMPREHENSIVE TRANSPORT AUDIT - ALL CITIES\n');
  
  const allCities = Object.keys(CLAUDE_DAILY_COSTS_DATABASE);
  console.log(`📊 TOTAL CITIES IN DATABASE: ${allCities.length}`);
  
  const results = [];
  const problematicCities = [];
  const citiesWithCompleteData = [];
  
  allCities.forEach((cityKey) => {
    const cityData = CLAUDE_DAILY_COSTS_DATABASE[cityKey];
    
    // Check if city has complete breakdown data
    if (!cityData.breakdown || 
        !cityData.breakdown.budget || 
        !cityData.breakdown.midRange || 
        !cityData.breakdown.luxury ||
        typeof cityData.breakdown.budget.transport !== 'number' ||
        typeof cityData.breakdown.midRange.transport !== 'number' ||
        typeof cityData.breakdown.luxury.transport !== 'number') {
      return; // Skip cities without complete data
    }
    
    citiesWithCompleteData.push(cityKey);
    
    const budget = cityData.breakdown.budget.transport;
    const midRange = cityData.breakdown.midRange.transport;
    const luxury = cityData.breakdown.luxury.transport;
    
    // Check if meets our realistic standards
    const meetsStandards = budget >= 8 && midRange >= 20 && luxury >= 40;
    
    if (!meetsStandards) {
      const issues = [];
      if (budget < 8) issues.push('budget < $8');
      if (midRange < 20) issues.push('mid-range < $20');
      if (luxury < 40) issues.push('luxury < $40');
      
      problematicCities.push({
        city: cityKey,
        current: { budget, midRange, luxury },
        issues
      });
    }
    
    results.push({
      city: cityKey,
      budget,
      midRange,
      luxury,
      meetsStandards
    });
  });
  
  console.log(`📋 CITIES WITH COMPLETE DATA: ${citiesWithCompleteData.length}`);
  console.log(`📋 CITIES WITHOUT COMPLETE DATA: ${allCities.length - citiesWithCompleteData.length}`);
  
  const goodCities = results.filter(r => r.meetsStandards).length;
  
  console.log(`\n📊 TRANSPORT COST AUDIT RESULTS:`);
  console.log(`✅ Cities Meeting Standards: ${goodCities}/${citiesWithCompleteData.length}`);
  console.log(`🔧 Cities Needing Fixes: ${problematicCities.length}`);
  console.log(`📈 SUCCESS RATE: ${Math.round((goodCities / citiesWithCompleteData.length) * 100)}%`);
  
  if (problematicCities.length > 0) {
    console.log(`\n🔧 CITIES STILL NEEDING FIXES (showing first 20):`);
    problematicCities.slice(0, 20).forEach((city, index) => {
      console.log(`   ${(index + 1).toString().padStart(2)}. ${city.city.padEnd(15)} | $${city.current.budget}/$${city.current.midRange}/$${city.current.luxury} | ${city.issues.join(', ')}`);
    });
    
    if (problematicCities.length > 20) {
      console.log(`   ... and ${problematicCities.length - 20} more cities needing fixes`);
    }
  } else {
    console.log(`\n🎉 ALL CITIES WITH COMPLETE DATA HAVE REALISTIC TRANSPORT COSTS!`);
  }
  
  return {
    totalCities: allCities.length,
    completeDataCities: citiesWithCompleteData.length,
    good: goodCities,
    needsFix: problematicCities.length,
    successRate: Math.round((goodCities / citiesWithCompleteData.length) * 100),
    problematicCities
  };
}

// Run the comprehensive audit
const auditResult = auditAllCities();

if (auditResult.needsFix === 0) {
  console.log(`\n🎉 TRANSPORT LOGIC SUCCESSFULLY APPLIED TO ALL CITIES!`);
  console.log(`✅ 100% of cities with complete data have realistic transport costs`);
} else {
  console.log(`\n⚠️  WORK REMAINING: ${auditResult.needsFix} cities still need transport fixes`);
  console.log(`📋 Current success rate: ${auditResult.successRate}%`);
}

export default auditResult;