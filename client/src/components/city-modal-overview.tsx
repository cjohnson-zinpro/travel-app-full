import React from 'react';
import { CityRecommendation } from '@shared/schema';

type CityOverviewProps = {
  city: CityRecommendation;
  origin?: string;
  comparisonText?: string;
};

// Sample data for popular cities (in production this would come from a database or CMS)
const CITY_DATA: Record<string, { topAttractions: string[]; sampleItinerary: string[]; mapUrl?: string }> = {
  tokyo: {
    topAttractions: [
      "Senso-ji Temple & Asakusa district",
      "Shibuya Crossing & Harajuku",
      "Tsukiji Outer Market & Ginza"
    ],
    sampleItinerary: [
      "Morning: Visit Senso-ji Temple and explore Asakusa's traditional streets",
      "Afternoon: Shop in Ginza and experience the energy of Shibuya Crossing",
      "Evening: Try authentic sushi in Tsukiji and enjoy Tokyo's neon lights"
    ],
    mapUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop"
  },
  paris: {
    topAttractions: [
      "Eiffel Tower & Trocadéro Gardens",
      "Louvre Museum & Tuileries Garden",
      "Notre-Dame Cathedral & Île de la Cité"
    ],
    sampleItinerary: [
      "Morning: Climb the Eiffel Tower and stroll through Trocadéro Gardens",
      "Afternoon: Explore the Louvre's masterpieces and relax in Tuileries",
      "Evening: Visit Notre-Dame area and dine at a traditional bistro"
    ],
    mapUrl: "https://source.unsplash.com/300x200/?paris,eiffel-tower"
  },
  london: {
    topAttractions: [
      "Tower of London & Tower Bridge",
      "British Museum & Covent Garden",
      "Big Ben, Westminster Abbey & Parliament"
    ],
    sampleItinerary: [
      "Morning: Tour the Tower of London and walk across Tower Bridge",
      "Afternoon: Explore the British Museum and browse Covent Garden markets",
      "Evening: See Big Ben at sunset and enjoy traditional pub dinner"
    ],
    mapUrl: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=300&h=200&fit=crop"
  },
  bangkok: {
    topAttractions: [
      "Grand Palace & Wat Phra Kaew",
      "Wat Arun (Temple of Dawn)",
      "Chatuchak Weekend Market"
    ],
    sampleItinerary: [
      "Morning: Explore the ornate Grand Palace and Emerald Buddha Temple",
      "Afternoon: Take a river boat to Wat Arun and climb for city views",
      "Evening: Browse Chatuchak Market and try authentic street food"
    ],
    mapUrl: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=300&h=200&fit=crop"
  },
  "new york": {
    topAttractions: [
      "Central Park & Metropolitan Museum",
      "Times Square & Broadway",
      "Statue of Liberty & 9/11 Memorial"
    ],
    sampleItinerary: [
      "Morning: Walk through Central Park and visit the Metropolitan Museum",
      "Afternoon: Experience the energy of Times Square and see a Broadway show",
      "Evening: Take ferry to Statue of Liberty and reflect at 9/11 Memorial"
    ],
    mapUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300&h=200&fit=crop"
  },
  rome: {
    topAttractions: [
      "Colosseum & Roman Forum",
      "Vatican City & St. Peter's Basilica",
      "Trevi Fountain & Spanish Steps"
    ],
    sampleItinerary: [
      "Morning: Tour the ancient Colosseum and walk through Roman Forum",
      "Afternoon: Explore Vatican Museums and admire St. Peter's Basilica",
      "Evening: Toss a coin in Trevi Fountain and climb the Spanish Steps"
    ],
    mapUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300&h=200&fit=crop"
  },
  barcelona: {
    topAttractions: [
      "Sagrada Familia & Park Güell (Gaudí)",
      "Las Ramblas & Gothic Quarter",
      "Barcelona Beach & Port Olímpic"
    ],
    sampleItinerary: [
      "Morning: Marvel at Sagrada Familia and explore colorful Park Güell",
      "Afternoon: Stroll Las Ramblas and get lost in the Gothic Quarter",
      "Evening: Relax on Barcelona Beach and enjoy seafood by the port"
    ],
    mapUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=300&h=200&fit=crop"
  },
  sydney: {
    topAttractions: [
      "Sydney Opera House & Harbour Bridge",
      "Bondi Beach & Coastal Walk",
      "The Rocks & Circular Quay"
    ],
    sampleItinerary: [
      "Morning: Tour Sydney Opera House and walk across Harbour Bridge",
      "Afternoon: Surf at Bondi Beach and take the scenic coastal walk",
      "Evening: Explore The Rocks markets and dine at Circular Quay"
    ],
    mapUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=300&h=200&fit=crop"
  },
  amsterdam: {
    topAttractions: [
      "Anne Frank House & Jordaan District",
      "Van Gogh Museum & Museumplein",
      "Canal cruises & Vondelpark"
    ],
    sampleItinerary: [
      "Morning: Visit Anne Frank House and walk through historic Jordaan",
      "Afternoon: Explore Van Gogh Museum and relax in Vondelpark",
      "Evening: Take a canal cruise and enjoy Dutch cuisine"
    ],
    mapUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=300&h=200&fit=crop"
  },
  berlin: {
    topAttractions: [
      "Brandenburg Gate & Unter den Linden",
      "Berlin Wall Memorial & East Side Gallery",
      "Museum Island & Alexanderplatz"
    ],
    sampleItinerary: [
      "Morning: Walk through Brandenburg Gate and historic Unter den Linden",
      "Afternoon: Visit Berlin Wall Memorial and see East Side Gallery",
      "Evening: Explore Museum Island and climb Alexanderplatz TV Tower"
    ],
    mapUrl: "https://images.unsplash.com/photo-1567949884641-6d9d7fd6bbf2?w=300&h=200&fit=crop"
  },
  vienna: {
    topAttractions: [
      "Schönbrunn Palace & Gardens",
      "St. Stephen's Cathedral & Ringstrasse",
      "Belvedere Palace & Naschmarkt"
    ],
    sampleItinerary: [
      "Morning: Tour magnificent Schönbrunn Palace and gardens",
      "Afternoon: Visit St. Stephen's Cathedral and walk the Ringstrasse",
      "Evening: See art at Belvedere Palace and browse Naschmarkt"
    ],
    mapUrl: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=300&h=200&fit=crop"
  },
  prague: {
    topAttractions: [
      "Prague Castle & Lesser Town",
      "Charles Bridge & Old Town Square",
      "Jewish Quarter & Wenceslas Square"
    ],
    sampleItinerary: [
      "Morning: Explore Prague Castle and wander Lesser Town",
      "Afternoon: Cross historic Charles Bridge to Old Town Square",
      "Evening: Discover Jewish Quarter and enjoy Czech beer"
    ],
    mapUrl: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=300&h=200&fit=crop"
  },
  budapest: {
    topAttractions: [
      "Buda Castle & Fisherman's Bastion",
      "Parliament Building & Danube River",
      "Széchenyi Thermal Baths & Great Market Hall"
    ],
    sampleItinerary: [
      "Morning: Visit Buda Castle and enjoy views from Fisherman's Bastion",
      "Afternoon: Tour Parliament Building and walk along Danube",
      "Evening: Relax in Széchenyi Baths and shop at Great Market Hall"
    ],
    mapUrl: "https://images.unsplash.com/photo-1565009373350-9a1b0c3b3bc9?w=300&h=200&fit=crop"
  },
  istanbul: {
    topAttractions: [
      "Hagia Sophia & Blue Mosque",
      "Grand Bazaar & Topkapi Palace",
      "Galata Tower & Bosphorus Cruise"
    ],
    sampleItinerary: [
      "Morning: Marvel at Hagia Sophia and Blue Mosque architecture",
      "Afternoon: Shop in Grand Bazaar and explore Topkapi Palace",
      "Evening: Climb Galata Tower and take Bosphorus sunset cruise"
    ],
    mapUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=300&h=200&fit=crop"
  },
  lisbon: {
    topAttractions: [
      "Belém Tower & Jerónimos Monastery",
      "Alfama District & Fado Houses",
      "Tram 28 & Miradouro da Senhora do Monte"
    ],
    sampleItinerary: [
      "Morning: Visit Belém Tower and historic Jerónimos Monastery",
      "Afternoon: Wander through Alfama and listen to traditional Fado",
      "Evening: Ride iconic Tram 28 and watch sunset from miradouro"
    ],
    mapUrl: "https://images.unsplash.com/photo-1513735718999-de8ad3d82e5d?w=300&h=200&fit=crop"
  },
  dubai: {
    topAttractions: [
      "Burj Khalifa & Dubai Mall",
      "Dubai Marina & Palm Jumeirah",
      "Desert Safari & Gold Souk"
    ],
    sampleItinerary: [
      "Morning: Ascend Burj Khalifa and shop at Dubai Mall",
      "Afternoon: Explore Dubai Marina and visit Palm Jumeirah",
      "Evening: Experience desert safari and browse traditional Gold Souk"
    ],
    mapUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=300&h=200&fit=crop"
  },
  singapore: {
    topAttractions: [
      "Gardens by the Bay & Marina Bay Sands",
      "Sentosa Island & Universal Studios",
      "Chinatown & Little India"
    ],
    sampleItinerary: [
      "Morning: Explore futuristic Gardens by the Bay and Marina Bay Sands",
      "Afternoon: Have fun at Sentosa Island and Universal Studios",
      "Evening: Experience diverse cultures in Chinatown and Little India"
    ],
    mapUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=300&h=200&fit=crop"
  },
  // MAJOR ASIAN CITIES
  seoul: {
    topAttractions: [
      "Gyeongbokgung Palace & Bukchon Hanok Village",
      "Myeongdong Shopping & N Seoul Tower",
      "Gangnam District & Han River"
    ],
    sampleItinerary: [
      "Morning: Watch changing of guard at Gyeongbokgung and explore traditional Bukchon",
      "Afternoon: Shop in Myeongdong and enjoy panoramic views from N Seoul Tower",
      "Evening: Experience vibrant Gangnam district and picnic by Han River"
    ]
  },
  mumbai: {
    topAttractions: [
      "Gateway of India & Taj Mahal Palace Hotel",
      "Marine Drive & Chhatrapati Shivaji Terminus",
      "Bollywood Film City & Elephanta Caves"
    ],
    sampleItinerary: [
      "Morning: Visit iconic Gateway of India and admire colonial architecture",
      "Afternoon: Walk along Marine Drive and explore bustling CST station",
      "Evening: Take ferry to Elephanta Caves or tour Bollywood studios"
    ]
  },
  delhi: {
    topAttractions: [
      "Red Fort & Jama Masjid",
      "India Gate & Lotus Temple",
      "Qutub Minar & Humayun's Tomb"
    ],
    sampleItinerary: [
      "Morning: Explore Red Fort and pray at beautiful Jama Masjid",
      "Afternoon: Pay respects at India Gate and meditate at Lotus Temple",
      "Evening: Visit UNESCO sites Qutub Minar and Humayun's Tomb"
    ]
  },
  "hong-kong": {
    topAttractions: [
      "Victoria Peak & Star Ferry",
      "Temple Street Night Market & Symphony of Lights",
      "Big Buddha & Tian Tan Buddha"
    ],
    sampleItinerary: [
      "Morning: Take Peak Tram to Victoria Peak for spectacular harbor views",
      "Afternoon: Ride historic Star Ferry and explore Temple Street Market",
      "Evening: Watch Symphony of Lights and visit Big Buddha on Lantau Island"
    ]
  },
  shanghai: {
    topAttractions: [
      "The Bund & Oriental Pearl Tower",
      "Yu Garden & Shanghai Museum",
      "French Concession & Tianzifang"
    ],
    sampleItinerary: [
      "Morning: Walk The Bund waterfront and ascend Oriental Pearl Tower",
      "Afternoon: Explore traditional Yu Garden and world-class Shanghai Museum",
      "Evening: Stroll tree-lined French Concession and shop in artsy Tianzifang"
    ]
  },
  beijing: {
    topAttractions: [
      "Forbidden City & Tiananmen Square",
      "Great Wall of China (Mutianyu section)",
      "Temple of Heaven & Summer Palace"
    ],
    sampleItinerary: [
      "Morning: Tour the magnificent Forbidden City and vast Tiananmen Square",
      "Afternoon: Hike the Great Wall at less crowded Mutianyu section",
      "Evening: Admire architecture at Temple of Heaven and stroll Summer Palace gardens"
    ]
  },
  "kuala-lumpur": {
    topAttractions: [
      "Petronas Twin Towers & KLCC Park",
      "Batu Caves & Central Market",
      "Chinatown & Little India"
    ],
    sampleItinerary: [
      "Morning: Marvel at Petronas Towers and relax in KLCC Park",
      "Afternoon: Climb colorful Batu Caves and browse Central Market handicrafts",
      "Evening: Explore diverse cultures in bustling Chinatown and Little India"
    ]
  },
  // MAJOR EUROPEAN CITIES
  madrid: {
    topAttractions: [
      "Prado Museum & Retiro Park",
      "Royal Palace & Plaza Mayor",
      "Reina Sofia Museum & Gran Via"
    ],
    sampleItinerary: [
      "Morning: Admire masterpieces at Prado Museum and stroll through Retiro Park",
      "Afternoon: Tour opulent Royal Palace and enjoy tapas at Plaza Mayor",
      "Evening: See Picasso's Guernica at Reina Sofia and shop along Gran Via"
    ]
  },
  zurich: {
    topAttractions: [
      "Lake Zurich & Uetliberg Mountain",
      "Old Town & Grossmünster",
      "Bahnhofstrasse Shopping & Swiss National Museum"
    ],
    sampleItinerary: [
      "Morning: Cruise Lake Zurich and hike up Uetliberg for panoramic views",
      "Afternoon: Wander medieval Old Town and climb Grossmünster towers",
      "Evening: Shop luxury Bahnhofstrasse and explore Swiss culture at National Museum"
    ]
  },
  stockholm: {
    topAttractions: [
      "Gamla Stan & Royal Palace",
      "Vasa Museum & Skansen Open-Air Museum",
      "ABBA Museum & Fotografiska"
    ],
    sampleItinerary: [
      "Morning: Explore cobblestone Gamla Stan and tour the Royal Palace",
      "Afternoon: Marvel at preserved Vasa ship and experience Swedish culture at Skansen",
      "Evening: Sing along at ABBA Museum and see contemporary art at Fotografiska"
    ]
  },
  oslo: {
    topAttractions: [
      "Viking Ship Museum & Fram Museum",
      "Opera House & Vigeland Sculpture Park",
      "Akershus Fortress & Munch Museum"
    ],
    sampleItinerary: [
      "Morning: Discover Viking history and polar exploration at Bygdøy museums",
      "Afternoon: Walk on Opera House roof and admire sculptures at Vigeland Park",
      "Evening: Explore medieval Akershus Fortress and see 'The Scream' at Munch Museum"
    ]
  },
  reykjavik: {
    topAttractions: [
      "Blue Lagoon & Golden Circle",
      "Hallgrímskirkja Church & Harpa Concert Hall",
      "Northern Lights & Whale Watching"
    ],
    sampleItinerary: [
      "Morning: Relax in geothermal Blue Lagoon and tour Golden Circle attractions",
      "Afternoon: Climb Hallgrímskirkja for city views and admire modern Harpa architecture",
      "Evening: Hunt for Northern Lights or take whale watching tour from harbor"
    ]
  },
  // AMERICAS
  "los-angeles": {
    topAttractions: [
      "Hollywood Sign & Walk of Fame",
      "Santa Monica Pier & Venice Beach",
      "Getty Center & Griffith Observatory"
    ],
    sampleItinerary: [
      "Morning: Hike to Hollywood Sign and stroll famous Walk of Fame",
      "Afternoon: Enjoy Santa Monica Pier rides and explore eclectic Venice Beach",
      "Evening: Visit world-class Getty Center and stargaze at Griffith Observatory"
    ]
  },
  "san-francisco": {
    topAttractions: [
      "Golden Gate Bridge & Alcatraz Island",
      "Fisherman's Wharf & Pier 39",
      "Lombard Street & Chinatown"
    ],
    sampleItinerary: [
      "Morning: Walk across iconic Golden Gate Bridge and tour former prison Alcatraz",
      "Afternoon: Watch sea lions at Pier 39 and sample clam chowder at Fisherman's Wharf",
      "Evening: Drive down 'crookedest street' Lombard and dine in historic Chinatown"
    ]
  },
  chicago: {
    topAttractions: [
      "Millennium Park & Cloud Gate",
      "Navy Pier & Architecture Boat Tour",
      "Art Institute & Lincoln Park Zoo"
    ],
    sampleItinerary: [
      "Morning: See 'The Bean' at Millennium Park and take architecture boat tour",
      "Afternoon: Enjoy Navy Pier attractions and world-renowned Art Institute",
      "Evening: Visit free Lincoln Park Zoo and try deep-dish pizza"
    ]
  },
  miami: {
    topAttractions: [
      "South Beach & Art Deco District",
      "Little Havana & Wynwood Walls",
      "Everglades National Park & Key Biscayne"
    ],
    sampleItinerary: [
      "Morning: Sunbathe at South Beach and admire Art Deco architecture",
      "Afternoon: Experience Cuban culture in Little Havana and see street art at Wynwood",
      "Evening: Take airboat tour in Everglades or relax at Key Biscayne beaches"
    ]
  },
  toronto: {
    topAttractions: [
      "CN Tower & Ripley's Aquarium",
      "Royal Ontario Museum & Casa Loma",
      "St. Lawrence Market & Harbourfront"
    ],
    sampleItinerary: [
      "Morning: Ascend CN Tower and explore marine life at Ripley's Aquarium",
      "Afternoon: Discover artifacts at ROM and tour fairytale Casa Loma castle",
      "Evening: Sample local foods at St. Lawrence Market and stroll scenic Harbourfront"
    ]
  },
  vancouver: {
    topAttractions: [
      "Stanley Park & Capilano Suspension Bridge",
      "Granville Island & Gastown",
      "Grouse Mountain & English Bay"
    ],
    sampleItinerary: [
      "Morning: Bike through Stanley Park and cross thrilling Capilano Bridge",
      "Afternoon: Browse Granville Island Public Market and explore historic Gastown",
      "Evening: Take gondola up Grouse Mountain and watch sunset at English Bay"
    ]
  },
  "mexico-city": {
    topAttractions: [
      "Zócalo & Metropolitan Cathedral",
      "Frida Kahlo Museum & Xochimilco",
      "Teotihuacan Pyramids & Chapultepec Park"
    ],
    sampleItinerary: [
      "Morning: Explore massive Zócalo square and magnificent Metropolitan Cathedral",
      "Afternoon: Visit Frida Kahlo's Blue House and float through Xochimilco canals",
      "Evening: Climb ancient Teotihuacan pyramids or picnic in Chapultepec Park"
    ]
  },
  // OCEANIA
  melbourne: {
    topAttractions: [
      "Federation Square & Flinders Street Station",
      "Royal Botanic Gardens & Eureka Skydeck",
      "Great Ocean Road & Phillip Island"
    ],
    sampleItinerary: [
      "Morning: Start at Federation Square and admire iconic Flinders Street Station",
      "Afternoon: Relax in Royal Botanic Gardens and get city views from Eureka Skydeck",
      "Evening: Take Great Ocean Road day trip or watch penguin parade at Phillip Island"
    ]
  },
  // MIDDLE EAST
  doha: {
    topAttractions: [
      "Museum of Islamic Art & Corniche",
      "Souq Waqif & Katara Cultural Village",
      "Desert Safari & Pearl Monument"
    ],
    sampleItinerary: [
      "Morning: Explore world-class Islamic Art Museum and walk the scenic Corniche",
      "Afternoon: Browse traditional Souq Waqif and experience culture at Katara Village",
      "Evening: Take desert safari adventure or admire modern Pearl Monument"
    ]
  },
  "abu-dhabi": {
    topAttractions: [
      "Sheikh Zayed Grand Mosque & Louvre Abu Dhabi",
      "Yas Island & Ferrari World",
      "Emirates Palace & Corniche Beach"
    ],
    sampleItinerary: [
      "Morning: Marvel at stunning Sheikh Zayed Mosque and explore Louvre Abu Dhabi",
      "Afternoon: Experience thrills at Ferrari World on entertainment hub Yas Island",
      "Evening: Tour luxurious Emirates Palace and relax at pristine Corniche Beach"
    ]
  },
  // AFRICA
  cairo: {
    topAttractions: [
      "Pyramids of Giza & Sphinx",
      "Egyptian Museum & Khan el-Khalili",
      "Coptic Cairo & Citadel of Saladin"
    ],
    sampleItinerary: [
      "Morning: Wonder at ancient Pyramids of Giza and mysterious Sphinx",
      "Afternoon: Discover treasures at Egyptian Museum and shop at Khan el-Khalili bazaar",
      "Evening: Explore Christian heritage in Coptic Cairo and medieval Citadel"
    ]
  },
  "cape-town": {
    topAttractions: [
      "Table Mountain & V&A Waterfront",
      "Robben Island & Bo-Kaap",
      "Cape Point & Penguin Colony"
    ],
    sampleItinerary: [
      "Morning: Cable car up Table Mountain and explore V&A Waterfront shopping",
      "Afternoon: Take ferry to historic Robben Island and walk colorful Bo-Kaap streets",
      "Evening: Drive to dramatic Cape Point and visit adorable penguin colony"
    ]
  },
  marrakech: {
    topAttractions: [
      "Jemaa el-Fnaa & Koutoubia Mosque",
      "Bahia Palace & Saadian Tombs",
      "Atlas Mountains & Majorelle Garden"
    ],
    sampleItinerary: [
      "Morning: Experience bustling Jemaa el-Fnaa square and admire Koutoubia Mosque",
      "Afternoon: Tour ornate Bahia Palace and discover ancient Saadian Tombs",
      "Evening: Take Atlas Mountains day trip or stroll peaceful Majorelle Garden"
    ]
  }
};

