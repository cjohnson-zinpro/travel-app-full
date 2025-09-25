import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Cities table
export const cities = pgTable(
  "cities",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    countryCode: text("country_code").notNull(),
    country: text("country").notNull(),
    region: text("region").notNull(),
    iataCityCode: text("iata_city_code"),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    enabled: integer("enabled").default(1).notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    regionIdx: index("cities_region_idx").on(table.region),
    countryIdx: index("cities_country_idx").on(table.country),
    enabledIdx: index("cities_enabled_idx").on(table.enabled),
  }),
);

// Flight averages table
export const flightAverages = pgTable(
  "flight_averages",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    originIata: text("origin_iata").notNull(),
    cityIata: text("city_iata").notNull(),
    month: integer("month"), // 1-12, null for any month
    avgRoundtripUsd: decimal("avg_roundtrip_usd", {
      precision: 10,
      scale: 2,
    }).notNull(),
    sampleSize: integer("sample_size").default(0),
    confidence: text("confidence").notNull(), // 'high', 'medium', 'low'
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    originCityIdx: index("flight_averages_origin_city_idx").on(
      table.originIata,
      table.cityIata,
    ),
    monthIdx: index("flight_averages_month_idx").on(table.month),
  }),
);

// Hotel statistics table
export const hotelStats = pgTable(
  "hotel_stats",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    cityId: varchar("city_id")
      .notNull()
      .references(() => cities.id),
    month: integer("month"), // 1-12, null for any month
    p25Usd: decimal("p25_usd", { precision: 10, scale: 2 }).notNull(),
    p50Usd: decimal("p50_usd", { precision: 10, scale: 2 }).notNull(),
    p75Usd: decimal("p75_usd", { precision: 10, scale: 2 }).notNull(),
    sampleSize: integer("sample_size").default(0),
    confidence: text("confidence").notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    cityMonthIdx: index("hotel_stats_city_month_idx").on(
      table.cityId,
      table.month,
    ),
  }),
);

// Daily costs table
export const dailyCosts = pgTable(
  "daily_costs",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    cityId: varchar("city_id")
      .notNull()
      .references(() => cities.id),
    dailyFoodUsd: decimal("daily_food_usd", {
      precision: 10,
      scale: 2,
    }).notNull(),
    dailyTransportUsd: decimal("daily_transport_usd", {
      precision: 10,
      scale: 2,
    }).notNull(),
    dailyMiscUsd: decimal("daily_misc_usd", {
      precision: 10,
      scale: 2,
    }).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    cityIdx: index("daily_costs_city_idx").on(table.cityId),
  }),
);

// Cache metadata table
export const cacheMetadata = pgTable("cache_metadata", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  cacheKey: text("cache_key").notNull().unique(),
  dataType: text("data_type").notNull(), // 'flights', 'hotels', 'daily_costs'
  lastUpdated: timestamp("last_updated").default(sql`CURRENT_TIMESTAMP`),
  expiresAt: timestamp("expires_at").notNull(),
  metadata: jsonb("metadata"), // Additional metadata as JSON
});

// Cached hotel pricing from Claude API batch calls
export const cachedHotelPricing = pgTable(
  "cached_hotel_pricing",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    cityIata: text("city_iata").notNull().unique(),
    cityName: text("city_name").notNull(),
    countryName: text("country_name").notNull(),
    p25Usd: decimal("p25_usd", { precision: 10, scale: 2 }).notNull(),
    p50Usd: decimal("p50_usd", { precision: 10, scale: 2 }).notNull(),
    p75Usd: decimal("p75_usd", { precision: 10, scale: 2 }).notNull(),
    source: text("source").notNull().default("claude"), // 'claude' or 'fallback'
    confidence: text("confidence").notNull().default("medium"), // 'high', 'medium', 'low'
    batchId: text("batch_id"), // Track which batch run created this
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    cityIataIdx: index("cached_hotel_pricing_city_iata_idx").on(table.cityIata),
    batchIdx: index("cached_hotel_pricing_batch_idx").on(table.batchId),
  }),
);

// Cached daily costs from Claude API batch calls
export const cachedDailyCosts = pgTable(
  "cached_daily_costs",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    cityIata: text("city_iata").notNull().unique(),
    cityName: text("city_name").notNull(),
    countryName: text("country_name").notNull(),
    dailyFoodUsd: decimal("daily_food_usd", { precision: 10, scale: 2 }).notNull(),
    dailyTransportUsd: decimal("daily_transport_usd", { precision: 10, scale: 2 }).notNull(),
    dailyMiscUsd: decimal("daily_misc_usd", { precision: 10, scale: 2 }).notNull(),
    source: text("source").notNull().default("claude"), // 'claude' or 'fallback'
    batchId: text("batch_id"), // Track which batch run created this
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    cityIataIdx: index("cached_daily_costs_city_iata_idx").on(table.cityIata),
    batchIdx: index("cached_daily_costs_batch_idx").on(table.batchId),
  }),
);

