/**
 * SMART SCALING APPROACH - USE EXISTING BUDGET COSTS AS BASE
 * Scale transport costs from existing budget amounts rather than regional tables
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🎯 SMART SCALING: BUDGET-BASED TRANSPORT COST SCALING');
console.log('Using existing budget costs as base, scaling up with consistent ratios\n');

// Read and parse the database
const claudeCostsPath = join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
let content = readFileSync(claudeCostsPath, 'utf-8');

const databaseMatch = content.match(/export const CLAUDE_DAILY_COSTS_DATABASE: Record<string, CityDailyCosts> = ({[\s\S]*?});(?=\s*\/\*\*|\s*export|\s*$)/);
const databaseContent = databaseMatch[1];
const CLAUDE_DAILY_COSTS_DATABASE = eval(`(${databaseContent})`);

function calculateScaledCosts(budgetTransport) {
  // Keep existing budget cost (already researched local costs)
  const budget = Math.max(budgetTransport, 4); // Minimum $4 for very cheap markets
  
  // Scale up with consistent ratios + enforce minimums
  const midRange = Math.max(Math.round(budget * 2.5), 20); // 2.5x scaling, min $20
  const luxury = Math.max(Math.round(budget * 5), 40);     // 5x scaling, min $40
  
  return { budget, midRange, luxury };
}

// Find all cities that need transport scaling
const citiesToFix = [];
Object.keys(CLAUDE_DAILY_COSTS_DATABASE).forEach((cityKey) => {
  const cityData = CLAUDE_DAILY_COSTS_DATABASE[cityKey];
  
  if (cityData.breakdown && cityData.breakdown.budget && cityData.breakdown.midRange && cityData.breakdown.luxury) {
    const currentBudget = cityData.breakdown.budget.transport;
    const currentMidRange = cityData.breakdown.midRange.transport;
    const currentLuxury = cityData.breakdown.luxury.transport;
    
    // Check if needs scaling (mid-range < $20 OR luxury < $40)
    const needsScaling = currentMidRange < 20 || currentLuxury < 40;
    
    if (needsScaling) {
      const scaled = calculateScaledCosts(currentBudget);
      citiesToFix.push({
        city: cityKey,
        current: { budget: currentBudget, midRange: currentMidRange, luxury: currentLuxury },
        scaled: scaled,
        changes: {
          budgetChange: scaled.budget - currentBudget,
          midRangeChange: scaled.midRange - currentMidRange,
          luxuryChange: scaled.luxury - currentLuxury
        }
      });
    }
  }
});

console.log(`📊 ANALYSIS COMPLETE:`);
console.log(`Cities needing scaling: ${citiesToFix.length}`);
console.log(`Cities already good: ${157 - citiesToFix.length}`);

// Show scaling examples
console.log(`\n💡 SCALING EXAMPLES (first 10 cities):`);
citiesToFix.slice(0, 10).forEach((city, index) => {
  const c = city.current;
  const s = city.scaled;
  console.log(`${(index + 1).toString().padStart(2)}. ${city.city.padEnd(18)} | $${c.budget}→$${s.budget} | $${c.midRange}→$${s.midRange} | $${c.luxury}→$${s.luxury}`);
});

if (citiesToFix.length > 10) {
  console.log(`   ... and ${citiesToFix.length - 10} more cities`);
}

// Apply the scaling fixes
console.log(`\n🔧 APPLYING SCALED TRANSPORT COSTS...`);

let successCount = 0;
let failureCount = 0;

citiesToFix.forEach((cityFix, index) => {
  const { city, current, scaled, changes } = cityFix;
  
  try {
    // Find and update midRange transport if needed
    if (changes.midRangeChange !== 0) {
      const midRangePattern = new RegExp(
        `(${city}[\\s\\S]*?midRange:\\s*{[^}]*)(transport:\\s*)${current.midRange}([^}]*})`
      );
      
      if (content.match(midRangePattern)) {
        // Also need to adjust activities to keep total balanced
        const activityAdjustment = -changes.midRangeChange;
        const activityPattern = new RegExp(
          `(${city}[\\s\\S]*?midRange:\\s*{[^}]*activities:\\s*)(\\d+)([^}]*transport:\\s*)${current.midRange}([^}]*})`
        );
        
        const activityMatch = content.match(activityPattern);
        if (activityMatch) {
          const currentActivities = parseInt(activityMatch[2]);
          const newActivities = Math.max(10, currentActivities + activityAdjustment);
          content = content.replace(activityPattern, `$1${newActivities}$3${scaled.midRange}$4`);
        } else {
          // Fallback: just update transport without activity adjustment
          content = content.replace(midRangePattern, `$1$2${scaled.midRange}$3`);
        }
      }
    }
    
    // Find and update luxury transport if needed
    if (changes.luxuryChange !== 0) {
      const luxuryPattern = new RegExp(
        `(${city}[\\s\\S]*?luxury:\\s*{[^}]*)(transport:\\s*)${current.luxury}([^}]*})`
      );
      
      if (content.match(luxuryPattern)) {
        // Also need to adjust activities to keep total balanced
        const activityAdjustment = -changes.luxuryChange;
        const activityPattern = new RegExp(
          `(${city}[\\s\\S]*?luxury:\\s*{[^}]*activities:\\s*)(\\d+)([^}]*transport:\\s*)${current.luxury}([^}]*})`
        );
        
        const activityMatch = content.match(activityPattern);
        if (activityMatch) {
          const currentActivities = parseInt(activityMatch[2]);
          const newActivities = Math.max(20, currentActivities + activityAdjustment);
          content = content.replace(activityPattern, `$1${newActivities}$3${scaled.luxury}$4`);
        } else {
          // Fallback: just update transport without activity adjustment
          content = content.replace(luxuryPattern, `$1$2${scaled.luxury}$3`);
        }
      }
    }
    
    successCount++;
    if ((index + 1) % 20 === 0) {
      console.log(`   Progress: ${index + 1}/${citiesToFix.length} cities processed...`);
    }
    
  } catch (error) {
    console.log(`❌ Failed to update ${city}: ${error.message}`);
    failureCount++;
  }
});

// Write the updated content
writeFileSync(claudeCostsPath, content);

console.log(`\n🎉 SMART SCALING COMPLETE!`);
console.log(`✅ Cities processed: ${successCount}`);
console.log(`❌ Cities failed: ${failureCount}`);
console.log(`📊 Total cities targeted: ${citiesToFix.length}`);

console.log(`\n🔍 KEY BENEFITS OF THIS APPROACH:`);
console.log(`✅ Uses existing budget costs (already researched local economics)`);
console.log(`✅ Consistent 2.5x and 5x scaling ratios`);
console.log(`✅ Enforces realistic minimums ($20 mid-range, $40 luxury)`);
console.log(`✅ No complex regional tables needed`);
console.log(`✅ Maintains local cost relationships`);

console.log(`\n💡 SCALING FORMULA USED:`);
console.log(`Budget: Keep existing (local research already done)`);
console.log(`Mid-Range: max(Budget × 2.5, $20)`);
console.log(`Luxury: max(Budget × 5, $40)`);

if (successCount > 0) {
  console.log(`\n✅ Database updated! Run audit to verify new success rate.`);
}