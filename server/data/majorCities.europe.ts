// Major cities in Europe with confirmed IATA codes and hotel availability
export const EuropeMajorCities = {
  // United Kingdom
  GB: [
    { name: "London", iata: "LHR", lat: 51.5074, lon: -0.1278 },
    { name: "Edinburgh", iata: "EDI", lat: 55.9533, lon: -3.1883 },
    { name: "Manchester", iata: "MAN", lat: 53.4808, lon: -2.2426 },
  ],
  
  // France
  FR: [
    { name: "Paris", iata: "CDG", lat: 48.8566, lon: 2.3522 },
    { name: "Nice", iata: "NCE", lat: 43.7102, lon: 7.2620 },
    { name: "Lyon", iata: "LYS", lat: 45.7640, lon: 4.8357 },
  ],
  
  // Germany
  DE: [
    { name: "Berlin", iata: "BER", lat: 52.5200, lon: 13.4050 },
    { name: "Munich", iata: "MUC", lat: 48.1351, lon: 11.5820 },
    { name: "Frankfurt", iata: "FRA", lat: 50.1109, lon: 8.6821 },
    { name: "Hamburg", iata: "HAM", lat: 53.5511, lon: 9.9937 },
  ],
  
  // Italy
  IT: [
    { name: "Rome", iata: "FCO", lat: 41.9028, lon: 12.4964 },
    { name: "Milan", iata: "MXP", lat: 45.4642, lon: 9.1900 },
    { name: "Venice", iata: "VCE", lat: 45.4408, lon: 12.3155 },
    { name: "Florence", iata: "FLR", lat: 43.7696, lon: 11.2558 },
  ],
  
  // Spain
  ES: [
    { name: "Madrid", iata: "MAD", lat: 40.4168, lon: -3.7038 },
    { name: "Barcelona", iata: "BCN", lat: 41.3851, lon: 2.1734 },
    { name: "Seville", iata: "SVQ", lat: 37.3891, lon: -5.9845 },
  ],
  
  // Netherlands
  NL: [
    { name: "Amsterdam", iata: "AMS", lat: 52.3676, lon: 4.9041 },
  ],
  
  // Switzerland
  CH: [
    { name: "Zurich", iata: "ZUR", lat: 47.3769, lon: 8.5417 },
    { name: "Geneva", iata: "GVA", lat: 46.2044, lon: 6.1432 },
  ],
  
  // Austria
  AT: [
    { name: "Vienna", iata: "VIE", lat: 48.2082, lon: 16.3738 },
  ],
  
  // Belgium
  BE: [
    { name: "Brussels", iata: "BRU", lat: 50.8503, lon: 4.3517 },
  ],
  
  // Portugal
  PT: [
    { name: "Lisbon", iata: "LIS", lat: 38.7223, lon: -9.1393 },
    { name: "Porto", iata: "OPO", lat: 41.1579, lon: -8.6291 },
  ],
  
  // Greece
  GR: [
    { name: "Athens", iata: "ATH", lat: 37.9838, lon: 23.7275 },
    { name: "Santorini", iata: "JTR", lat: 36.4139, lon: 25.4318 },
  ],
  
  // Czech Republic
  CZ: [
    { name: "Prague", iata: "PRG", lat: 50.0755, lon: 14.4378 },
  ],
  
  // Hungary
  HU: [
    { name: "Budapest", iata: "BUD", lat: 47.4979, lon: 19.0402 },
  ],
  
  // Poland
  PL: [
    { name: "Warsaw", iata: "WAW", lat: 52.2297, lon: 21.0122 },
    { name: "Krakow", iata: "KRK", lat: 50.0647, lon: 19.9450 },
  ],
  
  // Ireland
  IE: [
    { name: "Dublin", iata: "DUB", lat: 53.3498, lon: -6.2603 },
  ],
  
  // Sweden
  SE: [
    { name: "Stockholm", iata: "ARN", lat: 59.3293, lon: 18.0686 },
  ],
  
  // Denmark
  DK: [
    { name: "Copenhagen", iata: "CPH", lat: 55.6761, lon: 12.5683 },
  ],
  
  // Norway
  NO: [
    { name: "Oslo", iata: "OSL", lat: 59.9139, lon: 10.7522 },
  ],
  
  // Finland
  FI: [
    { name: "Helsinki", iata: "HEL", lat: 60.1699, lon: 24.9384 },
  ],
  
  // Croatia
  HR: [
    { name: "Zagreb", iata: "ZAG", lat: 45.8150, lon: 15.9819 },
    { name: "Dubrovnik", iata: "DBV", lat: 42.6507, lon: 18.0944 },
  ],
  
  // Turkey
  TR: [
    { name: "Istanbul", iata: "IST", lat: 41.0082, lon: 28.9784 },
    { name: "Antalya", iata: "AYT", lat: 36.8969, lon: 30.7133 },
  ],
  
  // Romania
  RO: [
    { name: "Bucharest", iata: "OTP", lat: 44.4268, lon: 26.1025 },
  ],
} as const;

export type EuropeCountryCode = keyof typeof EuropeMajorCities;
export type EuropeCityInfo = typeof EuropeMajorCities[EuropeCountryCode][number];