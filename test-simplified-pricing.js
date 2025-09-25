// Test the simplified pricing algorithm
console.log('🚀 SIMPLIFIED FLIGHT PRICING ALGORITHM');
console.log('=====================================\n');

// Test cases based on your feedback
const testRoutes = [
  // China - slightly too low (now 1.15x instead of 1.10x)
  { name: 'PHX → Beijing', distance: 6500, region: 'China', multiplier: 1.15 },
  { name: 'PHX → Shanghai', distance: 7300, region: 'China', multiplier: 1.15 },
  
  // Hong Kong - slightly too high (now 0.95x instead of 1.0x)
  { name: 'PHX → Hong Kong', distance: 8200, region: 'Hong Kong', multiplier: 0.95 },
  
  // Southeast Asia - way too high (now 0.45x instead of 0.65x)
  { name: 'PHX → Penang', distance: 9000, region: 'Southeast Asia', multiplier: 0.45 },
  { name: 'LAX → Kuala Lumpur', distance: 9100, region: 'Southeast Asia', multiplier: 0.45 },
  { name: 'PHX → Malé', distance: 9800, region: 'Southeast Asia', multiplier: 0.45 },
  
  // Europe - Rome too high (now 0.55x instead of 0.65x)  
  { name: 'JFK → Rome', distance: 4300, region: 'Europe', multiplier: 0.55 },
  
  // US Domestic - simplified base pricing should help
  { name: 'LAX → JFK', distance: 2500, region: 'default', multiplier: 1.0 }
];

console.log('📊 Simplified Algorithm:');
console.log('   < 3000 miles: $0.12/mile + $150 base');
console.log('   < 6000 miles: $0.08/mile + $200 base'); 
console.log('   > 6000 miles: $0.07/mile + $250 base');
console.log('   + Regional Multiplier + Seasonal Multiplier\n');

testRoutes.forEach(route => {
  // Calculate base cost using simplified algorithm
  let baseCost;
  if (route.distance < 3000) {
    baseCost = (route.distance * 0.12) + 150;
  } else if (route.distance < 6000) {
    baseCost = (route.distance * 0.08) + 200;
  } else {
    baseCost = (route.distance * 0.07) + 250;
  }
  
  // Apply seasonal (November = 1.0)
  const seasonal = 1.0;
  
  // Apply regional multiplier
  const regional = route.multiplier;
  
  // Final cost
  const finalCost = Math.round(baseCost * seasonal * regional);
  
  console.log(`${route.name.padEnd(20)} | ${route.distance}mi | Base: $${Math.round(baseCost)} | ${route.region} (${regional}x) | Final: $${finalCost}`);
});

console.log('\n🎯 Expected Improvements:');
console.log('✅ China routes: 5-10% higher than before');
console.log('✅ Hong Kong: 5% lower than before');  
console.log('✅ Southeast Asia: 30-40% lower than before');
console.log('✅ Europe: More aggressive discounts');
console.log('✅ US Domestic: Simpler, more consistent pricing');
console.log('✅ Overall: Much more manageable system');

console.log('\n🚀 Server restart required to activate simplified model');
console.log('💡 Run: npm run dev');