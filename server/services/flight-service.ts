// Distance-based flight calculation service
// Replaces AI-powered flight cost estimation with deterministic calculations

interface AirportData {
  coordinates: [number, number];
  hubType: 'major' | 'regional' | 'secondary';
  passengerVolume: number; // Annual passengers in millions
  routeCount: number; // Number of destinations served
}

interface SeasonalDemand {
  month: number;
  multiplier: number;
}

interface RouteAnalysis {
  directFlight: boolean;
  connectionCount: number;
  connectionHubs: string[];
  totalDistance: number;
  routingEfficiency: number;
  connectionPenalty: number;
}

// Major airport data with passenger volumes and route counts
const AIRPORT_DATA: Record<string, AirportData> = {
  // Major North American hubs
  'ATL': { coordinates: [33.6407, -84.4277], hubType: 'major', passengerVolume: 107, routeCount: 220 },
  'LAX': { coordinates: [33.9425, -118.4081], hubType: 'major', passengerVolume: 88, routeCount: 180 },
  'ORD': { coordinates: [41.9742, -87.9073], hubType: 'major', passengerVolume: 84, routeCount: 200 },
  'DFW': { coordinates: [32.8998, -97.0403], hubType: 'major', passengerVolume: 75, routeCount: 190 },
  'JFK': { coordinates: [40.6413, -73.7781], hubType: 'major', passengerVolume: 62, routeCount: 120 },
  'SFO': { coordinates: [37.6213, -122.3790], hubType: 'major', passengerVolume: 58, routeCount: 85 },
  'YYZ': { coordinates: [43.6777, -79.6248], hubType: 'major', passengerVolume: 49, routeCount: 95 },
  
  // Major European hubs
  'LHR': { coordinates: [51.4700, -0.4543], hubType: 'major', passengerVolume: 80, routeCount: 180 },
  'CDG': { coordinates: [49.0097, 2.5479], hubType: 'major', passengerVolume: 76, routeCount: 160 },
  'FRA': { coordinates: [50.0379, 8.5622], hubType: 'major', passengerVolume: 70, routeCount: 140 },
  'AMS': { coordinates: [52.3105, 4.7683], hubType: 'major', passengerVolume: 71, routeCount: 130 },
  'MAD': { coordinates: [40.4983, -3.5676], hubType: 'major', passengerVolume: 61, routeCount: 110 },
  'FCO': { coordinates: [41.8003, 12.2389], hubType: 'major', passengerVolume: 43, routeCount: 90 },
  'ZUR': { coordinates: [47.4647, 8.5492], hubType: 'major', passengerVolume: 31, routeCount: 85 },
  'IST': { coordinates: [41.2619, 28.7419], hubType: 'major', passengerVolume: 68, routeCount: 150 },
  
  // Major Asian hubs
  'NRT': { coordinates: [35.7647, 140.3864], hubType: 'major', passengerVolume: 43, routeCount: 120 },
  'ICN': { coordinates: [37.4602, 126.4407], hubType: 'major', passengerVolume: 71, routeCount: 95 },
  'SIN': { coordinates: [1.3644, 103.9915], hubType: 'major', passengerVolume: 68, routeCount: 140 },
  'HKG': { coordinates: [22.3080, 113.9185], hubType: 'major', passengerVolume: 46, routeCount: 120 },
  'BKK': { coordinates: [13.6900, 100.7501], hubType: 'major', passengerVolume: 65, routeCount: 85 },
  'PVG': { coordinates: [31.1443, 121.8083], hubType: 'major', passengerVolume: 76, routeCount: 100 },
  'TPE': { coordinates: [25.0797, 121.2342], hubType: 'major', passengerVolume: 48, routeCount: 85 }, // Taipei
  'PUS': { coordinates: [35.1796, 129.0756], hubType: 'regional', passengerVolume: 28, routeCount: 45 }, // Busan
  
  // Major Middle East hubs
  'DXB': { coordinates: [25.2532, 55.3657], hubType: 'major', passengerVolume: 86, routeCount: 240 },
  'DOH': { coordinates: [25.2731, 51.6080], hubType: 'major', passengerVolume: 38, routeCount: 150 },
  'AUH': { coordinates: [24.4330, 54.6511], hubType: 'major', passengerVolume: 23, routeCount: 110 },
  
  // Regional hubs
  'BCN': { coordinates: [41.2974, 2.0833], hubType: 'regional', passengerVolume: 52, routeCount: 90 },
  'MUC': { coordinates: [48.3537, 11.7754], hubType: 'regional', passengerVolume: 48, routeCount: 80 },
  'DUB': { coordinates: [53.4213, -6.2701], hubType: 'regional', passengerVolume: 32, routeCount: 75 },
  'CPH': { coordinates: [55.6181, 12.6563], hubType: 'regional', passengerVolume: 30, routeCount: 70 },
  'ARN': { coordinates: [59.6519, 17.9186], hubType: 'regional', passengerVolume: 27, routeCount: 65 },
  'DEN': { coordinates: [39.8561, -104.6737], hubType: 'regional', passengerVolume: 69, routeCount: 75 },
  'SEA': { coordinates: [47.4502, -122.3088], hubType: 'regional', passengerVolume: 51, routeCount: 70 },
  'BOS': { coordinates: [42.3656, -71.0096], hubType: 'regional', passengerVolume: 42, routeCount: 60 },
  'KUL': { coordinates: [2.7456, 101.7072], hubType: 'regional', passengerVolume: 25, routeCount: 60 },
  'CGK': { coordinates: [-6.1275, 106.6537], hubType: 'regional', passengerVolume: 66, routeCount: 55 },
  'BOM': { coordinates: [19.0898, 72.8686], hubType: 'regional', passengerVolume: 49, routeCount: 65 },
  'DEL': { coordinates: [28.5665, 77.1031], hubType: 'regional', passengerVolume: 69, routeCount: 70 },
  'SYD': { coordinates: [-33.9399, 151.1753], hubType: 'regional', passengerVolume: 44, routeCount: 55 },
  'MEL': { coordinates: [-37.6690, 144.8410], hubType: 'regional', passengerVolume: 37, routeCount: 50 },
  
  // Secondary airports
  'PHX': { coordinates: [33.4373, -112.0078], hubType: 'secondary', passengerVolume: 46, routeCount: 45 },
  'MIA': { coordinates: [25.7959, -80.2870], hubType: 'secondary', passengerVolume: 45, routeCount: 55 },
  'IAH': { coordinates: [29.9902, -95.3368], hubType: 'secondary', passengerVolume: 45, routeCount: 65 },
  'LAS': { coordinates: [36.0840, -115.1537], hubType: 'secondary', passengerVolume: 52, routeCount: 40 },
  'CLT': { coordinates: [35.2144, -80.9473], hubType: 'secondary', passengerVolume: 47, routeCount: 55 },
  'MSP': { coordinates: [44.8818, -93.2218], hubType: 'secondary', passengerVolume: 39, routeCount: 50 },
  'DTW': { coordinates: [42.2162, -83.3554], hubType: 'secondary', passengerVolume: 36, routeCount: 45 },
  'PHL': { coordinates: [39.8744, -75.2424], hubType: 'secondary', passengerVolume: 33, routeCount: 40 },
};

