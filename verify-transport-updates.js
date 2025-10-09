/**
 * Verify Comprehensive Transport Updates
 * Confirms all transport cost updates were applied correctly
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read and parse the TypeScript file
const claudeCostsPath = join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
const claudeCostsContent = readFileSync(claudeCostsPath, 'utf-8');

// Extract the database object
const databaseMatch = claudeCostsContent.match(/export const CLAUDE_DAILY_COSTS_DATABASE: Record<string, CityDailyCosts> = ({[\s\S]*?});(?=\s*\/\*\*|\s*export|\s*$)/);
if (!databaseMatch) {
  console.error('Could not find CLAUDE_DAILY_COSTS_DATABASE');
  process.exit(1);
}
const databaseContent = databaseMatch[1];
const CLAUDE_DAILY_COSTS_DATABASE = eval(`(${databaseContent})`);

function verifyTransportUpdates() {
  console.log('🔍 VERIFYING TRANSPORT COST UPDATES\n');
  
  const allCities = Object.keys(CLAUDE_DAILY_COSTS_DATABASE);
  const citiesWithAccommodation = allCities.filter(city => !!CLAUDE_DAILY_COSTS_DATABASE[city].accommodation);
  
  console.log(`📊 VERIFICATION STATISTICS:`);
  console.log(`Total Cities in Database: ${allCities.length}`);
  console.log(`Cities with Complete Data: ${citiesWithAccommodation.length}\n`);
  
  // Analyze transport cost patterns
  const transportAnalysis = citiesWithAccommodation.map(city => {
    const data = CLAUDE_DAILY_COSTS_DATABASE[city];
    const budgetTransport = data.breakdown.budget.transport;
    const midRangeTransport = data.breakdown.midRange.transport;
    const luxuryTransport = data.breakdown.luxury.transport;
    
    // Calculate scaling ratios
    const midToBudgetRatio = (midRangeTransport / budgetTransport);
    const luxuryToBudgetRatio = (luxuryTransport / budgetTransport);
    
    // Check if costs meet our new standards
    const meetsStandards = 
      budgetTransport >= 4 &&      // Minimum budget transport
      midRangeTransport >= 10 &&   // Minimum mid-range transport
      luxuryTransport >= 25 &&     // Minimum luxury transport
      luxuryToBudgetRatio >= 2.5 && luxuryToBudgetRatio <= 8.0; // Reasonable scaling
    
    return {
      city,
      budget: budgetTransport,
      midRange: midRangeTransport,
      luxury: luxuryTransport,
      midToBudgetRatio: midToBudgetRatio,
      luxuryToBudgetRatio: luxuryToBudgetRatio,
      meetsStandards: meetsStandards
    };
  });
  
  // Sort by standards compliance
  transportAnalysis.sort((a, b) => {
    if (a.meetsStandards && !b.meetsStandards) return 1;
    if (!a.meetsStandards && b.meetsStandards) return -1;
    return a.city.localeCompare(b.city);
  });
  
  console.log(`🚗 TRANSPORT COST VERIFICATION RESULTS:\n`);
  
  let standardsMetCount = 0;
  let needsAttentionCount = 0;
  
  transportAnalysis.forEach((analysis, index) => {
    const status = analysis.meetsStandards ? '✅' : '⚠️ ';
    if (analysis.meetsStandards) {
      standardsMetCount++;
    } else {
      needsAttentionCount++;
    }
    
    console.log(`${status} ${(index + 1).toString().padStart(3)}. ${analysis.city.padEnd(25)} | $${analysis.budget.toString().padStart(2)}/$${analysis.midRange.toString().padStart(2)}/$${analysis.luxury.toString().padStart(2)} | Scaling: ${analysis.midToBudgetRatio.toFixed(1)}x/${analysis.luxuryToBudgetRatio.toFixed(1)}x`);
  });
  
  console.log(`\n📋 VERIFICATION SUMMARY:`);
  console.log(`Cities Meeting New Standards: ${standardsMetCount}/${citiesWithAccommodation.length} (${(standardsMetCount / citiesWithAccommodation.length * 100).toFixed(1)}%)`);
  console.log(`Cities Needing Attention: ${needsAttentionCount}`);
  
  // Analyze by cost ranges
  const costRanges = {
    budget: { veryLow: 0, low: 0, adequate: 0, good: 0, high: 0 },
    midRange: { veryLow: 0, low: 0, adequate: 0, good: 0, high: 0 },
    luxury: { veryLow: 0, low: 0, adequate: 0, good: 0, high: 0 }
  };
  
  transportAnalysis.forEach(analysis => {
    // Budget categorization
    if (analysis.budget < 4) costRanges.budget.veryLow++;
    else if (analysis.budget < 8) costRanges.budget.low++;
    else if (analysis.budget < 12) costRanges.budget.adequate++;
    else if (analysis.budget < 16) costRanges.budget.good++;
    else costRanges.budget.high++;
    
    // Mid-range categorization
    if (analysis.midRange < 10) costRanges.midRange.veryLow++;
    else if (analysis.midRange < 15) costRanges.midRange.low++;
    else if (analysis.midRange < 25) costRanges.midRange.adequate++;
    else if (analysis.midRange < 35) costRanges.midRange.good++;
    else costRanges.midRange.high++;
    
    // Luxury categorization
    if (analysis.luxury < 20) costRanges.luxury.veryLow++;
    else if (analysis.luxury < 30) costRanges.luxury.low++;
    else if (analysis.luxury < 50) costRanges.luxury.adequate++;
    else if (analysis.luxury < 70) costRanges.luxury.good++;
    else costRanges.luxury.high++;
  });
  
  console.log(`\n💰 COST DISTRIBUTION ANALYSIS:`);
  console.log(`Budget Transport:`);
  console.log(`  Very Low (<$4):  ${costRanges.budget.veryLow} cities`);
  console.log(`  Low ($4-7):      ${costRanges.budget.low} cities`);
  console.log(`  Adequate ($8-11): ${costRanges.budget.adequate} cities`);
  console.log(`  Good ($12-15):   ${costRanges.budget.good} cities`);
  console.log(`  High ($16+):     ${costRanges.budget.high} cities`);
  
  console.log(`\nMid-Range Transport:`);
  console.log(`  Very Low (<$10):  ${costRanges.midRange.veryLow} cities`);
  console.log(`  Low ($10-14):     ${costRanges.midRange.low} cities`);
  console.log(`  Adequate ($15-24): ${costRanges.midRange.adequate} cities`);
  console.log(`  Good ($25-34):    ${costRanges.midRange.good} cities`);
  console.log(`  High ($35+):      ${costRanges.midRange.high} cities`);
  
  console.log(`\nLuxury Transport:`);
  console.log(`  Very Low (<$20):  ${costRanges.luxury.veryLow} cities`);
  console.log(`  Low ($20-29):     ${costRanges.luxury.low} cities`);
  console.log(`  Adequate ($30-49): ${costRanges.luxury.adequate} cities`);
  console.log(`  Good ($50-69):    ${costRanges.luxury.good} cities`);
  console.log(`  High ($70+):      ${costRanges.luxury.high} cities`);
  
  // Check for cities with accommodation data but still missing
  const citiesStillNeedingWork = transportAnalysis.filter(a => !a.meetsStandards);
  
  if (citiesStillNeedingWork.length > 0) {
    console.log(`\n⚠️  CITIES STILL NEEDING ATTENTION (${citiesStillNeedingWork.length}):`);
    citiesStillNeedingWork.forEach(city => {
      const issues = [];
      if (city.budget < 4) issues.push('budget too low');
      if (city.midRange < 10) issues.push('mid-range too low');
      if (city.luxury < 25) issues.push('luxury too low');
      if (city.luxuryToBudgetRatio < 2.5) issues.push('scaling too low');
      if (city.luxuryToBudgetRatio > 8.0) issues.push('scaling too high');
      
      console.log(`   ${city.city}: ${issues.join(', ')}`);
    });
  }
  
  console.log(`\n✨ TRANSPORT UPDATE VERIFICATION COMPLETE!`);
  console.log(`Success Rate: ${(standardsMetCount / citiesWithAccommodation.length * 100).toFixed(1)}%`);
  
  if (standardsMetCount === citiesWithAccommodation.length) {
    console.log(`🎉 ALL CITIES NOW HAVE REALISTIC TRANSPORT COSTS!`);
  } else {
    console.log(`📝 ${needsAttentionCount} cities may need manual review for edge cases.`);
  }
  
  return {
    totalCities: citiesWithAccommodation.length,
    standardsMetCount,
    needsAttentionCount,
    successRate: (standardsMetCount / citiesWithAccommodation.length * 100).toFixed(1)
  };
}

// Execute verification
const result = verifyTransportUpdates();
export default result;