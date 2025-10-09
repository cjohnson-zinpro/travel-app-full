/**
 * Analyze Claude Daily Costs Database for Complete Data
 * Identifies cities with complete accommodation and transport data
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read and parse the TypeScript file
const claudeCostsPath = join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
const claudeCostsContent = readFileSync(claudeCostsPath, 'utf-8');

// Extract the database object using regex
const databaseMatch = claudeCostsContent.match(/export const CLAUDE_DAILY_COSTS_DATABASE: Record<string, CityDailyCosts> = ({[\s\S]*?});/);
if (!databaseMatch) {
  throw new Error('Could not find CLAUDE_DAILY_COSTS_DATABASE in the file');
}

// Evaluate the database object (we'll replace it manually for safety)
const databaseContent = databaseMatch[1];
const CLAUDE_DAILY_COSTS_DATABASE = eval(`(${databaseContent})`);

function analyzeCompleteData() {
  console.log('🔍 ANALYZING CLAUDE DAILY COSTS DATABASE FOR COMPLETE DATA\n');
  
  const allCities = Object.keys(CLAUDE_DAILY_COSTS_DATABASE);
  const citiesWithAccommodation = [];
  const citiesWithoutAccommodation = [];
  const citiesWithDetailedBreakdown = [];
  const citiesFullyComplete = [];
  
  // Analyze each city
  allCities.forEach(cityKey => {
    const cityData = CLAUDE_DAILY_COSTS_DATABASE[cityKey];
    const hasAccommodation = !!cityData.accommodation;
    const hasDetailedBreakdown = !!cityData.detailedBreakdown;
    
    if (hasAccommodation) {
      citiesWithAccommodation.push(cityKey);
    } else {
      citiesWithoutAccommodation.push(cityKey);
    }
    
    if (hasDetailedBreakdown) {
      citiesWithDetailedBreakdown.push(cityKey);
    }
    
    if (hasAccommodation && cityData.breakdown) {
      citiesFullyComplete.push(cityKey);
    }
  });
  
  // Display comprehensive analysis
  console.log(`📊 DATABASE STATISTICS:`);
  console.log(`Total Cities: ${allCities.length}`);
  console.log(`Cities with Accommodation Data: ${citiesWithAccommodation.length}`);
  console.log(`Cities without Accommodation Data: ${citiesWithoutAccommodation.length}`);
  console.log(`Cities with Detailed Breakdown: ${citiesWithDetailedBreakdown.length}`);
  console.log(`Cities with Complete Data: ${citiesFullyComplete.length}\n`);
  
  // Show cities WITH accommodation data (these are complete)
  console.log(`✅ CITIES WITH COMPLETE DATA (${citiesWithAccommodation.length}):`);
  citiesWithAccommodation.sort().forEach((city, index) => {
    const data = CLAUDE_DAILY_COSTS_DATABASE[city];
    const hasDetailed = !!data.detailedBreakdown;
    console.log(`${(index + 1).toString().padStart(3)}. ${city.padEnd(25)} | Acc: ✓ | Detailed: ${hasDetailed ? '✓' : '✗'} | Transport: $${data.breakdown.budget.transport}/$${data.breakdown.midRange.transport}/$${data.breakdown.luxury.transport}`);
  });
  
  console.log(`\n❌ CITIES MISSING ACCOMMODATION DATA (${citiesWithoutAccommodation.length}):`);
  citiesWithoutAccommodation.sort().forEach((city, index) => {
    const data = CLAUDE_DAILY_COSTS_DATABASE[city];
    const hasDetailed = !!data.detailedBreakdown;
    console.log(`${(index + 1).toString().padStart(3)}. ${city.padEnd(25)} | Acc: ✗ | Detailed: ${hasDetailed ? '✓' : '✗'} | Transport: $${data.breakdown.budget.transport}/$${data.breakdown.midRange.transport}/$${data.breakdown.luxury.transport}`);
  });
  
  // Analyze transport cost patterns for cities with complete data
  console.log(`\n🚗 TRANSPORT COST ANALYSIS FOR COMPLETE CITIES:`);
  const transportAnalysis = citiesWithAccommodation.map(city => {
    const data = CLAUDE_DAILY_COSTS_DATABASE[city];
    const budgetTransport = data.breakdown.budget.transport;
    const midRangeTransport = data.breakdown.midRange.transport;
    const luxuryTransport = data.breakdown.luxury.transport;
    
    // Calculate scaling ratios
    const midToBudgetRatio = (midRangeTransport / budgetTransport).toFixed(1);
    const luxuryToBudgetRatio = (luxuryTransport / budgetTransport).toFixed(1);
    
    return {
      city,
      budget: budgetTransport,
      midRange: midRangeTransport,
      luxury: luxuryTransport,
      midToBudgetRatio: parseFloat(midToBudgetRatio),
      luxuryToBudgetRatio: parseFloat(luxuryToBudgetRatio),
      needsUpdate: budgetTransport < 8 || midRangeTransport < 15 || luxuryTransport < 30 || 
                   luxuryToBudgetRatio < 3.0 || luxuryToBudgetRatio > 8.0
    };
  });
  
  // Sort by those needing updates first
  transportAnalysis.sort((a, b) => {
    if (a.needsUpdate && !b.needsUpdate) return -1;
    if (!a.needsUpdate && b.needsUpdate) return 1;
    return a.city.localeCompare(b.city);
  });
  
  let needsUpdateCount = 0;
  transportAnalysis.forEach((analysis, index) => {
    const status = analysis.needsUpdate ? '🔧' : '✅';
    if (analysis.needsUpdate) needsUpdateCount++;
    
    console.log(`${status} ${(index + 1).toString().padStart(3)}. ${analysis.city.padEnd(25)} | $${analysis.budget.toString().padStart(2)}/$${analysis.midRange.toString().padStart(2)}/$${analysis.luxury.toString().padStart(2)} | Scaling: ${analysis.midToBudgetRatio}x/${analysis.luxuryToBudgetRatio}x`);
  });
  
  console.log(`\n📋 SUMMARY:`);
  console.log(`Complete Cities Ready for Transport Update: ${citiesWithAccommodation.length}`);
  console.log(`Cities Needing Transport Logic Updates: ${needsUpdateCount}`);
  console.log(`Cities with Acceptable Transport Logic: ${citiesWithAccommodation.length - needsUpdateCount}`);
  
  return {
    completeCities: citiesWithAccommodation,
    needsTransportUpdate: transportAnalysis.filter(a => a.needsUpdate).map(a => a.city),
    transportAnalysis
  };
}

// Execute analysis
const result = analyzeCompleteData();
export { result };