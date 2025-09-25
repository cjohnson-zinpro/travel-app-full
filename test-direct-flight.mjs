// Direct test of flight service pricing
import { FlightService } from './server/services/flight-service.js';

async function testFlightPricing() {
  console.log('🧪 Testing Google Flights-calibrated flight pricing...\n');
  
  const flightService = new FlightService();
  
  const testRoutes = [
    { origin: 'PHX', destination: 'TPE', distance: 8136, description: 'Phoenix → Taipei (expected $751-870)' },
    { origin: 'PHX', destination: 'HKG', distance: 8240, description: 'Phoenix → Hong Kong (expected $800-950)' },
    { origin: 'SEA', destination: 'LHR', distance: 4780, description: 'Seattle → London (expected $519-687)' },
    { origin: 'DEN', destination: 'GRU', distance: 6296, description: 'Denver → São Paulo (expected $673-910)' },
    { origin: 'MIA', destination: 'NRT', distance: 7757, description: 'Miami → Tokyo (expected $905-1152)' },
  ];
  
  for (const route of testRoutes) {
    console.log(`\n🛫 ${route.description}`);
    console.log(`📏 Distance: ${route.distance} miles`);
    
    try {
      const result = await flightService.calculateFlightCost(route.origin, route.destination);
      console.log(`💰 Calculated cost: $${Math.round(result)}`);
      
      // Extract expected range from description
      const match = route.description.match(/\$(\d+)-(\d+)/);
      if (match) {
        const [, min, max] = match.map(Number);
        const midpoint = (min + max) / 2;
        const percentageOff = Math.abs((result - midpoint) / midpoint * 100);
        const withinRange = result >= min && result <= max;
        
        console.log(`📊 Accuracy: ${withinRange ? '✅' : '❌'} (${percentageOff.toFixed(1)}% from midpoint)`);
        
        if (!withinRange) {
          if (result < min) {
            console.log(`⚠️  Too low by $${Math.round(min - result)}`);
          } else {
            console.log(`⚠️  Too high by $${Math.round(result - max)}`);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error calculating ${route.origin}→${route.destination}:`, error.message);
    }
  }
  
  console.log('\n✨ Testing complete!');
}

testFlightPricing();