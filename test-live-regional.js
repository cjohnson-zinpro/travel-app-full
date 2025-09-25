// Test a few routes to see if regional multipliers are working
console.log('🧪 Testing regional multipliers with live API calls...\n');

const testRoutes = [
  {
    name: 'PHX → Tokyo (Japan)',
    url: 'http://localhost:5000/api/travel/search/progressive?budget=3000&origin=PHX&travelDuration=10&countries=JP&interests=culture',
    expectedRegion: 'Japan',
    expectedMultiplier: '1.15x'
  },
  {
    name: 'LAX → Beijing (China)',
    url: 'http://localhost:5000/api/travel/search/progressive?budget=3000&origin=LAX&travelDuration=10&countries=CN&interests=culture',
    expectedRegion: 'China', 
    expectedMultiplier: '1.10x'
  },
  {
    name: 'JFK → Rome (Europe)',
    url: 'http://localhost:5000/api/travel/search/progressive?budget=3000&origin=JFK&travelDuration=10&countries=IT&interests=culture',
    expectedRegion: 'Europe',
    expectedMultiplier: '0.65x'
  }
];

async function testRegionalMultipliers() {
  for (const test of testRoutes) {
    console.log(`🛫 Testing: ${test.name}`);
    console.log(`   Expected: ${test.expectedRegion} region with ${test.expectedMultiplier} multiplier`);
    
    try {
      const response = await fetch(test.url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const flight = data.results[0];
          console.log(`   ✅ Flight cost: $${flight.flights[0].cost}`);
        } else {
          console.log(`   ⚠️  No results returned`);
        }
      } else {
        console.log(`   ❌ API error: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }
    
    console.log(''); // Add space between tests
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between requests
  }
}

testRegionalMultipliers().then(() => {
  console.log('🏁 Regional multiplier testing complete!');
  console.log('💡 Check server logs to see if "Regional: X.XXx" appears in the multiplier output');
});