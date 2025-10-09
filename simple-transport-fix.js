// Simple Transport Cost Update Script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Transport updates with proper scaling: Budget → Mid-Range (2x) → Luxury (4-5x)
const UPDATES = [
  // High-cost regions
  { city: 'zurich', current: [18, 35, 60], new: [18, 35, 60] }, // Already good
  { city: 'oslo', current: [15, 30, 50], new: [15, 30, 50] }, // Already good
  { city: 'reykjavik', current: [12, 20, 35], new: [12, 20, 35] }, // Already good
  { city: 'dubai', current: [12, 23, 40], new: [12, 23, 40] }, // Already good
  
  // Fix US cities with poor luxury scaling
  { city: 'new-york', current: [12, 20, 35], new: [12, 25, 50] },
  { city: 'atlanta', current: [8, 12, 20], new: [8, 15, 30] },
  { city: 'denver', current: [8, 12, 20], new: [8, 15, 30] },
  { city: 'detroit', current: [8, 12, 20], new: [8, 15, 30] },
  { city: 'dallas', current: [8, 12, 18], new: [8, 15, 30] },
  { city: 'houston', current: [8, 12, 18], new: [8, 15, 30] },
  { city: 'cleveland', current: [8, 12, 18], new: [8, 15, 25] },
  { city: 'philadelphia', current: [8, 12, 18], new: [8, 15, 25] },
  { city: 'kansas-city', current: [8, 12, 18], new: [8, 15, 25] },
  { city: 'charlotte', current: [8, 12, 20], new: [8, 15, 30] },
  { city: 'nashville', current: [8, 12, 20], new: [8, 15, 30] },
  { city: 'salt-lake-city', current: [8, 12, 20], new: [8, 15, 30] },
  { city: 'las-vegas', current: [8, 12, 20], new: [8, 15, 30] },
  
  // Fix problematic cities with flat luxury scaling
  { city: 'budapest', current: [6, 10, 10], new: [6, 12, 25] },
  { city: 'buenos-aires', current: [6, 10, 10], new: [6, 12, 25] },
  { city: 'prague', current: [8, 12, 12], new: [8, 15, 30] },
  { city: 'santiago', current: [8, 12, 12], new: [8, 15, 25] },
  { city: 'sao-paulo', current: [10, 15, 15], new: [10, 18, 35] },
  { city: 'mumbai', current: [6, 10, 8], new: [6, 12, 20] },
  
  // Improve other cities with poor luxury scaling
  { city: 'lima', current: [7, 10, 12], new: [7, 12, 25] },
  { city: 'rio-de-janeiro', current: [8, 12, 15], new: [8, 15, 30] },
  { city: 'chiang-mai', current: [5, 8, 10], new: [5, 10, 20] },
  { city: 'bangkok', current: [6, 8, 12], new: [6, 12, 25] },
  { city: 'guadalajara', current: [5, 12, 30], new: [5, 12, 30] }, // Already fixed
  { city: 'mexico-city', current: [8, 15, 35], new: [8, 15, 35] }, // Already fixed
  { city: 'cancun', current: [6, 10, 20], new: [6, 12, 30] },
  { city: 'puerto-vallarta', current: [3, 5, 12], new: [3, 8, 20] },
  { city: 'acapulco', current: [3, 5, 10], new: [3, 8, 18] },
  
  // Fix major European cities
  { city: 'berlin', current: [6, 12, 20], new: [6, 15, 30] },
  { city: 'rome', current: [6, 12, 20], new: [6, 15, 30] },
  { city: 'barcelona', current: [6, 12, 20], new: [6, 15, 30] },
  { city: 'madrid', current: [4, 8, 15], new: [4, 12, 25] },
  { city: 'lisbon', current: [4, 8, 15], new: [4, 12, 25] },
  { city: 'amsterdam', current: [8, 15, 25], new: [8, 18, 35] },
  { city: 'vienna', current: [8, 15, 30], new: [8, 18, 40] },
  
  // Fix Asia-Pacific
  { city: 'tokyo', current: [8, 15, 30], new: [8, 18, 40] },
  { city: 'seoul', current: [4, 8, 15], new: [4, 12, 25] },
  { city: 'singapore', current: [6, 10, 20], new: [6, 15, 30] },
  { city: 'hong-kong', current: [6, 12, 20], new: [6, 15, 35] },
  { city: 'beijing', current: [4, 8, 15], new: [4, 10, 25] },
  { city: 'shanghai', current: [4, 8, 15], new: [4, 10, 25] },
  
  // Fix Australia
  { city: 'sydney', current: [12, 22, 40], new: [12, 25, 50] },
  { city: 'melbourne', current: [10, 18, 35], new: [10, 22, 45] },
  { city: 'brisbane', current: [10, 20, 35], new: [10, 22, 40] }
];

