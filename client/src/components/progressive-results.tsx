import { useState, useEffect, useRef } from "react";
import { CityRecommendation, CountrySummary } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { CityCard } from "@/components/city-card";
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
  results: CityRecommendation[];
  countries: CountrySummary[];
  status: "idle" | "loading" | "processing" | "completed" | "error";
  progress: {
    processed: number;
    total: number;
    percentage: number;
  };
  totalResults: number;
}

export function ProgressiveResults({
  results,
  countries,
  status,
  progress,
  totalResults,
  travelStyle = "budget",
}: ProgressiveResultsProps & { travelStyle?: "budget" | "mid" | "luxury" }) {
  const [displayedResults, setDisplayedResults] = useState<
    CityRecommendation[]
  >([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<
    "alphabetical" | "price-low-high" | "confidence" | "region"
  >("price-low-high");

  // Track timeout IDs and prevent concurrency issues
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);
  const isProcessingRef = useRef(false);

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

  // Handle city click
  const handleCityClick = (city: CityRecommendation) => {
    console.log("City clicked:", city);
  };

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
            (confidenceOrder[b.confidence] || 0) -
            (confidenceOrder[a.confidence] || 0)
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
    {} as Record<string, Record<string, (CityRecommendation & { _sortIndex: number })[]>>,
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
    {} as Record<string, (CityRecommendation & { _sortIndex: number })[]>,
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
            {status === "completed" && `${totalResults} destinations found`}
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

      {/* Results Controls */}
      {displayedResults.length > 0 && (
        <div className="space-y-6">
          {/* Header with Sort and Info */}
          <div
            className="flex items-center justify-between"
            data-testid="progressive-results-header"
          >
            <div className="flex items-center space-x-4">
              <h3
                className="text-xl font-semibold text-foreground"
                data-testid="text-progressive-results-title"
              >
                Destinations within your budget
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select
                  value={sortOption}
                  onValueChange={(value) => setSortOption(value as any)}
                  data-testid="select-progressive-sort"
                >
                  <SelectTrigger className="h-8 w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="alphabetical"
                      data-testid="option-alphabetical"
                    >
                      A-Z (Alphabetical)
                    </SelectItem>
                    <SelectItem
                      value="price-low-high"
                      data-testid="option-price-low-high"
                    >
                      Price: Low to High
                    </SelectItem>
                    <SelectItem
                      value="confidence"
                      data-testid="option-confidence"
                    >
                      Confidence Level
                    </SelectItem>
                    <SelectItem value="region" data-testid="option-region">
                      Region
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                      data-testid="button-progressive-how-we-estimate"
                    >
                      <HelpCircle className="mr-1 h-4 w-4" />
                      How we estimate
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      We use live flight prices from Amadeus and AI-powered
                      hotel & daily cost estimates from Claude. Look for data
                      source indicators on each city to see what's live vs
                      estimated.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span
                className="text-sm font-medium text-foreground"
                data-testid="text-progressive-count"
              >
                Showing {totalDisplayed} of {totalResults} destinations
              </span>
            </div>
          </div>

          {/* Country Filter Buttons */}
          <div
            className="flex flex-wrap justify-center gap-3 border-b border-border pb-6"
            data-testid="progressive-country-filters"
          >
            <Button
              variant={selectedCountries.length === 0 ? "default" : "secondary"}
              size="sm"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              onClick={() => setSelectedCountries([])}
              data-testid="filter-progressive-all-countries"
            >
              All Countries {Object.keys(citiesByCountry).length}
            </Button>

            {Object.entries(citiesByCountry)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([countryName, cities]) => (
                <Button
                  key={countryName}
                  variant={
                    selectedCountries.includes(countryName)
                      ? "default"
                      : "secondary"
                  }
                  size="sm"
                  className="rounded-md border border-border px-5 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  onClick={() => toggleCountryFilter(countryName)}
                  data-testid={`filter-progressive-country-${countryName
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {countryName} {cities.length}
                </Button>
              ))}
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
              <div className="space-y-6">
                <div className="border-b-2 border-green-200 dark:border-green-800 pb-3">
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-400" data-testid="header-within-budget">
                    Within Your Budget
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    These destinations fit comfortably within your budget
                  </p>
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
                                cities={cities}
                                onCityClick={handleCityClick}
                                travelStyle={travelStyle}
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
                                      city={city}
                                      onClick={handleCityClick}
                                      travelStyle={travelStyle}
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
              <div className="space-y-6">
                <div className="border-b-2 border-orange-200 dark:border-orange-800 pb-3">
                  <h3 className="text-xl font-bold text-orange-700 dark:text-orange-400" data-testid="header-slightly-above-budget">
                    Slightly Above Budget (5-10% over)
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    These destinations are close to your budget but might require a small stretch
                  </p>
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
                                cities={cities}
                                onCityClick={handleCityClick}
                                travelStyle={travelStyle}
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
                                      city={city}
                                      onClick={handleCityClick}
                                      travelStyle={travelStyle}
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
                      (order[bestCityB.confidence] ?? 0) -
                      (order[bestCityA.confidence] ?? 0)
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
                              city={city}
                              onClick={handleCityClick}
                              travelStyle={travelStyle}
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
    </div>
  );
}