// Seasonal demand patterns (1.0 = baseline, >1.0 = high demand, <1.0 = low demand)
const SEASONAL_DEMAND: SeasonalDemand[] = [
  { month: 1, multiplier: 0.85 }, // January - post-holiday low
  { month: 2, multiplier: 0.80 }, // February - lowest demand
  { month: 3, multiplier: 0.90 }, // March
  { month: 4, multiplier: 1.00 }, // April - baseline
  { month: 5, multiplier: 1.05 }, // May
  { month: 6, multiplier: 1.15 }, // June - summer starts
  { month: 7, multiplier: 1.20 }, // July - peak
  { month: 8, multiplier: 1.15 }, // August
  { month: 9, multiplier: 0.95 }, // September - shoulder
  { month: 10, multiplier: 0.95 }, // October - shoulder
  { month: 11, multiplier: 1.00 }, // November - BASELINE (not premium!)
  { month: 12, multiplier: 1.10 }, // December - moderate holiday premium
];

// Major connection hubs by region for routing logic
const CONNECTION_HUBS: Record<string, string[]> = {
  'north_america': ['ATL', 'ORD', 'DFW', 'LAX', 'JFK', 'YYZ'],
  'europe': ['LHR', 'CDG', 'FRA', 'AMS', 'ZUR', 'IST'],
  'middle_east': ['DXB', 'DOH', 'AUH'],
  'asia_pacific': ['NRT', 'ICN', 'SIN', 'HKG', 'BKK', 'PVG'],
  'africa': ['CAI', 'JNB', 'ADD'],
  'south_america': ['GRU', 'BOG', 'LIM']
};

