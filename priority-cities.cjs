/**
 * High-Priority Cities Missing Accommodation Data
 * Adding accurate pricing based on current market research and tourism patterns
 */

// Group 1: Major Tourist Destinations (High Priority)
const HIGH_PRIORITY_CITIES = [
  'taipei',      // Major Asian hub
  'cairo',       // Egypt tourism
  'athens',      // Greece tourism  
  'santorini',   // Greek islands
  'cape-town',   // South Africa
  'marrakech',   // Morocco
  'bali',        // Indonesia
  'warsaw',      // Eastern Europe
  'krakow',      // Eastern Europe
  'bucharest',   // Eastern Europe
];

// Group 2: Regional Hubs (Medium Priority)
const MEDIUM_PRIORITY_CITIES = [
  'bangalore',   // India tech hub
  'chennai',     // India
  'abu-dhabi',   // UAE
  'doha',        // Qatar
  'colombo',     // Sri Lanka
  'penang',      // Malaysia
  'cebu',        // Philippines
  'cairns',      // Australia
  'queenstown',  // New Zealand
  'male',        // Maldives
];

// Group 3: Regional Centers (Lower Priority)
const LOWER_PRIORITY_CITIES = [
  'bogota',      // Colombia
  'alexandria',  // Egypt
  'johannesburg', // South Africa
  'durban',      // South Africa
  'casablanca',  // Morocco
  'nairobi',     // Kenya
  'addis-ababa', // Ethiopia
  'lagos',       // Nigeria
  'accra',       // Ghana
  'tunis',       // Tunisia
];

console.log('HIGH PRIORITY CITIES (10):', HIGH_PRIORITY_CITIES);
console.log('MEDIUM PRIORITY CITIES (10):', MEDIUM_PRIORITY_CITIES);
console.log('LOWER PRIORITY CITIES (10):', LOWER_PRIORITY_CITIES);
console.log('\nTotal cities to add:', HIGH_PRIORITY_CITIES.length + MEDIUM_PRIORITY_CITIES.length + LOWER_PRIORITY_CITIES.length);