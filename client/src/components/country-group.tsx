import { useState } from "react";
import { Flag, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CityCard } from "./city-card";
import type { CityRecommendation, CountrySummary } from "@/types/travel";

interface CountryGroupProps {
  country: CountrySummary;
  cities: CityRecommendation[];
  onCityClick?: (city: CityRecommendation) => void;
}

export function CountryGroup({ country, cities, onCityClick }: CountryGroupProps) {
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
      <div className="bg-secondary px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h4 className="text-lg font-semibold text-foreground flex items-center" data-testid={`text-country-name-${country.country}`}>
              <Flag className="h-5 w-5 mr-2" />
              {country.country}
            </h4>
            <span className="ml-2 text-sm text-muted-foreground" data-testid={`text-city-count-${country.country}`}>
              ({cities.length} cit{cities.length !== 1 ? 'ies' : 'y'})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground" data-testid={`text-country-average-${country.country}`}>
              Average: {formatCurrency(country.summaryP50)}
            </span>
            {hasMultiplePages && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevPage}
                  className="h-8 w-8 p-0"
                  data-testid={`button-prev-${country.country}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground" data-testid={`text-page-info-${country.country}`}>
                  {currentPage + 1}/{totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextPage}
                  className="h-8 w-8 p-0"
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
          />
        ))}
      </div>
    </Card>
  );
}
