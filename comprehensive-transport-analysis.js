// Comprehensive Transport Cost Recalculation System
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Regional transport cost multipliers based on market conditions
const REGIONAL_MULTIPLIERS = {
  // Expensive Markets (2x base)
  switzerland: 2.0,
  norway: 2.0,
  iceland: 2.0,
  uae: 1.8,
  
  // Very Expensive (1.8x base)
  'united-states-major': 1.8, // NYC, SF, LA
  'united-states-standard': 1.5, // Other US cities
  australia: 1.6,
  'united-kingdom': 1.5,
  japan: 1.5,
  singapore: 1.4,
  
  // Standard Markets (1.2x base)
  'western-europe': 1.2,
  canada: 1.3,
  'south-korea': 1.2,
  'new-zealand': 1.4,
  
  // Moderate Markets (1.0x base)
  'eastern-europe': 1.0,
  'southern-europe': 1.1,
  chile: 1.0,
  
  // Affordable Markets (0.7x base)
  'latin-america': 0.7,
  'eastern-europe-budget': 0.8,
  turkey: 0.6,
  
  // Budget Markets (0.4-0.6x base)
  'southeast-asia': 0.4,
  india: 0.3,
  'south-asia': 0.3,
  china: 0.4,
  'africa': 0.5
};

// Base transport costs for perfect scaling
const BASE_TRANSPORT = {
  budget: 8,    // Public transport, walking, occasional rideshare
  midRange: 16, // Regular taxi usage, airport transfers
  luxury: 40   // Private drivers, luxury services
};

// City to region mapping
const CITY_REGIONS = {
  // Switzerland
  'zurich': 'switzerland',
  'geneva': 'switzerland',
  
  // Norway  
  'oslo': 'norway',
  
  // Iceland
  'reykjavik': 'iceland',
  
  // UAE
  'dubai': 'uae',
  
  // US Major Cities
  'new-york': 'united-states-major',
  'san-francisco': 'united-states-major',
  'los-angeles': 'united-states-major',
  'boston': 'united-states-major',
  'washington-d-c': 'united-states-major',
  
  // US Standard Cities
  'chicago': 'united-states-standard',
  'miami': 'united-states-standard',
  'atlanta': 'united-states-standard',
  'denver': 'united-states-standard',
  'seattle': 'united-states-standard',
  'portland': 'united-states-standard',
  'philadelphia': 'united-states-standard',
  'phoenix': 'united-states-standard',
  'san-diego': 'united-states-standard',
  'dallas': 'united-states-standard',
  'houston': 'united-states-standard',
  'minneapolis': 'united-states-standard',
  'detroit': 'united-states-standard',
  'cleveland': 'united-states-standard',
  'pittsburgh': 'united-states-standard',
  'kansas-city': 'united-states-standard',
  'charlotte': 'united-states-standard',
  'nashville': 'united-states-standard',
  'salt-lake-city': 'united-states-standard',
  'las-vegas': 'united-states-standard',
  'orlando': 'united-states-standard',
  
  // Australia
  'sydney': 'australia',
  'melbourne': 'australia',
  'brisbane': 'australia',
  'perth': 'australia',
  'adelaide': 'australia',
  'gold-coast': 'australia',
  
  // UK
  'london': 'united-kingdom',
  'manchester': 'united-kingdom',
  'dublin': 'united-kingdom',
  
  // Japan
  'tokyo': 'japan',
  
  // Singapore
  'singapore': 'singapore',
  
  // Western Europe
  'paris': 'western-europe',
  'amsterdam': 'western-europe',
  'brussels': 'western-europe',
  'frankfurt': 'western-europe',
  'hamburg': 'western-europe',
  'berlin': 'western-europe',
  'vienna': 'western-europe',
  'copenhagen': 'western-europe',
  'stockholm': 'western-europe',
  'helsinki': 'western-europe',
  
  // Southern Europe
  'rome': 'southern-europe',
  'barcelona': 'southern-europe',
  'madrid': 'southern-europe',
  'seville': 'southern-europe',
  'lisbon': 'southern-europe',
  'porto': 'southern-europe',
  'nice': 'southern-europe',
  'lyon': 'southern-europe',
  'antalya': 'southern-europe',
  
  // Canada
  'toronto': 'canada',
  'vancouver': 'canada',
  'montreal': 'canada',
  'calgary': 'canada',
  'ottawa': 'canada',
  'quebec-city': 'canada',
  
  // South Korea
  'seoul': 'south-korea',
  
  // New Zealand
  'auckland': 'new-zealand',
  'wellington': 'new-zealand',
  'christchurch': 'new-zealand',
  
  // Eastern Europe
  'prague': 'eastern-europe',
  'budapest': 'eastern-europe-budget',
  'zagreb': 'eastern-europe-budget',
  'dubrovnik': 'eastern-europe',
  
  // Turkey
  'istanbul': 'turkey',
  
  // Latin America
  'mexico-city': 'latin-america',
  'guadalajara': 'latin-america',
  'cancun': 'latin-america',
  'puerto-vallarta': 'latin-america',
  'acapulco': 'latin-america',
  'buenos-aires': 'latin-america',
  'santiago': 'latin-america',
  'rio-de-janeiro': 'latin-america',
  'sao-paulo': 'latin-america',
  'lima': 'latin-america',
  
  // Southeast Asia
  'bangkok': 'southeast-asia',
  'ho-chi-minh-city': 'southeast-asia',
  'phuket': 'southeast-asia',
  'chiang-mai': 'southeast-asia',
  'kuala-lumpur': 'southeast-asia',
  'jakarta': 'southeast-asia',
  'manila': 'southeast-asia',
  
  // South Asia
  'delhi': 'india',
  'mumbai': 'india',
  
  // China
  'beijing': 'china',
  'shanghai': 'china',
  'guangzhou': 'china',
  'hong-kong': 'china'
};

