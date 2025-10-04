import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, HelpCircle, Clock, MapPin, Info, Calendar, Globe, Users, MessageCircle, Lightbulb, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { CityRecommendation } from "@shared/schema";
import { getFlagImageComponent } from "@/lib/flag-utils";
import { ClaudeDailyCosts } from "@shared/data/claude-daily-costs";
import { getCostComparison, getDisplayCityName, canCompareCosts, CostComparison } from "@shared/utils/cost-comparison";

// Utility function for formatting currency
const formatCurrency = (amount: number) => `$${amount}`;

// Price accuracy functions (matching city-card.tsx)
const getAccuracyLevel = (city: CityRecommendation): "verified" | "estimated" | "approximate" => {
  // Check if city has Claude data
  const claudeCosts = ClaudeDailyCosts.getDailyCosts(city.city);
  
  if (claudeCosts?.accommodation) {
    // Has comprehensive accommodation and daily cost data
    return "verified";
  } else if (claudeCosts) {
    // Has daily costs but estimated hotel rates
    return "estimated";
  } else {
    // No Claude data, using regional estimates
    return "approximate";
  }
};

const accuracyClasses = {
  verified: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
  estimated: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  approximate: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
} as const;

const getAccuracyTooltip = (level: "verified" | "estimated" | "approximate") => {
  switch (level) {
    case "verified":
      return "Verified Pricing: Real market data analyzed by AI from current hotel rates and comprehensive local cost analysis";
    case "estimated":
      return "Estimated Pricing: AI-powered estimates based on detailed local knowledge with some market rate interpolation";
    case "approximate":
      return "Approximate Pricing: AI estimates using regional patterns and historical data - less precise but directionally accurate";
  }
};

// Cultural insights interface and data
interface CulturalInsights {
  primaryLanguage: string;
  secondaryLanguages?: string[];
  currency: string;
  culturalNorms: string[];
  tippingCustoms: string;
  businessHours: string;
  localEtiquette: string[];
  religiousConsiderations?: string[];
  safetyTips: string[];
  localCuisine: string[];
  transportTips: string[];
}

