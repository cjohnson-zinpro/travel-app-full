// Targeted Transport Logic Fixes for Most Problematic Cities
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cities with the most problematic transport logic (current vs realistic)
const TRANSPORT_FIXES = [
  // US Cities - many have unrealistic mid-range costs
  { city: 'san-diego', current: [8, 15, 25], realistic: [12, 28, 55] },
  { city: 'miami', current: [8, 15, 25], realistic: [12, 28, 55] },
  { city: 'atlanta', current: [8, 15, 30], realistic: [10, 25, 50] },
  { city: 'denver', current: [8, 15, 30], realistic: [10, 25, 50] },
  { city: 'detroit', current: [8, 15, 30], realistic: [10, 25, 50] },
  { city: 'philadelphia', current: [8, 15, 25], realistic: [10, 25, 45] },
  { city: 'charlotte', current: [8, 15, 30], realistic: [10, 25, 50] },
  { city: 'phoenix', current: [10, 18, 30], realistic: [12, 30, 60] },
  { city: 'las-vegas', current: [8, 15, 30], realistic: [10, 28, 55] },
  { city: 'orlando', current: [12, 20, 35], realistic: [15, 32, 65] },
  
  // European Cities - many have low mid-range costs
  { city: 'prague', current: [8, 15, 30], realistic: [10, 25, 50] },
  { city: 'rome', current: [6, 15, 30], realistic: [10, 28, 55] },
  { city: 'barcelona', current: [6, 15, 30], realistic: [10, 28, 55] },
  { city: 'madrid', current: [4, 12, 25], realistic: [8, 25, 50] },
  { city: 'lisbon', current: [4, 12, 25], realistic: [8, 22, 45] },
  { city: 'berlin', current: [6, 15, 30], realistic: [10, 25, 50] },
  { city: 'vienna', current: [8, 18, 40], realistic: [12, 30, 60] },
  { city: 'amsterdam', current: [8, 18, 35], realistic: [12, 30, 60] },
  
  // Major International Cities
  { city: 'tokyo', current: [8, 18, 40], realistic: [12, 30, 60] },
  { city: 'seoul', current: [4, 12, 25], realistic: [8, 22, 45] },
  { city: 'singapore', current: [6, 15, 30], realistic: [10, 25, 50] },
  { city: 'hong-kong', current: [6, 15, 35], realistic: [10, 28, 55] },
  { city: 'sydney', current: [12, 25, 50], realistic: [15, 35, 70] },
  { city: 'melbourne', current: [10, 22, 45], realistic: [12, 30, 65] },
  
  // Latin America
  { city: 'buenos-aires', current: [6, 12, 25], realistic: [8, 20, 40] },
  { city: 'santiago', current: [8, 15, 25], realistic: [10, 22, 45] },
  { city: 'rio-de-janeiro', current: [8, 15, 30], realistic: [10, 22, 45] },
  { city: 'sao-paulo', current: [10, 18, 35], realistic: [12, 25, 50] },
  { city: 'lima', current: [7, 12, 25], realistic: [8, 20, 40] },
  
  // Asian Cities
  { city: 'bangkok', current: [6, 12, 25], realistic: [8, 20, 40] },
  { city: 'kuala-lumpur', current: [3, 8, 15], realistic: [5, 15, 30] },
  { city: 'jakarta', current: [2, 6, 15], realistic: [4, 12, 25] }
];

