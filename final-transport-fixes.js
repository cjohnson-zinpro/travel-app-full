/**
 * Final Transport Logic Fix
 * Manual fixes for the remaining cities that need transport cost updates
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cities that still need fixing based on verification
const FINAL_FIXES = {
  'acapulco': { budget: 8, midRange: 15, luxury: 30 },
  'adelaide': { budget: 10, midRange: 20, luxury: 40 },
  'antalya': { budget: 8, midRange: 15, luxury: 30 },
  'calgary': { budget: 10, midRange: 20, luxury: 40 },
  'chiang-mai': { budget: 8, midRange: 15, luxury: 30 },
  'christchurch': { budget: 10, midRange: 20, luxury: 40 },
  'delhi': { budget: 8, midRange: 15, luxury: 30 },
  'dubrovnik': { budget: 8, midRange: 15, luxury: 30 },
  'guangzhou': { budget: 8, midRange: 15, luxury: 30 },
  'ho-chi-minh-city': { budget: 8, midRange: 15, luxury: 30 },
  'istanbul': { budget: 8, midRange: 15, luxury: 30 },
  'jakarta': { budget: 8, midRange: 15, luxury: 30 },
  'kuala-lumpur': { budget: 8, midRange: 15, luxury: 30 },
  'lyon': { budget: 8, midRange: 15, luxury: 30 },
  'manchester': { budget: 8, midRange: 15, luxury: 30 },
  'manila': { budget: 8, midRange: 15, luxury: 30 },
  'montreal': { budget: 8, midRange: 15, luxury: 30 },
  'mumbai': { budget: 8, midRange: 15, luxury: 30 },
  'nice': { budget: 8, midRange: 15, luxury: 30 },
  'ottawa': { budget: 8, midRange: 15, luxury: 30 },
  'phuket': { budget: 8, midRange: 15, luxury: 30 },
  'pittsburgh': { budget: 8, midRange: 15, luxury: 30 },
  'porto': { budget: 8, midRange: 15, luxury: 30 },
  'puerto-vallarta': { budget: 8, midRange: 15, luxury: 30 },
  'quebec-city': { budget: 8, midRange: 15, luxury: 30 },
  'seville': { budget: 8, midRange: 15, luxury: 30 },
  'zagreb': { budget: 8, midRange: 15, luxury: 30 }
};

function applyFinalTransportFixes() {
  console.log('🔧 APPLYING FINAL TRANSPORT LOGIC FIXES\n');
  
  // Read the current file
  const filePath = join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
  let content = readFileSync(filePath, 'utf-8');
  
  let successCount = 0;
  const fixes = Object.entries(FINAL_FIXES);
  
  fixes.forEach(([cityKey, costs]) => {
    console.log(`Fixing ${cityKey}...`);
    
    // Find the city section more precisely
    const cityPattern = new RegExp(
      `'${cityKey}':\\s*{([\\s\\S]*?)(?=},?\\s*\\n\\s*(?:'[a-z-]+':)|},?\\s*\\n\\s*};)`,
      'g'
    );
    
    let cityMatch;
    while ((cityMatch = cityPattern.exec(content)) !== null) {
      const citySection = cityMatch[1];
      
      // Update breakdown section within this city
      const breakdownPattern = /breakdown:\s*{([\\s\\S]*?)(?=}[,\\s]*(?:detailedBreakdown|confidence))/;
      const breakdownMatch = citySection.match(breakdownPattern);
      
      if (breakdownMatch) {
        let breakdownContent = breakdownMatch[1];
        
        // Replace budget transport
        breakdownContent = breakdownContent.replace(
          /(budget:\s*{[^}]*transport:\s*)\d+/,
          `$1${costs.budget}`
        );
        
        // Replace midRange transport  
        breakdownContent = breakdownContent.replace(
          /(midRange:\s*{[^}]*transport:\s*)\d+/,
          `$1${costs.midRange}`
        );
        
        // Replace luxury transport
        breakdownContent = breakdownContent.replace(
          /(luxury:\s*{[^}]*transport:\s*)\d+/,
          `$1${costs.luxury}`
        );
        
        // Replace the entire breakdown section
        const newBreakdownSection = breakdownMatch[0].replace(breakdownMatch[1], breakdownContent);
        const newCitySection = citySection.replace(breakdownMatch[0], newBreakdownSection);
        content = content.replace(cityMatch[1], newCitySection);
        
        successCount++;
        console.log(`✅ ${cityKey}: Updated to $${costs.budget}/$${costs.midRange}/$${costs.luxury}`);
      } else {
        console.log(`❌ ${cityKey}: Could not find breakdown section`);
      }
    }
  });
  
  // Write the updated content back
  writeFileSync(filePath, content, 'utf-8');
  
  console.log(`\\n📋 FINAL FIXES SUMMARY:`);
  console.log(`Cities Fixed: ${successCount}/${fixes.length}`);
  console.log(`Success Rate: ${(successCount / fixes.length * 100).toFixed(1)}%`);
  
  return {
    fixedCount: successCount,
    totalFixes: fixes.length
  };
}

// Execute final fixes
const result = applyFinalTransportFixes();

console.log(`\\n✨ FINAL TRANSPORT FIXES COMPLETE!`);
console.log(`All cities should now have realistic transport costs with:`);
console.log(`• Budget: $8+ per day minimum`);
console.log(`• Mid-Range: $15+ per day minimum`); 
console.log(`• Luxury: $30+ per day minimum`);
console.log(`• Proper scaling ratios between tiers`);

export default result;