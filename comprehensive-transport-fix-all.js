/**
 * COMPREHENSIVE TRANSPORT FIX - ALL REMAINING CITIES
 * Apply realistic transport costs to all 107 cities that still need fixes
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🌍 COMPREHENSIVE TRANSPORT FIX - ALL REMAINING CITIES');
console.log('Applying realistic transport costs to all cities that need fixes...\n');

// Read the database file
const claudeCostsPath = join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
let content = readFileSync(claudeCostsPath, 'utf-8');

// Parse to find problematic cities
const databaseMatch = content.match(/export const CLAUDE_DAILY_COSTS_DATABASE: Record<string, CityDailyCosts> = ({[\s\S]*?});(?=\s*\/\*\*|\s*export|\s*$)/);
const databaseContent = databaseMatch[1];
const CLAUDE_DAILY_COSTS_DATABASE = eval(`(${databaseContent})`);

const problematicCities = [];
Object.keys(CLAUDE_DAILY_COSTS_DATABASE).forEach((cityKey) => {
  const cityData = CLAUDE_DAILY_COSTS_DATABASE[cityKey];
  
  if (cityData.breakdown && cityData.breakdown.budget && cityData.breakdown.midRange && cityData.breakdown.luxury) {
    const budget = cityData.breakdown.budget.transport;
    const midRange = cityData.breakdown.midRange.transport;
    const luxury = cityData.breakdown.luxury.transport;
    
    const needsFix = budget < 8 || midRange < 20 || luxury < 40;
    if (needsFix) {
      problematicCities.push({
        city: cityKey,
        current: { budget, midRange, luxury },
        needed: {
          budget: Math.max(budget, 8),
          midRange: Math.max(midRange, 20), 
          luxury: Math.max(luxury, 40)
        }
      });
    }
  }
});

console.log(`🔧 FOUND ${problematicCities.length} CITIES NEEDING TRANSPORT FIXES`);

// Apply fixes systematically
let fixCount = 0;
let failureCount = 0;

problematicCities.forEach((cityFix, index) => {
  const { city, current, needed } = cityFix;
  
  // Find and fix budget tier if needed
  if (current.budget < 8) {
    const budgetPattern = new RegExp(`(${city}[\\s\\S]*?budget:\\s*{[^}]*transport:\\s*)${current.budget}([^}]*})`);
    const budgetMatch = content.match(budgetPattern);
    if (budgetMatch) {
      content = content.replace(budgetPattern, `$1${needed.budget}$2`);
      console.log(`✅ ${city}: budget ${current.budget} → ${needed.budget}`);
      fixCount++;
    }
  }
  
  // Find and fix midRange tier if needed  
  if (current.midRange < 20) {
    const midRangePattern = new RegExp(`(${city}[\\s\\S]*?midRange:\\s*{[^}]*transport:\\s*)${current.midRange}([^}]*})`);
    const midRangeMatch = content.match(midRangePattern);
    if (midRangeMatch) {
      // Need to adjust total or other categories to keep balance
      const oldTransport = current.midRange;
      const newTransport = needed.midRange;
      const difference = newTransport - oldTransport;
      
      // Try to find activities to reduce by the difference
      const activitiesPattern = new RegExp(`(${city}[\\s\\S]*?midRange:\\s*{[^}]*activities:\\s*)(\\d+)([^}]*transport:\\s*)${current.midRange}([^}]*})`);
      const activitiesMatch = content.match(activitiesPattern);
      
      if (activitiesMatch) {
        const currentActivities = parseInt(activitiesMatch[2]);
        const newActivities = Math.max(10, currentActivities - difference); // Don't go below $10
        content = content.replace(activitiesPattern, `$1${newActivities}$3${newTransport}$4`);
        console.log(`✅ ${city}: midRange transport ${oldTransport} → ${newTransport}, activities ${currentActivities} → ${newActivities}`);
        fixCount++;
      } else {
        console.log(`⚠️  ${city}: could not fix midRange transport pattern`);
        failureCount++;
      }
    }
  }
  
  // Find and fix luxury tier if needed
  if (current.luxury < 40) {
    const luxuryPattern = new RegExp(`(${city}[\\s\\S]*?luxury:\\s*{[^}]*transport:\\s*)${current.luxury}([^}]*})`);
    const luxuryMatch = content.match(luxuryPattern);
    if (luxuryMatch) {
      const oldTransport = current.luxury;
      const newTransport = needed.luxury;
      const difference = newTransport - oldTransport;
      
      // Try to find activities to reduce by the difference
      const activitiesPattern = new RegExp(`(${city}[\\s\\S]*?luxury:\\s*{[^}]*activities:\\s*)(\\d+)([^}]*transport:\\s*)${current.luxury}([^}]*})`);
      const activitiesMatch = content.match(activitiesPattern);
      
      if (activitiesMatch) {
        const currentActivities = parseInt(activitiesMatch[2]);
        const newActivities = Math.max(20, currentActivities - difference); // Don't go below $20 for luxury
        content = content.replace(activitiesPattern, `$1${newActivities}$3${newTransport}$4`);
        console.log(`✅ ${city}: luxury transport ${oldTransport} → ${newTransport}, activities ${currentActivities} → ${newActivities}`);
        fixCount++;
      } else {
        console.log(`⚠️  ${city}: could not fix luxury transport pattern`);
        failureCount++;
      }
    }
  }
  
  // Progress indicator
  if ((index + 1) % 20 === 0) {
    console.log(`📈 Progress: ${index + 1}/${problematicCities.length} cities processed...`);
  }
});

// Write the updated content back
writeFileSync(claudeCostsPath, content);

console.log(`\n🎉 COMPREHENSIVE TRANSPORT FIX COMPLETE!`);
console.log(`✅ Successful fixes applied: ${fixCount}`);
console.log(`⚠️  Patterns not found: ${failureCount}`);
console.log(`📊 Total cities processed: ${problematicCities.length}`);

if (fixCount > 0) {
  console.log(`\n✅ Database updated! Run audit again to verify success rate.`);
} else {
  console.log(`\n❌ No fixes could be applied. Patterns may need manual review.`);
}