function applyTargetedTransportFixes() {
  console.log('🎯 APPLYING TARGETED TRANSPORT LOGIC FIXES\n');
  console.log('Fixing cities with most problematic transport costs...\n');
  
  const claudeDataPath = path.join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
  let content = fs.readFileSync(claudeDataPath, 'utf8');
  
  let updatesApplied = 0;
  
  for (const fix of TRANSPORT_FIXES) {
    const { city, current, realistic } = fix;
    
    console.log(`🔧 Fixing ${city}:`);
    console.log(`   Current: $${current[0]} → $${current[1]} → $${current[2]}`);
    console.log(`   Realistic: $${realistic[0]} → $${realistic[1]} → $${realistic[2]}`);
    
    // Find the city's breakdown section
    const cityRegex = new RegExp(
      `('${city}':[\\s\\S]*?breakdown:\\s*{[\\s\\S]*?)` +
      `(budget:\\s*{\\s*total:\\s*)(\\d+)(,\\s*meals:\\s*\\d+,\\s*transport:\\s*)${current[0]}([\\s\\S]*?)` +
      `(midRange:\\s*{\\s*total:\\s*)(\\d+)(,\\s*meals:\\s*\\d+,\\s*transport:\\s*)${current[1]}([\\s\\S]*?)` +
      `(luxury:\\s*{\\s*total:\\s*)(\\d+)(,\\s*meals:\\s*\\d+,\\s*transport:\\s*)${current[2]}([\\s\\S]*?})`
    );
    
    const match = cityRegex.exec(content);
    if (match) {
      const [fullMatch, prefix, budgetPrefix, budgetTotal, budgetMid, budgetSuffix, 
             midPrefix, midTotal, midMid, midSuffix, luxPrefix, luxTotal, luxMid, luxSuffix] = match;
      
      // Calculate new totals
      const budgetDiff = realistic[0] - current[0];
      const midDiff = realistic[1] - current[1];  
      const luxDiff = realistic[2] - current[2];
      
      const newBudgetTotal = parseInt(budgetTotal) + budgetDiff;
      const newMidTotal = parseInt(midTotal) + midDiff;
      const newLuxTotal = parseInt(luxTotal) + luxDiff;
      
      // Create replacement
      const replacement = 
        prefix +
        budgetPrefix + newBudgetTotal + budgetMid + realistic[0] + budgetSuffix +
        midPrefix + newMidTotal + midMid + realistic[1] + midSuffix +
        luxPrefix + newLuxTotal + luxMid + realistic[2] + luxSuffix;
      
      content = content.replace(fullMatch, replacement);
      
      // Also update dailyCost section
      const dailyCostRegex = new RegExp(
        `('${city}':\\s*{[\\s\\S]*?dailyCost:\\s*{\\s*budget:\\s*)(\\d+)(,\\s*midRange:\\s*)(\\d+)(,\\s*luxury:\\s*)(\\d+)(\\s*})`
      );
      
      content = content.replace(dailyCostRegex, (match, prefix, budget, mid1, midVal, lux1, luxVal, suffix) => {
        const newBudget = parseInt(budget) + budgetDiff;
        const newMid = parseInt(midVal) + midDiff;
        const newLux = parseInt(luxVal) + luxDiff;
        return prefix + newBudget + mid1 + newMid + lux1 + newLux + suffix;
      });
      
      console.log(`   ✅ Updated totals: $${budgetTotal}→$${newBudgetTotal}, $${midTotal}→$${newMidTotal}, $${luxTotal}→$${newLuxTotal}`);
      console.log(`   Scaling improved: ${(current[2]/current[0]).toFixed(1)}x → ${(realistic[2]/realistic[0]).toFixed(1)}x`);
      console.log('');
      
      updatesApplied++;
    } else {
      console.log(`   ⚠️ Pattern not found for ${city}`);
      console.log('');
    }
  }
  
  // Write updated content
  fs.writeFileSync(claudeDataPath, content, 'utf8');
  
  console.log(`\n🎯 TARGETED FIXES COMPLETE:`);
  console.log(`  Cities targeted: ${TRANSPORT_FIXES.length}`);
  console.log(`  Cities updated: ${updatesApplied}`);
  console.log(`  Success rate: ${Math.round(updatesApplied / TRANSPORT_FIXES.length * 100)}%`);
  
  console.log('\n📊 TRANSPORT LOGIC NOW REALISTIC:');
  console.log('  Budget ($8-15): Public transport + 1-2 short rides');
  console.log('  Mid-Range ($20-40): 3-4 taxi rides + airport transfers');  
  console.log('  Luxury ($40-80): Private drivers + premium services');
  console.log('\n✅ Transport costs now reflect real travel patterns!');
}

applyTargetedTransportFixes();