function updateTransportCosts() {
  console.log('🚗 UPDATING TRANSPORT COSTS WITH PROPER LUXURY SCALING\n');
  
  const claudeDataPath = path.join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
  let content = fs.readFileSync(claudeDataPath, 'utf8');
  
  let updatesApplied = 0;
  
  for (const update of UPDATES) {
    const { city, current, new: newCosts } = update;
    
    // Skip if no change needed
    if (current[0] === newCosts[0] && current[1] === newCosts[1] && current[2] === newCosts[2]) {
      continue;
    }
    
    // Find and replace transport costs for this city
    const citySection = content.match(new RegExp(`'${city}':[\\s\\S]*?breakdown:[\\s\\S]*?luxury:[\\s\\S]*?}`));
    
    if (citySection) {
      const oldSection = citySection[0];
      
      // Replace transport costs in breakdown
      let newSection = oldSection
        .replace(
          new RegExp(`(budget:\\s*{\\s*total:\\s*)(\\d+)(,\\s*meals:\\s*\\d+,\\s*transport:\\s*)${current[0]}`),
          (match, p1, total, p3) => {
            const newTotal = parseInt(total) + (newCosts[0] - current[0]);
            return `${p1}${newTotal}${p3}${newCosts[0]}`;
          }
        )
        .replace(
          new RegExp(`(midRange:\\s*{\\s*total:\\s*)(\\d+)(,\\s*meals:\\s*\\d+,\\s*transport:\\s*)${current[1]}`),
          (match, p1, total, p3) => {
            const newTotal = parseInt(total) + (newCosts[1] - current[1]);
            return `${p1}${newTotal}${p3}${newCosts[1]}`;
          }
        )
        .replace(
          new RegExp(`(luxury:\\s*{\\s*total:\\s*)(\\d+)(,\\s*meals:\\s*\\d+,\\s*transport:\\s*)${current[2]}`),
          (match, p1, total, p3) => {
            const newTotal = parseInt(total) + (newCosts[2] - current[2]);
            return `${p1}${newTotal}${p3}${newCosts[2]}`;
          }
        );
      
      // Update daily cost totals in the main section
      newSection = newSection
        .replace(
          /dailyCost:\s*{\s*budget:\s*(\d+),\s*midRange:\s*(\d+),\s*luxury:\s*(\d+)\s*}/,
          (match, budget, mid, luxury) => {
            const newBudget = parseInt(budget) + (newCosts[0] - current[0]);
            const newMid = parseInt(mid) + (newCosts[1] - current[1]);
            const newLuxury = parseInt(luxury) + (newCosts[2] - current[2]);
            return `dailyCost: { budget: ${newBudget}, midRange: ${newMid}, luxury: ${newLuxury} }`;
          }
        );
      
      // Apply the update
      content = content.replace(oldSection, newSection);
      
      console.log(`✅ Updated ${city}:`);
      console.log(`   Transport: $${current[0]}→$${newCosts[0]}, $${current[1]}→$${newCosts[1]}, $${current[2]}→$${newCosts[2]}`);
      console.log(`   Luxury scaling: ${(current[2]/current[0]).toFixed(1)}x → ${(newCosts[2]/newCosts[0]).toFixed(1)}x`);
      
      updatesApplied++;
    } else {
      console.log(`⚠️  Could not find ${city} in database`);
    }
  }
  
  // Write updated content back
  fs.writeFileSync(claudeDataPath, content, 'utf8');
  
  console.log(`\n🎯 UPDATE COMPLETE:`);
  console.log(`  Cities processed: ${UPDATES.length}`);
  console.log(`  Cities updated: ${updatesApplied}`);
  console.log(`  Success rate: ${Math.round(updatesApplied / UPDATES.length * 100)}%`);
  
  console.log('\n📊 NEW TRANSPORT SCALING:');
  console.log('  Budget: $3-18/day (public transport, walking)');
  console.log('  Mid-range: $8-35/day (taxis, rideshare, tours)');
  console.log('  Luxury: $18-60/day (private drivers, premium services)');
  console.log('  Proper 3-5x scaling from budget to luxury!');
}

updateTransportCosts();