const culturalData: Record<string, CulturalInsights> = {
  tokyo: {
    primaryLanguage: "Japanese",
    secondaryLanguages: ["English (limited)"],
    currency: "Japanese Yen (¥)",
    culturalNorms: [
      "Bowing is a common greeting - reciprocate with a slight nod",
      "Remove shoes when entering homes, temples, and some restaurants",
      "Avoid eating or drinking while walking",
      "Keep conversations quiet on public transport"
    ],
    tippingCustoms: "Tipping is not customary and can be considered rude",
    businessHours: "Most shops: 10 AM - 8 PM, Restaurants: 11 AM - 10 PM",
    localEtiquette: [
      "Point with your whole hand, not a single finger",
      "Don't blow your nose in public",
      "Slurping noodles is acceptable and shows appreciation",
      "Always use both hands when giving/receiving business cards"
    ],
    religiousConsiderations: [
      "Dress modestly when visiting temples and shrines",
      "Follow purification rituals at shrine entrances",
      "Photography may be restricted in some religious sites"
    ],
    safetyTips: [
      "Japan is extremely safe - violent crime is rare",
      "Carry cash as many places don't accept cards",
      "Download translation apps for emergencies",
      "Keep your passport with you at all times"
    ],
    localCuisine: [
      "Try authentic ramen, sushi, and tempura",
      "Visit izakayas (Japanese pubs) for local atmosphere",
      "Don't miss seasonal specialties like sakura mochi in spring",
      "Convenience store food is surprisingly good and cheap"
    ],
    transportTips: [
      "Get a JR Pass for unlimited train travel",
      "Download Google Translate with camera for signs",
      "Rush hours are 7-9 AM and 5-7 PM - avoid if possible",
      "Trains stop running around midnight"
    ]
  },
  paris: {
    primaryLanguage: "French",
    secondaryLanguages: ["English (widely spoken in tourist areas)"],
    currency: "Euro (€)",
    culturalNorms: [
      "Always greet with 'Bonjour/Bonsoir' when entering shops",
      "Dress well - Parisians value style and appearance",
      "Dining is leisurely - don't rush meals",
      "Say 'Excusez-moi' to get attention, not 'Garçon'"
    ],
    tippingCustoms: "10% is standard for good service, round up for drinks",
    businessHours: "Most shops: 9 AM - 7 PM (closed Sundays), Restaurants: 12-2 PM, 7-10 PM",
    localEtiquette: [
      "Learn basic French phrases - effort is appreciated",
      "Don't speak loudly in public places",
      "Wait to be seated at restaurants",
      "Keep hands visible on the table while dining"
    ],
    religiousConsiderations: [
      "Dress modestly when visiting churches and cathedrals",
      "Remain quiet and respectful in religious sites",
      "Some churches have specific visiting hours"
    ],
    safetyTips: [
      "Watch for pickpockets on metro and tourist areas",
      "Avoid displaying expensive items openly",
      "Be cautious around major tourist attractions",
      "Emergency number is 112"
    ],
    localCuisine: [
      "Try croissants from local bakeries, not tourist cafes",
      "Visit traditional bistros for authentic French cuisine",
      "Don't miss cheese and wine tastings",
      "Lunch is typically 12-2 PM, dinner after 7 PM"
    ],
    transportTips: [
      "Get a Navigo weekly pass for metro/bus",
      "Metro runs until 1:15 AM (2:15 AM Fridays/Saturdays)",
      "Validate your ticket or face fines",
      "Walking is often faster than metro in central areas"
    ]
  },
  london: {
    primaryLanguage: "English",
    secondaryLanguages: ["Many languages due to diversity"],
    currency: "British Pound (£)",
    culturalNorms: [
      "Queue politely and wait your turn - jumping queues is very rude",
      "Stand right, walk left on escalators",
      "Pub culture is important - buying rounds is expected",
      "Small talk about weather is common and appreciated"
    ],
    tippingCustoms: "10-15% in restaurants if service charge not included, round up for drinks",
    businessHours: "Most shops: 9 AM - 6 PM (later on Thursdays), Pubs: 11 AM - 11 PM",
    localEtiquette: [
      "Say 'please' and 'thank you' frequently",
      "Apologize even when it's not your fault - it's cultural",
      "Don't jump queues or cut in line",
      "Remove hats when entering churches"
    ],
    religiousConsiderations: [
      "Many historic churches welcome visitors during specific hours",
      "Be respectful during services",
      "Photography may be restricted in some religious sites"
    ],
    safetyTips: [
      "London is generally safe but watch for pickpockets in tourist areas",
      "Stay aware on public transport, especially at night",
      "Emergency number is 999 or 112",
      "Keep belongings secure in crowded areas"
    ],
    localCuisine: [
      "Try traditional fish and chips, Sunday roast, and afternoon tea",
      "Explore diverse food markets like Borough Market",
      "Pub food has improved significantly in recent years",
      "Don't miss Indian curry - it's practically a national dish"
    ],
    transportTips: [
      "Get an Oyster Card or use contactless payment",
      "Mind the gap when boarding the Tube",
      "Night Tube runs on weekends on some lines",
      "Black cabs are expensive but iconic - use Uber for cheaper rides"
    ]
  },
  bangkok: {
    primaryLanguage: "Thai",
    secondaryLanguages: ["English (in tourist areas)", "Chinese"],
    currency: "Thai Baht (฿)",
    culturalNorms: [
      "Wai greeting (hands together, slight bow) shows respect",
      "Never touch someone's head or point feet at people",
      "Remove shoes when entering temples and many homes",
      "Show respect for the Thai Royal Family at all times"
    ],
    tippingCustoms: "Not required but appreciated - round up bills or leave small change",
    businessHours: "Most shops: 10 AM - 9 PM, Street food: 6 AM - midnight",
    localEtiquette: [
      "Dress modestly, especially when visiting temples",
      "Don't raise your voice or show anger in public",
      "Use both hands when giving or receiving items",
      "Step over thresholds, don't step on them"
    ],
    religiousConsiderations: [
      "Cover shoulders and knees when visiting temples",
      "Remove shoes before entering temple buildings",
      "Don't point feet toward Buddha statues",
      "Women should not touch monks or hand them items directly"
    ],
    safetyTips: [
      "Bangkok is generally safe but watch for scams targeting tourists",
      "Be cautious of tuk-tuk drivers offering 'special deals'",
      "Don't accept drinks from strangers",
      "Use reputable taxi apps or metered taxis"
    ],
    localCuisine: [
      "Street food is safe, delicious, and incredibly cheap",
      "Try pad thai, som tam, mango sticky rice, and tom yum",
      "Specify spice level - Thai food can be very spicy",
      "Don't miss floating markets and food courts in malls"
    ],
    transportTips: [
      "BTS Skytrain and MRT are clean, efficient, and air-conditioned",
      "Tuk-tuks are fun but negotiate price beforehand",
      "Boat taxis on the river are scenic and practical",
      "Traffic is heavy - plan extra time for ground transport"
    ]
  },
  "new york": {
    primaryLanguage: "English",
    secondaryLanguages: ["Spanish", "Chinese", "Many others"],
    currency: "US Dollar ($)",
    culturalNorms: [
      "Walk fast and with purpose - don't block sidewalks",
      "Be direct in communication - New Yorkers appreciate efficiency",
      "Don't make eye contact with strangers on the subway",
      "Tipping is essential and expected in most service industries"
    ],
    tippingCustoms: "18-20% in restaurants, $1-2 per drink at bars, 15-20% for taxis",
    businessHours: "Many places open 24/7, most shops: 10 AM - 8 PM",
    localEtiquette: [
      "Keep right when walking, pass on the left",
      "Don't stop suddenly on busy sidewalks",
      "Hold elevator doors for others",
      "Be prepared to wait in lines for popular attractions"
    ],
    religiousConsiderations: [
      "NYC is very diverse - respect all religious practices",
      "Many beautiful churches and synagogues welcome visitors",
      "Be respectful during religious services"
    ],
    safetyTips: [
      "NYC is much safer than its reputation suggests",
      "Stay aware of your surroundings, especially late at night",
      "Keep valuables secure in crowded areas",
      "Emergency number is 911"
    ],
    localCuisine: [
      "Try authentic NYC pizza, bagels, and deli sandwiches",
      "Explore diverse neighborhoods for ethnic cuisines",
      "Food trucks offer quick, affordable meals",
      "Don't miss classic NY cheesecake and hot dogs"
    ],
    transportTips: [
      "Get a MetroCard or use OMNY contactless payment",
      "Subway runs 24/7 but some lines have weekend service changes",
      "Taxis and rideshares are abundant but can be expensive",
      "Walking is often faster than driving in Manhattan"
    ]
  },
  rome: {
    primaryLanguage: "Italian",
    secondaryLanguages: ["English (in tourist areas)", "Spanish"],
    currency: "Euro (€)",
    culturalNorms: [
      "Greet with 'Ciao' (informal) or 'Buongiorno/Buonasera' (formal)",
      "Dress well - Italians take pride in appearance",
      "Meal times are later - lunch 1-3 PM, dinner after 8 PM",
      "Family is very important in Italian culture"
    ],
    tippingCustoms: "10% in restaurants if satisfied, round up for coffee and drinks",
    businessHours: "Shops: 9 AM - 1 PM, 3:30-7:30 PM (siesta break), Restaurants: 12:30-3 PM, 7:30-11 PM",
    localEtiquette: [
      "Don't order cappuccino after 11 AM (considered a breakfast drink)",
      "Eat pasta with a fork only - no spoon needed",
      "Don't ask for parmesan on seafood pasta",
      "Stand at the bar for cheaper coffee prices"
    ],
    religiousConsiderations: [
      "Dress modestly when visiting churches (cover shoulders and knees)",
      "St. Peter's Basilica and other major churches have strict dress codes",
      "Be respectful during religious services",
      "Many churches close for lunch (12:30-3:30 PM)"
    ],
    safetyTips: [
      "Rome is generally safe but watch for pickpockets near tourist sites",
      "Be cautious around Termini Station and on crowded buses",
      "Avoid walking alone in quiet areas late at night",
      "Emergency number is 112"
    ],
    localCuisine: [
      "Try authentic Roman dishes: carbonara, cacio e pepe, amatriciana",
      "Gelato is best from gelaterias, not tourist shops",
      "Aperitivo culture - drinks with snacks before dinner",
      "Pizza al taglio (by the slice) is perfect for lunch"
    ],
    transportTips: [
      "Buy metro tickets before boarding - validate them",
      "Walking is often faster than public transport in the center",
      "Taxis are expensive - use only official white taxis",
      "Many attractions are within walking distance of each other"
    ]
  },
  barcelona: {
    primaryLanguage: "Catalan",
    secondaryLanguages: ["Spanish", "English (in tourist areas)"],
    currency: "Euro (€)",
    culturalNorms: [
      "Greet with two kisses on the cheek (air kisses)",
      "Dinner is very late - typically after 9 PM",
      "Siesta time is respected - many shops close 2-5 PM",
      "Catalan culture is distinct from Spanish culture"
    ],
    tippingCustoms: "5-10% in restaurants if satisfied, round up for drinks and taxis",
    businessHours: "Shops: 9 AM - 2 PM, 5-8 PM, Restaurants: 1-4 PM, 8 PM-midnight",
    localEtiquette: [
      "Learn a few words in Catalan - it's appreciated",
      "Don't expect restaurants to be open between meal times",
      "Topless sunbathing is normal on beaches",
      "Don't walk around the city in beachwear"
    ],
    religiousConsiderations: [
      "Sagrada Familia and other churches require modest dress",
      "Cover shoulders and knees when visiting religious sites",
      "Book tickets in advance for popular churches",
      "Be respectful of ongoing construction at Sagrada Familia"
    ],
    safetyTips: [
      "Watch for pickpockets on Las Ramblas and in metro",
      "Be cautious with belongings on beaches",
      "Avoid walking alone in El Raval area late at night",
      "Emergency number is 112"
    ],
    localCuisine: [
      "Try authentic paella (not the touristy versions on Las Ramblas)",
      "Tapas culture - small plates shared with drinks",
      "Pa amb tomàquet (bread with tomato) is a local staple",
      "Don't miss pintxos bars in the Gothic Quarter"
    ],
    transportTips: [
      "Get a T-10 ticket for multiple metro/bus rides",
      "Metro runs until 2 AM on weekdays, 24 hours on weekends",
      "Bicing (bike sharing) is popular and tourist-friendly",
      "Beach is easily accessible by metro"
    ]
  },
  sydney: {
    primaryLanguage: "English",
    secondaryLanguages: ["Mandarin", "Arabic", "Cantonese"],
    currency: "Australian Dollar (A$)",
    culturalNorms: [
      "Australians are generally laid-back and friendly",
      "Mate culture - calling people 'mate' is common and friendly",
      "Outdoor lifestyle is central - beaches, BBQs, and sports",
      "Work-life balance is highly valued"
    ],
    tippingCustoms: "10-15% in restaurants for good service, not mandatory",
    businessHours: "Most shops: 9 AM - 5:30 PM (9 PM Thursdays), Restaurants vary widely",
    localEtiquette: [
      "Remove shoes when entering homes",
      "Australians value punctuality",
      "Don't take yourself too seriously - humor is appreciated",
      "Sun safety is taken very seriously"
    ],
    religiousConsiderations: [
      "Australia is multicultural with many faiths represented",
      "St. Mary's Cathedral and other historic churches welcome visitors",
      "Be respectful of all religious practices"
    ],
    safetyTips: [
      "Sydney is very safe with low crime rates",
      "Be sun smart - UV levels are extreme, use sunscreen",
      "Be aware of strong ocean currents and swim between flags",
      "Emergency number is 000"
    ],
    localCuisine: [
      "Try meat pies, fish and chips, and pavlova",
      "Coffee culture is excellent - flat whites originated here",
      "Fresh seafood and barbecue are staples",
      "Don't miss Tim Tams and Vegemite (acquired taste)"
    ],
    transportTips: [
      "Get an Opal Card for public transport",
      "Ferries are scenic and practical for harbor travel",
      "Trains connect most areas but can be delayed",
      "Walking and cycling are popular in the city center"
    ]
  }
};

