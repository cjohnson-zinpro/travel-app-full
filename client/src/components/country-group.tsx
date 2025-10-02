import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CityCard } from "./city-card";
import { getFlagImageComponent } from "@/lib/flag-utils";
import type { CityRecommendation, CountrySummary } from "@/types/travel";

interface CountryGroupProps {
  country: CountrySummary;
  cities: CityRecommendation[];
  onCityClick?: (city: CityRecommendation) => void;
  originAirport?: string;
}

export function CountryGroup({ country, cities, onCityClick, originAirport }: CountryGroupProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const citiesPerPage = 3;
  const totalPages = Math.ceil(cities.length / citiesPerPage);
  const hasMultiplePages = totalPages > 1;
  
  const visibleCities = hasMultiplePages 
    ? cities.slice(currentPage * citiesPerPage, (currentPage + 1) * citiesPerPage)
    : cities;
    
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  
  const handlePrevPage = () => {
    setCurrentPage(prev => prev > 0 ? prev - 1 : totalPages - 1);
  };
  
  const handleNextPage = () => {
    setCurrentPage(prev => prev < totalPages - 1 ? prev + 1 : 0);
  };

  return (
    <Card className="bg-card rounded-lg border border-border overflow-hidden" data-testid={`country-group-${country.country}`}>
      {/* Country Header */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-5 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-background rounded-full border-2 border-primary/20 shadow-sm">
              {getFlagImageComponent(country.country)}
            </div>
            <div>
              <h4 className="text-xl font-bold text-foreground tracking-tight" data-testid={`text-country-name-${country.country}`}>
                {country.country}
              </h4>
              <span className="text-sm text-muted-foreground font-medium" data-testid={`text-city-count-${country.country}`}>
                {cities.length} destination{cities.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground">Average Cost</div>
              <div className="text-lg font-bold text-foreground" data-testid={`text-country-average-${country.country}`}>
                {formatCurrency(country.summaryP50)}
              </div>
            </div>
            {hasMultiplePages && (
              <div className="flex items-center space-x-1 bg-background rounded-lg p-1 border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevPage}
                  className="h-7 w-7 p-0 hover:bg-primary/10"
                  data-testid={`button-prev-${country.country}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium text-muted-foreground px-2" data-testid={`text-page-info-${country.country}`}>
                  {currentPage + 1}/{totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextPage}
                  className="h-7 w-7 p-0 hover:bg-primary/10"
                  data-testid={`button-next-${country.country}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Cities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6" data-testid={`cities-grid-${country.country}`}>
        {visibleCities.map((city) => (
          <CityCard 
            key={city.cityId} 
            city={city} 
            onClick={onCityClick}
            originAirport={originAirport}
          />
        ))}
      </div>
    </Card>
  );
}
