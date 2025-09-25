// Country name to flag emoji mapping
// Uses Unicode flag emojis based on ISO 3166-1 alpha-2 country codes

const countryToCode: Record<string, string> = {
  // Asia
  "China": "CN",
  "Japan": "JP",
  "South Korea": "KR",
  "Thailand": "TH",
  "Vietnam": "VN",
  "Singapore": "SG",
  "Malaysia": "MY",
  "Indonesia": "ID",
  "Philippines": "PH",
  "India": "IN",
  "Taiwan": "TW",
  "Hong Kong": "HK",
  "Macau": "MO",
  "Cambodia": "KH",
  "Laos": "LA",
  "Myanmar": "MM",
  "Bangladesh": "BD",
  "Sri Lanka": "LK",
  
  // Europe
  "United Kingdom": "GB",
  "France": "FR",
  "Germany": "DE",
  "Italy": "IT",
  "Spain": "ES",
  "Netherlands": "NL",
  "Belgium": "BE",
  "Switzerland": "CH",
  "Austria": "AT",
  "Portugal": "PT",
  "Greece": "GR",
  "Poland": "PL",
  "Czech Republic": "CZ",
  "Hungary": "HU",
  "Sweden": "SE",
  "Norway": "NO",
  "Denmark": "DK",
  "Finland": "FI",
  "Ireland": "IE",
  "Iceland": "IS",
  "Croatia": "HR",
  "Slovenia": "SI",
  "Slovakia": "SK",
  "Romania": "RO",
  "Bulgaria": "BG",
  "Estonia": "EE",
  "Latvia": "LV",
  "Lithuania": "LT",
  "Luxembourg": "LU",
  "Malta": "MT",
  "Cyprus": "CY",
  
  // North America
  "United States": "US",
  "Canada": "CA",
  "Mexico": "MX",
  
  // South America
  "Brazil": "BR",
  "Argentina": "AR",
  "Chile": "CL",
  "Peru": "PE",
  "Colombia": "CO",
  "Venezuela": "VE",
  "Ecuador": "EC",
  "Bolivia": "BO",
  "Paraguay": "PY",
  "Uruguay": "UY",
  "Guyana": "GY",
  "Suriname": "SR",
  
  // Africa
  "South Africa": "ZA",
  "Egypt": "EG",
  "Morocco": "MA",
  "Kenya": "KE",
  "Nigeria": "NG",
  "Ghana": "GH",
  "Tanzania": "TZ",
  "Uganda": "UG",
  "Ethiopia": "ET",
  "Tunisia": "TN",
  "Algeria": "DZ",
  
  // Oceania
  "Australia": "AU",
  "New Zealand": "NZ",
  "Fiji": "FJ",
  
  // Middle East
  "Israel": "IL",
  "Jordan": "JO",
  "Lebanon": "LB",
  "Turkey": "TR",
  "United Arab Emirates": "AE",
  "Saudi Arabia": "SA",
  "Qatar": "QA",
  "Kuwait": "KW",
  "Bahrain": "BH",
  "Oman": "OM",
};

/**
 * Converts a country code to flag emoji
 * Uses Unicode regional indicator symbols (U+1F1E6-U+1F1FF)
 */
function countryCodeToFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return "🏁"; // Fallback flag
  }
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
}

/**
 * Gets flag emoji for a country name
 * @param countryName - The full country name (e.g., "United States", "Japan")
 * @returns Flag emoji string (e.g., "🇺🇸", "🇯🇵") or fallback "🏁"
 */
export function getCountryFlag(countryName: string): string {
  if (!countryName) {
    return "🏁";
  }
  
  // Try exact match first
  const countryCode = countryToCode[countryName];
  if (countryCode) {
    return countryCodeToFlag(countryCode);
  }
  
  // Try partial matches for variations like "Korea" vs "South Korea"
  const normalizedName = countryName.toLowerCase();
  for (const [country, code] of Object.entries(countryToCode)) {
    if (country.toLowerCase().includes(normalizedName) || 
        normalizedName.includes(country.toLowerCase())) {
      return countryCodeToFlag(code);
    }
  }
  
  return "🏁"; // Default fallback flag
}