export class FlightService {
  // Simplified regional multipliers targeting cheapest Google Flights prices
  private getRegionalMultiplier(destination: string, country?: string): number {
    const budgetMultipliers: Record<string, number> = {
      // Premium regions (limited competition, higher costs)
      'Africa': 1.35,       // Lagos, Cape Town - high operational costs
      'Japan': 1.15,        // Premium but targeting budget options  
      'China': 1.15,        // Increased from 1.10x (was slightly too low)
      
      // Moderate regions
      'Australia': 1.05,    // Limited competition
      'Korea': 1.0,         // Baseline competitive
      
      // Competitive regions (strong budget airline presence)  
      'Hong Kong': 0.95,    // Major hub, competitive (was too high at 1.0x)
      'Middle East': 0.70,  // Dubai competitive, budget options
      'Turkey': 0.80,       // Istanbul budget-friendly
      'India': 0.65,        // Very competitive market
      'South America': 0.80, // Competitive but not ultra-budget
      
      // Ultra-competitive regions (budget airlines dominate) - FIXED TO REALISTIC PRICES
      'Europe': 0.92,       // Fixed: Targets ~$585 for PHX→London (was 0.55x = too aggressive)
      'Southeast Asia': 0.96, // Fixed: Targets ~$798 for PHX→Bangkok (was 0.45x = too aggressive)
      
      // Default baseline
      'default': 1.0
    };
    
    // Country/region detection logic
    const destLower = destination.toLowerCase();
    const countryLower = country?.toLowerCase() || '';
    
    // Africa detection
    if (destLower.includes('lagos') || destLower.includes('cape town') || 
        destLower.includes('johannesburg') || destLower.includes('cairo') ||
        countryLower.includes('south africa') || countryLower.includes('nigeria') || 
        countryLower.includes('egypt') || countryLower.includes('kenya')) {
      return budgetMultipliers.Africa;
    }
    
    // Japan detection
    if (destLower.includes('tokyo') || destLower.includes('osaka') || 
        destLower.includes('japan') || countryLower.includes('japan')) {
      return budgetMultipliers.Japan;
    }
    
    // China detection
    if (destLower.includes('beijing') || destLower.includes('shanghai') || 
        destLower.includes('guangzhou') || destLower.includes('china') ||
        countryLower.includes('china')) {
      return budgetMultipliers.China;
    }
    
    // Hong Kong detection (major hub, competitive)
    if (destLower.includes('hong kong') || destLower.includes('hkg') ||
        countryLower.includes('hong kong')) {
      return budgetMultipliers['Hong Kong'];
    }
    
    // Korea detection
    if (destLower.includes('seoul') || destLower.includes('korea') ||
        countryLower.includes('korea')) {
      return budgetMultipliers.Korea;
    }
    
    // Australia/Oceania detection
    if (destLower.includes('sydney') || destLower.includes('melbourne') ||
        destLower.includes('brisbane') || destLower.includes('australia') ||
        countryLower.includes('australia')) {
      return budgetMultipliers.Australia;
    }
    
    // Middle East detection (Dubai, Abu Dhabi, etc)
    if (destLower.includes('dubai') || destLower.includes('abu dhabi') ||
        destLower.includes('doha') || destLower.includes('kuwait') ||
        countryLower.includes('uae') || countryLower.includes('qatar')) {
      return budgetMultipliers['Middle East'];
    }
    
    // Turkey detection
    if (destLower.includes('istanbul') || destLower.includes('ankara') ||
        destLower.includes('turkey') || countryLower.includes('turkey')) {
      return budgetMultipliers.Turkey;
    }
    
    // Europe detection (very competitive budget market)
    if (destLower.includes('london') || destLower.includes('paris') || 
        destLower.includes('rome') || destLower.includes('madrid') ||
        destLower.includes('frankfurt') || destLower.includes('amsterdam') ||
        destLower.includes('berlin') || destLower.includes('barcelona') ||
        countryLower.includes('united kingdom') || countryLower.includes('france') ||
        countryLower.includes('germany') || countryLower.includes('spain') ||
        countryLower.includes('italy') || countryLower.includes('netherlands')) {
      return budgetMultipliers.Europe;
    }
    
    // India detection (very competitive)
    if (destLower.includes('delhi') || destLower.includes('mumbai') ||
        destLower.includes('bangalore') || destLower.includes('india') ||
        countryLower.includes('india')) {
      return budgetMultipliers.India;
    }
    
    // Southeast Asia detection
    if (destLower.includes('bangkok') || destLower.includes('singapore') ||
        destLower.includes('kuala lumpur') || destLower.includes('ho chi minh') ||
        destLower.includes('manila') || countryLower.includes('thailand') ||
        countryLower.includes('singapore') || countryLower.includes('malaysia') ||
        countryLower.includes('vietnam') || countryLower.includes('philippines')) {
      return budgetMultipliers['Southeast Asia'];
    }
    
    // South America detection
    if (destLower.includes('buenos aires') || destLower.includes('sao paulo') ||
        destLower.includes('lima') || destLower.includes('bogota') ||
        countryLower.includes('argentina') || countryLower.includes('brazil') ||
        countryLower.includes('colombia') || countryLower.includes('peru')) {
      return budgetMultipliers['South America'];
    }
    
    return budgetMultipliers.default;
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Apply minimal market competition factors (Google Flights prices are already competitive)
  private applyMarketCompetitionFactors(origin: string, destination: string, distance: number, flightCost: number): number {
    // Very conservative competition adjustments - Google pricing is already optimized
    let competitionFactor = 1.0;
    
    // Minimal competition adjustments since base pricing now matches Google reality
    if (distance > 6000) {
      competitionFactor = 0.98; // Only 2% discount for long-haul
    } else if (distance > 3000) {
      competitionFactor = 0.99; // Only 1% discount for medium-haul
    } else {
      competitionFactor = 1.0; // No discount for shorter routes
    }
    
    // Minimal market saturation factor for popular airport pairs
    const originAirport = AIRPORT_DATA[origin];
    const destAirport = AIRPORT_DATA[destination];
    
    if (originAirport && destAirport) {
      // Minimal volume-based adjustments
      const avgVolume = (originAirport.passengerVolume + destAirport.passengerVolume) / 2;
      
      if (avgVolume > 50) {
        competitionFactor *= 0.99; // Only 1% off for high-volume routes
      }
      
      // Minimal major hub to major hub adjustment
      if (originAirport.hubType === 'major' && destAirport.hubType === 'major') {
        competitionFactor *= 0.98; // Only 2% off for major-to-major routes
      }
    }
    
    // No additional market reality adjustment needed - base pricing is now realistic
    const marketReality = 1.0; // No additional discount
    
    const finalCost = flightCost * competitionFactor * marketReality;
    
    console.log(`   📊 Market factors: Competition ${(competitionFactor * 100).toFixed(0)}% | Market Reality ${(marketReality * 100).toFixed(0)}% | Final: ${((competitionFactor * marketReality) * 100).toFixed(0)}%`);
    console.log(`   💰 Price adjustment: $${Math.round(flightCost)} → $${Math.round(finalCost)} (${((finalCost / flightCost) * 100).toFixed(0)}% of base)`);
    
    return finalCost;
  }

  // Get region for an airport code
  private getAirportRegion(airportCode: string): string {
    for (const [region, hubs] of Object.entries(CONNECTION_HUBS)) {
      if (hubs.includes(airportCode)) return region;
    }
    
    // Fallback based on airport data or country
    const airport = AIRPORT_DATA[airportCode];
    if (!airport) return 'unknown';
    
    const [lat, lng] = airport.coordinates;
    
    // Simple geographic region assignment
    if (lng >= -140 && lng <= -60) return 'north_america';
    if (lng >= -20 && lng <= 40 && lat >= 35) return 'europe';
    if (lng >= 25 && lng <= 65 && lat >= 15 && lat <= 40) return 'middle_east';
    if (lng >= 95 && lng <= 180) return 'asia_pacific';
    if (lng >= 15 && lng <= 55 && lat >= -35 && lat <= 15) return 'africa';
    if (lng >= -85 && lng <= -35 && lat >= -60 && lat <= 15) return 'south_america';
    
    return 'unknown';
  }

  // Calculate hub popularity score (0.7 - 1.3 multiplier)
  private calculateHubPopularity(airportCode: string): number {
    const airport = AIRPORT_DATA[airportCode];
    if (!airport) return 1.1; // Default for unknown airports (slightly expensive)
    
    // Normalize passenger volume (0-100M range) and route count (0-250 routes)
    const passengerScore = Math.min(airport.passengerVolume / 100, 1.0);
    const routeScore = Math.min(airport.routeCount / 250, 1.0);
    
    // Combined score: 70% passenger volume, 30% route diversity
    const popularityScore = (passengerScore * 0.7) + (routeScore * 0.3);
    
    // Convert to multiplier: high popularity = lower prices (more competition)
    // Range: 0.7 (major hubs) to 1.3 (small airports)
    return 1.3 - (popularityScore * 0.6);
  }

  // Get seasonal demand multiplier for a given month
  private getSeasonalDemand(month: number): number {
    const seasonal = SEASONAL_DEMAND.find(s => s.month === month);
    return seasonal?.multiplier || 1.0;
  }

  // Determine if direct flight is likely available
  private isDirectFlightLikely(origin: string, destination: string, distance: number): boolean {
    const originAirport = AIRPORT_DATA[origin];
    const destAirport = AIRPORT_DATA[destination];
    
    // If we don't have data, assume no direct flight for long distances
    if (!originAirport || !destAirport) {
      return distance < 3000;
    }
    
    // Major to Major hubs: Direct flights likely even for long distances
    if (originAirport.hubType === 'major' && destAirport.hubType === 'major') {
      return distance < 8000; // Most major routes covered
    }
    
    // One major hub: Direct flights for medium distances
    if (originAirport.hubType === 'major' || destAirport.hubType === 'major') {
      return distance < 5000;
    }
    
    // Regional to Regional: Limited direct flights
    if (originAirport.hubType === 'regional' && destAirport.hubType === 'regional') {
      return distance < 2000;
    }
    
    // Secondary airports: Very limited direct flights
    return distance < 1500;
  }

  // Find likely connection hubs for a route
  private findConnectionHubs(origin: string, destination: string): string[] {
    const originRegion = this.getAirportRegion(origin);
    const destRegion = this.getAirportRegion(destination);
    
    // Same region: might have direct or 1-stop through regional hub
    if (originRegion === destRegion) {
      const regionHubs = CONNECTION_HUBS[originRegion] || [];
      return regionHubs.filter((hub: string) => hub !== origin && hub !== destination).slice(0, 1);
    }
    
    // Different regions: find best connection points
    const connections: string[] = [];
    
    // Transcontinental routes often go through specific hubs
    if (originRegion === 'north_america' && destRegion === 'europe') {
      connections.push('JFK'); // East coast gateway
    } else if (originRegion === 'north_america' && destRegion === 'asia_pacific') {
      connections.push('LAX'); // West coast gateway
    } else if (originRegion === 'north_america' && destRegion === 'middle_east') {
      connections.push('JFK'); // Then connect via Europe or direct
    } else if (originRegion === 'europe' && destRegion === 'asia_pacific') {
      connections.push('FRA'); // European gateway
    } else if (destRegion === 'middle_east' || originRegion === 'middle_east') {
      connections.push('DXB'); // Middle East super-connector
    } else if (originRegion === 'europe' && destRegion === 'north_america') {
      connections.push('LHR');
    } else if (originRegion === 'asia_pacific' && destRegion === 'north_america') {
      connections.push('NRT');
    }
    
    // For complex routes, might need 2 stops
    const originCoords = AIRPORT_DATA[origin]?.coordinates || [0, 0];
    const destCoords = AIRPORT_DATA[destination]?.coordinates || [0, 0];
    const distance = this.calculateDistance(originCoords[0], originCoords[1], destCoords[0], destCoords[1]);
    
    if (distance > 10000 && connections.length === 0) {
      // Very long routes might need 2 connections
      if (originRegion === 'north_america' && destRegion === 'africa') {
        connections.push('JFK', 'CDG'); // US -> Europe -> Africa
      } else if (originRegion === 'south_america' && destRegion === 'asia_pacific') {
        connections.push('BOG', 'DXB'); // SA -> Middle East -> Asia
      }
    }
    
    return connections.slice(0, 2); // Max 2 connections
  }

  // Analyze route complexity and connection requirements
  private analyzeRoute(origin: string, destination: string): RouteAnalysis {
    const originCoords = AIRPORT_DATA[origin]?.coordinates || [0, 0];
    const destCoords = AIRPORT_DATA[destination]?.coordinates || [0, 0];
    const distance = this.calculateDistance(originCoords[0], originCoords[1], destCoords[0], destCoords[1]);
    
    const directFlight = this.isDirectFlightLikely(origin, destination, distance);
    
    if (directFlight) {
      return {
        directFlight: true,
        connectionCount: 0,
        connectionHubs: [],
        totalDistance: distance,
        routingEfficiency: 1.0,
        connectionPenalty: 1.0
      };
    }
    
    // Find required connections
    const connectionHubs = this.findConnectionHubs(origin, destination);
    const connectionCount = connectionHubs.length;
    
    // Calculate total routing distance (with connections)
    let totalDistance = distance;
    let routingEfficiency = 1.0;
    
    if (connectionCount === 1) {
      // Estimate detour distance (typically 10-30% longer)
      const detourFactor = 1.15 + (Math.random() * 0.15); // 1.15-1.30x
      totalDistance = distance * detourFactor;
      routingEfficiency = 1.05; // Slight inefficiency
    } else if (connectionCount === 2) {
      // Two connections mean significant detour
      const detourFactor = 1.25 + (Math.random() * 0.25); // 1.25-1.50x
      totalDistance = distance * detourFactor;
      routingEfficiency = 1.15; // More inefficiency
    }
    
    // Connection penalties (time, hassle, missed connection risk)
    let connectionPenalty = 1.0;
    if (connectionCount === 1) {
      connectionPenalty = 1.08; // 8% penalty for 1 stop
    } else if (connectionCount === 2) {
      connectionPenalty = 1.20; // 20% penalty for 2 stops
    }
    
    return {
      directFlight: false,
      connectionCount,
      connectionHubs,
      totalDistance,
      routingEfficiency,
      connectionPenalty
    };
  }

  // Country-based fallback rates
  private getCountryFlightFallback(countryName: string): number {
    const fallbackRates: { [key: string]: number } = {
      // Close destinations
      "United States": 300,
      "Canada": 350,
      "Mexico": 400,
      // Europe
      "United Kingdom": 600,
      "France": 650,
      "Germany": 600,
      "Italy": 650,
      "Spain": 600,
      "Portugal": 550,
      "Greece": 600,
      "Czech Republic": 550,
      "Hungary": 500,
      "Poland": 500,
      // Asia - affordable
      "Thailand": 800,
      "Vietnam": 900,
      "Malaysia": 850,
      "Indonesia": 900,
      "Philippines": 850,
      "India": 950,
      // Asia - premium
      "Japan": 1200,
      "Singapore": 1000,
      "South Korea": 1100,
      "China": 1000,
      // Other regions
      "Australia": 1500,
      "New Zealand": 1600,
      "South Africa": 1400,
      "Morocco": 700,
      "Egypt": 750,
      "Brazil": 800,
      "Argentina": 900,
    };
    return fallbackRates[countryName] || 800; // Default fallback
  }

  // Main flight cost calculation function with optional coordinates
  async getFlightCosts(
    origin: string, 
    destination: string, 
    month?: number, 
    originCoords?: [number, number], 
    destCoords?: [number, number]
  ): Promise<{ cost: number; confidence: string }> {
    try {
      // Use provided coordinates or look up in airport data
      const originLatLng = originCoords || AIRPORT_DATA[origin]?.coordinates;
      const destLatLng = destCoords || AIRPORT_DATA[destination]?.coordinates;
      
      if (!originLatLng || !destLatLng) {
        console.warn(`📏 No coordinates found for route ${origin} → ${destination}, using fallback`);
        return {
          cost: this.getCountryFlightFallback('Unknown'),
          confidence: 'low'
        };
      }
      
      // Analyze the route complexity using coordinates
      const routeAnalysis = this.analyzeRouteWithCoords(origin, destination, originLatLng, destLatLng);
      
      // Use total routing distance (including detours) for price calculation
      const distance = routeAnalysis.totalDistance;

      // Determine if this is a short international (cross-border) route
      const isInternational = this.isInternationalRoute(origin, destination);
      const isShortRoute = distance < 2500;

      // Universal short international (cross-border) pricing tier
      let baseCost = 0;
      if (isInternational && isShortRoute) {
        // Short cross-border: Mexico, Caribbean, Central America, Canada, etc.
        baseCost = (distance * 0.18) + 180;
      } else if (!isInternational && distance < 3000) {
        // Domestic
        baseCost = (distance * 0.05) + 80;
      } else if (distance < 6000) {
        // Medium international
        baseCost = (distance * 0.08) + 200;
      } else {
        // Long international
        baseCost = (distance * 0.07) + 250;
      }
      
      let flightCost = baseCost;

      // Apply seasonal demand (minimal adjustment)
      const seasonalMultiplier = month ? this.getSeasonalDemand(month) : 1.0;
      flightCost = flightCost * seasonalMultiplier;
      
      // Apply regional multiplier (the key differentiator for accuracy)
      const regionalMultiplier = this.getRegionalMultiplier(destination);
      flightCost = flightCost * regionalMultiplier;

      // Ensure reasonable bounds
      flightCost = Math.max(100, Math.min(2500, Math.round(flightCost)));

      // Determine confidence based on route analysis
      let confidence = 'medium';
      if (routeAnalysis.directFlight && AIRPORT_DATA[origin] && AIRPORT_DATA[destination]) {
        confidence = 'high';
      } else if (routeAnalysis.connectionCount >= 2 || !AIRPORT_DATA[origin] || !AIRPORT_DATA[destination]) {
        confidence = 'low';
      }

      // Enhanced logging for simplified approach
      console.log(`✈️ Simplified flight cost: ${origin} → ${destination} = $${Math.round(flightCost)}`);
      console.log(`   Distance: ${Math.round(distance)}mi | Base cost: $${Math.round(baseCost)}`);
      console.log(`   Multipliers - Season: ${seasonalMultiplier.toFixed(2)}x | Regional: ${regionalMultiplier.toFixed(2)}x`);
      console.log(`   Confidence: ${confidence}`);      return {
        cost: flightCost,
        confidence
      };
      
    } catch (error) {
      console.error('Distance-based flight cost calculation failed:', error);
      return {
        cost: this.getCountryFlightFallback('Unknown'),
        confidence: 'low'
      };
    }
  }

  // Analyze route with provided coordinates
  private analyzeRouteWithCoords(origin: string, destination: string, originCoords: [number, number], destCoords: [number, number]): RouteAnalysis {
    const distance = this.calculateDistance(originCoords[0], originCoords[1], destCoords[0], destCoords[1]);
    
    const directFlight = this.isDirectFlightLikely(origin, destination, distance);
    
    if (directFlight) {
      return {
        directFlight: true,
        connectionCount: 0,
        connectionHubs: [],
        totalDistance: distance,
        routingEfficiency: 1.0,
        connectionPenalty: 1.0
      };
    }
    
    // Find required connections
    const connectionHubs = this.findConnectionHubs(origin, destination);
    const connectionCount = connectionHubs.length;
    
    // Calculate total routing distance (with connections)
    let totalDistance = distance;
    let routingEfficiency = 1.0;
    
    if (connectionCount === 1) {
      // Estimate detour distance (typically 10-30% longer)
      const detourFactor = 1.15 + (Math.random() * 0.15); // 1.15-1.30x
      totalDistance = distance * detourFactor;
      routingEfficiency = 1.05; // Slight inefficiency
    } else if (connectionCount === 2) {
      // Two connections mean significant detour
      const detourFactor = 1.25 + (Math.random() * 0.25); // 1.25-1.50x
      totalDistance = distance * detourFactor;
      routingEfficiency = 1.15; // More inefficiency
    }
    
    // Connection penalties (time, hassle, missed connection risk)
    let connectionPenalty = 1.0;
    if (connectionCount === 1) {
      connectionPenalty = 1.08; // 8% penalty for 1 stop
    } else if (connectionCount === 2) {
      connectionPenalty = 1.20; // 20% penalty for 2 stops
    }
    
    return {
      directFlight: false,
      connectionCount,
      connectionHubs,
      totalDistance,
      routingEfficiency,
      connectionPenalty
    };
  }

  // Utility: Determine if two airports are in different countries
  isInternationalRoute(origin: string, destination: string): boolean {
    // Simple check: if IATA code country prefixes differ, or use a country lookup if available
    // For now, treat US/CA/MX/Caribbean/Central America as different countries
    // You can expand this with a real country lookup if needed
    const usCodes = ['US', 'K', 'P', 'L', 'A', 'S', 'J', 'D', 'C', 'M', 'N', 'H', 'G', 'F', 'E', 'B', 'Q', 'R', 'T', 'V', 'W', 'Y', 'Z'];
    // This is a placeholder. Replace with a real country lookup for production.
    if (origin.length === 3 && destination.length === 3) {
      // If both are US, not international
      if (origin[0] === 'K' && destination[0] === 'K') return false;
      // If both are C (Canada), not international
      if (origin[0] === 'C' && destination[0] === 'C') return false;
      // Otherwise, treat as international
      return origin[0] !== destination[0];
    }
    // Fallback: treat as international if not obviously domestic
    return true;
  }

  // For compatibility with existing API
  async getFlightCostsCached(
    originCode: string, 
    destinationCode: string, 
    originCity: string, 
    destinationCity: string, 
    countryName: string, 
    month?: number, 
    nights: number = 7,
    originCoords?: [number, number],
    destCoords?: [number, number]
  ): Promise<{ cost: number; confidence: string }> {
    return this.getFlightCosts(originCode, destinationCode, month, originCoords, destCoords);
  }
}

export const flightService = new FlightService();