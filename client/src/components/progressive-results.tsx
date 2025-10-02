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
import { HelpCircle } from "lucide-react";

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
}: ProgressiveResultsProps & { travelStyle?: "budget" | "mid" | "luxury" }) {
  const [displayedResults, setDisplayedResults] = useState<
    SharedCityRecommendation[]
  >([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<
    "alphabetical" | "price-low-high" | "confidence" | "region"
  >("price-low-high");
  
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

  // Track timeout IDs and prevent concurrency issues
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);
  const isProcessingRef = useRef(false);
  const withinSectionRef = useRef<HTMLDivElement | null>(null);
  const slightlySectionRef = useRef<HTMLDivElement | null>(null);

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
    }
  }, [status]);

  // Sort displayed results
  const sortedResults = [...displayedResults]
    .filter((city) => city && city.city && city.country && city.region)
    .sort((a, b) => {
      switch (sortOption) {
        case "price-low-high":
          return (a.totals?.p35 || 0) - (b.totals?.p35 || 0);
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
          <div />

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
                <h3 className="text-2xl font-bold text-gray-900" data-testid="text-progressive-title">
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
          <div className="mb-8">
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
                          return (bestCityA.totals?.p35 ?? Infinity) - (bestCityB.totals?.p35 ?? Infinity);
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
                      const avgPrice = countrySummary?.summaryP35 || 0;

                      return (
                        <div
                          key={`within-${countryName}`}
                          className="space-y-4 country-group-enter"
                          data-testid={`group-within-budget-${countryName.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {/* Country Header */}
                          <div className="bg-gradient-to-r from-secondary/50 to-secondary/20 rounded-lg p-4 border border-border/60 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-7 h-7 bg-background rounded-full border-2 border-primary/20">
                                  {getFlagImageComponent(countryName)}
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-foreground tracking-tight">
                                    {countryName}
                                  </h4>
                                  <div className="text-sm text-muted-foreground font-medium">
                                    {cities.length} destination{cities.length !== 1 ? "s" : ""}
                                    {avgPrice > 0 && <span className="ml-2 text-primary font-semibold">Avg: ${avgPrice.toLocaleString()}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Cities - Responsive Layout */}
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
                          return (bestCityA.totals?.p35 ?? Infinity) - (bestCityB.totals?.p35 ?? Infinity);
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
                      const avgPrice = countrySummary?.summaryP35 || 0;

                      return (
                        <div
                          key={`above-${countryName}`}
                          className="space-y-4 country-group-enter"
                          data-testid={`group-slightly-above-budget-${countryName.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {/* Country Header */}
                          <div className="bg-gradient-to-r from-yellow-50/50 to-orange-50/30 rounded-lg p-4 border border-orange-200/60 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-7 h-7 bg-background rounded-full border-2 border-orange-300/40">
                                  {getFlagImageComponent(countryName)}
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-foreground tracking-tight">
                                    {countryName}
                                  </h4>
                                  <div className="text-sm text-muted-foreground font-medium">
                                    {cities.length} destination{cities.length !== 1 ? "s" : ""}
                                    {avgPrice > 0 && <span className="ml-2 text-orange-600 font-semibold">Avg: ${avgPrice.toLocaleString()}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Cities - Responsive Layout */}
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
                    return (
                      (bestCityA.totals?.p35 ?? Infinity) -
                      (bestCityB.totals?.p35 ?? Infinity)
                    );
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
                const avgPrice = countrySummary?.summaryP35 || 0;

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
                              {avgPrice > 0 && <span className="ml-2 text-blue-600 font-semibold">Avg: ${avgPrice.toLocaleString()}</span>}
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