export function CityModalOverview({ city, origin, comparisonText }: CityOverviewProps) {
  const {
    city: name,
    country,
    region,
    safetyScore,
    safetyLabel,
    breakdown,
    cityId
  } = city;

  // Calculate daily budget from breakdown data
  const dailyBudget = breakdown?.dailyPerDay || 0;
  
  // Extract airport info - use cityId as nearest airport code
  const nearestAirport = cityId || '—';
  const transferTime = cityId ? 'Direct flights available' : 'Check connections';

  // Get sample data for the city
  const cityKey = name.toLowerCase();
  const cityData = CITY_DATA[cityKey];
  const finalAttractions = cityData?.topAttractions || [];
  const finalItinerary = cityData?.sampleItinerary || [];
  
  // For now, use a reliable placeholder system instead of external images
  // In production, these would be hosted locally or on a CDN
  const finalMapUrl = createCityPlaceholder(name);

  // Debug: log if we found data for this city
  if (process.env.NODE_ENV === 'development') {
    console.log(`🏙️ City Overview for ${name}:`, {
      cityKey,
      hasData: !!cityData,
      imageUrl: finalMapUrl,
      attractions: finalAttractions.length,
      itinerary: finalItinerary.length
    });
  }

  // Create a city-themed placeholder image
  function createCityPlaceholder(cityName: string): string {
    const cityColors: Record<string, { bg: string; accent: string; icon: string }> = {
      paris: { bg: '#f3e8ff', accent: '#8b5cf6', icon: '⚡' },
      london: { bg: '#f0f9ff', accent: '#0ea5e9', icon: '★' },
      tokyo: { bg: '#fef3c7', accent: '#f59e0b', icon: '◆' },
      'new york': { bg: '#f3f4f6', accent: '#6b7280', icon: '●' },
      rome: { bg: '#fef2f2', accent: '#ef4444', icon: '♦' },
      barcelona: { bg: '#ecfdf5', accent: '#10b981', icon: '▲' },
      sydney: { bg: '#fdf4ff', accent: '#d946ef', icon: '◉' },
      amsterdam: { bg: '#f0fdfa', accent: '#14b8a6', icon: '◈' },
      berlin: { bg: '#f5f3ff', accent: '#7c3aed', icon: '■' },
      default: { bg: '#f8fafc', accent: '#64748b', icon: '◯' }
    };
    
    const colors = cityColors[cityName.toLowerCase()] || cityColors.default;
    
    // Use URL encoding instead of base64 to avoid btoa issues with special characters
    const svgContent = `
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.4" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#cityGrad)"/>
        <circle cx="75" cy="60" r="25" fill="${colors.accent}" opacity="0.15"/>
        <circle cx="200" cy="80" r="35" fill="${colors.accent}" opacity="0.1"/>
        <circle cx="250" cy="120" r="20" fill="${colors.accent}" opacity="0.2"/>
        <text x="150" y="85" text-anchor="middle" dy=".3em" fill="${colors.accent}" font-family="Arial, sans-serif" font-size="24" font-weight="bold">${colors.icon}</text>
        <text x="150" y="115" text-anchor="middle" dy=".3em" fill="${colors.accent}" font-family="Arial, sans-serif" font-size="18" font-weight="bold">${cityName}</text>
        <text x="150" y="135" text-anchor="middle" dy=".3em" fill="${colors.accent}" font-family="Arial, sans-serif" font-size="12" opacity="0.8">City Overview</text>
      </svg>
    `.trim();
    
    return 'data:image/svg+xml,' + encodeURIComponent(svgContent);
  }

  const safetyDisplayLabel =
    safetyLabel ||
    (safetyScore === undefined
      ? 'Unknown'
      : safetyScore >= 80
      ? 'Low Risk'
      : safetyScore >= 60
      ? 'Moderate Risk'
      : 'Higher Risk');

  // Clean up comparison text - remove duplicate percentages
  const cleanComparisonText = comparisonText 
    ? comparisonText.replace(/(\+?\d+%)\s+\d+%/, '$1') // Remove duplicate percentage
    : '≈ Similar costs';

  // Function to open Google Maps
  const openGoogleMaps = () => {
    const query = encodeURIComponent(`${name}, ${country}`);
    const googleMapsUrl = `https://www.google.com/maps/search/${query}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div className="space-y-6" data-testid="city-modal-overview">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-card rounded-lg">
              <div className="text-sm text-muted-foreground">Compared to {origin || 'your city'}</div>
              <div className="text-xl font-semibold">{cleanComparisonText}</div>
              <div className="text-xs text-muted-foreground">Cost difference</div>
            </div>

            <div className="p-4 bg-card rounded-lg">
              <div className="text-sm text-muted-foreground">Nearest airport</div>
              <div className="text-lg font-medium">{nearestAirport}</div>
              <div className="text-xs text-muted-foreground">{transferTime}</div>
            </div>
          </div>

          <div className="p-4 bg-card rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Top sights</h4>
            <ul className="text-sm list-disc pl-5 space-y-1">
              {finalAttractions.slice(0, 3).map((a, i) => (
                <li key={i}>{a}</li>
              ))}
              {finalAttractions.length === 0 && <li className="text-muted-foreground">Popular attractions data coming soon</li>}
            </ul>
          </div>

          <div className="p-4 bg-card rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Sample 1-day itinerary</h4>
            <ol className="text-sm list-decimal pl-5 space-y-1">
              {finalItinerary.length > 0 ? (
                finalItinerary.map((s, i) => <li key={i}>{s}</li>)
              ) : (
                <li className="text-muted-foreground">Detailed itinerary suggestions coming soon</li>
              )}
            </ol>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-card rounded-lg overflow-hidden shadow-sm w-full cursor-pointer hover:shadow-md transition-shadow"
               onClick={openGoogleMaps}>
            <div className="w-full h-36 bg-gray-50 relative overflow-hidden">
              <img
                src={finalMapUrl}
                alt={`${name} city overview`}
                className="w-full h-full object-cover transition-transform hover:scale-105"
                onError={(e) => {
                  console.warn(`Image fallback triggered for ${name}`);
                  // This should rarely happen since we're using SVG data URLs
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                onLoad={() => {
                  console.log(`✅ City image loaded for ${name}`);
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
                <div className="text-white opacity-0 hover:opacity-100 transition-opacity font-medium text-sm">
                  🗺️ Open in Google Maps
                </div>
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{name}</div>
                  <div className="text-xs text-muted-foreground">{country} • {region?.replace('_', ' ')}</div>
                </div>

                <div className="text-center">
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${
                      safetyScore === undefined
                        ? 'bg-gray-50 text-gray-600 border-gray-200'
                        : safetyScore >= 80
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : safetyScore >= 60
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                    title={`Travel Safety Assessment: ${safetyDisplayLabel}${safetyScore ? ` (Score: ${safetyScore}/100)` : ''}`}
                    data-testid="safety-badge"
                  >
                    <span className="text-xs">🛡️</span>
                    <span>{safetyDisplayLabel}</span>
                  </div>
                  {safetyScore !== undefined && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {safetyScore}/100
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 text-xs text-blue-600 font-medium">
                �️ Click to explore on Google Maps
              </div>
            </div>
          </div>

          <div className="p-3 bg-card rounded-lg text-sm">
            <div className="font-medium mb-1">Practical tips</div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>Carry a reusable water bottle</li>
              <li>Tap to open map and transit options</li>
              <li>Respect local customs — tipping and dress</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CityModalOverview;
