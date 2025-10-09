// components/city-card.tsx  (Frontend bundle: project_bundle_frontend.txt)
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Bot, Calculator, TrendingUp, TrendingDown, MapPin, Heart, Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCountryFlag, getFlagImageComponent } from "@/lib/flag-utils";
import { ClaudeDailyCosts } from "@shared/data/claude-daily-costs";
import { getCostComparison, canCompareCosts } from "@shared/utils/cost-comparison";
import type { CityRecommendation } from "@/types/travel";

interface CityCardProps {
  city: CityRecommendation;
  onClick?: (city: CityRecommendation) => void;
  travelStyle?: "budget" | "mid" | "luxury";
  originAirport?: string;
}

export function CityCard({
  city,
  onClick,
  travelStyle = "budget",
  originAirport,
}: CityCardProps) {
  // Feature flag to show/hide flight costs
  // In Vite, environment variables are accessed via import.meta.env
  const showFlightCosts = import.meta.env.VITE_SHOW_FLIGHT_COSTS === 'true';
  
  // Hero image mapping for cities (starting with New York for testing)
  const getCityHeroImage = (cityName: string): string => {
    const cityImages: Record<string, string> = {
      "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=400&fit=crop&crop=center&auto=format&q=80", // Manhattan skyline
      "Los Angeles": "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800&h=400&fit=crop&crop=center&auto=format&q=80", // LA skyline
      "Chicago": "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=800&h=400&fit=crop&crop=center&auto=format&q=80", // Chicago skyline
      "San Francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=400&fit=crop&crop=center&auto=format&q=80", // Golden Gate Bridge
      "Las Vegas": "https://images.unsplash.com/photo-1605833618194-68d17ca59405?w=800&h=400&fit=crop&crop=center&auto=format&q=80", // Vegas strip
      "Miami": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&crop=center&auto=format&q=80", // Miami beach
      // Add more cities as needed
    };
    
    return cityImages[cityName] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop&crop=center&auto=format&q=80"; // Generic city fallback
  };

  // Function to identify capital cities
  const isCapitalCity = (cityName: string, country: string): boolean => {
    const capitals: Record<string, string[]> = {
      "United States": ["Washington", "Washington D.C."],
      "United Kingdom": ["London"],
      "Canada": ["Ottawa"],
      "France": ["Paris"],
      "Germany": ["Berlin"],
      "Italy": ["Rome"],
      "Spain": ["Madrid"],
      "Japan": ["Tokyo"],
      "China": ["Beijing"],
      "India": ["New Delhi", "Delhi"],
      "Australia": ["Canberra"],
      "Brazil": ["Brasília", "Brasilia"],
      "Mexico": ["Mexico City"],
      "Russia": ["Moscow"],
      "South Korea": ["Seoul"],
      "Thailand": ["Bangkok"],
      "Egypt": ["Cairo"],
      "South Africa": ["Cape Town", "Pretoria", "Bloemfontein"], // Multiple capitals
      "Netherlands": ["Amsterdam", "The Hague"], // Amsterdam is capital, The Hague is seat of government
      "Turkey": ["Ankara"],
      "Greece": ["Athens"],
      "Argentina": ["Buenos Aires"],
      "Chile": ["Santiago"],
      "Colombia": ["Bogotá", "Bogota"],
      "Peru": ["Lima"],
      "Malaysia": ["Kuala Lumpur"],
      "Singapore": ["Singapore"],
      "Indonesia": ["Jakarta"],
      "Philippines": ["Manila"],
      "Vietnam": ["Hanoi"],
      "Cambodia": ["Phnom Penh"],
      "Myanmar": ["Naypyidaw", "Yangon"], // Naypyidaw is capital, Yangon is largest city
      "Sri Lanka": ["Colombo", "Sri Jayawardenepura Kotte"],
      "Bangladesh": ["Dhaka"],
      "Pakistan": ["Islamabad"],
      "Nepal": ["Kathmandu"],
      "Israel": ["Jerusalem"],
      "Jordan": ["Amman"],
      "United Arab Emirates": ["Abu Dhabi"],
      "Qatar": ["Doha"],
      "Saudi Arabia": ["Riyadh"],
      "Morocco": ["Rabat"],
      "Kenya": ["Nairobi"],
      "Tanzania": ["Dodoma"],
      "Ethiopia": ["Addis Ababa"],
      "Ghana": ["Accra"],
      "Nigeria": ["Abuja"],
      "New Zealand": ["Wellington"],
      "Fiji": ["Suva"],
      "Costa Rica": ["San José", "San Jose"],
      "Panama": ["Panama City"],
      "Guatemala": ["Guatemala City"],
      "Jamaica": ["Kingston"],
      "Cuba": ["Havana"],
      "Dominican Republic": ["Santo Domingo"],
      "Czech Republic": ["Prague"],
      "Poland": ["Warsaw"],
      "Hungary": ["Budapest"],
      "Croatia": ["Zagreb"],
      "Romania": ["Bucharest"],
      "Bulgaria": ["Sofia"],
      "Norway": ["Oslo"],
      "Sweden": ["Stockholm"],
      "Denmark": ["Copenhagen"],
      "Finland": ["Helsinki"],
      "Iceland": ["Reykjavik"],
      "Austria": ["Vienna"],
      "Switzerland": ["Bern"],
      "Belgium": ["Brussels"],
      "Portugal": ["Lisbon"],
      "Ireland": ["Dublin"],
      "Kazakhstan": ["Nur-Sultan", "Astana"],
      "Mongolia": ["Ulaanbaatar"],
      "Uzbekistan": ["Tashkent"],
    };

    const countryCapitals = capitals[country];
    if (!countryCapitals) return false;
    
    return countryCapitals.some(capital => 
      cityName.toLowerCase().includes(capital.toLowerCase()) || 
      capital.toLowerCase().includes(cityName.toLowerCase())
    );
  };

  // Removed budget status badges - will add comprehensive badges once other filtering criteria (activity level, etc.) are defined
  
  const accuracyClasses = {
    verified: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    estimated:
      "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
    approximate: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
  } as const;

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

  const getSourceIcon = (source: "amadeus" | "claude" | "estimate") => {
    const common = "h-3.5 w-3.5";
    switch (source) {
      case "amadeus":
        return <Zap className={common} />;
      case "claude":
        return <Bot className={common} />;
      case "estimate":
        return <Calculator className={common} />;
    }
  };

  const getSourceTooltip = (
    source: "amadeus" | "claude" | "estimate",
    type: string,
    style: "budget" | "mid" | "luxury" = "budget"
  ) => {
    const styleText = style === "mid" ? "mid-range" : style;
    
    switch (source) {
      case "amadeus":
        if (type === "flight") {
          return "Live flight pricing: Averages 5 economy searches across multiple dates, removes luxury outliers (top 15%)";
        }
        return `Live ${type} pricing from Amadeus API`;
      case "claude":
        if (type === "hotel") {
          return `AI hotel estimates: Claude analyzes local rates for ${styleText} travelers, factoring in location and amenities`;
        }
        if (type === "daily") {
          const descriptions = {
            budget: "Budget traveler perspective (local transport, street food, budget activities)",
            mid: "Mid-range traveler perspective (mix of local/tourist transport, restaurants, standard attractions)",
            luxury: "Luxury traveler perspective (premium transport, fine dining, exclusive experiences)"
          };
          return `AI daily costs: ${descriptions[style]} using Claude's knowledge of local pricing`;
        }
        return `AI-powered ${type} estimates from Claude for ${styleText} travelers`;
      case "estimate":
        return `Fallback ${type} estimates for ${styleText} travelers based on historical data when live sources unavailable`;
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount == null || isNaN(amount)) return '$0';
    return `$${amount.toLocaleString()}`;
  };
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  // Get Claude-based daily costs with fallback to original logic
  const getClaudeDailyCosts = (
    city: CityRecommendation,
    style: "budget" | "mid" | "luxury",
  ) => {
    // Try to get costs from Claude database first
    console.log(`🔍 Looking up Claude data for: "${city.city}" (${style})`);
    const claudeCosts = ClaudeDailyCosts.getDailyCosts(city.city);
    
    if (claudeCosts) {
      console.log(`✅ Found Claude data for ${city.city}:`, claudeCosts);
      // Use accommodation costs if available (realistic hotel + Airbnb blended pricing)
      if (claudeCosts.accommodation) {
        const styleKey = style === "mid" ? "midRange" : style;
        const hotelPerNight = claudeCosts.accommodation[styleKey as keyof typeof claudeCosts.accommodation];
        
        // Use daily costs for other expenses
        const dailyCost = claudeCosts.dailyCost[styleKey as keyof typeof claudeCosts.dailyCost];
        const adjustedDaily = dailyCost;
        
        // Calculate total (flights unchanged if available, or 0 if no flight data)
        const flightCost = city.breakdown?.flight || 0;
        const total = flightCost + city.nights * (hotelPerNight + adjustedDaily);
        
        // Debug logging
        console.log(`🔍 ${city.city} Claude accommodation data (${style}):`, {
          city: city.city,
          style,
          styleKey,
          hotelPerNight,
          adjustedDaily,
          total,
          source: 'claude-accommodation'
        });
        
        return {
          hotelPerNight,
          adjustedDaily,
          total,
          source: 'claude-accommodation' as const
        };
      }
      
      // Fallback to daily costs only with estimated hotel costs
      const styleKey = style === "mid" ? "midRange" : style;
      const dailyCost = claudeCosts.dailyCost[styleKey as keyof typeof claudeCosts.dailyCost];
      
      // Hotel cost estimates when accommodation data not available
      const hotelEstimates = {
        budget: { base: 45, multiplier: 1.0 },
        mid: { base: 85, multiplier: 1.2 },
        luxury: { base: 200, multiplier: 1.5 }
      };
      
      const estimate = style === "mid" ? hotelEstimates.mid : hotelEstimates[style as keyof typeof hotelEstimates];
      const hotelPerNight = Math.round(estimate.base * estimate.multiplier);
      
      // Daily costs from Claude are already the complete daily expenses
      const adjustedDaily = dailyCost;
      
      // Calculate total (flights unchanged if available, or 0 if no flight data)
      const flightCost = city.breakdown?.flight || 0;
      const total = flightCost + city.nights * (hotelPerNight + adjustedDaily);
      
      // Debug logging
      console.log(`🔍 ${city.city} Claude daily costs data (${style}):`, {
        city: city.city,
        style,
        styleKey,
        hotelPerNight,
        adjustedDaily,
        total,
        claudeCosts: claudeCosts.dailyCost,
        source: 'claude'
      });
      
      return {
        hotelPerNight,
        adjustedDaily,
        total,
        source: 'claude' as const
      };
    } else {
      console.log(`❌ No Claude data found for: "${city.city}"`);
    }

    // Fallback to original logic if city not in Claude database
    if ('travelStyleAdjusted' in city && city.travelStyleAdjusted && 
        typeof city.travelStyleAdjusted === 'object' &&
        'style' in city.travelStyleAdjusted && 
        'hotelPerNight' in city.travelStyleAdjusted &&
        'dailyPerDay' in city.travelStyleAdjusted &&
        'total' in city.travelStyleAdjusted &&
        city.travelStyleAdjusted.style === style) {
      return {
        hotelPerNight: city.travelStyleAdjusted.hotelPerNight as number,
        adjustedDaily: city.travelStyleAdjusted.dailyPerDay as number,
        total: city.travelStyleAdjusted.total as number,
        source: 'backend' as const
      };
    }

    // Final fallback with simplified calculation
    const baseDaily = city.breakdown?.dailyPerDay || (style === "budget" ? 25 : style === "mid" ? 50 : 120);
    const multiplier = style === "budget" ? 0.85 : style === "mid" ? 1.0 : 1.6;
    const adjustedDaily = Math.round(baseDaily * multiplier);
    const hotelPerNight = style === "budget" ? 45 : style === "mid" ? 85 : 185;
    const flightCost = city.breakdown?.flight || 0;
    const total = flightCost + city.nights * (hotelPerNight + adjustedDaily);

    // Debug logging
    console.log(`🔍 ${city.city} fallback data (${style}):`, {
      city: city.city,
      style,
      baseDaily,
      multiplier,
      adjustedDaily,
      hotelPerNight,
      total,
      source: 'fallback'
    });

    return {
      hotelPerNight,
      adjustedDaily, 
      total,
      source: 'fallback' as const
    };
  };

  const getDisplayTotal = (city: CityRecommendation, style: "budget" | "mid" | "luxury") => {
    // First try Claude calculation for more accurate and differentiated pricing
    const claudeCalculation = getClaudeDailyCosts(city, style);
    if (claudeCalculation.source === 'claude-accommodation' || claudeCalculation.source === 'claude') {
      console.log(`🔍 ${city.city} using Claude data (${style}):`, claudeCalculation);
      return claudeCalculation.total;
    }
    
    // Use backend's calculated totals based on travel style as fallback
    if (city.totals) {
      let result = 0;
      if (style === "luxury") {
        result = city.totals.p75;
      } else if (style === "mid") {
        result = city.totals.p50;
      } else {
        result = city.totals.p25;
      }
      
      console.log(`🔍 ${city.city} using backend totals (${style}):`, {
        city: city.city,
        style,
        totals: city.totals,
        selectedValue: result,
        p25: city.totals?.p25,
        p50: city.totals?.p50,
        p75: city.totals?.p75
      });
      
      return result;
    }
    
    // Final fallback
    console.log(`🔍 ${city.city} using fallback calculation (${style}):`, claudeCalculation);
    return claudeCalculation.total;
  };

  // Cost comparison logic using shared utility
  const getCostComparisonData = () => {
    if (!originAirport) return null;
    
    const cityKey = city.city.toLowerCase().replace(/\s+/g, '-');
    const travelStyleKey = travelStyle === "mid" ? "midRange" : travelStyle;
    
    try {
      const comparison = getCostComparison(cityKey, originAirport, travelStyleKey);
      if (!comparison) {
        // Fall through to local fallback below
        throw new Error('No shared comparison available');
      }
      
      const percentageDiff = comparison.overallComparison.percentageDifference;
      const neutralThreshold = 5; // consider ~same when <5%

      return {
        percentage: Math.abs(percentageDiff),
        isMoreExpensive: percentageDiff > 0,
        neutral: Math.abs(percentageDiff) < neutralThreshold,
        comparisonCityName: comparison.homeCity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      } as const;
    } catch (error) {
      // Fallback: derive a comparison using a small local map of origin cities with style totals (10-night trip)
      const airportToCityMap: Record<string, { city: string, country: string, pricing: { budget: number, mid: number, luxury: number } }> = {
        PHX: { city: 'Phoenix', country: 'United States', pricing: { budget: 1200, mid: 1800, luxury: 3200 } },
        LAX: { city: 'Los Angeles', country: 'United States', pricing: { budget: 1800, mid: 2800, luxury: 5000 } },
        JFK: { city: 'New York', country: 'United States', pricing: { budget: 2200, mid: 3500, luxury: 6000 } },
        ORD: { city: 'Chicago', country: 'United States', pricing: { budget: 1600, mid: 2400, luxury: 4200 } },
        DFW: { city: 'Dallas', country: 'United States', pricing: { budget: 1400, mid: 2200, luxury: 3800 } },
        SFO: { city: 'San Francisco', country: 'United States', pricing: { budget: 2000, mid: 3200, luxury: 5500 } },
        YYZ: { city: 'Toronto', country: 'Canada', pricing: { budget: 1500, mid: 2300, luxury: 4000 } },
        YVR: { city: 'Vancouver', country: 'Canada', pricing: { budget: 1600, mid: 2500, luxury: 4300 } },
        LHR: { city: 'London', country: 'United Kingdom', pricing: { budget: 1800, mid: 2800, luxury: 5200 } },
        CDG: { city: 'Paris', country: 'France', pricing: { budget: 1700, mid: 2600, luxury: 4800 } },
        FRA: { city: 'Frankfurt', country: 'Germany', pricing: { budget: 1600, mid: 2400, luxury: 4400 } },
        NRT: { city: 'Tokyo', country: 'Japan', pricing: { budget: 1900, mid: 3000, luxury: 5500 } },
        SIN: { city: 'Singapore', country: 'Singapore', pricing: { budget: 1400, mid: 2200, luxury: 4000 } },
        SYD: { city: 'Sydney', country: 'Australia', pricing: { budget: 1800, mid: 2800, luxury: 5000 } }
      };

      const home = airportToCityMap[originAirport];
      if (!home) {
        console.warn('No fallback mapping for origin airport', originAirport);
        return null;
      }

      // City cost excluding flights (align with UI default)
      const cityCostNoFlight = (getClaudeDailyCosts(city, travelStyle).hotelPerNight + getClaudeDailyCosts(city, travelStyle).adjustedDaily) * (city.nights || 10);
      const styleKey = travelStyle === 'mid' ? 'mid' : travelStyle;
      const homeCostNoFlight = home.pricing[styleKey as 'budget' | 'mid' | 'luxury'];
      if (!homeCostNoFlight || homeCostNoFlight <= 0) return null;

      const diff = cityCostNoFlight - homeCostNoFlight;
      const percentage = (diff / homeCostNoFlight) * 100;
      const neutralThreshold = 5;

      return {
        percentage: Math.abs(percentage),
        isMoreExpensive: percentage > 0,
        neutral: Math.abs(percentage) < neutralThreshold,
        comparisonCityName: home.city,
      } as const;
    }
  };

  const costComparison = getCostComparisonData();
  const displayTotal = getDisplayTotal(city, travelStyle);
  const tierPricing = getClaudeDailyCosts(city, travelStyle);
  const heroImage = getCityHeroImage(city.city);

  // Cost Comparison Indicator Component
  const CostComparisonIndicator = () => {
    if (!costComparison) return null;

    const { percentage, isMoreExpensive, comparisonCityName, neutral } = costComparison as {
      percentage: number; isMoreExpensive: boolean; comparisonCityName: string; neutral?: boolean;
    };

    const baseClasses = "absolute bottom-3 right-3 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium shadow-sm z-20 border";
    const colorClasses = neutral
      ? "bg-gray-100 text-gray-700 border-gray-200"
      : isMoreExpensive
        ? "bg-red-100 text-red-700 border-red-200"
        : "bg-green-100 text-green-700 border-green-200";

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`${baseClasses} ${colorClasses}`}>
              {neutral ? (
                <span className="h-3 w-3 leading-none">≈</span>
              ) : isMoreExpensive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className="tabular-nums">
                {neutral ? '≈' : isMoreExpensive ? '+' : '-'}{percentage.toFixed(0)}%
              </span>
              <span className="text-[10px] opacity-75">
                vs {comparisonCityName.split(' ')[0]}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">
              {neutral
                ? `About the same cost as ${comparisonCityName}`
                : `${isMoreExpensive ? 'More expensive' : 'Less expensive'} than ${comparisonCityName}`}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Enhanced StatBox component with better visual design
  const StatBox = ({
    label,
    tooltip,
    value,
    emphasized = false,
  }: {
    label: React.ReactNode;
    tooltip: string;
    value: React.ReactNode;
    emphasized?: boolean;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            role="button"
            className={`min-h-[85px] rounded-lg border transition-all duration-200 hover:border-primary/40 hover:shadow-sm flex flex-col items-center justify-center text-center p-3.5 ${
              emphasized 
                ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 shadow-sm' 
                : 'border-border/60 bg-background hover:bg-muted/30'
            }`}
          >
            <div className="flex items-center justify-center">
              <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                {label}
              </span>
            </div>
            <div className={`mt-2 text-lg font-bold leading-none tabular-nums ${emphasized ? 'text-primary' : 'text-foreground'}`}>
              {value}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Card
      className="group cursor-pointer rounded-xl border border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg relative overflow-hidden"
      onClick={() => onClick?.(city)}
      data-testid={`card-city-${city.cityId}`}
    >
      {/* Hero Image Section */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={heroImage}
          alt={`${city.city} hero image`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback gradient if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-80">
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="h-12 w-12 text-white" />
          </div>
        </div>
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Cost Comparison Indicator - positioned on image */}
        <CostComparisonIndicator />
        
        {/* City Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
          <div className="flex items-center gap-2 mb-1">
            <h5
              className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg"
              data-testid={`text-city-name-${city.cityId}`}
              title={city.city}
            >
              {city.city}
            </h5>
            {isCapitalCity(city.city, city.country) && (
              <div className="flex items-center">
                <span className="text-yellow-400 drop-shadow-lg" title="Capital City">
                  👑
                </span>
              </div>
            )}
          </div>
          <p
            className="text-white/90 text-xs sm:text-sm drop-shadow-md flex items-center"
            data-testid={`text-city-info-${city.cityId}`}
            title={`${city.country} • ${city.region}`}
          >
            <span 
              className="inline-block mr-2" 
              data-country={city.country}
              title={`Flag for ${city.country}`}
            >
              {getFlagImageComponent(city.country)}
            </span>
            {city.country} • {city.region}
          </p>
        </div>
      </div>

      <CardContent className="p-3 sm:p-5">
        {/* TOP ROW — Accuracy and Travel Style Badges */}
        <div className="flex items-center justify-between gap-1 sm:gap-3 mb-3 sm:mb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={`whitespace-nowrap border px-1 sm:px-2 py-0.5 text-xs sm:text-xs font-medium ${accuracyClasses[getAccuracyLevel(city)]}`}
                  data-testid={`badge-accuracy-${city.cityId}`}
                >
                  {(() => {
                    const level = getAccuracyLevel(city);
                    return level.charAt(0).toUpperCase() + level.slice(1);
                  })()}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  {getAccuracyTooltip(getAccuracyLevel(city))}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className="whitespace-nowrap bg-muted text-muted-foreground cursor-help px-1 sm:px-2 py-0.5 text-xs sm:text-xs"
                  data-testid={`text-total-range-${city.cityId}`}
                >
                  {travelStyle.charAt(0).toUpperCase() + travelStyle.slice(1)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  {travelStyle === "budget" 
                    ? "Budget Travel: Hostels, local transport, street food, free activities - cost-conscious choices"
                    : travelStyle === "mid"
                    ? "Mid-Range Travel: 3-star hotels, mix of local/tourist transport, restaurants, standard attractions"
                    : "Luxury Travel: 4-5 star hotels, premium transport, fine dining, exclusive experiences"
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* WEB-LIKE CONNECTED COST STRUCTURE */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-3 sm:p-6 mb-5">
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {showFlightCosts ? 'Trip Total' : 'Trip Total (no flights)'}
              </p>
              <p className="text-xs sm:text-sm text-primary/80 font-medium">{city.nights} nights</p>
              
              {/* Top Level - Total Trip Cost */}
              <div className="relative flex justify-center mb-6 sm:mb-8 mt-3 sm:mt-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-white border-2 border-gray-300 px-4 sm:px-8 py-3 sm:py-4 rounded-lg shadow-sm cursor-help w-48 sm:w-60 h-16 sm:h-20 flex flex-col justify-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                       
                            <div className="text-xl sm:text-3xl font-extrabold text-gray-800">
                            ~{formatCurrency(showFlightCosts ? displayTotal : (displayTotal - (city.breakdown?.flight || 0)))}
                          </div>
                   
                        </div>
                        <div className="text-xs text-gray-600">Estimated trip total</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Estimated total cost for {city.nights} nights using {travelStyle === 'mid' ? 'mid-range' : travelStyle} travel style.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Connecting line down */}
                <div className="absolute top-full w-0.5 h-6 sm:h-8 bg-gray-300"></div>
              </div>

              {/* Middle Level - Daily Total */}
              <div className="relative flex justify-center mb-6 sm:mb-8">
                <div className="bg-white border-2 border-gray-300 px-4 sm:px-8 py-3 sm:py-4 rounded-lg shadow-sm w-48 sm:w-60 h-16 sm:h-20 flex flex-col justify-center">
                  <div className="text-base sm:text-lg font-bold text-gray-800 mb-1">
                    ${Math.round((showFlightCosts ? displayTotal : (displayTotal - (city.breakdown?.flight || 0))) / city.nights)}/day
                  </div>
                  <div className="text-xs text-gray-600">Daily cost to stay here</div>
                </div>
                
                {/* Connecting lines - T-junction */}
                <div className="absolute top-full w-0.5 h-4 sm:h-6 bg-gray-300"></div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-4 sm:translate-y-6">
                  <div className="w-32 sm:w-40 h-0.5 bg-gray-300"></div>
                </div>
              </div>

              {/* Bottom Level - Hotel and Daily Costs */}
              <div className="grid grid-cols-2 gap-4 sm:gap-8 relative">
                {/* Left connecting line */}
                <div className="absolute left-1/4 -top-4 sm:-top-6 w-0.5 h-4 sm:h-6 bg-gray-300"></div>
                {/* Right connecting line */}
                <div className="absolute right-1/4 -top-4 sm:-top-6 w-0.5 h-4 sm:h-6 bg-gray-300"></div>
                
                {/* Hotel per night */}
                <div className="text-center bg-white border border-gray-200 p-2 sm:p-3 rounded-lg shadow-sm">
                  <div className="text-xs text-gray-600 font-medium mb-1 sm:mb-2">Hotel / night</div>
                  <div className="text-sm sm:text-lg font-bold text-gray-800">
                    {formatCurrency(city.breakdown?.hotelPerNightP50 || Math.round(displayTotal * 0.6 / city.nights))}
                  </div>
                </div>
                
                {/* Daily costs */}
                <div className="text-center bg-white border border-gray-200 p-2 sm:p-3 rounded-lg shadow-sm">
                  <div className="text-xs text-gray-600 font-medium mb-1 sm:mb-2">Daily costs</div>
                  <div className="text-sm sm:text-lg font-bold text-gray-800">
                    {formatCurrency(city.breakdown?.dailyPerDay || Math.round(displayTotal * 0.4 / city.nights))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FLIGHT COST (if enabled) */}
        {showFlightCosts && (
          <div className="mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 text-center shadow-sm">
              <div className="text-xs text-gray-600 font-medium mb-1 sm:mb-2">Flight</div>
              <div className="text-sm sm:text-lg font-bold text-gray-800">
                {formatCurrency(city.breakdown?.flight || 0)}
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-5 border-t border-border pt-4">
          <p
            className="flex items-center text-xs text-muted-foreground"
            data-testid={`text-last-updated-${city.cityId}`}
          >
            <Clock className="mr-1 h-3 w-3" />
            Updated {formatDate(city.lastUpdatedISO)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
