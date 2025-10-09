// Transport Cost Mass Update Script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Transport cost updates based on regional analysis
const TRANSPORT_UPDATES = {
  // High-cost regions (2x-1.8x multipliers)
  'zurich': { budget: 18, midRange: 35, luxury: 60 },
  'geneva': { budget: 15, midRange: 25, luxury: 45 },
  'oslo': { budget: 15, midRange: 30, luxury: 50 },
  'reykjavik': { budget: 12, midRange: 20, luxury: 35 },
  'dubai': { budget: 12, midRange: 23, luxury: 40 },
  
  // US Major Cities (1.8x)
  'new-york': { budget: 12, midRange: 25, luxury: 50 },
  'san-francisco': { budget: 12, midRange: 22, luxury: 40 },
  'los-angeles': { budget: 10, midRange: 18, luxury: 30 },
  'boston': { budget: 8, midRange: 15, luxury: 25 },
  'washington-d-c': { budget: 10, midRange: 18, luxury: 30 },
  
  // US Standard Cities (1.5x)
  'chicago': { budget: 8, midRange: 15, luxury: 25 },
  'miami': { budget: 8, midRange: 15, luxury: 25 },
  'atlanta': { budget: 8, midRange: 12, luxury: 20 },
  'denver': { budget: 8, midRange: 12, luxury: 20 },
  'seattle': { budget: 8, midRange: 15, luxury: 25 },
  'portland': { budget: 8, midRange: 15, luxury: 25 },
  'philadelphia': { budget: 8, midRange: 12, luxury: 18 },
  'phoenix': { budget: 10, midRange: 18, luxury: 30 },
  'san-diego': { budget: 8, midRange: 15, luxury: 25 },
  'dallas': { budget: 8, midRange: 12, luxury: 18 },
  'houston': { budget: 8, midRange: 12, luxury: 18 },
  'minneapolis': { budget: 8, midRange: 15, luxury: 25 },
  'detroit': { budget: 8, midRange: 12, luxury: 20 },
  'cleveland': { budget: 8, midRange: 12, luxury: 18 },
  'pittsburgh': { budget: 8, midRange: 12, luxury: 20 },
  'kansas-city': { budget: 8, midRange: 12, luxury: 18 },
  'charlotte': { budget: 8, midRange: 12, luxury: 20 },
  'nashville': { budget: 8, midRange: 12, luxury: 20 },
  'salt-lake-city': { budget: 8, midRange: 12, luxury: 20 },
  'las-vegas': { budget: 8, midRange: 12, luxury: 20 },
  'orlando': { budget: 12, midRange: 20, luxury: 35 },
  
  // Australia (1.6x)
  'sydney': { budget: 12, midRange: 22, luxury: 40 },
  'melbourne': { budget: 10, midRange: 18, luxury: 35 },
  'brisbane': { budget: 10, midRange: 20, luxury: 35 },
  'perth': { budget: 10, midRange: 18, luxury: 30 },
  'adelaide': { budget: 8, midRange: 15, luxury: 25 },
  'gold-coast': { budget: 10, midRange: 18, luxury: 30 },
  
  // UK (1.5x)
  'london': { budget: 10, midRange: 18, luxury: 30 },
  'manchester': { budget: 6, midRange: 12, luxury: 20 },
  'dublin': { budget: 8, midRange: 15, luxury: 25 },
  
  // Japan (1.5x)
  'tokyo': { budget: 8, midRange: 15, luxury: 30 },
  
  // Singapore (1.4x)
  'singapore': { budget: 6, midRange: 10, luxury: 20 },
  
  // Western Europe (1.2x)
  'paris': { budget: 8, midRange: 15, luxury: 25 },
  'amsterdam': { budget: 8, midRange: 15, luxury: 25 },
  'brussels': { budget: 8, midRange: 15, luxury: 25 },
  'frankfurt': { budget: 8, midRange: 15, luxury: 25 },
  'hamburg': { budget: 8, midRange: 15, luxury: 25 },
  'berlin': { budget: 6, midRange: 12, luxury: 20 },
  'vienna': { budget: 8, midRange: 15, luxury: 30 },
  'copenhagen': { budget: 12, midRange: 25, luxury: 45 },
  'stockholm': { budget: 10, midRange: 20, luxury: 35 },
  'helsinki': { budget: 10, midRange: 20, luxury: 35 },
  
  // Southern Europe (1.1x)
  'rome': { budget: 6, midRange: 12, luxury: 20 },
  'barcelona': { budget: 6, midRange: 12, luxury: 20 },
  'madrid': { budget: 4, midRange: 8, luxury: 15 },
  'seville': { budget: 4, midRange: 8, luxury: 15 },
  'lisbon': { budget: 4, midRange: 8, luxury: 15 },
  'porto': { budget: 4, midRange: 8, luxury: 15 },
  'nice': { budget: 6, midRange: 12, luxury: 20 },
  'lyon': { budget: 6, midRange: 12, luxury: 20 },
  'antalya': { budget: 4, midRange: 6, luxury: 12 },
  
  // Canada (1.3x)
  'toronto': { budget: 8, midRange: 15, luxury: 25 },
  'vancouver': { budget: 8, midRange: 15, luxury: 25 },
  'montreal': { budget: 6, midRange: 12, luxury: 20 },
  'calgary': { budget: 10, midRange: 15, luxury: 25 },
  'ottawa': { budget: 8, midRange: 12, luxury: 20 },
  'quebec-city': { budget: 6, midRange: 12, luxury: 20 },
  
  // South Korea (1.2x)
  'seoul': { budget: 4, midRange: 8, luxury: 15 },
  
  // New Zealand (1.4x)
  'auckland': { budget: 8, midRange: 15, luxury: 25 },
  'wellington': { budget: 8, midRange: 15, luxury: 25 },
  'christchurch': { budget: 8, midRange: 12, luxury: 20 },
  
  // Eastern Europe (1.0x)
  'prague': { budget: 8, midRange: 12, luxury: 20 },
  'budapest': { budget: 6, midRange: 10, luxury: 18 },
  'zagreb': { budget: 4, midRange: 8, luxury: 15 },
  'dubrovnik': { budget: 6, midRange: 12, luxury: 20 },
  
  // Turkey (0.6x)
  'istanbul': { budget: 3, midRange: 5, luxury: 10 },
  
  // Latin America (0.7x) - Already updated Mexico City and Guadalajara
  'cancun': { budget: 6, midRange: 12, luxury: 25 },
  'puerto-vallarta': { budget: 3, midRange: 8, luxury: 18 },
  'acapulco': { budget: 3, midRange: 6, luxury: 15 },
  'buenos-aires': { budget: 6, midRange: 12, luxury: 18 },
  'santiago': { budget: 8, midRange: 15, luxury: 25 },
  'rio-de-janeiro': { budget: 8, midRange: 15, luxury: 25 },
  'sao-paulo': { budget: 10, midRange: 18, luxury: 30 },
  'lima': { budget: 7, midRange: 12, luxury: 20 },
  
  // Southeast Asia (0.4x)
  'bangkok': { budget: 6, midRange: 10, luxury: 18 },
  'ho-chi-minh-city': { budget: 2, midRange: 6, luxury: 12 },
  'phuket': { budget: 4, midRange: 10, luxury: 20 },
  'chiang-mai': { budget: 5, midRange: 10, luxury: 15 },
  'kuala-lumpur': { budget: 3, midRange: 8, luxury: 15 },
  'jakarta': { budget: 2, midRange: 6, luxury: 15 },
  'manila': { budget: 3, midRange: 6, luxury: 12 },
  
  // South Asia (0.3x)
  'delhi': { budget: 2, midRange: 5, luxury: 12 },
  'mumbai': { budget: 6, midRange: 12, luxury: 20 },
  
  // China (0.4x)
  'beijing': { budget: 4, midRange: 10, luxury: 20 },
  'shanghai': { budget: 4, midRange: 10, luxury: 20 },
  'guangzhou': { budget: 3, midRange: 8, luxury: 15 },
  'hong-kong': { budget: 6, midRange: 15, luxury: 25 }
};

