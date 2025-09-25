import { 
  type InsertCity, 
  type InsertFlightAverage, 
  type InsertHotelStats, 
  type InsertDailyCosts 
} from "@shared/schema";

export const mockCities: InsertCity[] = [
  // Thailand
  { name: "Bangkok", countryCode: "TH", country: "Thailand", region: "asia", iataCityCode: "BKK", latitude: "13.7563", longitude: "100.5018", enabled: 1 },
  { name: "Chiang Mai", countryCode: "TH", country: "Thailand", region: "asia", iataCityCode: "CNX", latitude: "18.7883", longitude: "98.9853", enabled: 1 },
  { name: "Phuket", countryCode: "TH", country: "Thailand", region: "asia", iataCityCode: "HKT", latitude: "7.8804", longitude: "98.3923", enabled: 1 },
  
  // Vietnam
  { name: "Ho Chi Minh City", countryCode: "VN", country: "Vietnam", region: "asia", iataCityCode: "SGN", latitude: "10.8231", longitude: "106.6297", enabled: 1 },
  { name: "Hanoi", countryCode: "VN", country: "Vietnam", region: "asia", iataCityCode: "HAN", latitude: "21.0285", longitude: "105.8542", enabled: 1 },
  
  // Indonesia
  { name: "Bali (Denpasar)", countryCode: "ID", country: "Indonesia", region: "asia", iataCityCode: "DPS", latitude: "-8.6705", longitude: "115.2126", enabled: 1 },
  { name: "Jakarta", countryCode: "ID", country: "Indonesia", region: "asia", iataCityCode: "CGK", latitude: "-6.2088", longitude: "106.8456", enabled: 1 },
  { name: "Yogyakarta", countryCode: "ID", country: "Indonesia", region: "asia", iataCityCode: "JOG", latitude: "-7.7956", longitude: "110.3695", enabled: 1 },

  // Malaysia
  { name: "Kuala Lumpur", countryCode: "MY", country: "Malaysia", region: "asia", iataCityCode: "KUL", latitude: "3.1390", longitude: "101.6869", enabled: 1 },
  { name: "Penang", countryCode: "MY", country: "Malaysia", region: "asia", iataCityCode: "PEN", latitude: "5.4164", longitude: "100.3327", enabled: 1 },

  // Europe
  { name: "Prague", countryCode: "CZ", country: "Czech Republic", region: "europe", iataCityCode: "PRG", latitude: "50.0755", longitude: "14.4378", enabled: 1 },
  { name: "Budapest", countryCode: "HU", country: "Hungary", region: "europe", iataCityCode: "BUD", latitude: "47.4979", longitude: "19.0402", enabled: 1 },
  { name: "Warsaw", countryCode: "PL", country: "Poland", region: "europe", iataCityCode: "WAW", latitude: "52.2297", longitude: "21.0122", enabled: 1 },
  { name: "Lisbon", countryCode: "PT", country: "Portugal", region: "europe", iataCityCode: "LIS", latitude: "38.7223", longitude: "-9.1393", enabled: 1 },
  { name: "Athens", countryCode: "GR", country: "Greece", region: "europe", iataCityCode: "ATH", latitude: "37.9838", longitude: "23.7275", enabled: 1 }
];

export function generateMockFlightAverages(cities: { id: string, iataCityCode: string | null }[]): InsertFlightAverage[] {
  const origins = ["PHX", "LAX", "JFK", "ORD", "DFW"];
  const flights: InsertFlightAverage[] = [];
  
  const basePrices: Record<string, number> = {
    "BKK": 900, "CNX": 950, "HKT": 1050,
    "SGN": 820, "HAN": 790,
    "DPS": 980, "CGK": 860, "JOG": 920,
    "KUL": 780, "PEN": 850,
    "PRG": 650, "BUD": 620, "WAW": 680, "LIS": 580, "ATH": 720
  };
  
  origins.forEach(origin => {
    cities.forEach(city => {
      if (!city.iataCityCode) return;
      
      const basePrice = basePrices[city.iataCityCode] || 800;
      const variance = Math.random() * 200 - 100; // ±$100 variance
      
      flights.push({
        originIata: origin,
        cityIata: city.iataCityCode,
        month: null, // Annual average
        avgRoundtripUsd: (basePrice + variance).toFixed(2),
        sampleSize: Math.floor(Math.random() * 500) + 100,
        confidence: Math.random() > 0.3 ? (Math.random() > 0.6 ? 'high' : 'medium') : 'low'
      });
    });
  });
  
  return flights;
}

