// Realistic Transport Cost Re-Application Script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// REALISTIC transport ranges based on actual travel patterns
const REALISTIC_TRANSPORT_RANGES = {
  budget: { min: 8, max: 15 },     // Public transport + 1-2 short rides
  midRange: { min: 20, max: 40 },  // 3-4 taxi/Uber rides, airport transfers
  luxury: { min: 40, max: 80 }     // Private drivers, premium services
};

// Regional multipliers for transport costs
const REGIONAL_MULTIPLIERS = {
  // Premium markets (1.8-2.2x)
  'switzerland': 2.2,
  'norway': 2.0,
  'iceland': 1.8,
  'monaco': 2.2,
  
  // Very expensive (1.5-1.8x)
  'us-major': 1.8,     // NYC, SF, LA, Boston, DC
  'us-standard': 1.5,  // Other US cities
  'australia': 1.6,
  'uk': 1.5,
  'japan': 1.5,
  'singapore': 1.4,
  'uae': 1.6,
  
  // Standard expensive (1.2-1.4x)
  'western-europe': 1.3,
  'canada': 1.4,
  'south-korea': 1.2,
  'new-zealand': 1.4,
  'israel': 1.3,
  
  // Moderate (1.0-1.2x)
  'eastern-europe': 1.1,
  'southern-europe': 1.2,
  'chile': 1.0,
  'uruguay': 1.0,
  
  // Affordable (0.7-1.0x)
  'latin-america': 0.8,
  'turkey': 0.7,
  'eastern-europe-budget': 0.9,
  'south-africa': 0.8,
  
  // Budget (0.4-0.7x)
  'southeast-asia': 0.5,
  'south-asia': 0.4,
  'china': 0.5,
  'africa-budget': 0.4,
  'central-america': 0.6
};

// City to region mapping (comprehensive)
const CITY_REGIONS = {
  // Switzerland
  'zurich': 'switzerland', 'geneva': 'switzerland',
  
  // Norway
  'oslo': 'norway',
  
  // Iceland
  'reykjavik': 'iceland',
  
  // UAE
  'dubai': 'uae',
  
  // US Major Cities (highest transport costs)
  'new-york': 'us-major',
  'san-francisco': 'us-major',
  'los-angeles': 'us-major',
  'boston': 'us-major',
  'washington-d-c': 'us-major',
  'seattle': 'us-major',
  
  // US Standard Cities
  'chicago': 'us-standard', 'miami': 'us-standard', 'atlanta': 'us-standard',
  'denver': 'us-standard', 'portland': 'us-standard', 'philadelphia': 'us-standard',
  'phoenix': 'us-standard', 'san-diego': 'us-standard', 'dallas': 'us-standard',
  'houston': 'us-standard', 'minneapolis': 'us-standard', 'detroit': 'us-standard',
  'cleveland': 'us-standard', 'pittsburgh': 'us-standard', 'kansas-city': 'us-standard',
  'charlotte': 'us-standard', 'nashville': 'us-standard', 'salt-lake-city': 'us-standard',
  'las-vegas': 'us-standard', 'orlando': 'us-standard',
  
  // Australia
  'sydney': 'australia', 'melbourne': 'australia', 'brisbane': 'australia',
  'perth': 'australia', 'adelaide': 'australia', 'gold-coast': 'australia',
  
  // UK
  'london': 'uk', 'manchester': 'uk', 'dublin': 'uk',
  
  // Japan
  'tokyo': 'japan',
  
  // Singapore
  'singapore': 'singapore',
  
  // Western Europe
  'paris': 'western-europe', 'amsterdam': 'western-europe', 'brussels': 'western-europe',
  'frankfurt': 'western-europe', 'hamburg': 'western-europe', 'berlin': 'western-europe',
  'vienna': 'western-europe', 'copenhagen': 'western-europe', 'stockholm': 'western-europe',
  'helsinki': 'western-europe', 'lyon': 'western-europe',
  
  // Southern Europe
  'rome': 'southern-europe', 'barcelona': 'southern-europe', 'madrid': 'southern-europe',
  'seville': 'southern-europe', 'lisbon': 'southern-europe', 'porto': 'southern-europe',
  'nice': 'southern-europe', 'antalya': 'southern-europe',
  
  // Canada
  'toronto': 'canada', 'vancouver': 'canada', 'montreal': 'canada',
  'calgary': 'canada', 'ottawa': 'canada', 'quebec-city': 'canada',
  
  // South Korea
  'seoul': 'south-korea',
  
  // New Zealand
  'auckland': 'new-zealand', 'wellington': 'new-zealand', 'christchurch': 'new-zealand',
  
  // Eastern Europe
  'prague': 'eastern-europe', 'vienna': 'eastern-europe', 'dubrovnik': 'eastern-europe',
  'budapest': 'eastern-europe-budget', 'zagreb': 'eastern-europe-budget',
  
  // Turkey
  'istanbul': 'turkey',
  
  // Latin America
  'mexico-city': 'latin-america', 'guadalajara': 'latin-america', 'cancun': 'latin-america',
  'puerto-vallarta': 'latin-america', 'acapulco': 'latin-america', 'buenos-aires': 'latin-america',
  'santiago': 'latin-america', 'rio-de-janeiro': 'latin-america', 'sao-paulo': 'latin-america',
  'lima': 'latin-america',
  
  // Southeast Asia
  'bangkok': 'southeast-asia', 'ho-chi-minh-city': 'southeast-asia', 'phuket': 'southeast-asia',
  'chiang-mai': 'southeast-asia', 'kuala-lumpur': 'southeast-asia', 'jakarta': 'southeast-asia',
  'manila': 'southeast-asia',
  
  // South Asia
  'delhi': 'south-asia', 'mumbai': 'south-asia',
  
  // China
  'beijing': 'china', 'shanghai': 'china', 'guangzhou': 'china', 'hong-kong': 'china'
};

