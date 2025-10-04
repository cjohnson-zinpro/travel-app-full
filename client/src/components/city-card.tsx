// components/city-card.tsx  (Frontend bundle: project_bundle_frontend.txt)
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Bot, Calculator, TrendingUp, TrendingDown } from "lucide-react";
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
    const claudeCosts = ClaudeDailyCosts.getDailyCosts(city.city);
    
    if (claudeCosts) {
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
      
      return {
        hotelPerNight,
        adjustedDaily,
        total,
        source: 'claude' as const
      };
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

    return {
      hotelPerNight,
      adjustedDaily, 
      total,
      source: 'fallback' as const
    };
  };

  // Use backend-provided totals instead of recalculating
  // Backend already handles travel style adjustments and Claude data integration
  const getDisplayTotal = (city: CityRecommendation, style: "budget" | "mid" | "luxury") => {
    // Use backend's calculated totals based on travel style
    if (city.totals) {
      if (style === "luxury") {
        return city.totals.p75;
      } else if (style === "mid") {
        return city.totals.p50;
      } else {
        return city.totals.p25;
      }
    }
    
    // Fallback to Claude calculation if backend totals not available
    const claudeCalculation = getClaudeDailyCosts(city, style);
    return claudeCalculation.total;
  };

  const displayTotal = getDisplayTotal(city, travelStyle);
  
  // For breakdown display, use Claude calculation for hotel/daily breakdown
  // since backend totals don't provide per-night breakdown in the right format
  const tierPricing = getClaudeDailyCosts(city, travelStyle);

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
      const cityCostNoFlight = (tierPricing.hotelPerNight + tierPricing.adjustedDaily) * (city.nights || 10);
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

  // Small internal component for the three mini boxes
  // replace StatBox in components/city-card.tsx
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
            className={`min-h-[78px] rounded-lg border transition-colors hover:border-primary/40 flex flex-col items-center justify-center text-center p-3.5 ${
              emphasized 
                ? 'border-primary/30 bg-primary/5 hover:bg-primary/10' 
                : 'border-border/60 bg-background'
            }`}
          >
            <div className="flex items-center justify-center">
              <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                {label}
              </span>
            </div>
            <div className="mt-1.5 text-base font-semibold leading-none tabular-nums">
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
      className="cursor-pointer rounded-xl border border-border bg-background shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md relative"
      onClick={() => onClick?.(city)}
      data-testid={`card-city-${city.cityId}`}
    >
      <CostComparisonIndicator />
      <CardContent className="p-5">
        {/* TOP ROW — name + confidence; range pill wraps below on narrow widths */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h5
              className="truncate text-base font-semibold text-foreground"
              data-testid={`text-city-name-${city.cityId}`}
              title={city.city}
            >
              {city.city}
            </h5>
            <p
              className="truncate text-sm text-muted-foreground"
              data-testid={`text-city-info-${city.cityId}`}
              title={`${city.country} • ${city.region}`}
            >
              <span 
                className="inline-block mr-1" 
                data-country={city.country}
                title={`Flag for ${city.country}`}
              >
                {getFlagImageComponent(city.country)}
              </span>
              {city.country} • {city.region}
            </p>
          </div>

          <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={`whitespace-nowrap border px-2 py-0.5 text-xs font-medium ${accuracyClasses[getAccuracyLevel(city)]}`}
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
                    className="whitespace-nowrap bg-muted text-muted-foreground cursor-help"
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
        </div>

        {/* PRICE CLUSTER */}
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">
            {showFlightCosts ? 'Trip Total' : 'Trip Total (no flights)'}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="text-[26px] font-semibold leading-none text-foreground cursor-help flex items-baseline gap-1"
                  data-testid={`text-total-${travelStyle}-${city.cityId}`}
                >
                  <span className="text-lg text-muted-foreground">~</span>
                  {formatCurrency(showFlightCosts ? displayTotal : (displayTotal - city.breakdown.flight))}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Estimated total cost for {city.nights} nights using {travelStyle === 'mid' ? 'mid-range' : travelStyle} travel style. Prices are approximations based on live data and AI estimates.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* BREAKDOWN — cleaned up */}
        <div
          className={`mt-5 gap-4 border-t border-border pt-5 ${showFlightCosts ? 'grid grid-cols-3' : 'grid grid-cols-2'}`}
          data-testid={`breakdown-${city.cityId}`}
        >
          {showFlightCosts && (
            <StatBox
              label="Flight"
              tooltip={getSourceTooltip(city.breakdown.flightSource, "flight", travelStyle)}
              value={formatCurrency(city.breakdown.flight)}
            />
          )}

          <StatBox
            label={
              <span className="whitespace-nowrap">Hotel&nbsp;/&nbsp;night</span>
            }
            tooltip={getSourceTooltip(city.breakdown.hotelSource, "hotel", travelStyle)}
            value={formatCurrency(tierPricing.hotelPerNight)}
            emphasized={!showFlightCosts}
          />

          <StatBox
            label="Daily costs"
            tooltip={getSourceTooltip(city.breakdown.dailySource, "daily", travelStyle)}
            value={formatCurrency(tierPricing.adjustedDaily)}
            emphasized={!showFlightCosts}
          />
        </div>

        {/* Daily cost summary when flights are hidden */}
        {!showFlightCosts && (
          <div className="mt-4 rounded-lg bg-primary/5 p-3 text-center">
            <div className="text-lg font-semibold text-primary">
              ${tierPricing.hotelPerNight + tierPricing.adjustedDaily}/day
            </div>
            <div className="text-xs text-muted-foreground">
              Daily cost to stay here
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-4 border-t border-border pt-4">
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