function calculateTransportCosts(cityKey) {
  const region = CITY_REGIONS[cityKey] || 'western-europe'; // Default fallback
  const multiplier = REGIONAL_MULTIPLIERS[region] || 1.0;
  
  return {
    budget: Math.round(BASE_TRANSPORT.budget * multiplier),
    midRange: Math.round(BASE_TRANSPORT.midRange * multiplier),
    luxury: Math.round(BASE_TRANSPORT.luxury * multiplier)
  };
}

function analyzeCurrentTransportCosts() {
  console.log('🔍 ANALYZING CURRENT TRANSPORT COSTS ACROSS ALL CITIES\n');
  
  const claudeDataPath = path.join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
  const claudeDataContent = fs.readFileSync(claudeDataPath, 'utf8');
  
  // Extract all cities and their transport costs
  const cityPattern = /'([^']+)':\s*{\s*[^}]*?breakdown:\s*{\s*budget:\s*{\s*total:\s*\d+,\s*meals:\s*\d+,\s*transport:\s*(\d+),[^}]+},\s*midRange:\s*{\s*total:\s*\d+,\s*meals:\s*\d+,\s*transport:\s*(\d+),[^}]+},\s*luxury:\s*{\s*total:\s*\d+,\s*meals:\s*\d+,\s*transport:\s*(\d+),[^}]+}/g;
  
  const cities = [];
  let match;
  
  while ((match = cityPattern.exec(claudeDataContent)) !== null) {
    const [, cityName, budgetTransport, midTransport, luxuryTransport] = match;
    const current = {
      budget: parseInt(budgetTransport),
      midRange: parseInt(midTransport),
      luxury: parseInt(luxuryTransport)
    };
    
    const recommended = calculateTransportCosts(cityName);
    const region = CITY_REGIONS[cityName] || 'western-europe';
    
    cities.push({
      city: cityName,
      region,
      current,
      recommended,
      needsUpdate: (
        Math.abs(current.budget - recommended.budget) > 1 ||
        Math.abs(current.midRange - recommended.midRange) > 2 ||
        Math.abs(current.luxury - recommended.luxury) > 5
      )
    });
  }
  
  console.log(`Found ${cities.length} cities with transport data\n`);
  
  // Summary statistics
  const needsUpdate = cities.filter(c => c.needsUpdate);
  console.log(`${needsUpdate.length} cities need transport cost updates (${Math.round(needsUpdate.length / cities.length * 100)}%)\n`);
  
  // Show worst cases
  console.log('🚨 CITIES WITH WORST TRANSPORT SCALING:\n');
  
  const worstScaling = cities
    .map(city => ({
      ...city,
      luxuryRatio: city.current.luxury / city.current.budget,
      recommendedRatio: city.recommended.luxury / city.recommended.budget
    }))
    .sort((a, b) => a.luxuryRatio - b.luxuryRatio)
    .slice(0, 10);
    
  worstScaling.forEach(city => {
    console.log(`${city.city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:`);
    console.log(`  Current: $${city.current.budget} → $${city.current.midRange} → $${city.current.luxury} (${city.luxuryRatio.toFixed(1)}x ratio)`);
    console.log(`  Should be: $${city.recommended.budget} → $${city.recommended.midRange} → $${city.recommended.luxury} (${city.recommendedRatio.toFixed(1)}x ratio)`);
    console.log('');
  });
  
  return cities;
}