function calculateRealisticTransportCosts(cityKey) {
  const region = CITY_REGIONS[cityKey] || 'western-europe';
  const multiplier = REGIONAL_MULTIPLIERS[region] || 1.3;
  
  // Base costs using realistic ranges
  const baseBudget = 12;   // Middle of 8-15 range
  const baseMid = 30;      // Middle of 20-40 range  
  const baseLuxury = 60;   // Middle of 40-80 range
  
  const budget = Math.max(8, Math.min(15, Math.round(baseBudget * multiplier)));
  const midRange = Math.max(20, Math.min(40, Math.round(baseMid * multiplier)));
  const luxury = Math.max(40, Math.min(80, Math.round(baseLuxury * multiplier)));
  
  return { budget, midRange, luxury };
}

function applyRealisticTransportLogic() {
  console.log('🚗 APPLYING REALISTIC TRANSPORT LOGIC ACROSS ALL CITIES\n');
  console.log('Target Ranges:');
  console.log('  Budget: $8-15/day (public transport + 1-2 short rides)');
  console.log('  Mid-Range: $20-40/day (3-4 taxi rides + airport transfers)');
  console.log('  Luxury: $40-80/day (private drivers + premium services)\n');
  
  const claudeDataPath = path.join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
  let content = fs.readFileSync(claudeDataPath, 'utf8');
  
  // Find all city breakdowns
  const cityPattern = /'([^']+)':\s*{[^}]*breakdown:\s*{[^}]*budget:\s*{\s*total:\s*(\d+),\s*meals:\s*\d+,\s*transport:\s*(\d+),[^}]*},\s*midRange:\s*{\s*total:\s*(\d+),\s*meals:\s*\d+,\s*transport:\s*(\d+),[^}]*},\s*luxury:\s*{\s*total:\s*(\d+),\s*meals:\s*\d+,\s*transport:\s*(\d+),[^}]*}/g;
  
  let updatesApplied = 0;
  let citiesProcessed = 0;
  let match;
  
  while ((match = cityPattern.exec(content)) !== null) {
    const [fullMatch, cityName, budgetTotal, currentBudgetTransport, midTotal, currentMidTransport, luxuryTotal, currentLuxuryTransport] = match;
    
    citiesProcessed++;
    const recommended = calculateRealisticTransportCosts(cityName);
    const current = {
      budget: parseInt(currentBudgetTransport),
      midRange: parseInt(currentMidTransport),
      luxury: parseInt(currentLuxuryTransport)
    };
    
    // Check if update is needed (more aggressive threshold for realism)
    const needsUpdate = (
      Math.abs(current.budget - recommended.budget) > 1 ||
      Math.abs(current.midRange - recommended.midRange) > 3 ||
      Math.abs(current.luxury - recommended.luxury) > 5 ||
      current.midRange < 20 || // Force mid-range minimum
      current.luxury < 35      // Force luxury minimum
    );
    
    if (needsUpdate) {
      // Calculate total adjustments
      const budgetDiff = recommended.budget - current.budget;
      const midDiff = recommended.midRange - current.midRange;
      const luxuryDiff = recommended.luxury - current.luxury;
      
      const newBudgetTotal = parseInt(budgetTotal) + budgetDiff;
      const newMidTotal = parseInt(midTotal) + midDiff;
      const newLuxuryTotal = parseInt(luxuryTotal) + luxuryDiff;
      
      // Create replacement string
      const newBreakdown = fullMatch
        .replace(`total: ${budgetTotal}`, `total: ${newBudgetTotal}`)
        .replace(`total: ${midTotal}`, `total: ${newMidTotal}`)
        .replace(`total: ${luxuryTotal}`, `total: ${newLuxuryTotal}`)
        .replace(`transport: ${current.budget}`, `transport: ${recommended.budget}`)
        .replace(`transport: ${current.midRange}`, `transport: ${recommended.midRange}`)
        .replace(`transport: ${current.luxury}`, `transport: ${recommended.luxury}`);
      
      // Apply the update
      content = content.replace(fullMatch, newBreakdown);
      
      const region = CITY_REGIONS[cityName] || 'western-europe';
      console.log(`✅ Updated ${cityName} (${region}):`);
      console.log(`   Transport: $${current.budget}→$${recommended.budget}, $${current.midRange}→$${recommended.midRange}, $${current.luxury}→$${recommended.luxury}`);
      console.log(`   Totals: $${budgetTotal}→$${newBudgetTotal}, $${midTotal}→$${newMidTotal}, $${luxuryTotal}→$${newLuxuryTotal}`);
      console.log(`   Scaling: ${(current.luxury/current.budget).toFixed(1)}x → ${(recommended.luxury/recommended.budget).toFixed(1)}x\n`);
      
      updatesApplied++;
    }
  }
  
  // Also update dailyCost totals to match
  const dailyCostPattern = /'([^']+)':\s*{\s*dailyCost:\s*{\s*budget:\s*(\d+),\s*midRange:\s*(\d+),\s*luxury:\s*(\d+)\s*}/g;
  
  while ((match = dailyCostPattern.exec(content)) !== null) {
    const [fullMatch, cityName, budgetDaily, midDaily, luxuryDaily] = match;
    const recommended = calculateRealisticTransportCosts(cityName);
    
    // Find corresponding breakdown to calculate differences
    const breakdownMatch = content.match(new RegExp(`'${cityName}':[^}]*breakdown:[^}]*budget:[^}]*total:\\s*(\\d+)[^}]*transport:\\s*(\\d+)[^}]*midRange:[^}]*total:\\s*(\\d+)[^}]*transport:\\s*(\\d+)[^}]*luxury:[^}]*total:\\s*(\\d+)[^}]*transport:\\s*(\\d+)`));
    
    if (breakdownMatch) {
      const [, , currentBudgetTransport, , currentMidTransport, , currentLuxuryTransport] = breakdownMatch;
      
      const budgetDiff = recommended.budget - parseInt(currentBudgetTransport);
      const midDiff = recommended.midRange - parseInt(currentMidTransport);
      const luxuryDiff = recommended.luxury - parseInt(currentLuxuryTransport);
      
      if (Math.abs(budgetDiff) > 1 || Math.abs(midDiff) > 3 || Math.abs(luxuryDiff) > 5) {
        const newBudgetDaily = parseInt(budgetDaily) + budgetDiff;
        const newMidDaily = parseInt(midDaily) + midDiff;
        const newLuxuryDaily = parseInt(luxuryDaily) + luxuryDiff;
        
        const newDailyCost = `'${cityName}': {\\n    dailyCost: { budget: ${newBudgetDaily}, midRange: ${newMidDaily}, luxury: ${newLuxuryDaily} }`;
        content = content.replace(fullMatch, newDailyCost);
      }
    }
  }
  
  // Write updated content
  fs.writeFileSync(claudeDataPath, content, 'utf8');
  
  console.log(`\n🎯 REALISTIC TRANSPORT LOGIC APPLIED:`);
  console.log(`  Cities processed: ${citiesProcessed}`);
  console.log(`  Cities updated: ${updatesApplied}`);
  console.log(`  Success rate: ${Math.round(updatesApplied / citiesProcessed * 100)}%`);
  
  console.log('\n📊 NEW TRANSPORT REALITY:');
  console.log('  Budget travelers: Can take 1-2 short rides + public transport');
  console.log('  Mid-range travelers: Can take 3-4 taxi rides + airport transfers');
  console.log('  Luxury travelers: Can afford private drivers + premium services');
  console.log('\n✅ Transport costs now match real-world travel patterns!');
}

applyRealisticTransportLogic();