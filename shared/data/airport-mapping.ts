/**
 * Airport Code to City Mapping for Cost Comparisons
 * Maps IATA airport codes to city keys in the Claude daily costs database
 */

export const AIRPORT_TO_CITY_MAP: Record<string, string> = {
  // Major US Departure Cities
  'PHX': 'phoenix',           // Phoenix Sky Harbor
  'LAX': 'los-angeles',       // Los Angeles International
  'JFK': 'new-york',         // John F. Kennedy (NYC)
  'LGA': 'new-york',         // LaGuardia (NYC)
  'EWR': 'new-york',         // Newark (NYC area)
  'ORD': 'chicago',          // O'Hare (Chicago)
  'MDW': 'chicago',          // Midway (Chicago)
  'MIA': 'miami',            // Miami International
  'SFO': 'san-francisco',    // San Francisco International
  'SEA': 'seattle',          // Seattle-Tacoma International
  'BOS': 'boston',           // Logan International
  'DEN': 'denver',           // Denver International
  'DFW': 'dallas',           // Dallas/Fort Worth
  'DAL': 'dallas',           // Dallas Love Field
  'IAH': 'houston',          // Houston Intercontinental
  'HOU': 'houston',          // Houston Hobby
  'ATL': 'atlanta',          // Hartsfield-Jackson Atlanta
  'DCA': 'washington-d-c',   // Reagan National (DC)
  'IAD': 'washington-d-c',   // Dulles International (DC)
  'BWI': 'washington-d-c',   // Baltimore-Washington (DC area)
  'PHL': 'philadelphia',     // Philadelphia International
  'SAN': 'san-diego',        // San Diego International
  'LAS': 'las-vegas',        // McCarran International
  'DTW': 'detroit',          // Detroit Metropolitan
  'MSP': 'minneapolis',      // Minneapolis-St. Paul
  'SLC': 'salt-lake-city',   // Salt Lake City International
  'PDX': 'portland',         // Portland International
  'BNA': 'nashville',        // Nashville International
  'CLT': 'charlotte',        // Charlotte Douglas
  'MCI': 'kansas-city',      // Kansas City International
  'PIT': 'pittsburgh',       // Pittsburgh International
  'CLE': 'cleveland',        // Cleveland Hopkins
  'MCO': 'orlando',          // Orlando International
  
  // Canadian Cities
  'YYZ': 'toronto',          // Toronto Pearson
  'YVR': 'vancouver',        // Vancouver International
  'YUL': 'montreal',         // Montreal-Trudeau
  'YOW': 'ottawa',           // Ottawa Macdonald-Cartier
  'YYC': 'calgary',          // Calgary International
  'YQB': 'quebec-city',      // Quebec City Jean Lesage
  
  // International Destinations (Major Hubs)
  'LHR': 'london',           // London Heathrow
  'LGW': 'london',           // London Gatwick
  'CDG': 'paris',            // Paris Charles de Gaulle
  'ORY': 'paris',            // Paris Orly
  'FCO': 'rome',             // Rome Fiumicino
  'CIA': 'rome',             // Rome Ciampino
  'BCN': 'barcelona',        // Barcelona El Prat
  'MAD': 'madrid',           // Madrid Barajas
  'AMS': 'amsterdam',        // Amsterdam Schiphol
  'FRA': 'frankfurt',        // Frankfurt Main
  'MUC': 'hamburg',          // Munich (closest match)
  'ZUR': 'zurich',           // Zurich Airport
  'CPH': 'copenhagen',       // Copenhagen Kastrup
  'ARN': 'stockholm',        // Stockholm Arlanda
  'OSL': 'oslo',             // Oslo Gardermoen
  'KEF': 'reykjavik',        // Keflavik (Reykjavik)
  'LIS': 'lisbon',           // Lisbon Portela
  'OPO': 'porto',            // Porto Airport
  'PRG': 'prague',           // Prague Vaclav Havel
  'BUD': 'budapest',         // Budapest Ferenc Liszt
  'DUB': 'dublin',           // Dublin Airport
  'BRU': 'brussels',         // Brussels Airport
  'VIE': 'vienna',           // Vienna International
  'BER': 'berlin',           // Berlin Brandenburg
  'ATH': 'athens',           // Athens International
  'JTR': 'santorini',        // Santorini Airport
  'WAW': 'warsaw',           // Warsaw Chopin
  'KRK': 'krakow',           // Krakow Airport
  'HEL': 'helsinki',         // Helsinki Vantaa
  'ZAG': 'zagreb',           // Zagreb Airport
  'DBV': 'dubrovnik',        // Dubrovnik Airport
  'AYT': 'antalya',          // Antalya Airport
  'IST': 'istanbul',         // Istanbul Airport
  'SAW': 'istanbul',         // Istanbul Sabiha Gokcen
  'OTP': 'bucharest',        // Bucharest Henri Coanda
  'MAN': 'manchester',       // Manchester Airport
  
  // Asia Pacific
  'NRT': 'tokyo',            // Tokyo Narita
  'HND': 'tokyo',            // Tokyo Haneda
  'ICN': 'seoul',            // Seoul Incheon
  'GMP': 'seoul',            // Seoul Gimpo
  'SIN': 'singapore',        // Singapore Changi
  'BKK': 'bangkok',          // Bangkok Suvarnabhumi
  'DMK': 'bangkok',          // Bangkok Don Mueang
  'KUL': 'kuala-lumpur',     // Kuala Lumpur International
  'SGN': 'ho-chi-minh-city', // Ho Chi Minh City
  'CGK': 'jakarta',          // Jakarta Soekarno-Hatta
  'MNL': 'manila',           // Manila Ninoy Aquino
  'BOM': 'mumbai',           // Mumbai Chhatrapati Shivaji
  'DEL': 'delhi',            // Delhi Indira Gandhi
  'DXB': 'dubai',            // Dubai International
  'DWC': 'dubai',            // Dubai World Central
  'DOH': 'doha',             // Doha Hamad International
  'HKG': 'hong-kong',        // Hong Kong International
  'PVG': 'shanghai',         // Shanghai Pudong
  'SHA': 'shanghai',         // Shanghai Hongqiao
  'PEK': 'beijing',          // Beijing Capital
  'PKX': 'beijing',          // Beijing Daxing
  'CAN': 'guangzhou',        // Guangzhou Baiyun
  'CNX': 'chiang-mai',       // Chiang Mai International
  'HKT': 'phuket',           // Phuket International
  'PEN': 'penang',           // Penang International
  'CEB': 'cebu',             // Cebu Mactan
  'BLR': 'bangalore',        // Bangalore Kempegowda
  'MAA': 'chennai',          // Chennai International
  'AUH': 'abu-dhabi',        // Abu Dhabi International
  'TPE': 'taipei',           // Taipei Taoyuan
  'TSA': 'taipei',           // Taipei Songshan
  'CMB': 'colombo',          // Colombo Bandaranaike
  'MLE': 'male',             // Male Ibrahim Nasir
  'DPS': 'bali',             // Bali Ngurah Rai
  
  // Oceania
  'SYD': 'sydney',           // Sydney Kingsford Smith
  'MEL': 'melbourne',        // Melbourne Tullamarine
  'BNE': 'brisbane',         // Brisbane Airport
  'PER': 'perth',            // Perth Airport
  'ADL': 'adelaide',         // Adelaide Airport
  'OOL': 'gold-coast',       // Gold Coast Airport
  'CNS': 'cairns',           // Cairns Airport
  'AKL': 'auckland',         // Auckland Airport
  'WLG': 'wellington',       // Wellington Airport
  'CHC': 'christchurch',     // Christchurch Airport
  'ZQN': 'queenstown',       // Queenstown Airport
  
  // Latin America
  'MEX': 'mexico-city',      // Mexico City International
  'CUN': 'cancun',           // Cancun International
  'PVR': 'puerto-vallarta',  // Puerto Vallarta
  'ACA': 'acapulco',         // Acapulco International
  'GIG': 'rio-de-janeiro',   // Rio de Janeiro Galeao
  'SDU': 'rio-de-janeiro',   // Rio de Janeiro Santos Dumont
  'GRU': 'sao-paulo',        // Sao Paulo Guarulhos
  'CGH': 'sao-paulo',        // Sao Paulo Congonhas
  'EZE': 'buenos-aires',     // Buenos Aires Ezeiza
  'AEP': 'buenos-aires',     // Buenos Aires Jorge Newbery
  'SCL': 'santiago',         // Santiago Arturo Merino
  'LIM': 'lima',             // Lima Jorge Chavez
  'BOG': 'bogota',           // Bogota El Dorado
  'SJO': 'san-jose-costa-rica', // San Jose Juan Santamaria
  'PTY': 'panama-city',      // Panama City Tocumen
  'GUA': 'guatemala-city',   // Guatemala City La Aurora
  'SAL': 'san-salvador',     // San Salvador International
  'TGU': 'tegucigalpa',      // Tegucigalpa Toncontin
  'MGA': 'managua',          // Managua Augusto Sandino
  'KIN': 'kingston',         // Kingston Norman Manley
  'SDQ': 'santo-domingo',    // Santo Domingo Las Americas
  'PAP': 'port-au-prince',   // Port-au-Prince Toussaint
  'NAS': 'nassau',           // Nassau Lynden Pindling
  'BGI': 'bridgetown',       // Bridgetown Grantley Adams
  'POS': 'port-of-spain',    // Port of Spain Piarco
  'SSA': 'salvador',         // Salvador Luis Eduardo
  'FOR': 'fortaleza',        // Fortaleza Pinto Martins
  'BSB': 'brasilia',         // Brasilia Juscelino Kubitschek
  'MAO': 'manaus',           // Manaus Eduardo Gomes
  'CWB': 'curitiba',         // Curitiba Afonso Pena
  'MDE': 'medellin',         // Medellin Jose Maria Cordova
  'CTG': 'cartagena',        // Cartagena Rafael Nunez
  'UIO': 'quito',            // Quito Mariscal Sucre
  'GYE': 'guayaquil',        // Guayaquil Jose Joaquin Olmedo
  'AQP': 'arequipa',         // Arequipa Rodriguez Ballon
  'SRE': 'sucre',            // Sucre Juana Azurduy
  'VVI': 'santa-cruz',       // Santa Cruz Viru Viru
  'ASU': 'asuncion',         // Asuncion Silvio Pettirossi
  'MVD': 'montevideo',       // Montevideo Carrasco
  'PDP': 'punta-del-este',   // Punta del Este
  'CCS': 'caracas',          // Caracas Simon Bolivar
  
  // Africa
  'CAI': 'cairo',            // Cairo International
  'HRG': 'cairo',            // Hurghada (closest to Cairo)
  'CPT': 'cape-town',        // Cape Town International
  'JNB': 'johannesburg',     // Johannesburg OR Tambo
  'DUR': 'durban',           // Durban King Shaka
  'CMN': 'casablanca',       // Casablanca Mohammed V
  'RAK': 'marrakech',        // Marrakech Menara
  'NBO': 'nairobi',          // Nairobi Jomo Kenyatta
  'ADD': 'addis-ababa',      // Addis Ababa Bole
  'LOS': 'lagos',            // Lagos Murtala Muhammed
  'ACC': 'accra',            // Accra Kotoka
  'TUN': 'tunis',            // Tunis Carthage
  'ALG': 'tunis'             // Algiers (closest match to Tunis)
};

/**
 * Helper function to get city key from airport code
 */
export function getCityFromAirport(airportCode: string): string | null {
  const normalizedCode = airportCode.toUpperCase().trim();
  return AIRPORT_TO_CITY_MAP[normalizedCode] || null;
}

/**
 * Helper function to check if airport code is supported
 */
export function isAirportSupported(airportCode: string): boolean {
  const normalizedCode = airportCode.toUpperCase().trim();
  return normalizedCode in AIRPORT_TO_CITY_MAP;
}

/**
 * Get all supported airport codes
 */
export function getSupportedAirports(): string[] {
  return Object.keys(AIRPORT_TO_CITY_MAP);
}

/**
 * Search for airports by partial code or city name
 */
export function searchAirports(query: string): Array<{airport: string, city: string}> {
  const normalizedQuery = query.toLowerCase().trim();
  const results: Array<{airport: string, city: string}> = [];
  
  for (const [airport, city] of Object.entries(AIRPORT_TO_CITY_MAP)) {
    if (airport.toLowerCase().includes(normalizedQuery) || 
        city.toLowerCase().includes(normalizedQuery)) {
      results.push({ airport, city });
    }
  }
  
  return results;
}