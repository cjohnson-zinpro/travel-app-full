// components/city-card.tsx  (Frontend bundle: project_bundle_frontend.txt)
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Bot, Calculator } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCountryFlag } from "@/lib/flag-utils";
import type { CityRecommendation } from "@/types/travel";

interface CityCardProps {
  city: CityRecommendation;
  onClick?: (city: CityRecommendation) => void;
  travelStyle?: "budget" | "mid" | "luxury";
}

export function CityCard({
  city,
  onClick,
  travelStyle = "budget",
}: CityCardProps) {
  const confidenceClasses = {
    high: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    medium:
      "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
    low: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
  } as const;

  const getConfidenceTooltip = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return "High Confidence: Recent flight data (within 30 days) and comprehensive hotel pricing available";
      case "medium":
        return "Medium Confidence: Recent flight data available, but limited hotel pricing or some estimates used";
      case "low":
        return "Low Confidence: Limited recent data available, estimates based on historical trends and nearby destinations";
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
  ) => {
    switch (source) {
      case "amadeus":
        if (type === "flight") {
          return "Live flight pricing: Averages 5 economy searches across multiple dates, removes luxury outliers (top 15%)";
        }
        return `Live ${type} pricing from Amadeus API`;
      case "claude":
        if (type === "hotel") {
          return "AI hotel estimates: Claude analyzes local rates, removes luxury outliers (top 15%) for budget focus";
        }
        if (type === "daily") {
          return "AI daily costs: Budget traveler perspective (local transport, street food, budget activities)";
        }
        return `AI-powered ${type} estimates from Claude`;
      case "estimate":
        return `Fallback ${type} estimates based on historical data when live sources unavailable`;
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
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

  // Calculate tier-adjusted pricing with non-overlapping ranges
  const getTierAdjustedPricing = (
    city: CityRecommendation,
    style: "budget" | "mid" | "luxury",
  ) => {
    // Use pre-calculated travel-style-adjusted costs from backend if available
    // This avoids double adjustment and ensures consistent filtering/display costs
    if (city.travelStyleAdjusted && city.travelStyleAdjusted.style === style) {
      return {
        hotelPerNight: city.travelStyleAdjusted.hotelPerNight,
        adjustedDaily: city.travelStyleAdjusted.dailyPerDay,
        total: city.travelStyleAdjusted.total,
      };
    }

    // Fallback to frontend calculation for backwards compatibility
    // Get base percentile values from Claude data
    const p25 = city.breakdown.hotelPerNightP25 || 0;
    const p50 = city.breakdown.hotelPerNightP50 || 0;
    const p75 = city.breakdown.hotelPerNightP75 || 0;

    let hotelPerNight = 0;
    let dailyMultiplier = 1.0;

    switch (style) {
      case "budget":
        // Budget: p25 × 1.3, capped at $80
        hotelPerNight = Math.min(80, Math.round((p25 || p50 || p75) * 1.3));
        dailyMultiplier = 0.85;
        break;
      case "mid":
        // Mid-range: max($85, p50 × 2.1), capped at $180
        const midBase = Math.round((p50 || p75 || p25) * 2.1);
        hotelPerNight = Math.min(180, Math.max(85, midBase));
        dailyMultiplier = 1.0;
        break;
      case "luxury":
        // Luxury: max($185, p75 × 3.2)
        const luxuryBase = Math.round((p75 || p50 || p25) * 3.2);
        hotelPerNight = Math.max(185, luxuryBase);
        dailyMultiplier = 1.6;
        break;
    }

    // Ensure minimum viable hotel price
    if (hotelPerNight === 0) {
      hotelPerNight = style === "budget" ? 45 : style === "mid" ? 85 : 185;
    }

    // Adjust daily costs
    const adjustedDaily = Math.round(
      city.breakdown.dailyPerDay * dailyMultiplier,
    );

    // Calculate total (flights unchanged)
    const total =
      city.breakdown.flight + city.nights * (hotelPerNight + adjustedDaily);

    return {
      hotelPerNight,
      adjustedDaily,
      total,
    };
  };

  const tierPricing = getTierAdjustedPricing(city, travelStyle);

  // Small internal component for the three mini boxes
  // replace StatBox in components/city-card.tsx
  const StatBox = ({
    label,
    tooltip,
    value,
  }: {
    label: React.ReactNode;
    tooltip: string;
    value: React.ReactNode;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            role="button"
            className="min-h-[78px] rounded-lg border border-border/60 bg-background p-3.5 transition-colors hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
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
      className="cursor-pointer rounded-xl border border-border bg-background shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
      onClick={() => onClick?.(city)}
      data-testid={`card-city-${city.cityId}`}
    >
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
              {getCountryFlag(city.country)} {city.country} • {city.region}
            </p>
          </div>

          <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={`whitespace-nowrap border px-2 py-0.5 text-xs font-medium ${confidenceClasses[city.confidence]}`}
                    data-testid={`badge-confidence-${city.cityId}`}
                  >
                    {city.confidence.charAt(0).toUpperCase() +
                      city.confidence.slice(1)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    {getConfidenceTooltip(city.confidence)}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Badge
              variant="secondary"
              className="whitespace-nowrap bg-muted text-muted-foreground"
              data-testid={`text-total-range-${city.cityId}`}
              title={`${travelStyle} travel style`}
            >
              {travelStyle.charAt(0).toUpperCase() + travelStyle.slice(1)}
            </Badge>
          </div>
        </div>

        {/* PRICE CLUSTER */}
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Trip Total</span>
          <span
            className="text-[26px] font-semibold leading-none text-foreground"
            data-testid={`text-total-${travelStyle}-${city.cityId}`}
          >
            {formatCurrency(tierPricing.total)}
          </span>
        </div>

        {/* BREAKDOWN — cleaned up */}
        <div
          className="mt-5 grid grid-cols-3 gap-4 border-t border-border pt-5"
          data-testid={`breakdown-${city.cityId}`}
        >
          <StatBox
            label="Flight"
            tooltip={getSourceTooltip(city.breakdown.flightSource, "flight")}
            value={formatCurrency(city.breakdown.flight)}
          />

          <StatBox
            label={
              <span className="whitespace-nowrap">Hotel&nbsp;/&nbsp;night</span>
            }
            tooltip={getSourceTooltip(city.breakdown.hotelSource, "hotel")}
            value={formatCurrency(tierPricing.hotelPerNight)}
          />

          <StatBox
            label="Daily costs"
            tooltip={getSourceTooltip(city.breakdown.dailySource, "daily")}
            value={formatCurrency(tierPricing.adjustedDaily)}
          />
        </div>

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
