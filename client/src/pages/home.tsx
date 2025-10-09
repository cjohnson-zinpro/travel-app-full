// client/src/pages/home.tsx
import { useState, useRef } from "react";
import { SearchForm } from "@/components/search-form";
import { ResultsGrid } from "@/components/results-grid";
import { useTravelSearch } from "@/hooks/use-travel-search";
import { useProgressiveSearch } from "@/hooks/use-progressive-search";
import { ProgressiveResults } from "@/components/progressive-results"; // make sure this exists/exports
import { Globe, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { TravelSearchParams, CityRecommendation } from "@shared/schema";

export default function Home() {
  const [searchParams, setSearchParams] = useState<TravelSearchParams | null>(
    null,
  );
  const [travelStyle, setTravelStyle] = useState<"budget" | "mid" | "luxury">(
    "budget",
  );
  const [sortOption, setSortOption] = useState<
    "alphabetical" | "price-low-high" | "confidence" | "region"
  >("price-low-high");

  // Ref for scrolling to results section
  const resultsRef = useRef<HTMLDivElement>(null);

  // Disable legacy search - using progressive search only
  const { data, isLoading, error } = useTravelSearch(null);
  const progressiveResults = useProgressiveSearch(searchParams);

  const handleSearch = (params: TravelSearchParams) => {
    // Override the budget with the slider value
    const updatedParams = { ...params, budget: budget };
    setSearchParams(updatedParams);
    if (params.travelStyle) {
      setTravelStyle(params.travelStyle);
    }
    // Scrolling is handled inside ProgressiveResults when it renders.
  };

  const handleCityClick = (city: CityRecommendation) => {
    // TODO: open city detail
    console.log("City clicked:", city);
  };

  const handlePageChange = (page: number) => {
    if (!searchParams) return;
    setSearchParams({ ...searchParams, page });
  };

  const handleSortChange = (
    sort: "alphabetical" | "price-low-high" | "confidence" | "region",
  ) => setSortOption(sort);

  // Insert budget slider as the primary input for trip planning
  const [budget, setBudget] = useState<number>(2000);
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBudget(Number(e.target.value));
  };

  return (
    <div className="min-h-screen bg-background" data-testid="home-page">
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 32px;
          width: 32px;
          border-radius: 50%;
          background: #1d4ed8;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(29, 78, 216, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 3px solid white;
          transition: all 0.2s ease;
        }
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          background: #1e40af;
          box-shadow: 0 8px 24px rgba(29, 78, 216, 0.5), 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        .slider-thumb::-moz-range-thumb {
          height: 32px;
          width: 32px;
          border-radius: 50%;
          background: #1d4ed8;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(29, 78, 216, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 3px solid white;
          transition: all 0.2s ease;
        }
        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.15);
          background: #1e40af;
          box-shadow: 0 8px 24px rgba(29, 78, 216, 0.5), 0 4px 8px rgba(0, 0, 0, 0.15);
        }
      `}</style>
      {/* Header */}
      <header className="bg-card border-b border-border" data-testid="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1
                  className="text-2xl font-bold text-primary flex items-center"
                  data-testid="text-brand-title"
                >
                  <Globe className="h-6 w-6 mr-2" />
                  TravelBudget
                </h1>
              </div>
            </div>
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  data-testid="link-how-it-works"
                >
                  How it works
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  data-testid="link-about"
                >
                  About
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  data-testid="link-faq"
                >
                  FAQ
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        data-testid="main-content"
      >
        {/* Hero */}
        <div className="text-center mb-12" data-testid="hero-section">
          <h2
            className="text-4xl font-bold text-foreground mb-4"
            data-testid="text-hero-title"
          >
            Where can you go for your budget?
          </h2>
          <p
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            data-testid="text-hero-subtitle"
          >
            Enter your budget and preferences to discover destinations that fit
            your travel plans. We show you ballpark estimates with transparent
            cost breakdowns.
          </p>
        </div>

        {/* Search Form with Prominent Budget Slider */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Prominent budget slider section */}
            <div className="mb-8">
              <label
                htmlFor="budget-slider"
                className="block text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
              >
                Budget: ${budget.toLocaleString()}
              </label>
              <div className="relative px-4">
                <input
                  id="budget-slider"
                  type="range"
                  min="250"
                  max="8000"
                  step="50"
                  value={budget}
                  onChange={handleBudgetChange}
                  className="w-full h-6 bg-gray-400 rounded-full appearance-none cursor-pointer slider-thumb shadow-md"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((budget - 250) / (8000 - 250)) * 100}%, #9ca3af ${((budget - 250) / (8000 - 250)) * 100}%, #9ca3af 100%)`
                  }}
                />
                <div className="flex justify-between text-sm font-medium text-muted-foreground mt-3 px-2">
                  <span className="bg-muted px-3 py-1 rounded-full">$250</span>
                  <span className="bg-muted px-3 py-1 rounded-full">$8,000+</span>
                </div>
              </div>
            </div>
            
            {/* Other form fields */}
            <SearchForm
              onSearch={handleSearch}
              isLoading={isLoading}
              initialValues={{
                budget: budget,
                origin: "PHX",
                nights: 10,
              }}
              key={budget} // Force re-render when budget changes
            />
          </CardContent>
        </Card>

        {/* Progressive (streamed) */}
        {progressiveResults.status !== "idle" && (
          <div className="mb-10" ref={resultsRef}>
            <ProgressiveResults
              results={progressiveResults.results}
              countries={progressiveResults.countries}
              status={progressiveResults.status}
              progress={progressiveResults.progress}
              totalResults={progressiveResults.totalResults}
              travelStyle={travelStyle}
              userBudget={searchParams?.budget}
              originAirport={searchParams?.origin}
              autoScrollOnLoad
              scrollTarget="header"
            />
          </div>
        )}

        {/* Loading - only show when progressive results are not active */}
        {isLoading && progressiveResults.status === "idle" && (
          <div className="space-y-6" data-testid="loading-state">
            <Skeleton className="h-8 w-64" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive" data-testid="error-alert">
            <AlertDescription>
              {error.message ||
                "Failed to fetch travel recommendations. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Legacy Results - only show when progressive results are not active */}
        {data &&
          !isLoading &&
          !error &&
          progressiveResults.status === "idle" && (
            <ResultsGrid
              data={data}
              onCityClick={handleCityClick}
              onPageChange={handlePageChange}
              onSortChange={handleSortChange}
              searchParams={searchParams || undefined}
              sortOption={sortOption}
            />
          )}

        {/* Welcome */}
        {!searchParams && !isLoading && !error && (
          <div className="text-center py-12" data-testid="welcome-state">
            <div className="text-6xl mb-6">🗺️</div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Ready to explore the world?
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Use the search form above to find destinations that fit your
              budget. We’ll show you real cost estimates and help you plan your
              next adventure.
            </p>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <span>Start by entering your budget</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="bg-card border-t border-border mt-16"
        data-testid="footer"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5
                className="font-semibold text-foreground mb-3"
                data-testid="text-footer-brand"
              >
                TravelBudget
              </h5>
              <p className="text-sm text-muted-foreground">
                Discover destinations that fit your budget with transparent cost
                estimates.
              </p>
            </div>
            <div>
              <h6 className="font-medium text-foreground mb-3">Product</h6>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                    data-testid="link-footer-how-it-works"
                  >
                    How it works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                    data-testid="link-footer-data-sources"
                  >
                    Data sources
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                    data-testid="link-footer-api-docs"
                  >
                    API documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-medium text-foreground mb-3">Support</h6>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                    data-testid="link-footer-faq"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                    data-testid="link-footer-contact"
                  >
                    Contact us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                    data-testid="link-footer-feedback"
                  >
                    Feedback
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-medium text-foreground mb-3">Legal</h6>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                    data-testid="link-footer-privacy"
                  >
                    Privacy policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                    data-testid="link-footer-terms"
                  >
                    Terms of service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                    data-testid="link-footer-disclaimers"
                  >
                    Disclaimers
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8">
            <p
              className="text-sm text-muted-foreground text-center"
              data-testid="text-footer-copyright"
            >
              © 2025 TravelBudget. All rights reserved. | Estimates are not
              guaranteed; verify before booking.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
