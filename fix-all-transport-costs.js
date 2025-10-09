// Simplified Transport Cost Analysis and Update System
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Regional multipliers for transport costs
const REGIONAL_MULTIPLIERS = {
  'switzerland': 2.0,
  'norway': 2.0,
  'iceland': 2.0,
  'uae': 1.8,
  'united-states-major': 1.8,
  'united-states-standard': 1.5,
  'australia': 1.6,
  'united-kingdom': 1.5,
  'japan': 1.5,
  'singapore': 1.4,
  'western-europe': 1.2,
  'canada': 1.3,
  'south-korea': 1.2,
  'new-zealand': 1.4,
  'eastern-europe': 1.0,
  'southern-europe': 1.1,
  'chile': 1.0,
  'latin-america': 0.7,
  'turkey': 0.6,
  'southeast-asia': 0.4,
  'india': 0.3,
  'china': 0.4,
  'africa': 0.5
};

// Base transport costs for perfect scaling
const BASE_TRANSPORT = {
  budget: 8,
  midRange: 16,
  luxury: 40
};

// City to region mapping (abbreviated)
const CITY_REGIONS = {
  'zurich': 'switzerland', 'geneva': 'switzerland',
  'oslo': 'norway', 'reykjavik': 'iceland', 'dubai': 'uae',
  'new-york': 'united-states-major', 'san-francisco': 'united-states-major', 'los-angeles': 'united-states-major',
  'chicago': 'united-states-standard', 'miami': 'united-states-standard', 'atlanta': 'united-states-standard',
  'sydney': 'australia', 'melbourne': 'australia', 'brisbane': 'australia',
  'london': 'united-kingdom', 'manchester': 'united-kingdom', 'dublin': 'united-kingdom',
  'tokyo': 'japan', 'singapore': 'singapore',
  'paris': 'western-europe', 'amsterdam': 'western-europe', 'berlin': 'western-europe',
  'toronto': 'canada', 'vancouver': 'canada', 'montreal': 'canada',
  'seoul': 'south-korea', 'auckland': 'new-zealand',
  'prague': 'eastern-europe', 'budapest': 'eastern-europe',
  'rome': 'southern-europe', 'barcelona': 'southern-europe', 'madrid': 'southern-europe',
  'istanbul': 'turkey',
  'mexico-city': 'latin-america', 'guadalajara': 'latin-america', 'cancun': 'latin-america',
  'buenos-aires': 'latin-america', 'rio-de-janeiro': 'latin-america', 'sao-paulo': 'latin-america',
  'bangkok': 'southeast-asia', 'ho-chi-minh-city': 'southeast-asia', 'kuala-lumpur': 'southeast-asia',
  'delhi': 'india', 'mumbai': 'india',
  'beijing': 'china', 'shanghai': 'china', 'hong-kong': 'china'
};

function calculateTransportCosts(cityKey) {
  const region = CITY_REGIONS[cityKey] || 'western-europe';
  const multiplier = REGIONAL_MULTIPLIERS[region] || 1.0;
  
  return {
    budget: Math.max(3, Math.round(BASE_TRANSPORT.budget * multiplier)),
    midRange: Math.max(6, Math.round(BASE_TRANSPORT.midRange * multiplier)),
    luxury: Math.max(15, Math.round(BASE_TRANSPORT.luxury * multiplier))
  };
}

