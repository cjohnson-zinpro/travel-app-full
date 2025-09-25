// Quick validation of simplified pricing algorithm
import path from 'path';
import { calculateDistanceBasedFlightCost } from './server/services/flight-service.js';

async function validatePricing() {
  console.log('🧪 VALIDATING SIMPLIFIED PRICING ALGORITHM');
  console.log('============================================\n');

  const testRoutes = [
    // Test China routes (should be higher with 1.15x multiplier)
    { from: { lat: 33.4484, lng: -112.074 }, to: { lat: 39.9042, lng: 116.4074 }, name: 'PHX → Beijing', expectedMultiplier: 1.15 },
    { from: { lat: 33.4484, lng: -112.074 }, to: { lat: 31.2304, lng: 121.4737 }, name: 'PHX → Shanghai', expectedMultiplier: 1.15 },
    
    // Test Hong Kong (should be lower with 0.95x multiplier)  
    { from: { lat: 33.4484, lng: -112.074 }, to: { lat: 22.3193, lng: 114.1694 }, name: 'PHX → Hong Kong', expectedMultiplier: 0.95 },
    
    // Test Southeast Asia (should be much lower with 0.45x multiplier)
    { from: { lat: 33.4484, lng: -112.074 }, to: { lat: 5.4164, lng: 100.3327 }, name: 'PHX → Penang', expectedMultiplier: 0.45 },
    { from: { lat: 34.0522, lng: -118.2437 }, to: { lat: 3.1390, lng: 101.6869 }, name: 'LAX → Kuala Lumpur', expectedMultiplier: 0.45 },
    
    // Test Europe (should be lower with 0.55x multiplier)
    { from: { lat: 40.7128, lng: -74.0060 }, to: { lat: 41.9028, lng: 12.4964 }, name: 'JFK → Rome', expectedMultiplier: 0.55 },
    
    // Test domestic US (no regional multiplier)
    { from: { lat: 34.0522, lng: -118.2437 }, to: { lat: 40.7128, lng: -74.0060 }, name: 'LAX → JFK', expectedMultiplier: 1.0 }
  ];

  for (const route of testRoutes) {
    try {
      const result = await calculateDistanceBasedFlightCost(route.from, route.to, 11); // November
      console.log(`${route.name.padEnd(20)} | $${Math.round(result.cost).toString().padStart(3)} | Expected ~${route.expectedMultiplier}x | ${result.confidence || 'N/A'}`);
    } catch (error) {
      console.error(`❌ Error testing ${route.name}:`, error.message);
    }
  }

  console.log('\n🎯 Key Changes to Verify:');
  console.log('• China routes should be 10-15% higher than old algorithm');
  console.log('• Hong Kong should be 5% lower than old algorithm'); 
  console.log('• Southeast Asia should be 40-50% lower than old algorithm');
  console.log('• Europe should have aggressive discounts (45% off)');
  console.log('• All routes should show simplified logging output');
}

validatePricing().catch(console.error);