function generateUpdateScript(cities) {
  console.log('\n📝 GENERATING TRANSPORT COST UPDATE SCRIPT\n');
  
  const citiesToUpdate = cities.filter(c => c.needsUpdate);
  
  let updateScript = `// AUTO-GENERATED TRANSPORT COST UPDATES
// This script updates transport costs for ${citiesToUpdate.length} cities with proper scaling

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function updateTransportCosts() {
  const claudeDataPath = path.join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
  let content = fs.readFileSync(claudeDataPath, 'utf8');
  
  console.log('🔄 UPDATING TRANSPORT COSTS FOR ${citiesToUpdate.length} CITIES\\n');
  
  let updatesApplied = 0;
`;

  citiesToUpdate.forEach(city => {
    const currentBreakdown = `budget: { total: \\\\d+, meals: \\\\d+, transport: ${city.current.budget}, activities: \\\\d+, drinks: \\\\d+, incidentals: \\\\d+ },\\\\s*midRange: { total: \\\\d+, meals: \\\\d+, transport: ${city.current.midRange}, activities: \\\\d+, drinks: \\\\d+, incidentals: \\\\d+ },\\\\s*luxury: { total: \\\\d+, meals: \\\\d+, transport: ${city.current.luxury}, activities: \\\\d+, drinks: \\\\d+, incidentals: \\\\d+ }`;
    
    updateScript += `
  // Update ${city.city}
  const ${city.city.replace(/-/g, '_')}_pattern = /'${city.city}':[\\\\s\\\\S]*?breakdown:\\\\s*{\\\\s*(${currentBreakdown})/;
  if (${city.city.replace(/-/g, '_')}_pattern.test(content)) {
    content = content.replace(
      /('${city.city}':[\\\\s\\\\S]*?breakdown:\\\\s*{\\\\s*budget:\\\\s*{\\\\s*total:\\\\s*\\\\d+,\\\\s*meals:\\\\s*\\\\d+,\\\\s*transport:\\\\s*)${city.current.budget}(,\\\\s*activities:[\\\\s\\\\S]*?midRange:\\\\s*{\\\\s*total:\\\\s*\\\\d+,\\\\s*meals:\\\\s*\\\\d+,\\\\s*transport:\\\\s*)${city.current.midRange}(,\\\\s*activities:[\\\\s\\\\S]*?luxury:\\\\s*{\\\\s*total:\\\\s*\\\\d+,\\\\s*meals:\\\\s*\\\\d+,\\\\s*transport:\\\\s*)${city.current.luxury}/,
      '$1${city.recommended.budget}$2${city.recommended.midRange}$3${city.recommended.luxury}'
    );
    console.log('✅ Updated ${city.city}: $${city.current.budget}→$${city.recommended.budget}, $${city.current.midRange}→$${city.recommended.midRange}, $${city.current.luxury}→$${city.recommended.luxury}');
    updatesApplied++;
  }`;
  });

  updateScript += `
  
  fs.writeFileSync(claudeDataPath, content, 'utf8');
  console.log(\`\\n🎯 TRANSPORT COST UPDATE COMPLETE: \${updatesApplied} cities updated\`);
}

updateTransportCosts();
`;

  return updateScript;
}

function main() {
  console.log('🚗 COMPREHENSIVE TRANSPORT COST RECALCULATION SYSTEM\n');
  console.log('=' * 70 + '\n');
  
  // Step 1: Analyze current costs
  const cities = analyzeCurrentTransportCosts();
  
  // Step 2: Generate update script
  const updateScript = generateUpdateScript(cities);
  
  // Step 3: Save update script
  const updateScriptPath = path.join(__dirname, 'update-transport-costs.js');
  fs.writeFileSync(updateScriptPath, updateScript, 'utf8');
  
  console.log(`\n💾 Update script saved to: update-transport-costs.js`);
  console.log(`\n🚀 To apply updates, run: node update-transport-costs.js`);
  
  // Step 4: Show summary
  const needsUpdate = cities.filter(c => c.needsUpdate);
  console.log(`\n📊 SUMMARY:`);
  console.log(`  Total cities analyzed: ${cities.length}`);
  console.log(`  Cities needing updates: ${needsUpdate.length}`);
  console.log(`  Update coverage: ${Math.round(needsUpdate.length / cities.length * 100)}%`);
  
  // Show regional breakdown
  console.log(`\n🌍 REGIONAL BREAKDOWN:`);
  const regionCounts = {};
  needsUpdate.forEach(city => {
    regionCounts[city.region] = (regionCounts[city.region] || 0) + 1;
  });
  
  Object.entries(regionCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([region, count]) => {
      console.log(`  ${region.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${count} cities`);
    });
}

main();