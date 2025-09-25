// Major cities in Oceania with confirmed IATA codes and hotel availability
export const OceaniaMajorCities = {
  // Australia
  AU: [
    { name: "Sydney", iata: "SYD", lat: -33.8688, lon: 151.2093 },
    { name: "Melbourne", iata: "MEL", lat: -37.8136, lon: 144.9631 },
    { name: "Brisbane", iata: "BNE", lat: -27.4705, lon: 153.0260 },
    { name: "Perth", iata: "PER", lat: -31.9505, lon: 115.8605 },
    { name: "Adelaide", iata: "ADL", lat: -34.9285, lon: 138.6007 },
  ],
  
  // New Zealand
  NZ: [
    { name: "Auckland", iata: "AKL", lat: -36.8485, lon: 174.7633 },
    { name: "Wellington", iata: "WLG", lat: -41.2865, lon: 174.7762 },
    { name: "Christchurch", iata: "CHC", lat: -43.5321, lon: 172.6362 },
  ],
  
  // Fiji
  FJ: [
    { name: "Suva", iata: "SUV", lat: -18.1416, lon: 178.4419 },
    { name: "Nadi", iata: "NAN", lat: -17.7553, lon: 177.4414 },
  ],
  
  // French Polynesia
  PF: [
    { name: "Tahiti", iata: "PPT", lat: -17.6797, lon: -149.4068 },
  ],
  
  // New Caledonia
  NC: [
    { name: "Nouméa", iata: "NOU", lat: -22.2758, lon: 166.4572 },
  ],
  
  // Vanuatu
  VU: [
    { name: "Port Vila", iata: "VLI", lat: -17.7334, lon: 168.3273 },
  ],
} as const;

export type OceaniaCountryCode = keyof typeof OceaniaMajorCities;
export type OceaniaCityInfo = typeof OceaniaMajorCities[OceaniaCountryCode][number];