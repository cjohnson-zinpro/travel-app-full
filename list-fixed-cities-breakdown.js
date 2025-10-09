/**
 * LIST FIXED CITIES AND BREAKDOWN RANDOM SAMPLES
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read and parse the database
const claudeCostsPath = join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
const claudeCostsContent = readFileSync(claudeCostsPath, 'utf-8');
const databaseMatch = claudeCostsContent.match(/export const CLAUDE_DAILY_COSTS_DATABASE: Record<string, CityDailyCosts> = ({[\s\S]*?});(?=\s*\/\*\*|\s*export|\s*$)/);

if (!databaseMatch) {
  console.error('❌ Could not find database in file');
  process.exit(1);
}

const databaseContent = databaseMatch[1];
const CLAUDE_DAILY_COSTS_DATABASE = eval(`(${databaseContent})`);

function getFixedCities() {
  console.log('✅ CITIES CURRENTLY MEETING TRANSPORT STANDARDS\n');
  
  const allCities = Object.keys(CLAUDE_DAILY_COSTS_DATABASE);
  const fixedCities = [];
  
  allCities.forEach((cityKey) => {
    const cityData = CLAUDE_DAILY_COSTS_DATABASE[cityKey];
    
    if (cityData.breakdown && cityData.breakdown.budget && cityData.breakdown.midRange && cityData.breakdown.luxury) {
      const budget = cityData.breakdown.budget.transport;
      const midRange = cityData.breakdown.midRange.transport;
      const luxury = cityData.breakdown.luxury.transport;
      
      // Check if meets our realistic standards
      const meetsStandards = budget >= 8 && midRange >= 20 && luxury >= 40;
      
      if (meetsStandards) {
        fixedCities.push({
          city: cityKey,
          budget,
          midRange,
          luxury,
          dailyCost: cityData.dailyCost
        });
      }
    }
  });
  
  console.log(`📊 TOTAL FIXED CITIES: ${fixedCities.length}/157`);
  console.log(`📈 SUCCESS RATE: ${Math.round((fixedCities.length / 157) * 100)}%\n`);
  
  // Show all fixed cities
  console.log('🌍 ALL CITIES WITH REALISTIC TRANSPORT COSTS:');
  fixedCities.forEach((city, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${city.city.padEnd(18)} | $${city.budget.toString().padStart(2)}/$${city.midRange.toString().padStart(2)}/$${city.luxury.toString().padStart(2)} | Daily: $${city.dailyCost.budget}/$${city.dailyCost.midRange}/$${city.dailyCost.luxury}`);
  });
  
  return fixedCities;
}

function getRandomSample(cities, count = 3) {
  const shuffled = [...cities].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function detailedBreakdown(cityKey) {
  const cityData = CLAUDE_DAILY_COSTS_DATABASE[cityKey];
  const breakdown = cityData.breakdown;
  
  console.log(`\n🏙️  ${cityKey.toUpperCase().replace(/-/g, ' ')} - DETAILED BREAKDOWN`);
  console.log('═'.repeat(60));
  
  console.log('\n💰 DAILY COSTS BY TIER:');
  console.log(`Budget:    $${cityData.dailyCost.budget}/day`);
  console.log(`Mid-Range: $${cityData.dailyCost.midRange}/day`);
  console.log(`Luxury:    $${cityData.dailyCost.luxury}/day`);
  
  console.log('\n🚗 TRANSPORT BREAKDOWN:');
  console.log(`Budget:    $${breakdown.budget.transport}/day    (${Math.round((breakdown.budget.transport / breakdown.budget.total) * 100)}% of daily budget)`);
  console.log(`Mid-Range: $${breakdown.midRange.transport}/day   (${Math.round((breakdown.midRange.transport / breakdown.midRange.total) * 100)}% of daily budget)`);
  console.log(`Luxury:    $${breakdown.luxury.transport}/day    (${Math.round((breakdown.luxury.transport / breakdown.luxury.total) * 100)}% of daily budget)`);
  
  console.log('\n📊 COMPLETE DAILY BREAKDOWN:');
  
  // Budget tier
  console.log(`\n💵 BUDGET ($${breakdown.budget.total}/day):`);
  console.log(`   Meals:       $${breakdown.budget.meals.toString().padStart(2)} (${Math.round((breakdown.budget.meals / breakdown.budget.total) * 100)}%)`);
  console.log(`   Transport:   $${breakdown.budget.transport.toString().padStart(2)} (${Math.round((breakdown.budget.transport / breakdown.budget.total) * 100)}%)`);
  console.log(`   Activities:  $${breakdown.budget.activities.toString().padStart(2)} (${Math.round((breakdown.budget.activities / breakdown.budget.total) * 100)}%)`);
  console.log(`   Drinks:      $${breakdown.budget.drinks.toString().padStart(2)} (${Math.round((breakdown.budget.drinks / breakdown.budget.total) * 100)}%)`);
  console.log(`   Incidentals: $${breakdown.budget.incidentals.toString().padStart(2)} (${Math.round((breakdown.budget.incidentals / breakdown.budget.total) * 100)}%)`);
  
  // Mid-range tier
  console.log(`\n💳 MID-RANGE ($${breakdown.midRange.total}/day):`);
  console.log(`   Meals:       $${breakdown.midRange.meals.toString().padStart(2)} (${Math.round((breakdown.midRange.meals / breakdown.midRange.total) * 100)}%)`);
  console.log(`   Transport:   $${breakdown.midRange.transport.toString().padStart(2)} (${Math.round((breakdown.midRange.transport / breakdown.midRange.total) * 100)}%)`);
  console.log(`   Activities:  $${breakdown.midRange.activities.toString().padStart(2)} (${Math.round((breakdown.midRange.activities / breakdown.midRange.total) * 100)}%)`);
  console.log(`   Drinks:      $${breakdown.midRange.drinks.toString().padStart(2)} (${Math.round((breakdown.midRange.drinks / breakdown.midRange.total) * 100)}%)`);
  console.log(`   Incidentals: $${breakdown.midRange.incidentals.toString().padStart(2)} (${Math.round((breakdown.midRange.incidentals / breakdown.midRange.total) * 100)}%)`);
  
  // Luxury tier
  console.log(`\n💎 LUXURY ($${breakdown.luxury.total}/day):`);
  console.log(`   Meals:       $${breakdown.luxury.meals.toString().padStart(3)} (${Math.round((breakdown.luxury.meals / breakdown.luxury.total) * 100)}%)`);
  console.log(`   Transport:   $${breakdown.luxury.transport.toString().padStart(3)} (${Math.round((breakdown.luxury.transport / breakdown.luxury.total) * 100)}%)`);
  console.log(`   Activities:  $${breakdown.luxury.activities.toString().padStart(3)} (${Math.round((breakdown.luxury.activities / breakdown.luxury.total) * 100)}%)`);
  console.log(`   Drinks:      $${breakdown.luxury.drinks.toString().padStart(3)} (${Math.round((breakdown.luxury.drinks / breakdown.luxury.total) * 100)}%)`);
  console.log(`   Incidentals: $${breakdown.luxury.incidentals.toString().padStart(3)} (${Math.round((breakdown.luxury.incidentals / breakdown.luxury.total) * 100)}%)`);
  
  // Transport analysis
  console.log(`\n🚗 TRANSPORT ANALYSIS:`);
  console.log(`✅ Budget $${breakdown.budget.transport}: Covers basic public transport, walking`);
  console.log(`✅ Mid-Range $${breakdown.midRange.transport}: Covers taxis, rideshares, occasional airport transfers`);
  console.log(`✅ Luxury $${breakdown.luxury.transport}: Covers private cars, frequent taxis, premium services`);
  
  if (cityData.accommodation) {
    console.log(`\n🏨 ACCOMMODATION (per night):`);
    console.log(`Budget:    $${cityData.accommodation.budget}`);
    console.log(`Mid-Range: $${cityData.accommodation.midRange}`);
    console.log(`Luxury:    $${cityData.accommodation.luxury}`);
  }
}

// Run the analysis
const fixedCities = getFixedCities();

if (fixedCities.length > 0) {
  console.log('\n🎲 RANDOM SAMPLE BREAKDOWNS:');
  console.log('═'.repeat(60));
  
  const randomSample = getRandomSample(fixedCities, 3);
  randomSample.forEach(city => {
    detailedBreakdown(city.city);
  });
} else {
  console.log('\n❌ No cities currently meet the transport standards.');
}