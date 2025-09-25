// Test international flight pricing with Google Flights validation routes
const testRoutes = [
  {
    name: "PHX → TPE (Taiwan)",
    request: {
      budget: 3000,
      origin: 'PHX',
      travelDuration: 10,
      countries: ['TW'],
      interests: ['culture', 'food']
    },
    expectedRange: [751, 870], // Google Flights data
    description: "Phoenix to Taipei - should be ~$847"
  },
  {
    name: "PHX → HKG (Hong Kong)", 
    request: {
      budget: 3500,
      origin: 'PHX',
      travelDuration: 12,
      countries: ['HK'],
      interests: ['culture', 'shopping']
    },
    expectedRange: [800, 950], // Estimated based on similar distance
    description: "Phoenix to Hong Kong - similar to Taipei pricing"
  },
  {
    name: "SEA → LHR (London)",
    request: {
      budget: 2500,
      origin: 'SEA',
      travelDuration: 8,
      countries: ['GB'],
      interests: ['culture', 'history']
    },
    expectedRange: [519, 687], // Google Flights data
    description: "Seattle to London - should be ~$603"
  }
];

async function testRoute(route) {
  console.log(`\n🧪 Testing: ${route.name}`);
  console.log(`📝 Expected: $${route.expectedRange[0]}-$${route.expectedRange[1]} (${route.description})`);
  
  try {
    // Build query string from request parameters
    const params = new URLSearchParams();
    Object.keys(route.request).forEach(key => {
      if (Array.isArray(route.request[key])) {
        params.append(key, route.request[key].join(','));
      } else {
        params.append(key, route.request[key].toString());
      }
    });
    
    const response = await fetch(`http://localhost:5000/api/travel/search/progressive?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract flight cost from response
    if (data && data.flights && data.flights.length > 0) {
      const flightCost = data.flights[0].cost;
      console.log(`💰 Algorithm Result: $${flightCost}`);
      
      const [minExpected, maxExpected] = route.expectedRange;
      const withinRange = flightCost >= minExpected && flightCost <= maxExpected;
      const percentageOff = Math.abs((flightCost - ((minExpected + maxExpected) / 2)) / ((minExpected + maxExpected) / 2) * 100);
      
      console.log(`📊 Accuracy: ${withinRange ? '✅' : '❌'} (${percentageOff.toFixed(1)}% from midpoint)`);
      
      if (!withinRange) {
        if (flightCost < minExpected) {
          console.log(`⚠️  Too low by $${minExpected - flightCost}`);
        } else {
          console.log(`⚠️  Too high by $${flightCost - maxExpected}`);
        }
      }
    } else {
      console.log('❌ No flight data returned');
    }
    
  } catch (error) {
    console.error(`❌ Error testing ${route.name}:`, error.message);
  }
}

async function runTests() {
  console.log('🚀 Testing Google Flights-calibrated pricing model...\n');
  
  for (const route of testRoutes) {
    await testRoute(route);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n✨ Testing complete!');
}

runTests();