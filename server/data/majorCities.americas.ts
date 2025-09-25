// Major cities in the Americas with confirmed IATA codes and hotel availability
export const AmericasMajorCities = {
  // United States
  US: [
    { name: "New York", iata: "JFK", lat: 40.7128, lon: -74.0060 },
    { name: "Los Angeles", iata: "LAX", lat: 34.0522, lon: -118.2437 },
    { name: "Chicago", iata: "ORD", lat: 41.8781, lon: -87.6298 },
    { name: "Miami", iata: "MIA", lat: 25.7617, lon: -80.1918 },
    { name: "San Francisco", iata: "SFO", lat: 37.7749, lon: -122.4194 },
    { name: "Las Vegas", iata: "LAS", lat: 36.1699, lon: -115.1398 },
    { name: "Orlando", iata: "MCO", lat: 28.5383, lon: -81.3792 },
    { name: "Seattle", iata: "SEA", lat: 47.6062, lon: -122.3321 },
    { name: "Denver", iata: "DEN", lat: 39.7392, lon: -104.9903 },
    { name: "Atlanta", iata: "ATL", lat: 33.7490, lon: -84.3880 },
    { name: "Boston", iata: "BOS", lat: 42.3601, lon: -71.0589 },
    { name: "Phoenix", iata: "PHX", lat: 33.4484, lon: -112.0740 },
    { name: "Dallas", iata: "DFW", lat: 32.7767, lon: -96.7970 },
    { name: "Houston", iata: "IAH", lat: 29.7604, lon: -95.3698 },
    { name: "Washington DC", iata: "DCA", lat: 38.9072, lon: -77.0369 },
    { name: "Philadelphia", iata: "PHL", lat: 39.9526, lon: -75.1652 },
    { name: "San Diego", iata: "SAN", lat: 32.7157, lon: -117.1611 },
    { name: "Nashville", iata: "BNA", lat: 36.1627, lon: -86.7816 },
  ],
  
  // Canada
  CA: [
    { name: "Toronto", iata: "YYZ", lat: 43.6532, lon: -79.3832 },
    { name: "Vancouver", iata: "YVR", lat: 49.2827, lon: -123.1207 },
    { name: "Montreal", iata: "YUL", lat: 45.5017, lon: -73.5673 },
  ],
  
  // Mexico
  MX: [
    { name: "Mexico City", iata: "MEX", lat: 19.4326, lon: -99.1332 },
    { name: "Cancun", iata: "CUN", lat: 21.1619, lon: -86.8515 },
    { name: "Guadalajara", iata: "GDL", lat: 20.6597, lon: -103.3496 },
    { name: "Puerto Vallarta", iata: "PVR", lat: 20.6534, lon: -105.2253 },
  ],
  
  // Brazil
  BR: [
    { name: "São Paulo", iata: "GRU", lat: -23.5505, lon: -46.6333 },
    { name: "Rio de Janeiro", iata: "GIG", lat: -22.9068, lon: -43.1729 },
    { name: "Salvador", iata: "SSA", lat: -12.9714, lon: -38.5014 },
    { name: "Brasília", iata: "BSB", lat: -15.7942, lon: -47.8822 },
  ],
  
  // Argentina
  AR: [
    { name: "Buenos Aires", iata: "EZE", lat: -34.6118, lon: -58.3960 },
    { name: "Mendoza", iata: "MDZ", lat: -32.8908, lon: -68.8272 },
  ],
  
  // Chile
  CL: [
    { name: "Santiago", iata: "SCL", lat: -33.4489, lon: -70.6693 },
  ],
  
  // Peru
  PE: [
    { name: "Lima", iata: "LIM", lat: -12.0464, lon: -77.0428 },
    { name: "Cusco", iata: "CUZ", lat: -13.5319, lon: -71.9675 },
  ],
  
  // Colombia
  CO: [
    { name: "Bogotá", iata: "BOG", lat: 4.7110, lon: -74.0721 },
    { name: "Medellín", iata: "MDE", lat: 6.2442, lon: -75.5812 },
    { name: "Cartagena", iata: "CTG", lat: 10.3997, lon: -75.5144 },
  ],
  
  // Ecuador
  EC: [
    { name: "Quito", iata: "UIO", lat: -0.1807, lon: -78.4678 },
    { name: "Guayaquil", iata: "GYE", lat: -2.1894, lon: -79.8890 },
  ],
  
  // Uruguay
  UY: [
    { name: "Montevideo", iata: "MVD", lat: -34.9011, lon: -56.1645 },
  ],
  
  // Costa Rica
  CR: [
    { name: "San José", iata: "SJO", lat: 9.9281, lon: -84.0907 },
  ],
  
  // Panama
  PA: [
    { name: "Panama City", iata: "PTY", lat: 8.9824, lon: -79.5199 },
  ],
  
  // Guatemala
  GT: [
    { name: "Guatemala City", iata: "GUA", lat: 14.6349, lon: -90.5069 },
  ],
  
  // Jamaica
  JM: [
    { name: "Kingston", iata: "KIN", lat: 17.9970, lon: -76.7936 },
  ],
  
  // Bahamas
  BS: [
    { name: "Nassau", iata: "NAS", lat: 25.0443, lon: -77.3504 },
  ],
  
  // Barbados
  BB: [
    { name: "Bridgetown", iata: "BGI", lat: 13.1939, lon: -59.5432 },
  ],
} as const;

export type AmericasCountryCode = keyof typeof AmericasMajorCities;
export type AmericasCityInfo = typeof AmericasMajorCities[AmericasCountryCode][number];