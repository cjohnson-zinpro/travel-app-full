// Major cities in Africa with confirmed IATA codes and hotel availability
export const AfricaMajorCities = {
  // Egypt
  EG: [
    { name: "Cairo", iata: "CAI", lat: 30.0444, lon: 31.2357 },
    { name: "Alexandria", iata: "HBE", lat: 31.2001, lon: 29.9187 },
  ],
  
  // South Africa
  ZA: [
    { name: "Cape Town", iata: "CPT", lat: -33.9249, lon: 18.4241 },
    { name: "Johannesburg", iata: "JNB", lat: -26.2041, lon: 28.0473 },
    { name: "Durban", iata: "DUR", lat: -29.8587, lon: 31.0218 },
  ],
  
  // Morocco
  MA: [
    { name: "Casablanca", iata: "CMN", lat: 33.5731, lon: -7.5898 },
    { name: "Marrakech", iata: "RAK", lat: 31.6295, lon: -7.9811 },
  ],
  
  // Kenya
  KE: [
    { name: "Nairobi", iata: "NBO", lat: -1.2864, lon: 36.8172 },
  ],
  
  // Ethiopia
  ET: [
    { name: "Addis Ababa", iata: "ADD", lat: 9.1450, lon: 40.4897 },
  ],
  
  // Tanzania
  TZ: [
    { name: "Dar es Salaam", iata: "DAR", lat: -6.7924, lon: 39.2083 },
    { name: "Zanzibar", iata: "ZNZ", lat: -6.2221, lon: 39.2197 },
  ],
  
  // Nigeria
  NG: [
    { name: "Lagos", iata: "LOS", lat: 6.5244, lon: 3.3792 },
    { name: "Abuja", iata: "ABV", lat: 9.0765, lon: 7.3986 },
  ],
  
  // Ghana
  GH: [
    { name: "Accra", iata: "ACC", lat: 5.6037, lon: -0.1870 },
  ],
  
  // Senegal
  SN: [
    { name: "Dakar", iata: "DKR", lat: 14.7167, lon: -17.4677 },
  ],
  
  // Tunisia
  TN: [
    { name: "Tunis", iata: "TUN", lat: 36.8065, lon: 10.1815 },
  ],
  
  // Algeria
  DZ: [
    { name: "Algiers", iata: "ALG", lat: 36.7538, lon: 3.0588 },
  ],
  
  // Uganda
  UG: [
    { name: "Kampala", iata: "EBB", lat: 0.3476, lon: 32.5825 },
  ],
  
  // Rwanda
  RW: [
    { name: "Kigali", iata: "KGL", lat: -1.9441, lon: 30.0619 },
  ],
  
  // Botswana
  BW: [
    { name: "Gaborone", iata: "GBE", lat: -24.6282, lon: 25.9231 },
  ],
  
  // Zimbabwe
  ZW: [
    { name: "Harare", iata: "HRE", lat: -17.8252, lon: 31.0335 },
  ],
} as const;

export type AfricaCountryCode = keyof typeof AfricaMajorCities;
export type AfricaCityInfo = typeof AfricaMajorCities[AfricaCountryCode][number];