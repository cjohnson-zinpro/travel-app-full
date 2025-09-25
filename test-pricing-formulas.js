// Manual test of our Google Flights-calibrated pricing formulas
function calculateBasePricing(distance) {
  let pricePerMile, baseFare;
  
  if (distance < 1500) {
    pricePerMile = 0.20;
    baseFare = 200;
  } else if (distance < 3000) {
    pricePerMile = 0.15;
    baseFare = 250;
  } else if (distance < 6000) {
    pricePerMile = 0.11;
    baseFare = 100;
  } else if (distance < 9000) {
    pricePerMile = 0.10;
    baseFare = 70; // Reduced from 80
  } else {
    pricePerMile = 0.11;
    baseFare = 70; // Increased from 50
  }
  
  return (distance * pricePerMile) + baseFare;
}

function applyMarketFactors(cost, distance) {
  // Apply minimal market competition factors
  let competitionFactor = 1.0;
  
  if (distance > 6000) {
    competitionFactor = 0.98; // Only 2% discount for long-haul
  } else if (distance > 3000) {
    competitionFactor = 0.99; // Only 1% discount for medium-haul
  } else {
    competitionFactor = 1.0; // No discount for shorter routes
  }
  
  return cost * competitionFactor;
}

function applySeasonal(cost, month = 11) { // November
  // November is baseline (1.0) according to SEASONAL_DEMAND
  return cost * 1.0; // No seasonal adjustment for November
}

console.log('🧪 Testing Google Flights-calibrated pricing formulas...\n');

const testRoutes = [
  { 
    name: 'PHX → TPE', 
    distance: 8136, 
    expected: [751, 870],
    description: 'Phoenix to Taipei - Google Flights data'
  },
  { 
    name: 'PHX → HKG', 
    distance: 8240, 
    expected: [800, 950],
    description: 'Phoenix to Hong Kong - similar route'
  },
  { 
    name: 'SEA → LHR', 
    distance: 4780, 
    expected: [519, 687],
    description: 'Seattle to London - Google Flights data'
  },
  { 
    name: 'DEN → GRU', 
    distance: 6296, 
    expected: [673, 910],
    description: 'Denver to São Paulo - Google Flights data'
  },
  { 
    name: 'MIA → NRT', 
    distance: 7757, 
    expected: [905, 1152],
    description: 'Miami to Tokyo - Google Flights data'
  },
  { 
    name: 'PHX → SIN', 
    distance: 9493, 
    expected: [790, 1207],
    description: 'Phoenix to Singapore - Google Flights data'
  }
];

testRoutes.forEach(route => {
  console.log(`\n🛫 ${route.name}`);
  console.log(`📏 Distance: ${route.distance} miles`);
  console.log(`📝 Expected: $${route.expected[0]}-$${route.expected[1]} (${route.description})`);
  
  // Calculate using our new pricing model
  const baseCost = calculateBasePricing(route.distance);
  const withMarketFactors = applyMarketFactors(baseCost, route.distance);
  const finalCost = applySeasonal(withMarketFactors);
  
  console.log(`💰 Base cost: $${Math.round(baseCost)}`);
  console.log(`📊 With market factors: $${Math.round(withMarketFactors)}`);
  console.log(`🌟 Final cost (with seasonal): $${Math.round(finalCost)}`);
  
  // Check accuracy
  const [min, max] = route.expected;
  const midpoint = (min + max) / 2;
  const percentageOff = Math.abs((finalCost - midpoint) / midpoint * 100);
  const withinRange = finalCost >= min && finalCost <= max;
  
  console.log(`📊 Accuracy: ${withinRange ? '✅' : '❌'} (${percentageOff.toFixed(1)}% from midpoint)`);
  
  if (!withinRange) {
    if (finalCost < min) {
      console.log(`⚠️  Too low by $${Math.round(min - finalCost)}`);
    } else {
      console.log(`⚠️  Too high by $${Math.round(finalCost - max)}`);
    }
  }
});

console.log('\n✨ Pricing formula test complete!');