export function generateMockHotelStats(cities: { id: string, name: string }[]): InsertHotelStats[] {
  const stats: InsertHotelStats[] = [];
  
  const hotelPrices: Record<string, { p25: number, p50: number, p75: number }> = {
    "Bangkok": { p25: 40, p50: 55, p75: 85 },
    "Chiang Mai": { p25: 30, p50: 45, p75: 65 },
    "Phuket": { p25: 45, p50: 65, p75: 95 },
    "Ho Chi Minh City": { p25: 35, p50: 50, p75: 70 },
    "Hanoi": { p25: 30, p50: 45, p75: 65 },
    "Bali (Denpasar)": { p25: 40, p50: 60, p75: 80 },
    "Jakarta": { p25: 45, p50: 65, p75: 85 },
    "Yogyakarta": { p25: 25, p50: 40, p75: 60 },
    "Kuala Lumpur": { p25: 35, p50: 50, p75: 75 },
    "Penang": { p25: 30, p50: 45, p75: 65 },
    "Prague": { p25: 60, p50: 85, p75: 120 },
    "Budapest": { p25: 55, p50: 75, p75: 105 },
    "Warsaw": { p25: 50, p50: 70, p75: 95 },
    "Lisbon": { p25: 65, p50: 90, p75: 125 },
    "Athens": { p25: 55, p50: 80, p75: 110 }
  };
  
  cities.forEach(city => {
    const prices = hotelPrices[city.name] || { p25: 50, p50: 70, p75: 95 };
    
    stats.push({
      cityId: city.id,
      month: null, // Annual average
      p25Usd: prices.p25.toFixed(2),
      p50Usd: prices.p50.toFixed(2),
      p75Usd: prices.p75.toFixed(2),
      sampleSize: Math.floor(Math.random() * 1000) + 200,
      confidence: Math.random() > 0.2 ? (Math.random() > 0.5 ? 'high' : 'medium') : 'low'
    });
  });
  
  return stats;
}

export function generateMockDailyCosts(cities: { id: string, name: string }[]): InsertDailyCosts[] {
  const costs: InsertDailyCosts[] = [];
  
  const dailyPrices: Record<string, { food: number, transport: number, misc: number }> = {
    "Bangkok": { food: 25, transport: 8, misc: 7 },
    "Chiang Mai": { food: 20, transport: 6, misc: 9 },
    "Phuket": { food: 28, transport: 8, misc: 6 },
    "Ho Chi Minh City": { food: 18, transport: 6, misc: 8 },
    "Hanoi": { food: 16, transport: 5, misc: 9 },
    "Bali (Denpasar)": { food: 22, transport: 8, misc: 8 },
    "Jakarta": { food: 20, transport: 8, misc: 7 },
    "Yogyakarta": { food: 15, transport: 6, misc: 7 },
    "Kuala Lumpur": { food: 18, transport: 7, misc: 8 },
    "Penang": { food: 16, transport: 6, misc: 8 },
    "Prague": { food: 35, transport: 12, misc: 15 },
    "Budapest": { food: 30, transport: 10, misc: 12 },
    "Warsaw": { food: 28, transport: 9, misc: 13 },
    "Lisbon": { food: 40, transport: 15, misc: 20 },
    "Athens": { food: 35, transport: 12, misc: 15 }
  };
  
  cities.forEach(city => {
    const prices = dailyPrices[city.name] || { food: 25, transport: 10, misc: 10 };
    
    costs.push({
      cityId: city.id,
      dailyFoodUsd: prices.food.toFixed(2),
      dailyTransportUsd: prices.transport.toFixed(2),
      dailyMiscUsd: prices.misc.toFixed(2)
    });
  });
  
  return costs;
}
