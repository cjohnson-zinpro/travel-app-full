import { useState } from "react";
import {
  CityRecommendation,
  CountrySummary,
  TravelRecommendationsResponse,
  TravelSearchParams,
} from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  Plane,
  Building,
  Coffee,
} from "lucide-react";
import { getFlagImageComponent } from "@/lib/flag-utils";

interface ResultsGridProps {
  data: TravelRecommendationsResponse | null;
  onCityClick?: (city: CityRecommendation) => void;
  onPageChange?: (page: number) => void;
  onSortChange?: (
    sort: "alphabetical" | "price-low-high" | "confidence" | "region",
  ) => void;
  searchParams?: TravelSearchParams | null;
  sortOption?: "alphabetical" | "price-low-high" | "confidence" | "region";
}

interface DisclaimerSectionProps {
  sources: string[];
  disclaimer: string;
}

function DisclaimerSection({ sources, disclaimer }: DisclaimerSectionProps) {
  return (
    <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
      <div className="text-sm text-muted-foreground">
        <p className="mb-2">
          <strong>Data Sources:</strong> {sources.join(", ")}
        </p>
        <p>{disclaimer}</p>
      </div>
    </div>
  );
}

function CityCard({
  city,
  onClick,
}: {
  city: CityRecommendation;
  onClick?: (city: CityRecommendation) => void;
}) {
  const handleClick = () => {
    onClick?.(city);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div
      className="bg-card border border-border rounded-md p-6 cursor-pointer shadow-sm transition-colors transition-transform hover:bg-accent/30 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      onClick={handleClick}
      data-testid={`card-city-${city.cityId}`}
      tabIndex={0}
      role="button"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3
            className="text-lg font-semibold text-foreground flex items-center"
            data-testid={`text-city-${city.cityId}`}
          >
            <MapPin className="h-4 w-4 mr-1" />
            {city.city}
          </h3>
          <p className="text-sm text-muted-foreground">{city.country}</p>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs border ${getConfidenceColor(city.confidence)}`}
        >
          {city.confidence} confidence
        </div>
      </div>

      {/* Centered Trip Total */}
      <div className="text-center mb-4">
        <div className="text-sm text-muted-foreground">
          Estimated Trip Total
        </div>
        <div className="text-2xl font-semibold text-foreground">
          ${city.totals.p35.toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground">
          Range: ${city.totals.p25.toLocaleString()} - $
          {city.totals.p75.toLocaleString()}
        </div>
      </div>

      {/* Per-night note */}
      <div className="flex items-center justify-center text-sm text-muted-foreground mb-2">
        <Calendar className="h-4 w-4 mr-1" />
        For {city.nights} nights
      </div>
      {city.rangeNote && (
        <div className="text-center text-sm text-muted-foreground mb-2">
          {city.rangeNote}
        </div>
      )}

      {/* Breakdown */}
      <div className="border-t border-border pt-3">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <Plane className="h-3 w-3 mr-1" />
              Flight
            </div>
            <div className="font-medium">
              ${city.breakdown.flight.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {city.breakdown.flightSource === "amadeus" ? "Live" : "Est."}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <Building className="h-3 w-3 mr-1" />
              Hotel
            </div>
            <div className="font-medium">
              $
              {(city.breakdown.hotelPerNightP35 * city.nights).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              ${city.breakdown.hotelPerNightP35}/night
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <Coffee className="h-3 w-3 mr-1" />
              Daily
            </div>
            <div className="font-medium">
              ${(city.breakdown.dailyPerDay * city.nights).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              ${city.breakdown.dailyPerDay}/day
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2 mt-2">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Updated {new Date(city.lastUpdatedISO).toLocaleDateString()}
        </div>
        <div />
      </div>
    </div>
  );
}

export function ResultsGrid({
  data,
  onCityClick,
  onPageChange,
  onSortChange,
  searchParams,
  sortOption = "alphabetical",
}: ResultsGridProps) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  if (!data) return null;

  const { results, countries, pagination, meta } = data;

  // Sort results based on sort option
  const sortedResults = [...results].sort((a, b) => {
    switch (sortOption) {
      case "price-low-high":
        return a.totals.p35 - b.totals.p35;
      case "confidence":
        const confidenceOrder = { high: 3, medium: 2, low: 1 };
        return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
      case "region":
        return a.region.localeCompare(b.region) || a.city.localeCompare(b.city);
      case "alphabetical":
      default:
        return a.city.localeCompare(b.city);
    }
  });

  // Group by country and apply sorting
  const citiesByCountry = sortedResults.reduce(
    (acc, city, index) => {
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

  if (results.length === 0) {
    return (
      <div className="text-center py-12" data-testid="no-results">
        <div className="text-6xl mb-4">✈️</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No destinations found
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          We couldn't find any destinations that match your budget and criteria.
          Try increasing your budget or adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="results-grid">
      {/* Results Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6" data-testid="results-header">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900" data-testid="text-results-title">
                Destinations within your budget
              </h3>
              <p className="text-sm text-gray-600">Perfect matches for your travel plans</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortOption} onValueChange={onSortChange} data-testid="select-sort-results">
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent data-testid="select-sort-content">
                  <SelectItem value="alphabetical" data-testid="option-alphabetical">A-Z (Alphabetical)</SelectItem>
                  <SelectItem value="price-low-high" data-testid="option-price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="confidence" data-testid="option-confidence">Confidence Level</SelectItem>
                  <SelectItem value="region" data-testid="option-region">Region</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="text-sm text-gray-600 flex items-center hover:text-gray-900 transition-colors"
                    data-testid="button-how-we-estimate"
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    How we estimate
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    We use live flight prices from Amadeus and AI-powered hotel &amp; daily cost estimates from Claude. Look for data source indicators on each city to see what's live vs estimated.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Results count integrated into header */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-lg border border-primary/20">
            <span className="text-sm font-medium text-primary" data-testid="text-results-count">
              {pagination.total} destinations found
            </span>
            <span className="text-xs text-gray-500">
              (page {pagination.page} of {pagination.totalPages})
            </span>
          </div>
        </div>
      </div>

      {/* Country Filter Buttons */}
      <div className="mb-8">
        <div className="text-center mb-4">
          <h4 className="text-sm font-medium text-gray-700">Filter by destination</h4>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2" data-testid="country-filters">
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
            data-testid="filter-all-countries"
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
                data-testid={`filter-country-${countryName.toLowerCase()}`}
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

      {/* Country Groups */}
      <div className="space-y-8" data-testid="country-groups">
        {Object.entries(filteredCitiesByCountry)
          .sort(([, citiesA], [, citiesB]) => {
            const bestCityA = citiesA[0];
            const bestCityB = citiesB[0];
            switch (sortOption) {
              case "price-low-high":
                return bestCityA.totals.p35 - bestCityB.totals.p35;
              case "confidence":
                const confidenceOrder = { high: 3, medium: 2, low: 1 };
                return (
                  confidenceOrder[bestCityB.confidence] -
                  confidenceOrder[bestCityA.confidence]
                );
              case "region":
                return bestCityA.region.localeCompare(bestCityB.region);
              case "alphabetical":
              default:
                return bestCityA.country.localeCompare(bestCityB.country);
            }
          })
          .map(([countryName, cities]) => (
            <div
              key={countryName}
              className="space-y-4"
              data-testid={`country-group-${countryName.toLowerCase()}`}
            >
              <div
                  className="w-full flex items-center justify-between gap-4 bg-primary/5 border border-primary/10 rounded-md px-4 py-2"
                  data-testid={`text-country-${countryName.toLowerCase()}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getFlagImageComponent(countryName) ?? (
                        <div className="w-6 h-4 bg-gray-200 rounded-sm" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-primary">
                        {countryName}
                      </div>
                      <div className="text-xs text-muted-foreground -mt-0.5">
                        {cities.length} cities
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center w-8 h-6 text-xs font-semibold rounded-full bg-white border border-primary/20 text-primary">
                      {cities.length}
                    </div>
                    <button
                      className={
                        "text-sm text-primary/90 hover:text-primary transition px-2 py-1 rounded-md bg-white/0 border border-transparent hover:bg-white/50"
                      }
                      aria-label={`Toggle filter ${countryName}`}
                      onClick={() => toggleCountryFilter(countryName)}
                      data-testid={`button-filter-toggle-${countryName.toLowerCase()}`}
                    >
                      {selectedCountries.includes(countryName) ? "Show all" : "View"}
                    </button>
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cities.map((city) => (
                  <CityCard
                    key={city.cityId}
                    city={city}
                    onClick={onCityClick}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div
          className="flex justify-center items-center space-x-4 py-6"
          data-testid="pagination"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(pagination.page - 1)}
            disabled={pagination.page === 1}
            data-testid="button-prev-page"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Page</span>
            <span
              className="text-sm font-medium text-foreground"
              data-testid="text-current-page"
            >
              {pagination.page}
            </span>
            <span className="text-sm text-muted-foreground">of</span>
            <span
              className="text-sm font-medium text-foreground"
              data-testid="text-total-pages"
            >
              {pagination.totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            data-testid="button-next-page"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Disclaimer Section */}
      <DisclaimerSection sources={meta.source} disclaimer={meta.disclaimer} />
    </div>
  );
}
