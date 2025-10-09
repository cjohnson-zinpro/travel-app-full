/**
 * DEBUG DETAILED BREAKDOWN DATA ACCESS
 * Check if the frontend can properly access detailedBreakdown data
 */

import fs from 'fs';

console.log('🔍 DEBUGGING DETAILED BREAKDOWN DATA ACCESS\n');

// Simulate how the frontend accesses the data
function testDataAccess() {
  // Read the database file to check structure
  const claudeFile = fs.readFileSync('shared/data/claude-daily-costs.ts', 'utf8');
  
  // Extract the database object (simulating what frontend does)
  const databaseMatch = claudeFile.match(/export const CLAUDE_DAILY_COSTS_DATABASE: Record<string, CityDailyCosts> = ({[\s\S]*?});(?=\s*\/\*\*|\s*export|\s*$)/);
  
  if (!databaseMatch) {
    console.log('❌ Database pattern not found');
    return;
  }
  
  const databaseContent = databaseMatch[1];
  const CLAUDE_DAILY_COSTS_DATABASE = eval(`(${databaseContent})`);
  
  // Test New York specifically (what user was looking at)
  const newYorkData = CLAUDE_DAILY_COSTS_DATABASE['new-york'];
  
  console.log('🏙️ NEW YORK DATA ACCESS TEST:');
  console.log('─'.repeat(50));
  
  console.log('✓ Basic data exists:', !!newYorkData);
  console.log('✓ Breakdown exists:', !!newYorkData?.breakdown);
  console.log('✓ DetailedBreakdown exists:', !!newYorkData?.detailedBreakdown);
  
  if (newYorkData?.detailedBreakdown) {
    console.log('✓ Budget tier exists:', !!newYorkData.detailedBreakdown.budget);
    console.log('✓ MidRange tier exists:', !!newYorkData.detailedBreakdown.midRange);
    console.log('✓ Luxury tier exists:', !!newYorkData.detailedBreakdown.luxury);
    
    // Test budget tier data
    const budgetData = newYorkData.detailedBreakdown.budget;
    if (budgetData) {
      console.log('\n📊 BUDGET TIER DETAILED DATA:');
      console.log('✓ Meals data:', !!budgetData.meals);
      console.log('✓ Transport data:', !!budgetData.transport);
      console.log('✓ Activities data:', !!budgetData.activities);
      console.log('✓ Drinks data:', !!budgetData.drinks);
      
      if (budgetData.meals) {
        console.log('\n🍽️ MEALS BREAKDOWN:');
        console.log('  Amount:', budgetData.meals.amount);
        console.log('  Examples exist:', !!budgetData.meals.examples);
        console.log('  Tips exist:', !!budgetData.meals.tips);
        
        if (budgetData.meals.examples) {
          console.log('  First example:', budgetData.meals.examples[0]);
        }
      }
      
      if (budgetData.transport) {
        console.log('\n🚇 TRANSPORT BREAKDOWN:');
        console.log('  Amount:', budgetData.transport.amount);
        console.log('  Examples exist:', !!budgetData.transport.examples);
        console.log('  Tips exist:', !!budgetData.transport.tips);
        
        if (budgetData.transport.examples) {
          console.log('  First example:', budgetData.transport.examples[0]);
        }
      }
    }
  }
  
  // Test the frontend access pattern
  console.log('\n🔧 FRONTEND ACCESS PATTERN TEST:');
  console.log('─'.repeat(50));
  
  // Simulate how ResponsiveBreakdownDisplay accesses data
  const styleMapping = {
    budget: 'budget',
    mid: 'midRange',
    luxury: 'luxury'
  };
  
  const travelStyle = 'budget';
  const category = 'meals';
  
  console.log('Travel style:', travelStyle);
  console.log('Mapped to:', styleMapping[travelStyle]);
  
  const detailedBreakdown = newYorkData?.detailedBreakdown?.[styleMapping[travelStyle]];
  console.log('DetailedBreakdown for budget:', !!detailedBreakdown);
  
  const categoryData = detailedBreakdown?.[category];
  console.log('Category data for meals:', !!categoryData);
  
  if (categoryData) {
    console.log('Has examples:', !!categoryData.examples);
    console.log('Has tips:', !!categoryData.tips);
    console.log('Has amount:', !!categoryData.amount);
    
    // This is the exact condition from the frontend component
    const shouldShowDetailed = categoryData && categoryData.examples;
    console.log('\n🎯 FRONTEND CONDITION RESULT:');
    console.log('!categoryData || !categoryData.examples =', !categoryData || !categoryData.examples);
    console.log('Should show detailed breakdown:', shouldShowDetailed);
    
    if (shouldShowDetailed) {
      console.log('\n✅ DETAILED BREAKDOWN SHOULD DISPLAY:');
      console.log('Examples count:', categoryData.examples.length);
      console.log('First example:', categoryData.examples[0]);
      console.log('Tips count:', categoryData.tips.length);
      console.log('First tip:', categoryData.tips[0]);
    }
  }
  
  // Test all 17 cities with detailedBreakdown
  console.log('\n🌍 ALL CITIES WITH DETAILED BREAKDOWN:');
  console.log('─'.repeat(50));
  
  const citiesWithDetails = [];
  Object.keys(CLAUDE_DAILY_COSTS_DATABASE).forEach(cityKey => {
    const cityData = CLAUDE_DAILY_COSTS_DATABASE[cityKey];
    if (cityData.detailedBreakdown) {
      citiesWithDetails.push(cityKey);
    }
  });
  
  console.log('Cities with detailedBreakdown:', citiesWithDetails.length);
  citiesWithDetails.forEach((city, index) => {
    const cityData = CLAUDE_DAILY_COSTS_DATABASE[city];
    const hasValidMeals = cityData.detailedBreakdown?.budget?.meals?.examples?.length > 0;
    console.log(`${(index + 1).toString().padStart(2)}. ${city.padEnd(20)} | Valid meals data: ${hasValidMeals ? '✅' : '❌'}`);
  });
}

testDataAccess();