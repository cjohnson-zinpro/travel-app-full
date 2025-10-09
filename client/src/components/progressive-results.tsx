import { useState, useEffect, useRef } from "react";
import { CountrySummary, CityRecommendation as SharedCityRecommendation } from "@shared/schema";
import { CityRecommendation } from "@/types/travel";
import { Progress } from "@/components/ui/progress";
import { CityCard } from "@/components/city-card";
import { CityModal } from "@/components/city-modal";
import { MobileCityCarousel } from "@/components/mobile-city-carousel";
import { Button } from "@/components/ui/button";
import { getFlagImageComponent } from "@/lib/flag-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface ProgressiveResultsProps {
  results: SharedCityRecommendation[];
  countries: CountrySummary[];
  status: "idle" | "loading" | "processing" | "completed" | "error";
  progress: {
    processed: number;
    total: number;
    percentage: number;
  };
  totalResults: number;
  userBudget?: number;
  originAirport?: string;
}

export function ProgressiveResults({
  results,
  countries,
  status,
  progress,
  totalResults,
  travelStyle = "budget",
  userBudget = 0,
  originAirport,
  autoScrollOnLoad = true,
  scrollTarget = "filters",
}: ProgressiveResultsProps & { travelStyle?: "budget" | "mid" | "luxury"; autoScrollOnLoad?: boolean; scrollTarget?: "filters" | "within" | "header" }) {
  const [displayedResults, setDisplayedResults] = useState<
    SharedCityRecommendation[]
  >([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<
    "alphabetical" | "price-low-high" | "confidence" | "region"
  >("price-low-high");
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  
  // Modal state
  const [selectedCity, setSelectedCity] = useState<SharedCityRecommendation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create a mock comparison city from origin airport for cost comparison
  const getComparisonCity = (): CityRecommendation | null => {
    if (!originAirport) return null;
    
    // Map of major airports to city data for cost comparison
    const airportToCityMap: Record<string, { city: string, country: string, pricing: { budget: number, mid: number, luxury: number } }> = {
      'PHX': { city: 'Phoenix', country: 'United States', pricing: { budget: 1200, mid: 1800, luxury: 3200 } },
      'LAX': { city: 'Los Angeles', country: 'United States', pricing: { budget: 1800, mid: 2800, luxury: 5000 } },
      'JFK': { city: 'New York', country: 'United States', pricing: { budget: 2200, mid: 3500, luxury: 6000 } },
      'ORD': { city: 'Chicago', country: 'United States', pricing: { budget: 1600, mid: 2400, luxury: 4200 } },
      'DFW': { city: 'Dallas', country: 'United States', pricing: { budget: 1400, mid: 2200, luxury: 3800 } },
      'SFO': { city: 'San Francisco', country: 'United States', pricing: { budget: 2000, mid: 3200, luxury: 5500 } },
      'YYZ': { city: 'Toronto', country: 'Canada', pricing: { budget: 1500, mid: 2300, luxury: 4000 } },
      'YVR': { city: 'Vancouver', country: 'Canada', pricing: { budget: 1600, mid: 2500, luxury: 4300 } },
      'LHR': { city: 'London', country: 'United Kingdom', pricing: { budget: 1800, mid: 2800, luxury: 5200 } },
      'CDG': { city: 'Paris', country: 'France', pricing: { budget: 1700, mid: 2600, luxury: 4800 } },
      'FRA': { city: 'Frankfurt', country: 'Germany', pricing: { budget: 1600, mid: 2400, luxury: 4400 } },
      'NRT': { city: 'Tokyo', country: 'Japan', pricing: { budget: 1900, mid: 3000, luxury: 5500 } },
      'SIN': { city: 'Singapore', country: 'Singapore', pricing: { budget: 1400, mid: 2200, luxury: 4000 } },
      'SYD': { city: 'Sydney', country: 'Australia', pricing: { budget: 1800, mid: 2800, luxury: 5000 } }
    };
    
    const cityData = airportToCityMap[originAirport];
    if (!cityData) return null;
    
    const totalForStyle = cityData.pricing[travelStyle];
    
    return {
      cityId: originAirport,
      city: cityData.city,
      country: cityData.country,
      region: 'home',
      nights: 10,
      totals: {
        p25: Math.round(totalForStyle * 0.85),
        p35: Math.round(totalForStyle * 0.92),
        p50: totalForStyle,
        p75: Math.round(totalForStyle * 1.15),
      },
      breakdown: {
        flight: 0, // No flight cost from home city
        flightSource: 'estimate' as const,
        hotelPerNightP25: Math.round(totalForStyle * 0.4 * 0.85),
        hotelPerNightP35: Math.round(totalForStyle * 0.4 * 0.92),
        hotelPerNightP50: Math.round(totalForStyle * 0.4),
        hotelPerNightP75: Math.round(totalForStyle * 0.4 * 1.15),
        hotelSource: 'estimate' as const,
        dailyPerDay: Math.round(totalForStyle * 0.6),
        dailySource: 'estimate' as const,
      },
      rangeNote: `Typical ${travelStyle} costs in ${cityData.city}`,
      confidence: 'medium' as const,
      lastUpdatedISO: new Date().toISOString(),
    } as CityRecommendation; // Type assertion to match the client type
  };

  const comparisonCity = getComparisonCity();

  // Helper function to get the correct total based on travel style (same as CityCard)
  const getCityTotal = (city: any, travelStyle: "budget" | "mid" | "luxury") => {
    if (!city.totals) return 0;
    let result = 0;
    if (travelStyle === "luxury") result = city.totals.p75;
    else if (travelStyle === "mid") result = city.totals.p50;
    else result = city.totals.p25;
    
    // Debug logging for Panama
    if (city.city === "Panama City") {
      console.log(`🔍 Panama City data:`, {
        city: city.city,
        travelStyle,
        totals: city.totals,
        selectedValue: result,
        p25: city.totals?.p25,
        p50: city.totals?.p50,
        p75: city.totals?.p75
      });
    }
    
    return result;
  };

  // Helper functions for enhanced country headers
  const getCountryImage = (countryName: string) => {
    const imageMap: Record<string, string> = {
      // North America
      "United States": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400&h=200&fit=crop",
      "Mexico": "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?w=400&h=200&fit=crop",
      "Canada": "https://images.unsplash.com/photo-1503614472-8c93d56cd040?w=400&h=200&fit=crop",
      
      // Europe - Western
      "United Kingdom": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=200&fit=crop",
      "France": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=200&fit=crop",
      "Germany": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=200&fit=crop",
      "Italy": "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400&h=200&fit=crop",
      "Spain": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=200&fit=crop",
      "Netherlands": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=200&fit=crop",
      "Switzerland": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop",
      "Austria": "https://images.unsplash.com/photo-1476209446441-5ad72f223207?w=400&h=200&fit=crop",
      "Belgium": "https://images.unsplash.com/photo-1559564484-0b8a4aa3c6b5?w=400&h=200&fit=crop",
      "Portugal": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=200&fit=crop",
      "Ireland": "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=200&fit=crop",
      
      // Europe - Nordic
      "Norway": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=200&fit=crop",
      "Sweden": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=400&h=200&fit=crop",
      "Denmark": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=400&h=200&fit=crop",
      "Finland": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Iceland": "https://images.unsplash.com/photo-1539650116574-75c0c6d0f864?w=400&h=200&fit=crop",
      
      // Europe - Eastern
      "Czech Republic": "https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&h=200&fit=crop",
      "Poland": "https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=400&h=200&fit=crop",
      "Hungary": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=200&fit=crop",
      "Croatia": "https://images.unsplash.com/photo-1555993539-1732b0258a95?w=400&h=200&fit=crop",
      "Greece": "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=200&fit=crop",
      "Romania": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Bulgaria": "https://images.unsplash.com/photo-1578906536077-72bc8b8b79fb?w=400&h=200&fit=crop",
      
      // Asia - East
      "Japan": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=200&fit=crop",
      "South Korea": "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&h=200&fit=crop",
      "China": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=200&fit=crop",
      "Taiwan": "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&h=200&fit=crop",
      "Hong Kong": "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=400&h=200&fit=crop",
      
      // Asia - Southeast
      "Thailand": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=200&fit=crop",
      "Singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=200&fit=crop",
      "Malaysia": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=200&fit=crop",
      "Indonesia": "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=200&fit=crop",
      "Philippines": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop",
      "Vietnam": "https://images.unsplash.com/photo-1559592413-7cec4d0d8fab?w=400&h=200&fit=crop",
      "Cambodia": "https://images.unsplash.com/photo-1584274860174-10c01b8dd4d7?w=400&h=200&fit=crop",
      "Laos": "https://images.unsplash.com/photo-1540611025311-01df3caf54f5?w=400&h=200&fit=crop",
      "Myanmar": "https://images.unsplash.com/photo-1570366583862-f91883984fde?w=400&h=200&fit=crop",
      
      // Asia - South
      "India": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=200&fit=crop",
      "Nepal": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=200&fit=crop",
      "Sri Lanka": "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400&h=200&fit=crop",
      "Bangladesh": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Pakistan": "https://images.unsplash.com/photo-1571596206116-19e682d3fb85?w=400&h=200&fit=crop",
      
      // Middle East
      "United Arab Emirates": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=200&fit=crop",
      "Turkey": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=200&fit=crop",
      "Israel": "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=200&fit=crop",
      "Jordan": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Qatar": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Saudi Arabia": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Oman": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      
      // Africa
      "Egypt": "https://images.unsplash.com/photo-1539650116574-75c0c6d0f864?w=400&h=200&fit=crop",
      "South Africa": "https://images.unsplash.com/photo-1484318571209-661cf29a69ea?w=400&h=200&fit=crop",
      "Morocco": "https://images.unsplash.com/photo-1489749798305-4fea3ae436d3?w=400&h=200&fit=crop",
      "Kenya": "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=200&fit=crop",
      "Tanzania": "https://images.unsplash.com/photo-1516652473400-1875bc1c148f?w=400&h=200&fit=crop",
      "Ethiopia": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Ghana": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Nigeria": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Tunisia": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      
      // Oceania
      "Australia": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop",
      "New Zealand": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=200&fit=crop",
      "Fiji": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      
      // South America
      "Brazil": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&h=200&fit=crop",
      "Argentina": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=400&h=200&fit=crop",
      "Chile": "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=200&fit=crop",
      "Peru": "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=200&fit=crop",
      "Colombia": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Ecuador": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Bolivia": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Uruguay": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Venezuela": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      
      // Central America & Caribbean
      "Costa Rica": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Panama": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Guatemala": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Jamaica": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Cuba": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Dominican Republic": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Barbados": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      
      // Additional destinations
      "Russia": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=200&fit=crop",
      "Kazakhstan": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Mongolia": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      "Uzbekistan": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop"
    };
    return imageMap[countryName] || null;
  };

  const getCountryDetails = (countryName: string) => {
    const detailsMap: Record<string, { region: string; highlights: string }> = {
      // North America
      "United States": { region: "North America", highlights: "National Parks • Tech Hubs • Entertainment" },
      "Mexico": { region: "North America", highlights: "Ancient Ruins • Beach Resorts • Vibrant Culture" },
      "Canada": { region: "North America", highlights: "Natural Beauty • Multicultural Cities • Winter Sports" },
      
      // Europe - Western
      "United Kingdom": { region: "Europe", highlights: "Historic Castles • Museums • Countryside" },
      "France": { region: "Europe", highlights: "Art & Culture • Cuisine • Wine Regions" },
      "Germany": { region: "Europe", highlights: "History • Beer Culture • Christmas Markets" },
      "Italy": { region: "Europe", highlights: "Ancient Rome • Renaissance Art • Culinary Excellence" },
      "Spain": { region: "Europe", highlights: "Architecture • Beaches • Flamenco Culture" },
      "Netherlands": { region: "Europe", highlights: "Canals • Tulip Fields • Liberal Culture" },
      "Switzerland": { region: "Europe", highlights: "Alpine Scenery • Luxury • Outdoor Adventures" },
      "Austria": { region: "Europe", highlights: "Classical Music • Imperial Architecture • Skiing" },
      "Belgium": { region: "Europe", highlights: "Medieval Cities • Chocolate • Beer Culture" },
      "Portugal": { region: "Europe", highlights: "Coastal Beauty • Historic Tiles • Port Wine" },
      "Ireland": { region: "Europe", highlights: "Green Landscapes • Celtic Culture • Friendly Locals" },
      
      // Europe - Nordic
      "Norway": { region: "Northern Europe", highlights: "Fjords • Northern Lights • Viking Heritage" },
      "Sweden": { region: "Northern Europe", highlights: "Design Culture • Archipelago • Midnight Sun" },
      "Denmark": { region: "Northern Europe", highlights: "Hygge Culture • Design • Historic Castles" },
      "Finland": { region: "Northern Europe", highlights: "Saunas • Lapland • Northern Lights" },
      "Iceland": { region: "Northern Europe", highlights: "Geysers • Blue Lagoon • Dramatic Landscapes" },
      
      // Europe - Eastern
      "Czech Republic": { region: "Central Europe", highlights: "Prague Architecture • Beer • Historic Towns" },
      "Poland": { region: "Central Europe", highlights: "Medieval Cities • Pierogi • Rich History" },
      "Hungary": { region: "Central Europe", highlights: "Thermal Baths • Architecture • Wine Regions" },
      "Croatia": { region: "Southern Europe", highlights: "Adriatic Coast • National Parks • Game of Thrones" },
      "Greece": { region: "Southern Europe", highlights: "Ancient History • Islands • Mediterranean Cuisine" },
      "Romania": { region: "Eastern Europe", highlights: "Dracula's Castle • Painted Monasteries • Carpathian Mountains" },
      "Bulgaria": { region: "Eastern Europe", highlights: "Rose Valley • Black Sea • Orthodox Monasteries" },
      
      // Asia - East
      "Japan": { region: "East Asia", highlights: "Temples • Technology • Culinary Art" },
      "South Korea": { region: "East Asia", highlights: "K-Culture • Technology • Historic Palaces" },
      "China": { region: "East Asia", highlights: "Great Wall • Ancient Culture • Modern Cities" },
      "Taiwan": { region: "East Asia", highlights: "Night Markets • Mountains • Technology" },
      "Hong Kong": { region: "East Asia", highlights: "Skyline • Dim Sum • Shopping" },
      
      // Asia - Southeast
      "Thailand": { region: "Southeast Asia", highlights: "Temples • Street Food • Tropical Beaches" },
      "Singapore": { region: "Southeast Asia", highlights: "Garden City • Hawker Culture • Modern Architecture" },
      "Malaysia": { region: "Southeast Asia", highlights: "Diverse Culture • Street Food • Twin Towers" },
      "Indonesia": { region: "Southeast Asia", highlights: "Thousands of Islands • Temples • Volcanoes" },
      "Philippines": { region: "Southeast Asia", highlights: "Tropical Islands • Rice Terraces • Friendly Culture" },
      "Vietnam": { region: "Southeast Asia", highlights: "Pho • Motorbikes • Ha Long Bay" },
      "Cambodia": { region: "Southeast Asia", highlights: "Angkor Wat • Khmer Culture • Mekong River" },
      "Laos": { region: "Southeast Asia", highlights: "Buddhist Temples • Mekong River • Peaceful Culture" },
      "Myanmar": { region: "Southeast Asia", highlights: "Golden Pagodas • Ancient Kingdoms • Traditional Culture" },
      
      // Asia - South
      "India": { region: "South Asia", highlights: "Diverse Culture • Spices • Spiritual Heritage" },
      "Nepal": { region: "South Asia", highlights: "Himalayas • Mount Everest • Buddhist Culture" },
      "Sri Lanka": { region: "South Asia", highlights: "Tea Plantations • Beaches • Ancient Ruins" },
      "Bangladesh": { region: "South Asia", highlights: "River Delta • Textiles • Rich Culture" },
      "Pakistan": { region: "South Asia", highlights: "Mountain Ranges • Historic Cities • Hospitality" },
      
      // Middle East
      "United Arab Emirates": { region: "Middle East", highlights: "Luxury • Desert • Modern Marvels" },
      "Turkey": { region: "Europe/Asia", highlights: "Byzantine History • Bazaars • Hot Air Balloons" },
      "Israel": { region: "Middle East", highlights: "Holy Sites • Ancient History • Mediterranean Coast" },
      "Jordan": { region: "Middle East", highlights: "Petra • Desert Landscapes • Hospitality" },
      "Qatar": { region: "Middle East", highlights: "Modern Architecture • Desert • Cultural Heritage" },
      "Saudi Arabia": { region: "Middle East", highlights: "Islamic Heritage • Desert • Modern Development" },
      "Oman": { region: "Middle East", highlights: "Dramatic Landscapes • Forts • Traditional Culture" },
      
      // Africa
      "Egypt": { region: "Africa", highlights: "Ancient Pyramids • Nile River • Archaeological Wonders" },
      "South Africa": { region: "Africa", highlights: "Safari • Wine • Rainbow Nation" },
      "Morocco": { region: "Africa", highlights: "Souks • Sahara Desert • Islamic Architecture" },
      "Kenya": { region: "Africa", highlights: "Safari • Maasai Culture • Great Migration" },
      "Tanzania": { region: "Africa", highlights: "Serengeti • Mount Kilimanjaro • Wildlife" },
      "Ethiopia": { region: "Africa", highlights: "Ancient Churches • Coffee Origin • Unique Calendar" },
      "Ghana": { region: "Africa", highlights: "Gold Coast • Slave Forts • Vibrant Culture" },
      "Nigeria": { region: "Africa", highlights: "Nollywood • Diverse Culture • Economic Hub" },
      "Tunisia": { region: "Africa", highlights: "Roman Ruins • Sahara • Mediterranean Coast" },
      
      // Oceania
      "Australia": { region: "Oceania", highlights: "Outback • Great Barrier Reef • Wildlife" },
      "New Zealand": { region: "Oceania", highlights: "Lord of the Rings • Adventure Sports • Natural Beauty" },
      "Fiji": { region: "Oceania", highlights: "Tropical Paradise • Coral Reefs • Island Culture" },
      
      // South America
      "Brazil": { region: "South America", highlights: "Carnival • Amazon • Beach Culture" },
      "Argentina": { region: "South America", highlights: "Tango • Wine • Patagonia" },
      "Chile": { region: "South America", highlights: "Wine Country • Atacama Desert • Patagonia" },
      "Peru": { region: "South America", highlights: "Machu Picchu • Inca Heritage • Cuisine" },
      "Colombia": { region: "South America", highlights: "Coffee • Cartagena • Diverse Landscapes" },
      "Ecuador": { region: "South America", highlights: "Galápagos • Andes • Amazon" },
      "Bolivia": { region: "South America", highlights: "Salt Flats • Indigenous Culture • High Altitude" },
      "Uruguay": { region: "South America", highlights: "Relaxed Culture • Beaches • Wine" },
      "Venezuela": { region: "South America", highlights: "Angel Falls • Beaches • Diverse Landscapes" },
      
      // Central America & Caribbean
      "Costa Rica": { region: "Central America", highlights: "Biodiversity • Eco-Tourism • Pura Vida" },
      "Panama": { region: "Central America", highlights: "Canal • Rainforests • Caribbean & Pacific" },
      "Guatemala": { region: "Central America", highlights: "Mayan Ruins • Volcanoes • Colonial Cities" },
      "Jamaica": { region: "Caribbean", highlights: "Reggae • Beaches • Blue Mountains" },
      "Cuba": { region: "Caribbean", highlights: "Classic Cars • Cigars • Colonial Architecture" },
      "Dominican Republic": { region: "Caribbean", highlights: "Beaches • Merengue • Baseball" },
      "Barbados": { region: "Caribbean", highlights: "Rum • Beaches • Cricket" },
      
      // Additional destinations
      "Russia": { region: "Europe/Asia", highlights: "Trans-Siberian Railway • Red Square • Vast Landscapes" },
      "Kazakhstan": { region: "Central Asia", highlights: "Steppes • Space Program • Nomadic Heritage" },
      "Mongolia": { region: "East Asia", highlights: "Nomadic Culture • Gobi Desert • Horseback Adventures" },
      "Uzbekistan": { region: "Central Asia", highlights: "Silk Road • Islamic Architecture • Ancient Cities" }
    };
    return detailsMap[countryName] || { region: "Global", highlights: "Unique Experiences • Local Culture" };
  };

  // Track timeout IDs and prevent concurrency issues
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);
  const isProcessingRef = useRef(false);
  const withinSectionRef = useRef<HTMLDivElement | null>(null);
  const slightlySectionRef = useRef<HTMLDivElement | null>(null);
  const countryFiltersRef = useRef<HTMLDivElement | null>(null);
  const hasAutoScrolledRef = useRef(false);

  // Progressively add new results to display with smooth timing and proper cleanup
  useEffect(() => {
    // Clear any existing timeouts to prevent cross-search contamination
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
    
    if (results.length > displayedResults.length && !isProcessingRef.current) {
      isProcessingRef.current = true;
      const newResults = results.slice(displayedResults.length);
      let index = 0;
      
      const addNextResult = () => {
        if (index < newResults.length && isProcessingRef.current) {
          setDisplayedResults((prev) => [...prev, newResults[index]]);
          index++;
          // Staggered timing: faster for first few, then slower for dramatic effect
          const nextDelay = index <= 3 ? 150 : index <= 6 ? 200 : 250;
          const timeoutId = setTimeout(addNextResult, nextDelay);
          timeoutIds.current.push(timeoutId);
        } else {
          isProcessingRef.current = false;
        }
      };
      
      // Shorter initial delay for more responsive feel
      const initialTimeoutId = setTimeout(addNextResult, 300);
      timeoutIds.current.push(initialTimeoutId);
    }

    // Cleanup function
    return () => {
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
      isProcessingRef.current = false;
    };
  }, [results.length]); // only track changes in count

  // Reset displayed results when search changes
  useEffect(() => {
    if (status === "loading") {
      // Clear timeouts and reset processing flag
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
      isProcessingRef.current = false;
      
      setDisplayedResults([]);
      setSelectedCountries([]);
      // Allow auto-scroll again for the next search
      hasAutoScrolledRef.current = false;
    }
  }, [status]);

  // Auto-scroll when results render, using a robust in-component trigger
  useEffect(() => {
    if (!autoScrollOnLoad || hasAutoScrolledRef.current) return;
    const active = status === "processing" || status === "completed";
    if (!active) return;
    if (displayedResults.length === 0) return;

    // Choose target
    let targetEl: HTMLElement | null = null;
    if (scrollTarget === "filters") {
      targetEl = countryFiltersRef.current || document.getElementById("progressive-country-filters-anchor");
    } else if (scrollTarget === "within") {
      targetEl = withinSectionRef.current;
    } else if (scrollTarget === "header") {
      targetEl = document.querySelector('[data-testid="progressive-results-header"]') as HTMLElement | null;
    }

    if (targetEl) {
      // Use rAF to ensure layout is painted before scrolling
      requestAnimationFrame(() => {
        targetEl!.scrollIntoView({ behavior: "smooth", block: "start" });
        hasAutoScrolledRef.current = true;
      });
    }
  }, [autoScrollOnLoad, scrollTarget, status, displayedResults.length]);

  // Sort displayed results
  const sortedResults = [...displayedResults]
    .filter((city) => city && city.city && city.country && city.region)
    .sort((a, b) => {
      switch (sortOption) {
        case "price-low-high":
          return getCityTotal(a, travelStyle) - getCityTotal(b, travelStyle);
        case "confidence":
          const confidenceOrder = { high: 3, medium: 2, low: 1 } as const;
          return (
            (confidenceOrder[b.confidence || 'low'] || 0) -
            (confidenceOrder[a.confidence || 'low'] || 0)
          );
        case "region":
          return (
            a.region.localeCompare(b.region) || a.city.localeCompare(b.city)
          );
        case "alphabetical":
        default:
          return a.city.localeCompare(b.city);
      }
    });

  // Group by budget category first, then by country
  const citiesByBudgetAndCountry = sortedResults.reduce(
    (acc, city, index) => {
      if (!city || !city.country || !city.city || !city.cityId) {
        console.warn("Skipping invalid city object:", city);
        return acc;
      }
      
      const budgetCategory = city.budgetCategory || "within_budget";
      if (!acc[budgetCategory]) acc[budgetCategory] = {};
      if (!acc[budgetCategory][city.country]) acc[budgetCategory][city.country] = [];
      acc[budgetCategory][city.country].push({ ...city, _sortIndex: index });
      return acc;
    },
    {} as Record<string, Record<string, (SharedCityRecommendation & { _sortIndex: number })[]>>,
  );

  // Legacy grouping for country filters (all destinations combined)
  const citiesByCountry = sortedResults.reduce(
    (acc, city, index) => {
      if (!city || !city.country || !city.city || !city.cityId) {
        console.warn("Skipping invalid city object:", city);
        return acc;
      }
      if (!acc[city.country]) acc[city.country] = [];
      acc[city.country].push({ ...city, _sortIndex: index });
      return acc;
    },
    {} as Record<string, (SharedCityRecommendation & { _sortIndex: number })[]>,
  );

  // Keep cities within each country in their global sorted order
  Object.keys(citiesByCountry).forEach((country) => {
    citiesByCountry[country].sort((a, b) => a._sortIndex - b._sortIndex);
  });

  const filteredCitiesByCountry =
    selectedCountries.length === 0
      ? citiesByCountry
      : Object.fromEntries(
          Object.entries(citiesByCountry).filter(([countryName]) =>
            selectedCountries.includes(countryName),
          ),
        );

  const toggleCountryFilter = (countryName: string) => {
    setSelectedCountries((prev) =>
      prev.includes(countryName)
        ? prev.filter((c) => c !== countryName)
        : [...prev, countryName],
    );
  };

  const toggleCountryAccordion = (countryName: string) => {
    setExpandedCountries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(countryName)) {
        newSet.delete(countryName);
      } else {
        newSet.add(countryName);
      }
      return newSet;
    });
  };

  const handleCityClick = (city: SharedCityRecommendation) => {
    setSelectedCity(city);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCity(null);
  };

  const totalDisplayed = Object.values(filteredCitiesByCountry).reduce(
    (sum, cities) => sum + cities.length,
    0,
  );

  return (
    <div
      className="container mx-auto px-4 py-8"
      data-testid="progressive-results"
    >
      {/* Progress Header */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-2xl font-semibold"
            data-testid="text-progressive-title"
          >
            {status === "loading" && "Searching destinations..."}
            {status === "processing" &&
              `Found ${displayedResults.length} destinations`}
          </h2>

          {status === "processing" && (
            <div className="text-sm text-muted-foreground progress-text-smooth">
              Loading more... ({progress.percentage}% complete)
            </div>
          )}
        </div>

        {(status === "processing" || status === "loading") && (
          <Progress value={progress.percentage} className="w-full progress-smooth" />
        )}
      </div>

      {/* Empty State Message */}
      {status === "completed" && displayedResults.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              No destinations found within your budget
            </h3>
            <p className="text-gray-600 mb-6">
              Try increasing your budget, selecting a different region, or adjusting your travel style to see more options.
            </p>
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Suggestions:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Increase your budget by $500-1000</li>
                <li>• Consider budget travel style instead of luxury</li>
                <li>• Try a different region or remove country filters</li>
                <li>• Reduce the number of nights for your trip</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Results Controls */}
      {displayedResults.length > 0 && (
        <div className="space-y-6">
          {/* Header with Sort and Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6" data-testid="progressive-results-header">
            <div className="flex items-center justify-between mb-4">
              <div />

              {/* sort control moved into the Within Your Budget section; tooltip is placed below the total count */}
            </div>

            {/* Total destinations moved into the header box */}
            <div className="mb-4 flex items-center justify-center">
              <div className="inline-flex items-center gap-4 px-4 py-2">
                <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 id="progressive-results-title" className="text-2xl font-bold text-gray-900" data-testid="text-progressive-title">
                  {status === "loading" && "Searching destinations..."}
                  {status === "processing" && `Found ${displayedResults.length} destinations`}
                  {status === "completed" && `${totalResults} destinations found`}
                </h3>
              </div>
            </div>

            {/* How we estimate tooltip (moved below total destinations) */}
            <div className="flex items-center justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex items-center text-sm text-gray-600 transition-colors hover:text-gray-900 mt-2"
                      data-testid="button-progressive-how-we-estimate"
                    >
                      <HelpCircle className="mr-1 h-4 w-4" />
                      How we estimate
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="text-sm">
                      All cost estimates are produced using Claude AI. We estimate hotel and daily costs and combine them into trip totals. These are model estimates for planning purposes; verify prices before booking.
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Results count integrated with quick jump chips */}
            {(() => {
              const withinCount = citiesByBudgetAndCountry.within_budget ? Object.values(citiesByBudgetAndCountry.within_budget).reduce((s, arr) => s + arr.length, 0) : 0;
              const slightlyCount = citiesByBudgetAndCountry.slightly_above_budget ? Object.values(citiesByBudgetAndCountry.slightly_above_budget).reduce((s, arr) => s + arr.length, 0) : 0;

              // Respect current country filters when showing counts in the chips
              const computeFilteredCount = (group?: Record<string, (SharedCityRecommendation & { _sortIndex: number })[]> ) => {
                if (!group) return 0;
                if (selectedCountries.length === 0) return Object.values(group).reduce((s, arr) => s + arr.length, 0);
                return Object.entries(group)
                  .filter(([countryName]) => selectedCountries.includes(countryName))
                  .reduce((s, [, arr]) => s + arr.length, 0);
              };

              const visibleWithinCount = computeFilteredCount(citiesByBudgetAndCountry.within_budget);
              const visibleSlightlyCount = computeFilteredCount(citiesByBudgetAndCountry.slightly_above_budget);

              return (
                <div className="flex items-center justify-center mt-4">
                  <div className="inline-flex items-center gap-6 px-6 py-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-900" data-testid="text-progressive-count">Showing {totalDisplayed} of {totalResults} destinations</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md hover:bg-green-100"
                        onClick={() => withinSectionRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        data-testid="chip-jump-within"
                      >
                        Within Budget: {visibleWithinCount}
                      </button>
                      <button
                        type="button"
                        className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-md hover:bg-orange-100"
                        onClick={() => slightlySectionRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        data-testid="chip-jump-slightly"
                      >
                        Slightly Above Budget: {visibleSlightlyCount}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Country Filter Buttons */}
          <div id="progressive-country-filters-anchor" className="mb-8" ref={countryFiltersRef}>
            <div className="text-center mb-4">
              <h4 className="text-sm font-medium text-gray-700">Filter by destination</h4>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2" data-testid="progressive-country-filters">
              <button
                className={[
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:scale-105 hover:shadow-sm active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  selectedCountries.length === 0
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-primary/30",
                ].join(" ")}
                onClick={() => setSelectedCountries([])}
                data-testid="filter-progressive-all-countries"
              >
                  <span className="flex items-center gap-2">
                    <span>All Countries</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full bg-white border border-gray-200 text-gray-700">
                      {Object.keys(citiesByCountry).length}
                    </span>
                  </span>
              </button>

              {Object.entries(citiesByCountry)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([countryName, cities]) => (
                  <button
                    key={countryName}
                    className={[
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      "hover:scale-105 hover:shadow-sm active:scale-95",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      selectedCountries.includes(countryName)
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-primary/30",
                    ].join(" ")}
                    onClick={() => toggleCountryFilter(countryName)}
                    data-testid={`filter-progressive-country-${countryName
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{countryName}</span>
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full bg-white border border-gray-200 text-gray-700">
                        {cities.length}
                      </span>
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Budget Category Groups */}
          <div className="space-y-12" data-testid="progressive-budget-groups">
            {/* Empty Within Budget Message - Show when no within_budget results but there are slightly_above_budget results */}
            {(!citiesByBudgetAndCountry.within_budget || Object.keys(citiesByBudgetAndCountry.within_budget).length === 0) && 
             citiesByBudgetAndCountry.slightly_above_budget && 
             Object.keys(citiesByBudgetAndCountry.slightly_above_budget).length > 0 && (
              <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-orange-600 dark:text-orange-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 19.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300">
                    No destinations found within your exact budget
                  </h3>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  We found destinations that are close to your budget (within 10% over). Consider these options below or try increasing your budget slightly.
                </p>
              </div>
            )}

            {/* Within Budget Section */}
            {citiesByBudgetAndCountry.within_budget && Object.keys(citiesByBudgetAndCountry.within_budget).length > 0 && (
              <div className="space-y-6" ref={withinSectionRef}>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-4 mb-2">
                      <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900" data-testid="header-within-budget">
                            Within Your Budget ({Object.values(citiesByBudgetAndCountry.within_budget).reduce((sum, cities) => sum + cities.length, 0)} destinations)
                          </h3>
                          <p className="text-sm text-gray-600">
                            These destinations fit comfortably within your budget
                          </p>
                        </div>
                      </div>

                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Sort by:</span>
                          <Select
                            value={sortOption}
                            onValueChange={(value) => setSortOption(value as any)}
                            data-testid="select-progressive-sort"
                          >
                            <SelectTrigger className="h-8 w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="alphabetical" data-testid="option-alphabetical">A-Z (Alphabetical)</SelectItem>
                              <SelectItem value="price-low-high" data-testid="option-price-low-high">Price: Low to High</SelectItem>
                              <SelectItem value="confidence" data-testid="option-confidence">Confidence Level</SelectItem>
                              <SelectItem value="region" data-testid="option-region">Region</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8">
                  {Object.entries(citiesByBudgetAndCountry.within_budget)
                    .filter(([countryName]) => 
                      selectedCountries.length === 0 || selectedCountries.includes(countryName)
                    )
                    .sort(([, citiesA], [, citiesB]) => {
                      const bestCityA = citiesA[0];
                      const bestCityB = citiesB[0];
                      if (!bestCityA || !bestCityB) return 0;

                      switch (sortOption) {
                        case "price-low-high":
                          return getCityTotal(bestCityA, travelStyle) - getCityTotal(bestCityB, travelStyle);
                        case "confidence":
                          const order = { high: 3, medium: 2, low: 1 } as const;
                          return (order[bestCityB.confidence] ?? 0) - (order[bestCityA.confidence] ?? 0);
                        case "region":
                          return (bestCityA.region || "").localeCompare(bestCityB.region || "") ||
                                 (bestCityA.city || "").localeCompare(bestCityB.city || "");
                        case "alphabetical":
                        default:
                          return (bestCityA.city || "").localeCompare(bestCityB.city || "");
                      }
                    })
                    .map(([countryName, cities]) => {
                      const countrySummary = countries.find(c => c.country === countryName);
                      
                      // Calculate average using same logic as CityCard
                      const avgPrice = cities.length > 0 
                        ? Math.round(cities.reduce((sum, city) => sum + getCityTotal(city, travelStyle), 0) / cities.length)
                        : 0;
                      
                      const isExpanded = expandedCountries.has(countryName);

                      return (
                        <div
                          key={`within-${countryName}`}
                          className="space-y-4 country-group-enter"
                          data-testid={`group-within-budget-${countryName.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {/* Country Header - Clickable Accordion */}
                          <Card className="overflow-hidden">
                            <div 
                              className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                              onClick={() => toggleCountryAccordion(countryName)}
                            >
                              <CardContent className="p-0">
                                <div className="flex items-stretch min-h-[140px]">
                                  {/* Country Image with Flag Overlay */}
                                  <div className="relative w-48 flex-shrink-0">
                                    {getCountryImage(countryName) ? (
                                      <>
                                        <img
                                          src={getCountryImage(countryName)!}
                                          alt={`${countryName} landscape`}
                                          className="w-full h-full object-cover rounded-l-lg"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const fallback = target.nextElementSibling as HTMLElement;
                                            if (fallback) fallback.classList.remove('hidden');
                                          }}
                                        />
                                        {/* Flag overlay on image */}
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
                                          {getFlagImageComponent(countryName)}
                                        </div>
                                      </>
                                    ) : null}
                                    {/* Fallback gradient with flag */}
                                    <div 
                                      className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-l-lg flex items-center justify-center ${getCountryImage(countryName) ? 'hidden' : ''}`}
                                    >
                                      <div className="text-4xl">
                                        {getFlagImageComponent(countryName)}
                                      </div>
                                    </div>
                                    {/* Overlay gradient for better text contrast */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent rounded-l-lg"></div>
                                  </div>

                                  {/* Country Information */}
                                  <div className="flex-1 p-6">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                          <h4 className="text-xl font-semibold text-foreground">
                                            {countryName}
                                          </h4>
                                          <Badge variant="outline" className="text-xs">
                                            {getCountryDetails(countryName).region}
                                          </Badge>
                                        </div>
                                        
                                        <div className="space-y-1 mb-3">
                                          <p className="text-sm text-muted-foreground">
                                            {cities.length} destination{cities.length !== 1 ? 's' : ''}
                                          </p>
                                          <p className="text-sm text-blue-600 font-medium">
                                            {getCountryDetails(countryName).highlights}
                                          </p>
                                        </div>

                                        {/* Quick city preview */}
                                        <div className="flex flex-wrap gap-1">
                                          {cities.slice(0, 3).map((city) => (
                                            <Badge key={city.city} variant="secondary" className="text-xs">
                                              {city.city}
                                            </Badge>
                                          ))}
                                          {cities.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                              +{cities.length - 3} more
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center space-x-3 ml-4">
                                        {/* Expand/collapse icon */}
                                        {isExpanded ? (
                                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </div>
                          </Card>

                          {/* Cities - Collapsible */}
                          {isExpanded && (
                            <div className="space-y-4">
                              {/* Mobile Carousel */}
                              <div className="block lg:hidden">
                                <MobileCityCarousel
                                  cities={cities as CityRecommendation[]}
                                  onCityClick={handleCityClick}
                                  travelStyle={travelStyle}
                                  originAirport={originAirport}
                                />
                              </div>
                              
                              {/* Desktop Grid */}
                              <div className="hidden lg:grid lg:grid-cols-3 gap-6 xl:gap-8 [grid-auto-rows:1fr]">
                                {cities.map((city, index) => {
                                  const uniqueKey = `within-${city.cityId || "unknown"}-${city.city || "unnamed"}-${index}`;
                                  const delayClass = `city-card-delay-${Math.min(index + 1, 6)}`;
                                  return (
                                    <div
                                      key={uniqueKey}
                                      className={`city-card-enter ${delayClass}`}
                                      style={{ opacity: 0 }}
                                    >
                                      <CityCard
                                        city={city as CityRecommendation}
                                        onClick={handleCityClick}
                                        travelStyle={travelStyle}
                                        originAirport={originAirport}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Slightly Above Budget Section */}
            {citiesByBudgetAndCountry.slightly_above_budget && Object.keys(citiesByBudgetAndCountry.slightly_above_budget).length > 0 && (
              <div className="space-y-6" ref={slightlySectionRef}>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900" data-testid="header-slightly-above-budget">
                        Slightly Above Budget ({Object.values(citiesByBudgetAndCountry.slightly_above_budget).reduce((sum, cities) => sum + cities.length, 0)} destinations, 5-10% over)
                      </h3>
                      <p className="text-sm text-gray-600">
                        These destinations are close to your budget but might require a small stretch
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8">
                  {Object.entries(citiesByBudgetAndCountry.slightly_above_budget)
                    .filter(([countryName]) => 
                      selectedCountries.length === 0 || selectedCountries.includes(countryName)
                    )
                    .sort(([, citiesA], [, citiesB]) => {
                      const bestCityA = citiesA[0];
                      const bestCityB = citiesB[0];
                      if (!bestCityA || !bestCityB) return 0;

                      switch (sortOption) {
                        case "price-low-high":
                          return getCityTotal(bestCityA, travelStyle) - getCityTotal(bestCityB, travelStyle);
                        case "confidence":
                          const order = { high: 3, medium: 2, low: 1 } as const;
                          return (order[bestCityB.confidence] ?? 0) - (order[bestCityA.confidence] ?? 0);
                        case "region":
                          return (bestCityA.region || "").localeCompare(bestCityB.region || "") ||
                                 (bestCityA.city || "").localeCompare(bestCityB.city || "");
                        case "alphabetical":
                        default:
                          return (bestCityA.city || "").localeCompare(bestCityB.city || "");
                      }
                    })
                    .map(([countryName, cities]) => {
                      const countrySummary = countries.find(c => c.country === countryName);
                      
                      // Calculate average using same logic as CityCard
                      const avgPrice = cities.length > 0 
                        ? Math.round(cities.reduce((sum, city) => sum + getCityTotal(city, travelStyle), 0) / cities.length)
                        : 0;
                      
                      const isExpanded = expandedCountries.has(countryName);

                      return (
                        <div
                          key={`above-${countryName}`}
                          className="space-y-4 country-group-enter"
                          data-testid={`group-slightly-above-budget-${countryName.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {/* Country Header - Clickable Accordion */}
                          <Card className="overflow-hidden">
                            <div 
                              className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                              onClick={() => toggleCountryAccordion(countryName)}
                            >
                              <CardContent className="p-0">
                                <div className="flex items-stretch min-h-[140px]">
                                  {/* Country Image with Flag Overlay */}
                                  <div className="relative w-48 flex-shrink-0">
                                    {getCountryImage(countryName) ? (
                                      <>
                                        <img
                                          src={getCountryImage(countryName)!}
                                          alt={`${countryName} landscape`}
                                          className="w-full h-full object-cover rounded-l-lg"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const fallback = target.nextElementSibling as HTMLElement;
                                            if (fallback) fallback.classList.remove('hidden');
                                          }}
                                        />
                                        {/* Flag overlay on image */}
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
                                          {getFlagImageComponent(countryName)}
                                        </div>
                                      </>
                                    ) : null}
                                    {/* Fallback gradient with flag */}
                                    <div 
                                      className={`absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-l-lg flex items-center justify-center ${getCountryImage(countryName) ? 'hidden' : ''}`}
                                    >
                                      <div className="text-3xl">
                                        {getFlagImageComponent(countryName)}
                                      </div>
                                    </div>
                                    {/* Overlay gradient for better text contrast */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent rounded-l-lg"></div>
                                  </div>

                                  {/* Country Information */}
                                  <div className="flex-1 p-6">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                          <h4 className="text-xl font-semibold text-foreground">
                                            {countryName}
                                          </h4>
                                          <Badge variant="outline" className="text-xs">
                                            {getCountryDetails(countryName).region}
                                          </Badge>
                                        </div>
                                        
                                        <div className="space-y-1 mb-3">
                                          <p className="text-sm text-muted-foreground">
                                            {cities.length} destination{cities.length !== 1 ? 's' : ''}
                                          </p>
                                          <p className="text-sm text-orange-600 font-medium">
                                            {getCountryDetails(countryName).highlights}
                                          </p>
                                        </div>

                                        {/* Quick city preview */}
                                        <div className="flex flex-wrap gap-1">
                                          {cities.slice(0, 3).map((city) => (
                                            <Badge key={city.city} variant="secondary" className="text-xs">
                                              {city.city}
                                            </Badge>
                                          ))}
                                          {cities.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                              +{cities.length - 3} more
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center space-x-3 ml-4">
                                        {/* Expand/collapse icon */}
                                        {isExpanded ? (
                                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </div>
                          </Card>

                          {/* Cities - Collapsible */}
                          {isExpanded && (
                            <div className="space-y-4">
                              {/* Mobile Carousel */}
                              <div className="block lg:hidden">
                                <MobileCityCarousel
                                  cities={cities as CityRecommendation[]}
                                  onCityClick={handleCityClick}
                                  travelStyle={travelStyle}
                                  originAirport={originAirport}
                                />
                              </div>
                              
                              {/* Desktop Grid */}
                              <div className="hidden lg:grid lg:grid-cols-3 gap-6 xl:gap-8 [grid-auto-rows:1fr]">
                                {cities.map((city, index) => {
                                  const uniqueKey = `above-${city.cityId || "unknown"}-${city.city || "unnamed"}-${index}`;
                                  const delayClass = `city-card-delay-${Math.min(index + 1, 6)}`;
                                  return (
                                    <div
                                      key={uniqueKey}
                                      className={`city-card-enter ${delayClass}`}
                                      style={{ opacity: 0 }}
                                    >
                                      <CityCard
                                        city={city as CityRecommendation}
                                        onClick={handleCityClick}
                                        travelStyle={travelStyle}
                                        originAirport={originAirport}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Fallback: Legacy Country Groups (if no budget category data) */}
          <div className="space-y-8" data-testid="progressive-country-groups" style={{ display: 'none' }}>
            {Object.entries(filteredCitiesByCountry)
              .sort(([, citiesA], [, citiesB]) => {
                const bestCityA = citiesA[0];
                const bestCityB = citiesB[0];
                if (!bestCityA || !bestCityB) return 0;

                switch (sortOption) {
                  case "price-low-high":
                    return getCityTotal(bestCityA, travelStyle) - getCityTotal(bestCityB, travelStyle);
                  case "confidence":
                    const order = { high: 3, medium: 2, low: 1 } as const;
                    return (
                      (order[bestCityB.confidence || 'low'] ?? 0) -
                      (order[bestCityA.confidence || 'low'] ?? 0)
                    );
                  case "region":
                    return (
                      (bestCityA.region || "").localeCompare(
                        bestCityB.region || "",
                      ) ||
                      (bestCityA.city || "").localeCompare(bestCityB.city || "")
                    );
                  case "alphabetical":
                  default:
                    return (bestCityA.city || "").localeCompare(
                      bestCityB.city || "",
                    );
                }
              })
              .map(([countryName, cities]) => {
                const countrySummary = countries.find(
                  (c) => c.country === countryName,
                );
                
                // Calculate average using same logic as CityCard
                const avgPrice = cities.length > 0 
                  ? Math.round(cities.reduce((sum, city) => sum + getCityTotal(city, travelStyle), 0) / cities.length)
                  : 0;

                return (
                  <div
                    key={countryName}
                    className="space-y-4 country-group-enter"
                    data-testid={`group-progressive-country-${countryName
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {/* Country Header */}
                    <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 rounded-lg p-4 border border-blue-200/60 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-7 h-7 bg-background rounded-full border-2 border-blue-300/40">
                            {getFlagImageComponent(countryName)}
                          </div>
                          <div>
                            <h4
                              className="text-lg font-bold text-foreground tracking-tight"
                              data-testid={`text-progressive-country-${countryName
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                            >
                              {countryName}
                            </h4>
                            <div className="text-sm text-muted-foreground font-medium">
                              {cities.length} destination{cities.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cities Grid — 3 columns on desktop, equal-height cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 [grid-auto-rows:1fr]">
                      {cities.map((city, index) => {
                        const uniqueKey = `${city.cityId || "unknown"}-${city.city || "unnamed"}-${index}`;
                        const delayClass = `city-card-delay-${Math.min(index + 1, 6)}`;
                        return (
                          <div
                            key={uniqueKey}
                            className={`city-card-enter ${delayClass}`}
                            style={{ opacity: 0 }} // Start invisible for animation
                          >
                            <CityCard
                              city={city as CityRecommendation}
                              onClick={handleCityClick}
                              travelStyle={travelStyle}
                              originAirport={originAirport}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Loading Animation for New Results */}
      {status === "processing" && displayedResults.length < results.length && (
        <div className="py-6 text-center">
          <div className="animate-pulse text-muted-foreground">
            Loading more destinations...
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {displayedResults.length > 0 && (
        <div className="mt-8 rounded-lg border border-border bg-muted/50 p-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Data Sources:</strong> Amadeus (flights), Claude AI
              (hotels & daily costs)
            </p>
            <p>
              Estimates for planning purposes only. Verify prices before
              booking.
            </p>
          </div>
        </div>
      )}

      {/* City Modal */}
      <CityModal
        city={selectedCity}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        travelStyle={travelStyle}
        userBudget={userBudget}
        originAirport={originAirport}
      />
    </div>
  );
}
