export interface TravelSearchParams {
  budget: number;
  origin?: string;
  nights: number;
  month?: number;
  region?: string;
  country?: string;
  limit?: number;
  page?: number;
  sort?: 'alphabetical' | 'price-low-high' | 'confidence' | 'region';
  includeEstimates?: boolean;
  travelStyle?: 'budget' | 'mid' | 'luxury';
}

export interface CityRecommendation {
  cityId: string;
  city: string;
  country: string;
  region: string;
  nights: number;
  totals: {
    p25: number;
    p35: number; // Budget-focused percentile
    p50: number;
    p75: number;
  };
  breakdown: {
    flight: number;
    flightEstimate?: boolean;
    flightSource: 'amadeus' | 'estimate'; // Live Amadeus API vs fallback estimate
    hotelPerNightP25: number;
    hotelPerNightP35: number; // Budget-focused hotel pricing
    hotelPerNightP50: number;
    hotelPerNightP75: number;
    hotelEstimate?: boolean;
    hotelSource: 'claude' | 'estimate'; // Claude AI pricing vs fallback estimate
    dailyPerDay: number;
    dailySource: 'claude' | 'estimate'; // Claude AI daily costs vs fallback estimate
  };
  rangeNote: string;
  confidence: 'high' | 'medium' | 'low';
  lastUpdatedISO: string;
}

export interface CountrySummary {
  country: string;
  summaryP35: number; // Budget-focused summary
  summaryP50: number;
  cities: string[];
}

export interface TravelRecommendationsResponse {
  query: TravelSearchParams;
  results: CityRecommendation[];
  countries: CountrySummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta: {
    source: string[];
    disclaimer: string;
  };
}
