// Regional mapping for travel search - maps regions to country codes
export const RegionCountriesMap = {
  asia: [
    'JP', 'KR', 'CN', 'TH', 'SG', 'MY', 'VN', 'ID', 'PH', 'IN', 
    'AE', 'QA', 'TW', 'LK', 'MV'
  ],
  europe: [
    'GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'CH', 'AT', 'BE', 'PT', 
    'GR', 'CZ', 'HU', 'PL', 'IE', 'SE', 'DK', 'NO', 'FI', 'HR', 
    'TR', 'RO'
  ],
  americas: [
    'US', 'CA', 'MX', 'BR', 'AR', 'CL', 'PE', 'CO', 'EC', 'UY', 
    'CR', 'PA', 'GT', 'JM', 'BS', 'BB'
  ],
  'south-america': [
    'BR', 'AR', 'CL', 'PE', 'CO', 'EC', 'UY'
  ],
  'north-america': [
    'US', 'CA', 'MX'
  ],
  africa: [
    'EG', 'ZA', 'MA', 'KE', 'ET', 'TZ', 'NG', 'GH', 'SN', 'TN', 
    'DZ', 'UG', 'RW', 'BW', 'ZW'
  ],
  oceania: [
    'AU', 'NZ', 'FJ', 'PF', 'NC', 'VU'
  ]
} as const;

export const CountryNames = {
  // Asia
  JP: 'Japan',
  KR: 'South Korea', 
  CN: 'China',
  TH: 'Thailand',
  SG: 'Singapore',
  MY: 'Malaysia',
  VN: 'Vietnam',
  ID: 'Indonesia',
  PH: 'Philippines',
  IN: 'India',
  AE: 'United Arab Emirates',
  QA: 'Qatar',
  TW: 'Taiwan',
  LK: 'Sri Lanka',
  MV: 'Maldives',
  
  // Europe
  GB: 'United Kingdom',
  FR: 'France',
  DE: 'Germany',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  CH: 'Switzerland',
  AT: 'Austria',
  BE: 'Belgium',
  PT: 'Portugal',
  GR: 'Greece',
  CZ: 'Czech Republic',
  HU: 'Hungary',
  PL: 'Poland',
  IE: 'Ireland',
  SE: 'Sweden',
  DK: 'Denmark',
  NO: 'Norway',
  FI: 'Finland',
  HR: 'Croatia',
  TR: 'Turkey',
  RO: 'Romania',
  
  // Americas
  US: 'United States',
  CA: 'Canada',
  MX: 'Mexico',
  BR: 'Brazil',
  AR: 'Argentina',
  CL: 'Chile',
  PE: 'Peru',
  CO: 'Colombia',
  EC: 'Ecuador',
  UY: 'Uruguay',
  CR: 'Costa Rica',
  PA: 'Panama',
  GT: 'Guatemala',
  JM: 'Jamaica',
  BS: 'Bahamas',
  BB: 'Barbados',
  
  // Africa
  EG: 'Egypt',
  ZA: 'South Africa',
  MA: 'Morocco',
  KE: 'Kenya',
  ET: 'Ethiopia',
  TZ: 'Tanzania',
  NG: 'Nigeria',
  GH: 'Ghana',
  SN: 'Senegal',
  TN: 'Tunisia',
  DZ: 'Algeria',
  UG: 'Uganda',
  RW: 'Rwanda',
  BW: 'Botswana',
  ZW: 'Zimbabwe',
  
  // Oceania
  AU: 'Australia',
  NZ: 'New Zealand',
  FJ: 'Fiji',
  PF: 'French Polynesia',
  NC: 'New Caledonia',
  VU: 'Vanuatu',
} as const;

export type RegionCode = keyof typeof RegionCountriesMap;
export type CountryCode = keyof typeof CountryNames;

// Utility functions
export function getCountriesForRegion(region: RegionCode): readonly string[] {
  return RegionCountriesMap[region] || [];
}

export function getCountryName(countryCode: CountryCode): string {
  return CountryNames[countryCode] || countryCode;
}

export function getRegionForCountry(countryCode: CountryCode): RegionCode | undefined {
  for (const [region, countries] of Object.entries(RegionCountriesMap)) {
    if ((countries as readonly string[]).includes(countryCode)) {
      return region as RegionCode;
    }
  }
  return undefined;
}