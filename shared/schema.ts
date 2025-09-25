import { z } from "zod";

// TypeScript interfaces (replacing database tables)
export interface City {
  id: string;
  name: string;
  countryCode: string;
  country: string;
  region: string;
  iataCityCode?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  enabled: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlightAverage {
  id: string;
  originIata: string;
  cityIata: string;
  month?: number | null;
  avgRoundtripUsd: string;
  sampleSize?: number | null;
  confidence: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HotelStats {
  id: string;
  cityId: string;
  month?: number | null;
  p25Usd: string;
  p50Usd: string;
  p75Usd: string;
  avgNightlyUsd?: string;
  sampleSize?: number | null;
  confidence: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyCosts {
  id: string;
  cityId: string;
  dailyFoodUsd: string;
  dailyTransportUsd: string;
  dailyMiscUsd: string;
  budgetPerDay?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CacheMetadata {
  id: string;
  cacheKey: string;
  dataType: string;
  expiresAt: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CachedHotelPricing {
  id: string;
  cityIata: string;
  cityName: string;
  countryName: string;
  p25Usd: string;
  p50Usd: string;
  p75Usd: string;
  source: string;
  confidence: string;
  batchId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CachedDailyCosts {
  id: string;
  cityIata: string;
  cityName: string;
  countryName: string;
  dailyFoodUsd: string;
  dailyTransportUsd: string;
  dailyMiscUsd: string;
  source: string;
  batchId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchMetadata {
  id: string;
  batchId: string;
  status: string;
  totalCities: number;
  processedCities?: number | null;
  successfulCalls?: number | null;
  failedCalls?: number | null;
  totalCost?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  errorMessage?: string | null;
  metadata?: any;
}

// Insert types (for creating new records)
export interface InsertCity {
  name: string;
  countryCode: string;
  country: string;
  region: string;
  iataCityCode?: string;
  latitude?: string;
  longitude?: string;
  enabled?: number;
}

export interface InsertFlightAverage {
  originIata: string;
  cityIata: string;
  month?: number;
  avgRoundtripUsd: string;
  sampleSize?: number;
  confidence: string;
}

export interface InsertHotelStats {
  cityId: string;
  month?: number;
  p25Usd: string;
  p50Usd: string;
  p75Usd: string;
  avgNightlyUsd?: string;
  sampleSize?: number;
  confidence: string;
}

export interface InsertDailyCosts {
  cityId: string;
  dailyFoodUsd: string;
  dailyTransportUsd: string;
  dailyMiscUsd: string;
  budgetPerDay?: string;
}

export interface InsertCachedHotelPricing {
  cityIata: string;
  cityName: string;
  countryName: string;
  p25Usd: string;
  p50Usd: string;
  p75Usd: string;
  source?: string;
  confidence?: string;
  batchId?: string;
}

export interface InsertCachedDailyCosts {
  cityIata: string;
  cityName: string;
  countryName: string;
  dailyFoodUsd: string;
  dailyTransportUsd: string;
  dailyMiscUsd: string;
  source?: string;
  batchId?: string;
}

export interface InsertBatchMetadata {
  batchId: string;
  status: string;
  totalCities: number;
  processedCities?: number;
  successfulCalls?: number;
  failedCalls?: number;
  totalCost?: string;
  completedAt?: Date;
  errorMessage?: string;
  metadata?: any;
}

// Zod validation schemas
export const travelSearchSchema = z.object({
  budget: z.number().min(1),
  origin: z.string().optional(),
  nights: z.number().min(1).max(365).default(10),
  month: z.number().min(1).max(12).optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  sort: z
    .enum(["alphabetical", "price-low-high", "confidence", "region"])
    .default("alphabetical"),
  includeEstimates: z.boolean().default(true),
  limit: z.number().min(1).max(100).default(50),
  page: z.number().min(1).default(1),
  travelStyle: z.enum(["budget", "mid", "luxury"]).optional(),
});

export type TravelSearchParams = z.infer<typeof travelSearchSchema>;

// Response types
export type CityRecommendation = {
  cityId?: string;
  city: string;
  country: string;
  region: string;
  nights?: number;
  budgetCategory?: "within_budget" | "slightly_above_budget";
  totals?: {
    p25: number;
    p35: number;
    p50: number;
    p75: number;
  };
  breakdown?: {
    flight: number;
    flightEstimate?: boolean;
    flightSource: "amadeus" | "estimate";
    hotelPerNightP25: number;
    hotelPerNightP35: number;
    hotelPerNightP50: number;
    hotelPerNightP75: number;
    hotelEstimate?: boolean;
    hotelSource: "claude" | "estimate";
    dailyPerDay: number;
    dailySource: "claude" | "estimate";
  };
  rangeNote?: string;
  confidence?: "high" | "medium" | "low";
  lastUpdatedISO?: string;
  flightCost?: number;
  hotelCostPerNight?: number;
  totalNightsCost?: number;
  dailyBudget?: number;
  totalDailyCost?: number;
  totalEstimate?: number;
  cityData?: City;
  coordinates?: {
    lat: number;
    lng: number;
  };
  iataCityCode?: string;
};

export type ProgressiveResponse = {
  sessionId: string;
  status: "processing" | "completed" | "timeout";
  progress: {
    processed: number;
    total: number;
    percentage: number;
  };
  results: CityRecommendation[];
  countries: CountrySummary[];
  totalResults: number;
  message?: string;
};

export type CountrySummary = {
  country: string;
  summaryP35?: number;
  summaryP50?: number;
  cities: string[];
};

export type TravelRecommendationsResponse = {
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
};