function analyzeAndUpdateTransport() {
  console.log('🚗 ANALYZING AND UPDATING TRANSPORT COSTS\n');
  
  const claudeDataPath = path.join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
  let content = fs.readFileSync(claudeDataPath, 'utf8');
  
  // Find all breakdown sections with transport costs
  const breakdownPattern = /('([^']+)':[^{]*{[^}]*breakdown:\s*{[^}]*budget:\s*{\s*total:\s*(\d+),\s*meals:\s*\d+,\s*transport:\s*(\d+),\s*activities:\s*\d+,\s*drinks:\s*\d+,\s*incidentals:\s*\d+\s*},\s*midRange:\s*{\s*total:\s*(\d+),\s*meals:\s*\d+,\s*transport:\s*(\d+),\s*activities:\s*\d+,\s*drinks:\s*\d+,\s*incidentals:\s*\d+\s*},\s*luxury:\s*{\s*total:\s*(\d+),\s*meals:\s*\d+,\s*transport:\s*(\d+),\s*activities:\s*\d+,\s*drinks:\s*\d+,\s*incidentals:\s*\d+\s*})/g;
  
  const cities = [];
  let match;
  let updatesApplied = 0;
  
  while ((match = breakdownPattern.exec(content)) !== null) {
    const [fullMatch, , cityName, budgetTotal, budgetTransport, midTotal, midTransport, luxuryTotal, luxuryTransport] = match;
    
    const current = {
      budget: parseInt(budgetTransport),
      midRange: parseInt(midTransport),
      luxury: parseInt(luxuryTransport)
    };
    
    const recommended = calculateTransportCosts(cityName);
    const region = CITY_REGIONS[cityName] || 'western-europe';
    
    // Check if update is needed
    const needsUpdate = (
      Math.abs(current.budget - recommended.budget) > 1 ||
      Math.abs(current.midRange - recommended.midRange) > 2 ||
      Math.abs(current.luxury - recommended.luxury) > 5
    );
    
    cities.push({
      city: cityName,
      region,
      current,
      recommended,
      needsUpdate,
      budgetTotal: parseInt(budgetTotal),
      midTotal: parseInt(midTotal),
      luxuryTotal: parseInt(luxuryTotal)
    });
    
    if (needsUpdate) {
      // Calculate new totals
      const budgetDiff = recommended.budget - current.budget;
      const midDiff = recommended.midRange - current.midRange;
      const luxuryDiff = recommended.luxury - current.luxury;
      
      const newBudgetTotal = parseInt(budgetTotal) + budgetDiff;
      const newMidTotal = parseInt(midTotal) + midDiff;
      const newLuxuryTotal = parseInt(luxuryTotal) + luxuryDiff;
      
      // Update the content
      const updatedBreakdown = fullMatch
        .replace(`transport: ${current.budget}`, `transport: ${recommended.budget}`)
        .replace(`transport: ${current.midRange}`, `transport: ${recommended.midRange}`)
        .replace(`transport: ${current.luxury}`, `transport: ${recommended.luxury}`)
        .replace(`total: ${budgetTotal}`, `total: ${newBudgetTotal}`)
        .replace(`total: ${midTotal}`, `total: ${newMidTotal}`)
        .replace(`total: ${luxuryTotal}`, `total: ${newLuxuryTotal}`);
      
      content = content.replace(fullMatch, updatedBreakdown);
      
      console.log(`✅ Updated ${cityName}:`);
      console.log(`   Transport: $${current.budget}→$${recommended.budget}, $${current.midRange}→$${recommended.midRange}, $${current.luxury}→$${recommended.luxury}`);
      console.log(`   Totals: $${budgetTotal}→$${newBudgetTotal}, $${midTotal}→$${newMidTotal}, $${luxuryTotal}→$${newLuxuryTotal}\n`);
      
      updatesApplied++;
    }
  }
  
  // Write updated content back to file
  fs.writeFileSync(claudeDataPath, content, 'utf8');
  
  console.log(`\n📊 ANALYSIS COMPLETE:`);
  console.log(`  Cities analyzed: ${cities.length}`);
  console.log(`  Cities updated: ${updatesApplied}`);
  console.log(`  Update rate: ${Math.round(updatesApplied / cities.length * 100)}%\n`);
  
  // Show regional breakdown
  const regionCounts = {};
  const updatedCities = cities.filter(c => c.needsUpdate);
  updatedCities.forEach(city => {
    regionCounts[city.region] = (regionCounts[city.region] || 0) + 1;
  });
  
  console.log('🌍 UPDATES BY REGION:');
  Object.entries(regionCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([region, count]) => {
      const multiplier = REGIONAL_MULTIPLIERS[region] || 1.0;
      console.log(`  ${region.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${count} cities (${multiplier}x multiplier)`);
    });
  
  // Show worst cases that were fixed
  console.log('\n🔧 MAJOR FIXES APPLIED:');
  const majorFixes = updatedCities
    .filter(city => city.current.luxury / city.current.budget < 2.5)
    .sort((a, b) => (a.current.luxury / a.current.budget) - (b.current.luxury / b.current.budget))
    .slice(0, 10);
    
  majorFixes.forEach(city => {
    const oldRatio = (city.current.luxury / city.current.budget).toFixed(1);
    const newRatio = (city.recommended.luxury / city.recommended.budget).toFixed(1);
    console.log(`  ${city.city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${oldRatio}x → ${newRatio}x scaling`);
  });
  
  console.log('\n🎯 TRANSPORT COST RECALCULATION COMPLETE!');
}

analyzeAndUpdateTransport();