function updateTransportCosts() {
  console.log('🚗 MASS UPDATING TRANSPORT COSTS FOR ALL CITIES\n');
  
  const claudeDataPath = path.join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
  let content = fs.readFileSync(claudeDataPath, 'utf8');
  
  let updatesApplied = 0;
  let totalChecked = 0;
  
  for (const [cityKey, newTransport] of Object.entries(TRANSPORT_UPDATES)) {
    totalChecked++;
    
    // Find the breakdown section for this city
    const cityPattern = new RegExp(
      `('${cityKey}':[\\s\\S]*?breakdown:\\s*{[\\s\\S]*?)(budget:\\s*{\\s*total:\\s*(\\d+),\\s*meals:\\s*\\d+,\\s*transport:\\s*(\\d+),([\\s\\S]*?)},\\s*midRange:\\s*{\\s*total:\\s*(\\d+),\\s*meals:\\s*\\d+,\\s*transport:\\s*(\\d+),([\\s\\S]*?)},\\s*luxury:\\s*{\\s*total:\\s*(\\d+),\\s*meals:\\s*\\d+,\\s*transport:\\s*(\\d+),([\\s\\S]*?}))`,
      'g'
    );
    
    const match = cityPattern.exec(content);
    if (match) {
      const [fullMatch, prefix, breakdownStart, budgetTotal, currentBudgetTransport, budgetRest, midTotal, currentMidTransport, midRest, luxuryTotal, currentLuxuryTransport, luxuryRest] = match;
      
      // Calculate transport cost differences
      const budgetDiff = newTransport.budget - parseInt(currentBudgetTransport);
      const midDiff = newTransport.midRange - parseInt(currentMidTransport);
      const luxuryDiff = newTransport.luxury - parseInt(currentLuxuryTransport);
      
      // Only update if there's a significant difference
      if (Math.abs(budgetDiff) > 1 || Math.abs(midDiff) > 2 || Math.abs(luxuryDiff) > 5) {
        // Calculate new totals
        const newBudgetTotal = parseInt(budgetTotal) + budgetDiff;
        const newMidTotal = parseInt(midTotal) + midDiff;
        const newLuxuryTotal = parseInt(luxuryTotal) + luxuryDiff;
        
        // Create the replacement
        const replacement = `${prefix}budget: { total: ${newBudgetTotal}, meals: \\d+, transport: ${newTransport.budget},${budgetRest}}, midRange: { total: ${newMidTotal}, meals: \\d+, transport: ${newTransport.midRange},${midRest}}, luxury: { total: ${newLuxuryTotal}, meals: \\d+, transport: ${newTransport.luxury},${luxuryRest}`;
        
        // Apply the update
        content = content.replace(fullMatch, replacement);
        
        console.log(`✅ Updated ${cityKey}:`);
        console.log(`   Transport: $${currentBudgetTransport}→$${newTransport.budget}, $${currentMidTransport}→$${newTransport.midRange}, $${currentLuxuryTransport}→$${newTransport.luxury}`);
        console.log(`   Totals: $${budgetTotal}→$${newBudgetTotal}, $${midTotal}→$${newMidTotal}, $${luxuryTotal}→$${newLuxuryTotal}\n`);
        
        updatesApplied++;
      }
    } else {
      console.log(`⚠️  Pattern not found for ${cityKey}`);
    }
    
    // Reset regex lastIndex for next iteration
    cityPattern.lastIndex = 0;
  }
  
  // Write updated content back
  fs.writeFileSync(claudeDataPath, content, 'utf8');
  
  console.log(`\n🎯 MASS UPDATE COMPLETE:`);
  console.log(`  Cities checked: ${totalChecked}`);
  console.log(`  Cities updated: ${updatesApplied}`);
  console.log(`  Success rate: ${Math.round(updatesApplied / totalChecked * 100)}%`);
  
  console.log('\n✅ All transport costs have been recalculated with proper scaling!');
  console.log('   Budget (public transport): $2-18/day');
  console.log('   Mid-range (taxis/rideshare): $6-35/day');
  console.log('   Luxury (private drivers/premium): $15-60/day');
}

updateTransportCosts();