const getCulturalInsights = (cityKey: string): CulturalInsights | null => {
  return culturalData[cityKey.toLowerCase()] || null;
};

// Hook to detect mobile devices
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

// Seasonal data utility functions
const getSeasonalData = (cityKey: string, hotelPrice: number, dailyCosts: number) => {
  // Realistic hotel seasonal multipliers - hotels vary significantly by season
  const hotelMultipliers = {
    winter: 0.75,  // 25% cheaper hotels
    spring: 1.0,   // baseline pricing
    summer: 1.4,   // 40% more expensive (peak season)
    fall: 0.85     // 15% cheaper
  };
  
  const crowdLevels = {
    winter: 25,   // Very low crowds
    spring: 75,   // High crowds (good weather)
    summer: 95,   // Very high crowds (peak season)
    fall: 55      // Moderate crowds
  };
  
  const currentSeason = getCurrentSeason();
  
  return [
    { 
      season: 'Winter', 
      month: 'Dec-Feb',
      hotelMultiplier: hotelMultipliers.winter,
      hotelPrice: Math.round(hotelPrice * hotelMultipliers.winter),
      dailyCosts: dailyCosts, // Daily costs stay the same
      totalDaily: Math.round(hotelPrice * hotelMultipliers.winter + dailyCosts),
      crowdLevel: crowdLevels.winter,
      isCurrent: currentSeason === 'winter',
      weather: '❄️',
      description: 'Budget-Friendly & Quiet',
      recommendation: 'Great value with fewer crowds, but check weather conditions'
    },
    { 
      season: 'Spring', 
      month: 'Mar-May',
      hotelMultiplier: hotelMultipliers.spring,
      hotelPrice: Math.round(hotelPrice * hotelMultipliers.spring),
      dailyCosts: dailyCosts,
      totalDaily: Math.round(hotelPrice * hotelMultipliers.spring + dailyCosts),
      crowdLevel: crowdLevels.spring,
      isCurrent: currentSeason === 'spring',
      weather: '🌸',
      description: 'Perfect Weather',
      recommendation: 'Ideal weather and blooming seasons, book early'
    },
    { 
      season: 'Summer', 
      month: 'Jun-Aug',
      hotelMultiplier: hotelMultipliers.summer,
      hotelPrice: Math.round(hotelPrice * hotelMultipliers.summer),
      dailyCosts: dailyCosts,
      totalDaily: Math.round(hotelPrice * hotelMultipliers.summer + dailyCosts),
      crowdLevel: crowdLevels.summer,
      isCurrent: currentSeason === 'summer',
      weather: '☀️',
      description: 'Peak Season',
      recommendation: 'Highest prices and crowds, book months ahead'
    },
    { 
      season: 'Fall', 
      month: 'Sep-Nov',
      hotelMultiplier: hotelMultipliers.fall,
      hotelPrice: Math.round(hotelPrice * hotelMultipliers.fall),
      dailyCosts: dailyCosts,
      totalDaily: Math.round(hotelPrice * hotelMultipliers.fall + dailyCosts),
      crowdLevel: crowdLevels.fall,
      isCurrent: currentSeason === 'fall',
      weather: '🍂',
      description: 'Great Value',
      recommendation: 'Good weather, moderate crowds, excellent value'
    }
  ];
};