// Batch processing metadata
export const batchMetadata = pgTable("batch_metadata", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  batchId: text("batch_id").notNull().unique(),
  status: text("status").notNull(), // 'running', 'completed', 'failed', 'cancelled'
  totalCities: integer("total_cities").notNull(),
  processedCities: integer("processed_cities").default(0),
  successfulCalls: integer("successful_calls").default(0),
  failedCalls: integer("failed_calls").default(0),
  totalCost: decimal("total_cost", { precision: 10, scale: 4 }).default("0"), // Estimated API cost in USD
  startedAt: timestamp("started_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"), // Additional batch info
});

// Relations
export const citiesRelations = relations(cities, ({ many }) => ({
  hotelStats: many(hotelStats),
  dailyCosts: many(dailyCosts),
}));

export const hotelStatsRelations = relations(hotelStats, ({ one }) => ({
  city: one(cities, {
    fields: [hotelStats.cityId],
    references: [cities.id],
  }),
}));

export const dailyCostsRelations = relations(dailyCosts, ({ one }) => ({
  city: one(cities, {
    fields: [dailyCosts.cityId],
    references: [cities.id],
  }),
}));

// Zod schemas for validation
export const insertCitySchema = createInsertSchema(cities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFlightAverageSchema = createInsertSchema(
  flightAverages,
).omit({
  id: true,
  updatedAt: true,
});

export const insertHotelStatsSchema = createInsertSchema(hotelStats).omit({
  id: true,
  updatedAt: true,
});

export const insertDailyCostsSchema = createInsertSchema(dailyCosts).omit({
  id: true,
  updatedAt: true,
});

export const insertCachedHotelPricingSchema = createInsertSchema(cachedHotelPricing).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCachedDailyCostsSchema = createInsertSchema(cachedDailyCosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBatchMetadataSchema = createInsertSchema(batchMetadata).omit({
  id: true,
  startedAt: true,
});

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
  travelStyle: z.enum(["budget", "mid", "luxury"]).optional(), // ADD THIS LINE
});

// Types
export type City = typeof cities.$inferSelect;
export type InsertCity = z.infer<typeof insertCitySchema>;
export type FlightAverage = typeof flightAverages.$inferSelect;
export type InsertFlightAverage = z.infer<typeof insertFlightAverageSchema>;
export type HotelStats = typeof hotelStats.$inferSelect;
export type InsertHotelStats = z.infer<typeof insertHotelStatsSchema>;
export type DailyCosts = typeof dailyCosts.$inferSelect;
export type InsertDailyCosts = z.infer<typeof insertDailyCostsSchema>;
export type CacheMetadata = typeof cacheMetadata.$inferSelect;
export type CachedHotelPricing = typeof cachedHotelPricing.$inferSelect;
export type InsertCachedHotelPricing = z.infer<typeof insertCachedHotelPricingSchema>;
export type CachedDailyCosts = typeof cachedDailyCosts.$inferSelect;
export type InsertCachedDailyCosts = z.infer<typeof insertCachedDailyCostsSchema>;
export type BatchMetadata = typeof batchMetadata.$inferSelect;
export type InsertBatchMetadata = z.infer<typeof insertBatchMetadataSchema>;
export type TravelSearchParams = z.infer<typeof travelSearchSchema>;

// Response types
export type CityRecommendation = {
  cityId: string;
  city: string;
  country: string;
  region: string;
  nights: number;
  budgetCategory: "within_budget" | "slightly_above_budget"; // New budget category field
  totals: {
    p25: number;
    p35: number; // Budget-focused percentile
    p50: number;
    p75: number;
  };
  breakdown: {
    flight: number;
    flightEstimate?: boolean;
    flightSource: "amadeus" | "estimate"; // Live Amadeus API vs fallback estimate
    hotelPerNightP25: number;
    hotelPerNightP35: number; // Budget-focused hotel pricing
    hotelPerNightP50: number;
    hotelPerNightP75: number;
    hotelEstimate?: boolean;
    hotelSource: "claude" | "estimate"; // Claude AI pricing vs fallback estimate
    dailyPerDay: number;
    dailySource: "claude" | "estimate"; // Claude AI daily costs vs fallback estimate
  };
  rangeNote: string;
  confidence: "high" | "medium" | "low";
  lastUpdatedISO: string;
};

// Progressive loading response
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
  summaryP35: number; // Budget-focused summary
  summaryP50: number;
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