const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 11 || month <= 1) return 'winter';
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  return 'fall';
};

// Interactive Seasonal Chart Component
function SeasonalChart({ cityKey, hotelPrice, dailyCosts }: { cityKey: string, hotelPrice: number, dailyCosts: number }) {
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const seasonalData = getSeasonalData(cityKey, hotelPrice, dailyCosts);
  const maxPrice = Math.max(...seasonalData.map(s => s.hotelPrice));

  return (
    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-sm text-blue-800">Best Time to Visit & Hotel Pricing</span>
      </div>
      
      {/* Interactive Chart */}
      <div className="space-y-4">
        {/* Hotel Price Chart */}
        <div>
          <div className="text-xs text-blue-600 mb-2 font-medium">
            Hotel Costs by Season
            <span className="text-gray-500 font-normal ml-1">(daily costs remain ~${dailyCosts})</span>
          </div>
          <div className="flex items-end gap-2 h-20 bg-white rounded-lg p-3">
            {seasonalData.map((season, idx) => (
              <div 
                key={season.season}
                className="flex-1 flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105"
                onMouseEnter={() => setSelectedSeason(season.season)}
                onMouseLeave={() => setSelectedSeason(null)}
              >
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    season.isCurrent 
                      ? 'bg-blue-500 shadow-lg' 
                      : selectedSeason === season.season
                      ? 'bg-blue-400'
                      : 'bg-blue-300'
                  }`}
                  style={{ 
                    height: `${(season.hotelPrice / maxPrice) * 100}%`,
                    minHeight: '20px'
                  }}
                />
                <div className="mt-1 text-center">
                  <div className="text-xs font-medium text-gray-700">{season.weather}</div>
                  <div className="text-xs text-gray-600">{season.season}</div>
                  {(selectedSeason === season.season || season.isCurrent) && (
                    <div className="text-xs font-bold text-blue-700">
                      ${season.hotelPrice}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crowd Level Chart */}
        <div>
          <div className="text-xs text-blue-600 mb-2 font-medium">Tourist Crowd Levels</div>
          <div className="space-y-2">
            {seasonalData.map((season) => (
              <div 
                key={`crowd-${season.season}`}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                  selectedSeason === season.season || season.isCurrent
                    ? 'bg-white shadow-sm'
                    : 'bg-white/50'
                }`}
                onMouseEnter={() => setSelectedSeason(season.season)}
                onMouseLeave={() => setSelectedSeason(null)}
              >
                <div className="w-16 text-xs font-medium text-gray-700">
                  {season.season}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          season.crowdLevel > 80 ? 'bg-red-500' :
                          season.crowdLevel > 60 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${season.crowdLevel}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 w-8">
                      {season.crowdLevel}%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 w-28 text-right leading-relaxed">
                  {season.description}
                </div>
                {season.isCurrent && (
                  <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    Now
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Season Details */}
        {selectedSeason && (
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            {(() => {
              const season = seasonalData.find(s => s.season === selectedSeason);
              if (!season) return null;
              
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-blue-800">
                      {season.weather} {season.season} ({season.month})
                    </span>
                    <span className="text-sm font-bold text-blue-700">
                      ${season.hotelPrice} hotels + ${season.dailyCosts} daily
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-600">Hotel Price vs Current: </span>
                      <span className={`font-medium ${
                        season.hotelPrice < hotelPrice ? 'text-green-600' : 
                        season.hotelPrice > hotelPrice ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {season.hotelPrice < hotelPrice ? '-' : season.hotelPrice > hotelPrice ? '+' : ''}
                        {Math.abs(Math.round(((season.hotelPrice - hotelPrice) / hotelPrice) * 100))}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Crowds: </span>
                      <span className={`font-medium ${
                        season.crowdLevel > 80 ? 'text-red-600' :
                        season.crowdLevel > 60 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {season.crowdLevel > 80 ? 'Very Busy' :
                         season.crowdLevel > 60 ? 'Moderate' : 'Quiet'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 italic bg-blue-50 p-2 rounded">
                    💡 <strong>Best for:</strong> {season.recommendation}
                  </div>
                </div>
              );
            })()} 
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for responsive detailed breakdown display
function ResponsiveBreakdownDisplay({ 
  category, 
  amount,
  claudeData, 
  travelStyle, 
  cityKey,
  colorClass 
}: { 
  category: string,
  amount: number,
  claudeData: any, 
  travelStyle: "budget" | "mid" | "luxury",
  cityKey: string,
  colorClass: string
}) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Fix the mapping between travelStyle and data structure
  const styleMapping = {
    budget: 'budget',
    mid: 'midRange',  // This was the issue - 'mid' should map to 'midRange'
    luxury: 'luxury'
  };
  
  const detailedBreakdown = claudeData?.detailedBreakdown?.[styleMapping[travelStyle]];
  const categoryData = detailedBreakdown?.[category];
  
  if (!categoryData || !categoryData.examples) {
    // Fallback for cities without detailed breakdown
    return (
      <div className="flex justify-between items-center">
        <span className={`${colorClass.replace('text-', 'text-').replace('-800', '-700')} font-medium capitalize`}>{category}:</span>
        <span className={`font-bold ${colorClass}`}>{formatCurrency(amount)}</span>
      </div>
    );
  }

  if (isMobile) {
    // Mobile: Expandable section
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="flex justify-between items-center w-full p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
          <span className={`${colorClass.replace('text-', 'text-').replace('-800', '-700')} font-medium capitalize`}>{category}:</span>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${colorClass}`}>{formatCurrency(amount)}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-2 pb-2">
          <div className="mt-3 space-y-3 text-sm">
            <div className="font-medium text-gray-700">
              Examples in {getDisplayCityName(cityKey)}:
            </div>
            <div className="space-y-1 pl-2">
              {categoryData.examples.slice(0, 4).map((example: string, index: number) => (
                <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-xs mt-1 text-gray-400">•</span>
                  <span>{example}</span>
                </div>
              ))}
            </div>
            {categoryData.tips && categoryData.tips.length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <div className="font-medium text-sm text-blue-700 mb-2">Local Tips:</div>
                {categoryData.tips.slice(0, 2).map((tip: string, index: number) => (
                  <div key={index} className="text-sm text-blue-600 flex items-start gap-2 mb-1">
                    <span className="text-xs mt-1">💡</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  } else {
    // Desktop: Tooltip
    return (
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className={`${colorClass.replace('text-', 'text-').replace('-800', '-700')} font-medium capitalize`}>{category}:</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help ml-1" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm p-4">
              <div className="space-y-3">
                <div className="font-semibold text-sm capitalize">
                  {category} Examples in {getDisplayCityName(cityKey)}:
                </div>
                <div className="space-y-1">
                  {categoryData.examples.slice(0, 4).map((example: string, index: number) => (
                    <div key={index} className="text-xs text-gray-700">
                      • {example}
                    </div>
                  ))}
                </div>
                {categoryData.tips && categoryData.tips.length > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="font-medium text-xs text-blue-700 mb-1">Local Tips:</div>
                    {categoryData.tips.slice(0, 2).map((tip: string, index: number) => (
                      <div key={index} className="text-xs text-blue-600">
                        💡 {tip}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <span className={`font-bold ${colorClass}`}>{formatCurrency(amount)}</span>
      </div>
    );
  }
}

// Mobile-friendly expandable breakdown component
function MobileBreakdownSection({ 
  category, 
  amount, 
  claudeData, 
  travelStyle, 
  cityKey,
  colorClass 
}: { 
  category: string, 
  amount: number, 
  claudeData: any, 
  travelStyle: "budget" | "mid" | "luxury",
  cityKey: string,
  colorClass: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Fix the mapping between travelStyle and data structure
  const styleMapping = {
    budget: 'budget',
    mid: 'midRange',  // This was the issue - 'mid' should map to 'midRange'
    luxury: 'luxury'
  };
  
  const detailedBreakdown = claudeData?.detailedBreakdown?.[styleMapping[travelStyle]];
  const categoryData = detailedBreakdown?.[category];
  
  const formatCurrency = (amount: number) => `$${amount}`;
  
  if (!categoryData || !categoryData.examples) {
    // Fallback to simple display if no detailed data
    return (
      <div className="flex justify-between items-center py-2">
        <span className={`${colorClass} font-medium capitalize`}>{category}:</span>
        <span className={`font-bold ${colorClass.replace('text-', 'text-').replace('-700', '-800')}`}>
          {formatCurrency(amount)}
        </span>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left">
        <span className={`${colorClass} font-medium capitalize`}>{category}:</span>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${colorClass.replace('text-', 'text-').replace('-700', '-800')}`}>
            {formatCurrency(amount)}
          </span>
          <ChevronDown className={`w-4 h-4 ${colorClass} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-3">
        <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-3">
          <div className="space-y-1">
            <div className="font-medium text-sm text-gray-800">Examples:</div>
            {categoryData.examples.slice(0, 4).map((example: string, index: number) => (
              <div key={index} className="text-sm text-gray-700 pl-2">
                • {example}
              </div>
            ))}
          </div>
          {categoryData.tips && categoryData.tips.length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <div className="font-medium text-sm text-blue-700 mb-1">Local Tips:</div>
              {categoryData.tips.slice(0, 2).map((tip: string, index: number) => (
                <div key={index} className="text-sm text-blue-600 pl-2">
                  💡 {tip}
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface CityModalProps {
  city: CityRecommendation | null;
  isOpen: boolean;
  onClose: () => void;
  travelStyle?: "budget" | "mid" | "luxury";
  userBudget?: number;
  originAirport?: string;
}

export function CityModal({ 
  city, 
  isOpen, 
  onClose, 
  travelStyle = "budget",
  userBudget = 0,
  originAirport
}: CityModalProps) {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!city) return null;

  // Get Claude data for enhanced breakdown
  const claudeData = ClaudeDailyCosts.getDailyCosts(city.city);
  
  // Calculate trip total based on travel style
  const getTripTotal = () => {
    if (city.totals) {
      switch (travelStyle) {
        case "luxury": return city.totals.p75;
        case "mid": return city.totals.p50;
        default: return city.totals.p25;
      }
    }
    return 0;
  };

  // Determine budget alignment
  const getBudgetAlignment = (tripTotal: number) => {
    if (!userBudget) return { 
      status: "mid_range_fit", 
      color: "bg-blue-100 text-blue-800",
      difference: 0,
      percentage: 0
    };
    
    const difference = tripTotal - userBudget;
    const percentage = (Math.abs(difference) / userBudget) * 100;
    const ratio = tripTotal / userBudget;
    
    if (ratio <= 1.0) {
      return { 
        status: "under_budget", 
        color: "bg-green-100 text-green-800", 
        icon: TrendingDown,
        difference,
        percentage
      };
    } else if (ratio <= 1.1) {
      return { 
        status: "slightly_over", 
        color: "bg-yellow-100 text-yellow-800", 
        icon: Minus,
        difference,
        percentage
      };
    } else {
      return { 
        status: "over_budget", 
        color: "bg-red-100 text-red-800", 
        icon: TrendingUp,
        difference,
        percentage
      };
    }
  };

  const tripTotal = getTripTotal();
  const budgetAlignment = getBudgetAlignment(tripTotal);
  const showFlightCosts = import.meta.env.VITE_SHOW_FLIGHT_COSTS === 'true';
  const displayTotal = showFlightCosts ? tripTotal : (tripTotal - (city.breakdown?.flight || 0));

  // Format currency
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount == null || isNaN(amount)) return '$0';
    return `$${amount.toLocaleString()}`;
  };

  // Get budget alignment text
  const getBudgetText = (status: string) => {
    switch (status) {
      case "under_budget": return "Under Budget";
      case "slightly_over": return "Slightly Over Budget";
      case "over_budget": return "Over Budget";
      default: return "Mid-Range Fit";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-auto">
        <DialogHeader>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        {/* Top Section - Overview */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-background rounded-full border-2">
              {getFlagImageComponent(city.country)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{city.city}</h2>
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground">{city.country} • {city.region}</p>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-help">
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className={`text-xs whitespace-nowrap border px-2 py-0.5 font-medium ${accuracyClasses[getAccuracyLevel(city)]}`}>
                            {(() => {
                              const level = getAccuracyLevel(city);
                              return level.charAt(0).toUpperCase() + level.slice(1);
                            })()} Pricing
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-2 text-xs">
                          <p><strong>Verified:</strong> Real market data analyzed by AI from current hotel rates and comprehensive local cost analysis</p>
                          <p><strong>Estimated:</strong> AI-powered estimates based on detailed local knowledge with market rate interpolation</p>
                          <p><strong>Approximate:</strong> AI estimates using regional patterns and historical data - directionally accurate</p>
                          <div className="pt-2 border-t border-gray-200 space-y-1">
                            <p className="font-medium">Current data sources:</p>
                            <p>• Hotels: {claudeData?.accommodation ? "Real market rates" : claudeData ? "AI estimates" : "Regional averages"}</p>
                            <p>• Daily costs: {claudeData ? "Local AI analysis" : "Regional patterns"}</p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>

          {/* City Description Placeholder */}
          <p className="text-sm text-muted-foreground">
            {city.city} is a vibrant destination offering unique cultural experiences and attractions for travelers.
          </p>

          {/* Trip Total and Budget Alignment */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 border border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="relative p-6">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-sm font-medium text-primary">Estimated Trip Total</p>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {(() => {
                    const baseTotal = displayTotal;
                    const lowerBound = Math.round(baseTotal * 0.85); // 15% lower
                    const upperBound = Math.round(baseTotal * 1.15); // 15% higher
                    return `${formatCurrency(lowerBound)} - ${formatCurrency(upperBound)}`;
                  })()} 
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{city.nights} nights</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${
                      travelStyle === "budget" ? "bg-green-500" :
                      travelStyle === "mid" ? "bg-blue-500" : "bg-purple-500"
                    }`} />
                    <span className="capitalize">{travelStyle === "mid" ? "Mid-Range" : travelStyle} style</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <span>Excludes flights</span>
                </div>
              </div>
              <div className="flex justify-center">
                <Badge className={`${budgetAlignment.color} border-0 shadow-md`}>
                  <div className="flex items-center gap-1">
                    {budgetAlignment.icon && <budgetAlignment.icon className="h-3 w-3" />}
                    {getBudgetText(budgetAlignment.status)}
                  </div>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="costs">Cost Breakdown</TabsTrigger>
            <TabsTrigger value="insights">Smart Insights</TabsTrigger>
            <TabsTrigger value="culture">Cultural Guide</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-6">
            {/* Quick Summary Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Trip Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-bold text-blue-700">{city.nights} nights</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-muted-foreground">Daily Budget</p>
                    <p className="font-bold text-green-700">
                      {formatCurrency((() => {
                        if (!claudeData?.breakdown) return city.breakdown?.dailyPerDay || 0;
                        const breakdown = travelStyle === "luxury" ? claudeData.breakdown.luxury :
                                        travelStyle === "mid" ? claudeData.breakdown.midRange :
                                        claudeData.breakdown.budget;
                        if (!breakdown) return city.breakdown?.dailyPerDay || 0;
                        return breakdown.meals + breakdown.transport + breakdown.activities + breakdown.drinks;
                      })())}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm text-muted-foreground">Travel Style</p>
                    <p className="font-bold text-purple-700 capitalize">
                      {travelStyle === "mid" ? "Mid-Range" : travelStyle}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <MapPin className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm text-muted-foreground">Region</p>
                    <p className="font-bold text-orange-700 capitalize">{city.region.replace('_', ' ')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Breakdown Tab */}
          <TabsContent value="costs" className="space-y-4 mt-6">
            <Card>
              <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
            
            {/* Hotel Costs */}
            {claudeData?.accommodation && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Hotel Costs per Night</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className={`relative text-center p-4 rounded-lg border-2 transition-all ${
                    travelStyle === "budget" 
                      ? "bg-green-100 border-green-500 shadow-lg ring-2 ring-green-200" 
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}>
                    {travelStyle === "budget" && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                    <p className={`text-xs font-medium ${travelStyle === "budget" ? "text-green-700" : "text-muted-foreground"}`}>Budget</p>
                    <p className={`text-lg font-bold ${travelStyle === "budget" ? "text-green-800" : "text-gray-600"}`}>
                      {formatCurrency(claudeData.accommodation.budget)}
                    </p>
                    {travelStyle === "budget" && (
                      <p className="text-xs text-green-600 font-medium mt-1">Your Selection</p>
                    )}
                  </div>
                  <div className={`relative text-center p-4 rounded-lg border-2 transition-all ${
                    travelStyle === "mid" 
                      ? "bg-blue-100 border-blue-500 shadow-lg ring-2 ring-blue-200" 
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}>
                    {travelStyle === "mid" && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                    <p className={`text-xs font-medium ${travelStyle === "mid" ? "text-blue-700" : "text-muted-foreground"}`}>Mid-Range</p>
                    <p className={`text-lg font-bold ${travelStyle === "mid" ? "text-blue-800" : "text-gray-600"}`}>
                      {formatCurrency(claudeData.accommodation.midRange)}
                    </p>
                    {travelStyle === "mid" && (
                      <p className="text-xs text-blue-600 font-medium mt-1">Your Selection</p>
                    )}
                  </div>
                  <div className={`relative text-center p-4 rounded-lg border-2 transition-all ${
                    travelStyle === "luxury" 
                      ? "bg-purple-100 border-purple-500 shadow-lg ring-2 ring-purple-200" 
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}>
                    {travelStyle === "luxury" && (
                      <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                    <p className={`text-xs font-medium ${travelStyle === "luxury" ? "text-purple-700" : "text-muted-foreground"}`}>Luxury</p>
                    <p className={`text-lg font-bold ${travelStyle === "luxury" ? "text-purple-800" : "text-gray-600"}`}>
                      {formatCurrency(claudeData.accommodation.luxury)}
                    </p>
                    {travelStyle === "luxury" && (
                      <p className="text-xs text-purple-600 font-medium mt-1">Your Selection</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Daily Living Costs */}
            {claudeData?.breakdown && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Daily Living Costs</h4>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                    travelStyle === "budget" ? "bg-green-100 border-green-500 text-green-700" :
                    travelStyle === "mid" ? "bg-blue-100 border-blue-500 text-blue-700" :
                    "bg-purple-100 border-purple-500 text-purple-700"
                  }`}>
                    ✓ {travelStyle === "mid" ? "Mid-Range" : travelStyle.charAt(0).toUpperCase() + travelStyle.slice(1)} Style
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg border-2 shadow-lg ${
                  travelStyle === "budget" ? "bg-green-50 border-green-300 ring-2 ring-green-100" :
                  travelStyle === "mid" ? "bg-blue-50 border-blue-300 ring-2 ring-blue-100" :
                  "bg-purple-50 border-purple-300 ring-2 ring-purple-100"
                }`}>
                  <TooltipProvider>
                    {travelStyle === "luxury" && claudeData.breakdown.luxury && (
                    <div className="space-y-2">
                      <ResponsiveBreakdownDisplay 
                        category="meals" 
                        amount={claudeData.breakdown.luxury.meals}
                        claudeData={claudeData} 
                        travelStyle="luxury" 
                        cityKey={city.city}
                        colorClass="text-purple-800"
                      />
                      <ResponsiveBreakdownDisplay 
                        category="transport" 
                        amount={claudeData.breakdown.luxury.transport}
                        claudeData={claudeData} 
                        travelStyle="luxury" 
                        cityKey={city.city}
                        colorClass="text-purple-800"
                      />
                      <ResponsiveBreakdownDisplay 
                        category="activities" 
                        amount={claudeData.breakdown.luxury.activities}
                        claudeData={claudeData} 
                        travelStyle="luxury" 
                        cityKey={city.city}
                        colorClass="text-purple-800"
                      />
                      <ResponsiveBreakdownDisplay 
                        category="drinks" 
                        amount={claudeData.breakdown.luxury.drinks}
                        claudeData={claudeData} 
                        travelStyle="luxury" 
                        cityKey={city.city}
                        colorClass="text-purple-800"
                      />
                    </div>
                  )}
                  {travelStyle === "mid" && claudeData.breakdown.midRange && (
                    <div className="space-y-2">
                      <ResponsiveBreakdownDisplay 
                        category="meals" 
                        amount={claudeData.breakdown.midRange.meals}
                        claudeData={claudeData} 
                        travelStyle="mid" 
                        cityKey={city.city}
                        colorClass="text-blue-800"
                      />
                      <ResponsiveBreakdownDisplay 
                        category="transport" 
                        amount={claudeData.breakdown.midRange.transport}
                        claudeData={claudeData} 
                        travelStyle="mid" 
                        cityKey={city.city}
                        colorClass="text-blue-800"
                      />
                      <ResponsiveBreakdownDisplay 
                        category="activities" 
                        amount={claudeData.breakdown.midRange.activities}
                        claudeData={claudeData} 
                        travelStyle="mid" 
                        cityKey={city.city}
                        colorClass="text-blue-800"
                      />
                      <ResponsiveBreakdownDisplay 
                        category="drinks" 
                        amount={claudeData.breakdown.midRange.drinks}
                        claudeData={claudeData} 
                        travelStyle="mid" 
                        cityKey={city.city}
                        colorClass="text-blue-800"
                      />
                    </div>
                  )}
                  {travelStyle === "budget" && claudeData.breakdown.budget && (
                    <div className="space-y-2">
                      <ResponsiveBreakdownDisplay 
                        category="meals" 
                        amount={claudeData.breakdown.budget.meals}
                        claudeData={claudeData} 
                        travelStyle="budget" 
                        cityKey={city.city}
                        colorClass="text-green-800"
                      />
                      <ResponsiveBreakdownDisplay 
                        category="transport" 
                        amount={claudeData.breakdown.budget.transport}
                        claudeData={claudeData} 
                        travelStyle="budget" 
                        cityKey={city.city}
                        colorClass="text-green-800"
                      />
                      <ResponsiveBreakdownDisplay 
                        category="activities" 
                        amount={claudeData.breakdown.budget.activities}
                        claudeData={claudeData} 
                        travelStyle="budget" 
                        cityKey={city.city}
                        colorClass="text-green-800"
                      />
                      <ResponsiveBreakdownDisplay 
                        category="drinks" 
                        amount={claudeData.breakdown.budget.drinks}
                        claudeData={claudeData} 
                        travelStyle="budget" 
                        cityKey={city.city}
                        colorClass="text-green-800"
                      />
                    </div>
                  )}
                  
                  {/* Daily Total */}
                  <div className={`mt-4 pt-3 border-t ${
                    travelStyle === "budget" ? "border-green-300" :
                    travelStyle === "mid" ? "border-blue-300" :
                    "border-purple-300"
                  }`}>
                    <div className="flex justify-between font-bold text-base">
                      <span className={
                        travelStyle === "budget" ? "text-green-700" :
                        travelStyle === "mid" ? "text-blue-700" :
                        "text-purple-700"
                      }>Daily Total:</span>
                      <span className={
                        travelStyle === "budget" ? "text-green-800" :
                        travelStyle === "mid" ? "text-blue-800" :
                        "text-purple-800"
                      }>
                        {formatCurrency((() => {
                          if (!claudeData?.breakdown) return city.breakdown?.dailyPerDay || 0;
                          
                          const breakdown = travelStyle === "luxury" ? claudeData.breakdown.luxury :
                                          travelStyle === "mid" ? claudeData.breakdown.midRange :
                                          claudeData.breakdown.budget;
                          
                          if (!breakdown) return city.breakdown?.dailyPerDay || 0;
                          
                          return breakdown.meals + breakdown.transport + breakdown.activities + breakdown.drinks;
                        })())}
                      </span>
                    </div>
                  </div>
                  </TooltipProvider>
                </div>
              </div>
            )}
            </CardContent>
        </Card>

            {/* Cost Comparison */}
            {originAirport && (() => {
              const comparison = getCostComparison(city.city, originAirport, travelStyle === "mid" ? "midRange" : travelStyle);
              if (!comparison) return null;
              
              return (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Cost Comparison
                    </h3>
                    <div className="space-y-3">
                      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          Compared to {getDisplayCityName(comparison.homeCity)}
                        </p>
                        <p className="text-2xl font-bold text-blue-700">
                          {comparison.overallComparison.percentageDifference > 0 ? '+' : ''}{Math.round(comparison.overallComparison.percentageDifference)}%
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          {comparison.overallComparison.description}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Hotels</p>
                          <p className={`text-lg font-semibold ${comparison.hotelComparison.percentageDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {comparison.hotelComparison.percentageDifference > 0 ? '+' : ''}{Math.round(comparison.hotelComparison.percentageDifference)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {comparison.hotelComparison.description}
                          </p>
                        </div>
                        
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Daily Costs</p>
                          <p className={`text-lg font-semibold ${comparison.dailyComparison.percentageDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {comparison.dailyComparison.percentageDifference > 0 ? '+' : ''}{Math.round(comparison.dailyComparison.percentageDifference)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {comparison.dailyComparison.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </TabsContent>

          {/* Smart Insights Tab */}
          <TabsContent value="insights" className="space-y-4 mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Smart Insights</h3>
                <div className="space-y-4">
                  
                  {/* Interactive Seasonal Chart */}
                  <SeasonalChart 
                    cityKey={city.city} 
                    hotelPrice={(() => {
                      if (!claudeData?.accommodation) return 100; // fallback
                      return travelStyle === "luxury" ? claudeData.accommodation.luxury :
                             travelStyle === "mid" ? claudeData.accommodation.midRange :
                             claudeData.accommodation.budget;
                    })()} 
                    dailyCosts={(() => {
                      if (!claudeData?.breakdown) return 80; // fallback
                      const breakdown = travelStyle === "luxury" ? claudeData.breakdown.luxury :
                                      travelStyle === "mid" ? claudeData.breakdown.midRange :
                                      claudeData.breakdown.budget;
                      if (!breakdown) return 80;
                      return breakdown.meals + breakdown.transport + breakdown.activities + breakdown.drinks;
                    })()} 
                  />
                  
                  {/* Last Updated */}
                  {city.lastUpdatedISO && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Data updated: {new Date(city.lastUpdatedISO).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Travel Tips */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Travel Tips</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="font-medium text-sm">Travel Style Recommendations</span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {travelStyle === "budget" && (
                        <p>• Look for hostels, guesthouses, and street food to maximize your budget</p>
                      )}
                      {travelStyle === "mid" && (
                        <p>• Consider mid-range hotels and local restaurants for comfortable travel</p>
                      )}
                      {travelStyle === "luxury" && (
                        <p>• Enjoy premium accommodations and fine dining experiences</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="font-medium text-sm">Regional Insights</span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {city.region === "asia" && (
                        <p>• Asia offers exceptional value - your money goes further here</p>
                      )}
                      {city.region === "europe" && (
                        <p>• Europe can be pricey - consider shoulder season for better deals</p>
                      )}
                      {city.region === "north_america" && (
                        <p>• North America has varying costs - cities are expensive, rural areas more affordable</p>
                      )}
                      {city.region === "south_america" && (
                        <p>• South America offers great value, especially outside major cities</p>
                      )}
                      {city.region === "africa" && (
                        <p>• Africa provides incredible experiences at budget-friendly prices</p>
                      )}
                      {city.region === "oceania" && (
                        <p>• Oceania tends to be pricier but offers unique experiences</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-medium text-sm">Booking Tips</span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• Book accommodations 2-3 months ahead for best rates</p>
                      <p>• Consider travel insurance for international trips</p>
                      <p>• Check visa requirements and passport validity</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cultural Guide Tab */}
          <TabsContent value="culture" className="space-y-4 mt-6">
            {(() => {
              const cultural = getCulturalInsights(city.city);
              
              if (!cultural) {
                return (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Cultural Guide Coming Soon</h3>
                      <p className="text-muted-foreground">
                        We're working on adding detailed cultural insights for {city.city}. 
                        Check back soon for language tips, local customs, and cultural etiquette!
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <>
                  {/* Language & Currency */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Language & Currency</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Primary Language</h4>
                            <p className="font-semibold text-lg">{cultural.primaryLanguage}</p>
                          </div>
                          {cultural.secondaryLanguages && cultural.secondaryLanguages.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">Also Spoken</h4>
                              <div className="flex flex-wrap gap-2">
                                {cultural.secondaryLanguages.map((lang, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {lang}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Currency</h4>
                            <p className="font-semibold text-lg">{cultural.currency}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Tipping</h4>
                            <p className="text-sm">{cultural.tippingCustoms}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cultural Norms & Etiquette */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold">Cultural Norms & Etiquette</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-3">Essential Cultural Norms</h4>
                          <div className="space-y-2">
                            {cultural.culturalNorms.map((norm, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-green-600 mt-1">•</span>
                                <span>{norm}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-3">Local Etiquette</h4>
                          <div className="space-y-2">
                            {cultural.localEtiquette.map((etiquette, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{etiquette}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Practical Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Calendar className="h-5 w-5 text-purple-600" />
                          <h3 className="text-lg font-semibold">Practical Info</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Business Hours</h4>
                            <p className="text-sm">{cultural.businessHours}</p>
                          </div>
                          {cultural.religiousConsiderations && (
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-2">Religious Sites</h4>
                              <div className="space-y-1">
                                {cultural.religiousConsiderations.map((consideration, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-sm">
                                    <span className="text-purple-600 mt-1">•</span>
                                    <span>{consideration}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Lightbulb className="h-5 w-5 text-orange-600" />
                          <h3 className="text-lg font-semibold">Safety Tips</h3>
                        </div>
                        <div className="space-y-2">
                          {cultural.safetyTips.map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-orange-600 mt-1">•</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Local Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">🍽️ Food & Dining</h3>
                        <div className="space-y-2">
                          {cultural.localCuisine.map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-red-600 mt-1">•</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">🚌 Transportation</h3>
                        <div className="space-y-2">
                          {cultural.transportTips.map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-blue-600 mt-1">•</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              );
            })()}
          </TabsContent>
        </Tabs>
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Updated {new Date(city.lastUpdatedISO || '').toLocaleDateString()}
          </p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Plan This Trip
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}