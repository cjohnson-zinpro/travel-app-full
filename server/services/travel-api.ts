import { storage } from "../storage";
import { getCacheServiceInstance } from "./cache-service";
import { claudeService } from "./claude-service";
import { flightService } from "./flight-service";
import { claudeRateLimiter } from "./rate-limiter";
import { ClaudeDailyCosts } from "@shared/data/claude-daily-costs";
import {
  type TravelSearchParams,
  type TravelRecommendationsResponse,
  type CountrySummary,
  type InsertFlightAverage,
  type ProgressiveResponse,
} from "@shared/schema";

// Import allowlists
import { AsiaMajorCities } from "../data/majorCities.asia";
import { EuropeMajorCities } from "../data/majorCities.europe";
import { AmericasMajorCities } from "../data/majorCities.americas";
import { AfricaMajorCities } from "../data/majorCities.africa";
import { OceaniaMajorCities } from "../data/majorCities.oceania";
import {
  RegionCountriesMap,
  CountryNames,
  getCountriesForRegion,
  getCountryName,
} from "../data/regionCountries";
import { randomUUID } from "crypto";

// In-memory session storage for progressive search
const progressSessions = new Map<
  string,
  {
    results: any[];
    status: "processing" | "completed" | "timeout";
    progress: { processed: number; total: number; attempts: number };
    startedAt: number;
    lastUpdatedAt: number;
  }
>();

// Session cleanup configuration
const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Start cleanup timer
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [sessionId, session] of Array.from(progressSessions.entries())) {
    const isExpired = now - session.lastUpdatedAt > SESSION_TTL_MS;
    const isCompleted =
      session.status === "completed" &&
      now - session.lastUpdatedAt > 10 * 60 * 1000; // 10 min after completion (same as TTL)

    if (isExpired || isCompleted) {
      progressSessions.delete(sessionId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(
      `🧹 Session cleanup: Removed ${cleanedCount} expired sessions (${progressSessions.size} remaining)`,
    );
  }
}, CLEANUP_INTERVAL_MS);

export class TravelApiService {
  constructor() {
    console.log("🚀 TravelApiService initialized with Claude-based cost estimation");
    
    // Clear cache on startup to ensure fresh accommodation data
    this.clearCacheOnStartup();
  }

  private async clearCacheOnStartup() {
    try {
      // Skip cache clearing during initialization - will be done after cache service is ready
      console.log("🧹 Cache clearing will be handled after cache service initialization");
    } catch (error) {
      console.log("⚠️ Could not clear cache on startup:", error);
    }
  }

  // Progressive search method for fast initial results
  async getProgressiveRecommendations(
    params: TravelSearchParams & { sessionId?: string },
  ): Promise<ProgressiveResponse> {
    const sessionId = params.sessionId || randomUUID();

    // If session exists, return current state
    const existingSession = progressSessions.get(sessionId);
    if (existingSession) {
      // Calculate percentage based on attempts (work completed) and clamp to 100%
      const percentage =
        existingSession.progress.total > 0
          ? Math.min(
              100,
              Math.round(
                (existingSession.progress.attempts /
                  existingSession.progress.total) *
                  100,
              ),
            )
          : 0;

      const countries: CountrySummary[] = this.buildCountrySummaries(
        existingSession.results,
      );

      return {
        sessionId,
        status: existingSession.status,
        progress: {
          processed: existingSession.progress.processed,
          total: existingSession.progress.total,
          percentage,
        },
        results: existingSession.results,
        countries,
        totalResults: existingSession.results.length,
        message:
          existingSession.status === "processing"
            ? "Loading more destinations..."
            : undefined,
      };
    }

    // Create new session and start progressive search
    const session = {
      results: [],
      status: "processing" as const,
      progress: { processed: 0, total: 0, attempts: 0 },
      startedAt: Date.now(),
      lastUpdatedAt: Date.now(),
    };

    progressSessions.set(sessionId, session);

    // Start background processing (don't await)
    this.processProgressiveSearch(sessionId, params).catch((error) => {
      console.error(
        `Progressive search error for session ${sessionId}:`,
        error,
      );
      const session = progressSessions.get(sessionId);
      if (session) {
        session.status = "timeout";
        session.lastUpdatedAt = Date.now();
      }
    });

    // Return initial response immediately
    return {
      sessionId,
      status: "processing",
      progress: { processed: 0, total: 0, percentage: 0 },
      results: [],
      countries: [],
      totalResults: 0,
      message: "Starting search for destinations...",
    };
  }

  // Background processing method for progressive search
  private async processProgressiveSearch(
    sessionId: string,
    params: TravelSearchParams,
  ): Promise<void> {
    const session = progressSessions.get(sessionId);
    if (!session) return;

    try {
      // Get priority cities first (8-10 major cities)
      const priorityCities = this.getPriorityCities(params);
      const regularCities = this.getCitiesFromAllowlists(params).filter(
        (city) =>
          !priorityCities.some(
            (priority) => priority.iataCode === city.iataCode,
          ),
      );

      const allCities = [...priorityCities, ...regularCities];
      const processingCap = 50; // Cap for performance
      const citiesToProcess = Math.min(allCities.length, processingCap);
      session.progress.total = citiesToProcess; // Match actual processing limit

      console.log(
        `🚀 Progressive search: Processing ${session.progress.total} cities (${priorityCities.length} priority + ${regularCities.length - (allCities.length - session.progress.total)} regular)`,
      );

      // Set deadline for 8-10 seconds for priority cities, then continue background
      const priorityDeadline = Date.now() + 10000; // 10 seconds for initial results
      const maxProcessingTime = Date.now() + 60000; // 1 minute max total

      // Create shared Set to track processed cities across both phases
      const sessionProcessedIds = new Set<string>();
      
      // Process priority cities first (up to 10)
      const prioritySlice = priorityCities.slice(
        0,
        Math.min(10, citiesToProcess),
      );
      await this.processProgressiveCities(
        sessionId,
        prioritySlice,
        params,
        priorityDeadline,
        true,
        sessionProcessedIds,
      );

      // Continue with regular cities if session still active
      const currentSession = progressSessions.get(sessionId);
      if (
        currentSession &&
        currentSession.status === "processing" &&
        Date.now() < maxProcessingTime
      ) {
        const remainingSlots = citiesToProcess - prioritySlice.length;
        const regularSlice = regularCities.slice(
          0,
          Math.max(0, remainingSlots),
        );
        await this.processProgressiveCities(
          sessionId,
          regularSlice,
          params,
          maxProcessingTime,
          false,
          sessionProcessedIds,
        );
      }

      // Mark as completed, apply final deduplication, and cache results
      const finalSession = progressSessions.get(sessionId);
      if (finalSession && finalSession.status === "processing") {
        // Apply final deduplication to ensure no duplicates in results
        finalSession.results = this.deduplicateCities(finalSession.results);
        finalSession.status = "completed";
        finalSession.lastUpdatedAt = Date.now();
        
        // Cache the completed results for immediate future access
        try {
          const cache = getCacheServiceInstance();
          const countries = this.buildCountrySummaries(finalSession.results);
          await cache.set(params, {
            query: params,
            results: finalSession.results,
            countries,
            pagination: {
              page: 1,
              limit: finalSession.results.length,
              total: finalSession.results.length,
              totalPages: 1,
            },
            meta: {
              source: ["claude"],
              disclaimer: "Estimates powered by Claude AI",
            },
          });
          console.log(`💾 Cached ${finalSession.results.length} results for future searches`);
        } catch (error) {
          console.warn('Failed to cache progressive search results:', error);
        }
        
        console.log(
          `✅ Progressive search completed for session ${sessionId}: ${finalSession.results.length} results (deduplicated)`,
        );
      }
    } catch (error) {
      console.error(
        `Progressive search error for session ${sessionId}:`,
        error,
      );
      const session = progressSessions.get(sessionId);
      if (session) {
        session.status = "timeout";
        session.lastUpdatedAt = Date.now();
      }
    }
  }

  // Process cities with progressive updates
  private async processProgressiveCities(
    sessionId: string,
    cities: any[],
    params: TravelSearchParams,
    deadline: number,
    isPriority: boolean,
    sessionProcessedIds?: Set<string>,
  ): Promise<void> {
    const session = progressSessions.get(sessionId);
    if (!session) return;

    const recommendations: any[] = [];
    let processed = 0;

    const processCity = async (city: any) => {
      if (Date.now() > deadline) return;

      try {
        // Use Claude for cost-effective flight estimates instead of expensive Amadeus
        let flightCost = 0;
        let flightEstimate = false;

        // Get flight cost using distance-based calculation if origin provided
        if (params.origin) {
          console.log(`🔍 Processing flight cost for city: ${city.name} (${city.iataCode}) in ${city.address?.countryName}`);
          console.log(`🔍 City coordinates available: lat=${city.geoCode?.latitude}, lon=${city.geoCode?.longitude}`);
          try {
            flightCost = await this.calculateFlightCostByDistance(params.origin, city, params.month);
            flightEstimate = false; // Distance-based calculations are precise, not estimates
            console.log(`✅ Distance-based flight cost calculated: $${flightCost} for ${city.name}`);
          } catch (error) {
            console.warn(`❌ Distance calculation failed for ${city.name}:`, error);
            flightCost = this.getFallbackFlightCost(city.address.countryName);
            flightEstimate = true;
            console.log(`🔄 Using fallback flight cost: $${flightCost} for ${city.name}`);
          }
        }

        // Get hotel pricing from Claude (cached estimates)
        let hotelPercentiles: any = null;
        let hotelEstimate = false;
        let hotelSourceFromClaude = false; // Track if data came from Claude vs fallback

        // PRIORITY 1: Try to get accommodation from Claude static database
        const claudeAccommodationData = this.getAccommodationFromClaudeDatabase(city.name);
        if (claudeAccommodationData) {
          hotelPercentiles = claudeAccommodationData;
          hotelSourceFromClaude = true;
          hotelEstimate = false; // Static Claude data is high confidence
          
          console.log(
            `🏨 Claude accommodation pricing for ${city.name}: $${hotelPercentiles.p25}/$${hotelPercentiles.p50}/$${hotelPercentiles.p75} USD/night (static blended data)`,
          );
        } else {
          // PRIORITY 2: Try dynamic Claude API hotel pricing
          try {
            const claudeHotelData = await claudeService.getHotelPricingFromDatabase(
              city.iataCode,
              city.name,
              city.address.countryName,
              params.nights,
              params.month,
            );

            const p25 = parseFloat(claudeHotelData.p25Usd) || 0;
            const p50 = parseFloat(claudeHotelData.p50Usd) || 0;
            const p75 = parseFloat(claudeHotelData.p75Usd) || 0;

            hotelPercentiles = {
              p25,
              p35: Math.min(p50, Math.round(p25 + 0.4 * (p50 - p25))), // Budget-focused percentile, ensure p25 ≤ p35 ≤ p50
              p50,
              p75,
            };

            hotelSourceFromClaude = true; // Data came from Claude
            hotelEstimate =
              claudeHotelData.confidence === "low" ||
              claudeHotelData.confidence === "medium";
          } catch {
            // Use fallback estimates
          }
        }

        if (!hotelPercentiles) {
          hotelEstimate = true;
          const baseHotelCost = this.getFallbackHotelCosts(
            city.address.countryName,
          );
          hotelPercentiles = {
            p25: Math.round(baseHotelCost * 0.7),
            p35: Math.round(baseHotelCost * 0.8),
            p50: baseHotelCost,
            p75: Math.round(baseHotelCost * 1.4),
          };
        }

        // Get daily costs using Claude cached estimates
        let dailyCost: number;
        let dailyEstimate = false;
        try {
          const costs = await claudeService.getDailyCostsFromDatabase(
            city.iataCode,
            city.name,
            city.address.countryName,
            params.month,
          );

          const foodCost = parseFloat(costs.dailyFoodUsd);
          const transportCost = parseFloat(costs.dailyTransportUsd);
          const miscCost = parseFloat(costs.dailyMiscUsd);

          // Check for NaN values and use fallback if any parsing failed
          if (isNaN(foodCost) || isNaN(transportCost) || isNaN(miscCost)) {
            dailyCost = this.getFallbackDailyCosts(city.address.countryName);
            dailyEstimate = true;
          } else {
            dailyCost = foodCost + transportCost + miscCost;
            dailyEstimate = false; // Claude data successfully obtained
          }
        } catch (error) {
          // Fallback to estimates if Claude fails
          dailyCost = this.getFallbackDailyCosts(city.address.countryName);
          dailyEstimate = true;
        }

        // Calculate totals
        const totalP25 =
          flightCost +
          hotelPercentiles.p25 * params.nights +
          dailyCost * params.nights;
        const totalP35 =
          flightCost +
          hotelPercentiles.p35 * params.nights +
          dailyCost * params.nights;
        const totalP50 =
          flightCost +
          hotelPercentiles.p50 * params.nights +
          dailyCost * params.nights;
        const totalP75 =
          flightCost +
          hotelPercentiles.p75 * params.nights +
          dailyCost * params.nights;

        // Apply travel style adjustments for accurate budget filtering
        const travelStyleAdjusted = this.applyTravelStyleAdjustments(
          flightCost,
          hotelPercentiles.p25,
          hotelPercentiles.p50,
          hotelPercentiles.p75,
          dailyCost,
          params.nights,
          params.travelStyle || "budget"
        );

        // Use travel style adjusted total for budget filtering (matches frontend display)
        const travelStyle = params.travelStyle || "budget";
        let budgetFilteringTotal: number;
        
        // Match frontend behavior: use travel style appropriate percentile
        if (travelStyle === "luxury") {
          budgetFilteringTotal = totalP75;
        } else if (travelStyle === "mid") {
          budgetFilteringTotal = totalP50;
        } else {
          budgetFilteringTotal = totalP25;
        }
        
        // Match frontend flight cost behavior
        const showFlightCosts = process.env.VITE_SHOW_FLIGHT_COSTS === 'true';
        if (!showFlightCosts) {
          // Frontend subtracts flight cost: (total - city.breakdown.flight)
          budgetFilteringTotal = budgetFilteringTotal - flightCost;
        }

        // Budget filtering - use Claude-based total when available for consistency with display
        // Exclude destinations more than 10% over budget
        if (budgetFilteringTotal > params.budget * 1.1) {
          // City over budget, count attempt and skip
          const session = progressSessions.get(sessionId);
          if (session) {
            session.progress.attempts++;
            session.lastUpdatedAt = Date.now();
          }
          return; // Skip if over budget
        }

        // Determine budget category based on consistent calculation
        // Determine budget category based on consistent calculation
        const budgetCategory: "within_budget" | "slightly_above_budget" =
          budgetFilteringTotal <= params.budget
            ? "within_budget"
            : "slightly_above_budget";

        const recommendation = {
          cityId: city.iataCode,
          city: city.name,
          country: city.address.countryName,
          region: this.getRegionFromCountry(city.address.countryName),
          nights: params.nights,
          budgetCategory,
          totals: {
            p25: Math.round(totalP25),
            p35: Math.round(totalP35),
            p50: Math.round(totalP50),
            p75: Math.round(totalP75),
          },
          // Store travel-style-adjusted costs to avoid double adjustment on frontend
          travelStyleAdjusted: {
            hotelPerNight: travelStyleAdjusted.hotelPerNight,
            dailyPerDay: travelStyleAdjusted.adjustedDaily,
            total: travelStyleAdjusted.total,
            style: params.travelStyle || "budget",
          },
          breakdown: {
            flight: Math.round(flightCost),
            flightEstimate,
            flightSource: flightEstimate ? "estimate" : "claude", // Claude AI vs fallback
            hotelPerNightP25: Math.round(hotelPercentiles.p25),
            hotelPerNightP35: Math.round(hotelPercentiles.p35),
            hotelPerNightP50: Math.round(hotelPercentiles.p50),
            hotelPerNightP75: Math.round(hotelPercentiles.p75),
            hotelEstimate,
            hotelSource: hotelSourceFromClaude ? "claude" : "estimate", // Claude AI vs fallback
            dailyPerDay: Math.round(dailyCost),
            dailySource: dailyEstimate ? "estimate" : "claude", // Claude AI vs fallback
          },
          rangeNote:
            flightEstimate || hotelEstimate || dailyEstimate
              ? "Mix of AI estimates and cached data"
              : "AI-powered flight & hotel estimates (Claude)",
          confidence: this.calculateLiveConfidence(
            !flightEstimate, // Is flight data from Claude (not fallback)?
            hotelSourceFromClaude, // Is hotel data from Claude (not fallback)?
            !dailyEstimate, // Is daily cost data from Claude (not fallback)?
          ),
          lastUpdatedISO: new Date().toISOString(),
        };

        recommendations.push(recommendation);
        processed++;

        // Update session progress incrementally with deduplication
        const currentSession = progressSessions.get(sessionId);
        if (currentSession) {
          // Check for duplicates before adding to results (use multiple keys for safety)
          const existingIndex = currentSession.results.findIndex(
            (r) =>
              r.cityId === recommendation.cityId ||
              (r.city === recommendation.city &&
                r.country === recommendation.country),
          );

          if (existingIndex === -1) {
            // New city, add to results
            currentSession.results.push(recommendation);
            currentSession.progress.processed++;
          } else {
            // Duplicate city, update existing (keep best data)
            currentSession.results[existingIndex] = recommendation;
          }

          // Count successful attempts
          currentSession.progress.attempts++;
          currentSession.lastUpdatedAt = Date.now();
        }

        console.log(
          `${isPriority ? "🟢 Priority" : "🔵 Regular"} city processed: ${city.name} - Raw: $${Math.round(totalP50)}, Budget Filter (${params.travelStyle || 'budget'}): $${budgetFilteringTotal}, Category: ${budgetCategory}`,
        );
      } catch (error) {
        console.error(`Failed to process city ${city.name}:`, error);
        processed++;

        // Count failed attempts
        const session = progressSessions.get(sessionId);
        if (session) {
          session.progress.attempts++;
          session.lastUpdatedAt = Date.now();
        }
      }
    };

    // Process cities with concurrency limit
    const concurrency = 3; // Lower concurrency for progressive loading
    let sharedCityIndex = 0; // FIXED: Shared counter outside workers
    const processedCityIds = sessionProcessedIds || new Set<string>(); // Use shared set or create new one

    const workers = Array.from(
      { length: Math.min(concurrency, cities.length) },
      async () => {
        while (sharedCityIndex < cities.length && Date.now() < deadline) {
          const cityIndex = sharedCityIndex++; // Atomic increment
          const city = cities[cityIndex];

          if (city) {
            // Use consistent city key for deduplication
            const cityKey = this.buildCityKey(city);
            
            // ATOMIC check-and-add to prevent race conditions
            if (processedCityIds.has(cityKey)) {
              continue; // Skip if already processed
            }
            processedCityIds.add(cityKey); // Add BEFORE processing
            
            await processCity(city);
          }
        }
      },
    );

    await Promise.all(workers);
  }

  // Helper method to build consistent city key for deduplication
  private buildCityKey(city: any): string {
    const countryCode = city.address?.countryCode || city.countryCode || 'unknown';
    return `${city.iataCode}-${city.name}-${countryCode}`.toLowerCase();
  }

  // Helper method to build country summaries
  private buildCountrySummaries(results: any[]): CountrySummary[] {
    const countryMap = new Map<
      string,
      { cities: string[]; totals: number[] }
    >();

    results.forEach((rec) => {
      if (!countryMap.has(rec.country)) {
        countryMap.set(rec.country, { cities: [], totals: [] });
      }

      const countryData = countryMap.get(rec.country)!;
      countryData.cities.push(rec.city);
      countryData.totals.push(rec.totals.p50);
    });

    return Array.from(countryMap.entries())
      .map(([country, data]) => ({
        country,
        summaryP35: Math.round(
          data.totals.reduce((sum, total) => sum + total, 0) /
            data.totals.length,
        ),
        summaryP50: Math.round(
          data.totals.reduce((sum, total) => sum + total, 0) /
            data.totals.length,
        ),
        cities: data.cities.sort(),
      }))
      .sort((a, b) => a.country.localeCompare(b.country));
  }

  // Helper method to get priority cities for fast initial results
  private getPriorityCities(params: TravelSearchParams): any[] {
    // Priority cities are major hubs with good connectivity and budget-friendly options
    const priorityList = [
      // Asia
      "BKK",
      "KUL",
      "SGN",
      "PEN",
      "NRT",
      "ICN",
      "TPE",
      "SIN",
      // Europe
      "LIS",
      "MAD",
      "FCO",
      "PRG",
      "BUD",
      "WAW",
      "VIE",
      "ATH",
      // Americas
      "MEX",
      "BOG",
      "LIM",
      "SCL",
      "GIG",
      "EZE",
      "YUL",
      "YVR",
    ];

    return this.getCitiesFromAllowlists(params).filter((city) =>
      priorityList.includes(city.iataCode),
    );
  }

  async getRecommendations(
    params: TravelSearchParams,
  ): Promise<TravelRecommendationsResponse> {
    // Check cache first 
    const cache = getCacheServiceInstance();
    const cached = await cache.get(params);
    if (cached) {
      console.log(`💾 Serving ${cached.results?.length || 0} results from cache for region: ${params.region}, origin: ${params.origin}`);
      return cached;
    }

    // Use live APIs instead of database lookups (cooperative timebox handles timeout)
    const allRecommendations = await this.getLiveRecommendations(params);

    // CRITICAL: Sort ALL recommendations BEFORE capping/pagination for consistent ordering
    const sortedRecommendations = this.sortLiveRecommendations(
      allRecommendations,
      params.sort || "alphabetical",
    );

    // Apply business cap AFTER sorting (increased for scale testing)
    const cappedTotal = Math.min(sortedRecommendations.length, 200);
    const cappedRecommendations = sortedRecommendations.slice(0, cappedTotal);

    // Apply pagination to properly sorted and capped results
    const totalPages = Math.ceil(cappedTotal / params.limit);
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const recommendations = cappedRecommendations.slice(startIndex, endIndex);

    // Group by country and calculate summaries (sort countries alphabetically)
    const countryMap = new Map<
      string,
      { cities: string[]; totals: number[] }
    >();

    cappedRecommendations.forEach((rec) => {
      if (!countryMap.has(rec.country)) {
        countryMap.set(rec.country, { cities: [], totals: [] });
      }

      const countryData = countryMap.get(rec.country)!;
      countryData.cities.push(rec.city);
      countryData.totals.push(rec.totals.p50);
    });

    const countries: CountrySummary[] = Array.from(countryMap.entries())
      .map(([country, data]) => ({
        country,
        summaryP35: Math.round(
          data.totals.reduce((sum, total) => sum + total, 0) /
            data.totals.length,
        ), // Budget-focused summary (using same data for compatibility)
        summaryP50: Math.round(
          data.totals.reduce((sum, total) => sum + total, 0) /
            data.totals.length,
        ),
        cities: data.cities.sort(),
      }))
      .sort((a, b) => {
        // Sort countries by price when price sorting is selected, otherwise alphabetically
        if (params.sort === "price-low-high") {
          return a.summaryP50 - b.summaryP50;
        }
        return a.country.localeCompare(b.country);
      });

    const response: TravelRecommendationsResponse = {
      query: params,
      results: recommendations,
      countries,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: cappedTotal,
        totalPages: totalPages,
      },
      meta: {
        source: await this.getDataSources(),
        disclaimer:
          "Ballpark estimates, not live quotes. Events/holidays may raise prices.",
      },
    };

    // Cache the response
    await cache.set(params, response);

    return response;
  }

  /**
   * Get cities from allowlists instead of API discovery - ensures quality destinations with IATA codes
   */
  private getCitiesFromAllowlists(params: TravelSearchParams): any[] {
    let targetCities: any[] = [];

    if (params.region) {
      // Get cities for specific region
      const countries = getCountriesForRegion(params.region as any);
      console.log(
        `🗺️  Region '${params.region}' mapped to ${countries.length} countries: ${countries.join(", ")}`,
      );

      for (const countryCode of countries) {
        const citiesInCountry = this.getCitiesForCountry(countryCode);
        targetCities.push(
          ...citiesInCountry.map((city) => ({
            name: city.name,
            iataCode: city.iata,
            geoCode: { latitude: city.lat, longitude: city.lon },
            address: {
              countryCode: countryCode,
              countryName: getCountryName(countryCode as any),
            },
            subType: "city",
          })),
        );
      }
    } else if (params.country) {
      // Get cities for specific country
      const countryCode = this.getCountryCodeFromName(params.country);
      if (countryCode) {
        const citiesInCountry = this.getCitiesForCountry(countryCode);
        targetCities.push(
          ...citiesInCountry.map((city) => ({
            name: city.name,
            iataCode: city.iata,
            geoCode: { latitude: city.lat, longitude: city.lon },
            address: {
              countryCode: countryCode,
              countryName: getCountryName(countryCode as any),
            },
            subType: "city",
          })),
        );
      }
    } else {
      // Default: get popular cities from all regions (sample from each)
      const allRegions = Object.keys(RegionCountriesMap);
      for (const region of allRegions) {
        const countries = getCountriesForRegion(region as any);
        // Take top 2 countries per region for default search
        for (const countryCode of countries.slice(0, 2)) {
          const citiesInCountry = this.getCitiesForCountry(countryCode);
          // Take top 2 cities per country for default
          targetCities.push(
            ...citiesInCountry.slice(0, 2).map((city) => ({
              name: city.name,
              iataCode: city.iata,
              geoCode: { latitude: city.lat, longitude: city.lon },
              address: {
                countryCode: countryCode,
                countryName: getCountryName(countryCode as any),
              },
              subType: "city",
            })),
          );
        }
      }
    }

    console.log(
      `🏙️  Allowlist discovery: Found ${targetCities.length} major cities with confirmed IATA codes`,
    );
    return targetCities;
  }

  /**
   * Get cities for a specific country from allowlists
   */
  private getCitiesForCountry(
    countryCode: string,
  ): Array<{ name: string; iata: string; lat: number; lon: number }> {
    // Check each region's allowlist for the country
    if (AsiaMajorCities[countryCode as keyof typeof AsiaMajorCities]) {
      return [...AsiaMajorCities[countryCode as keyof typeof AsiaMajorCities]];
    }
    if (EuropeMajorCities[countryCode as keyof typeof EuropeMajorCities]) {
      return [
        ...EuropeMajorCities[countryCode as keyof typeof EuropeMajorCities],
      ];
    }
    if (AmericasMajorCities[countryCode as keyof typeof AmericasMajorCities]) {
      return [
        ...AmericasMajorCities[countryCode as keyof typeof AmericasMajorCities],
      ];
    }
    if (AfricaMajorCities[countryCode as keyof typeof AfricaMajorCities]) {
      return [
        ...AfricaMajorCities[countryCode as keyof typeof AfricaMajorCities],
      ];
    }
    if (OceaniaMajorCities[countryCode as keyof typeof OceaniaMajorCities]) {
      return [
        ...OceaniaMajorCities[countryCode as keyof typeof OceaniaMajorCities],
      ];
    }
    return [];
  }

  /**
   * Convert country name to country code
   */
  private getCountryCodeFromName(countryName: string): string | null {
    const entries = Object.entries(CountryNames);
    const found = entries.find(
      ([code, name]) => name.toLowerCase() === countryName.toLowerCase(),
    );
    return found ? found[0] : null;
  }

  /**
   * Get travel recommendations using allowlist-based selection and Claude AI estimates
   */
  async getLiveRecommendations(params: TravelSearchParams): Promise<any[]> {
    try {
      // Step 1: Get curated cities from allowlists (no API calls needed)
      const targetCities = this.getCitiesFromAllowlists(params);
      console.log(
        `🏙️  Allowlist selection: ${targetCities.length} major cities selected from ${params.region || params.country || "global"} destinations`,
      );

      if (targetCities.length === 0) {
        console.warn(
          "No cities found in allowlists for the specified criteria",
        );
        return [];
      }

      return await this.processLiveCitiesWithRateLimit(
        targetCities,
        params,
      );
    } catch (error) {
      console.error("Failed to get travel recommendations:", error);
      throw new Error(
        "Unable to fetch travel cost estimates. Please try again later.",
      );
    }
  }

  /**
   * Process cities with rate limiting and quality gates to ensure complete data
   */
  private async processLiveCitiesWithRateLimit(
    cities: any[],
    params: TravelSearchParams,
  ): Promise<any[]> {
    const recommendations: any[] = [];
    const baseDate = this.getSearchDate(params.month);

    // PERFORMANCE: Limit cities to prevent long processing times
    const maxCities = Math.min(cities.length, 16);
    const limitedCities = cities.slice(0, maxCities);
    console.log(
      `🚀 Performance optimization: Processing ${limitedCities.length} of ${cities.length} cities for faster response`,
    );
    console.log(
      `🔄 Processing ${limitedCities.length} allowlist cities with rate limiting...`,
    );
    let processedCount = 0;
    let skippedCount = 0;
    let skipReasons = {
      noFlightData: 0,
      noHotelData: 0,
      overBudget: 0,
      apiError: 0,
    };

    // COOPERATIVE TIMEBOX: Set deadline for partial results (55 seconds)
    const deadline = Date.now() + 55_000;
    console.log(
      `⏰ Processing deadline set: ${new Date(deadline).toLocaleTimeString()}`,
    );

    // Process cities with bounded parallelism (4 concurrent cities max)
    const processCity = async (city: any, index: number, deadline: number) => {
      // Early return if deadline approached
      if (Date.now() > deadline) {
        console.log(`⏰ Deadline reached, skipping ${city.name}`);
        skippedCount++;
        return;
      }
      try {
        console.log(
          `🏙️  [${index + 1}/${limitedCities.length}] Processing ${city.name}, ${city.address.countryName}...`,
        );

        // QUALITY GATE 1: All cities from allowlists have IATA codes, but double-check
        if (!city.iataCode) {
          console.warn(
            `⚠️  Skipping ${city.name} - no IATA code in allowlist data`,
          );
          skippedCount++;
          return;
        }

        // REMAINING-TIME GUARD: Skip expensive API calls if deadline approaching
        const remainingTime = deadline - Date.now();
        const MINIMUM_TIME_FOR_APIS = 8000; // 8 seconds buffer

        let flightResult, hotelResult;
        if (remainingTime < MINIMUM_TIME_FOR_APIS) {
          // Use fallbacks when time is low
          console.log(
            `⏰ Low time remaining (${Math.round(remainingTime / 1000)}s), using fallbacks for ${city.name}`,
          );
          flightResult = { status: "rejected" as const, reason: "deadline" };
          hotelResult = { status: "rejected" as const, reason: "deadline" };
        } else {
          // PARALLEL PROCESSING: Get flight and hotel data concurrently with remaining time
          [flightResult, hotelResult] = await Promise.allSettled([
            // Flight data from Claude (cached estimates) - Cost-effective replacement for Amadeus
            params.origin
              ? claudeRateLimiter.schedule(() =>
                  claudeService.getFlightCostsCached(
                    params.origin!, // Safe: already checked above
                    city.iataCode,
                    params.origin!.replace(/[^A-Z]/g, ''), // Origin city name from IATA code
                    city.name,
                    city.address.countryName,
                    params.month,
                    params.nights,
                  ),
                )
              : Promise.resolve(null),

            // Hotel data from Claude (cached estimates)
            claudeRateLimiter.schedule(() =>
              claudeService.getHotelPricingCached(
                city.iataCode,
                city.name,
                city.address.countryName,
                params.nights,
                params.month,
              ),
            ),
          ]);
        }

        // Process flight results from Claude
        let flightCost = 0;
        let flightEstimate = false;
        let flightConfidence = 'medium';
        if (
          flightResult.status === "fulfilled" &&
          flightResult.value &&
          (flightResult.value as any)?.cost > 0
        ) {
          const claudeFlightData = flightResult.value as any;
          flightCost = claudeFlightData.cost;
          flightConfidence = claudeFlightData.confidence || 'medium';
          console.log(
            `✈️  Claude flight estimate: ${params.origin} → ${city.iataCode} = $${flightCost} (${flightConfidence} confidence)`,
          );
        } else if (params.origin) {
          // QUALITY GATE 2: No flight data found - use fallback
          if (!params.includeEstimates) {
            console.warn(
              `❌ Skipping ${city.name} - no flight data and estimates disabled`,
            );
            skipReasons.noFlightData++;
            skippedCount++;
            return;
          }
          flightEstimate = true;
          flightCost = this.getFallbackFlightCost(city.address.countryName);
          flightConfidence = 'low';
          console.log(
            `📊 Using fallback flight estimate for ${city.name}: $${flightCost}`,
          );
        }

        // Process hotel results from Claude cached pricing
        let hotelPercentiles;
        let hotelEstimate = false;
        let hotelSourceFromClaude = false; // Track if data came from Claude vs fallback
        
        // PRIORITY 1: Try to get accommodation from Claude static database
        const claudeAccommodationData = this.getAccommodationFromClaudeDatabase(city.name);
        if (claudeAccommodationData) {
          hotelPercentiles = claudeAccommodationData;
          hotelSourceFromClaude = true;
          hotelEstimate = false; // Static Claude data is high confidence
          
          console.log(
            `🏨 Claude accommodation pricing for ${city.name}: $${hotelPercentiles.p25}/$${hotelPercentiles.p50}/$${hotelPercentiles.p75} USD/night (static blended data)`,
          );
        } else if (hotelResult.status === "fulfilled" && hotelResult.value) {
          // Claude returns InsertHotelStats with p25Usd, p50Usd, p75Usd
          const claudeHotelData = hotelResult.value as any;
          const p25 = parseFloat(claudeHotelData.p25Usd) || 0;
          const p50 = parseFloat(claudeHotelData.p50Usd) || 0;
          const p75 = parseFloat(claudeHotelData.p75Usd) || 0;

          hotelPercentiles = {
            p25,
            p35: Math.min(p50, Math.round(p25 + 0.4 * (p50 - p25))), // Budget-focused percentile, ensure p25 ≤ p35 ≤ p50
            p50,
            p75,
          };

          hotelSourceFromClaude = true; // Data came from Claude
          // Mark as estimate based on confidence (but source is still Claude)
          hotelEstimate =
            claudeHotelData.confidence === "low" ||
            claudeHotelData.confidence === "medium";

          console.log(
            `🤖 Claude hotel pricing for ${city.name}: $${hotelPercentiles.p25}/$${hotelPercentiles.p50}/$${hotelPercentiles.p75} USD/night (${claudeHotelData.confidence} confidence)`,
          );
        } else {
          // QUALITY GATE 3: Claude API failed
          if (!params.includeEstimates) {
            console.warn(
              `❌ Skipping ${city.name} - Claude hotel pricing failed and estimates disabled`,
            );
            skipReasons.noHotelData++;
            skippedCount++;
            return;
          }
          // Use fallback hotel estimate
          const fallbackHotelCost = this.getFallbackHotelCosts(
            city.address.countryName,
          );
          hotelPercentiles = {
            p25: fallbackHotelCost * 0.8,
            p35: fallbackHotelCost * 0.9, // Budget-focused percentile
            p50: fallbackHotelCost,
            p75: fallbackHotelCost * 1.3,
          };
          hotelEstimate = true;
          console.log(
            `📊 Using fallback hotel estimate for ${city.name}: $${fallbackHotelCost}/night`,
          );
        }

        // Get daily costs using Claude with deadline guard and soft timeout
        let dailyCost: number;
        let dailyEstimate = false;
        try {
          // Recompute remaining time after flight/hotel processing
          const remainingTimeForClaude = deadline - Date.now();
          const MINIMUM_TIME_FOR_CLAUDE = 5000; // 5s buffer

          if (remainingTimeForClaude < MINIMUM_TIME_FOR_CLAUDE) {
            dailyCost = this.getFallbackDailyCost(city.address.countryName);
            dailyEstimate = true;
            console.log(
              `⏰ Using fallback daily costs for ${city.name} due to low remaining time (${Math.round(remainingTimeForClaude / 1000)}s)`,
            );
          } else {
            // Soft per-call timeout to prevent stall
            const timeoutMs = Math.min(
              Math.max(remainingTimeForClaude - 1000, 3000),
              7000,
            ); // leave 1s slack, cap 7s
            const rawClaudePromise = claudeRateLimiter.schedule(() =>
              this.getLiveDailyCosts(city, params.month),
            );
            const safeClaudePromise = rawClaudePromise.catch((_e) => NaN); // prevent unhandled rejection if later rejects
            const result = await Promise.race([
              safeClaudePromise,
              new Promise<number>((resolve) =>
                setTimeout(() => resolve(NaN), timeoutMs),
              ),
            ]);
            if (Number.isNaN(result)) {
              console.warn(
                `⏰ Claude timed out for ${city.name} in ${timeoutMs}ms, using fallback`,
              );
              dailyCost = this.getFallbackDailyCost(city.address.countryName);
              dailyEstimate = true;
            } else {
              dailyCost = result;
              dailyEstimate = false; // Claude data successfully obtained
            }
          }
        } catch (error) {
          console.warn(
            `❌ Daily costs API error for ${city.name} (${(error as any)?.message || error}), using fallback`,
          );
          dailyCost = this.getFallbackDailyCost(city.address.countryName);
          dailyEstimate = true;
        }

        // Calculate totals using NEW travel style adjustments (SEPARATE hotel and daily calculations)
        const budgetCalculation = this.applyTravelStyleAdjustments(
          flightCost,
          hotelPercentiles.p25,
          hotelPercentiles.p50,
          hotelPercentiles.p75,
          dailyCost,
          params.nights,
          "budget"
        );
        
        const midRangeCalculation = this.applyTravelStyleAdjustments(
          flightCost,
          hotelPercentiles.p25,
          hotelPercentiles.p50,
          hotelPercentiles.p75,
          dailyCost,
          params.nights,
          "mid"
        );
        
        const luxuryCalculation = this.applyTravelStyleAdjustments(
          flightCost,
          hotelPercentiles.p25,
          hotelPercentiles.p50,
          hotelPercentiles.p75,
          dailyCost,
          params.nights,
          "luxury"
        );

        // Map travel styles to percentile structure for backwards compatibility
        const totalP25 = budgetCalculation.total;           // Budget style
        const totalP35 = budgetCalculation.total;           // Budget-focused (same as P25)
        const totalP50 = midRangeCalculation.total;         // Mid-range style
        const totalP75 = luxuryCalculation.total;           // Luxury style

        // QUALITY GATE 5: Budget filter
        if (totalP50 > params.budget) {
          console.log(
            `💰 ${city.name} over budget: $${Math.round(totalP50)} > $${params.budget}`,
          );
          skipReasons.overBudget++;
          skippedCount++;
          return;
        }

        // QUALITY GATE 6: Final data quality check - ensure no $0 flights unless estimate
        if (flightCost <= 0 && params.origin && !flightEstimate) {
          console.warn(
            `❌ Skipping ${city.name} - $0 flight cost without estimate flag`,
          );
          skipReasons.noFlightData++;
          skippedCount++;
          return;
        }

        const recommendation = {
          cityId: city.iataCode,
          city: city.name,
          country: city.address.countryName,
          region: this.getRegionFromCountry(city.address.countryName),
          nights: params.nights,
          totals: {
            p25: Math.round(totalP25),
            p35: Math.round(totalP35), // Budget-focused total
            p50: Math.round(totalP50),
            p75: Math.round(totalP75),
          },
          breakdown: {
            flight: Math.round(flightCost),
            flightEstimate,
            flightSource: flightEstimate ? "estimate" : "claude", // Claude AI vs fallback
            hotelPerNightP25: Math.round(budgetCalculation.hotelPerNight),      // Budget hotel (cost-of-living adjusted)
            hotelPerNightP35: Math.round(budgetCalculation.hotelPerNight),      // Budget-focused (same as P25)
            hotelPerNightP50: Math.round(midRangeCalculation.hotelPerNight),    // Mid-range hotel (cost-of-living adjusted)
            hotelPerNightP75: Math.round(luxuryCalculation.hotelPerNight),      // Luxury hotel (cost-of-living adjusted)
            hotelEstimate,
            hotelSource: hotelSourceFromClaude ? "claude" : "estimate", // Claude AI vs fallback
            dailyPerDay: Math.round(budgetCalculation.adjustedDaily),           // Budget daily spending (cost-of-living adjusted)
            dailyPerDayP50: Math.round(midRangeCalculation.adjustedDaily),      // Mid-range daily spending
            dailyPerDayP75: Math.round(luxuryCalculation.adjustedDaily),        // Luxury daily spending
            dailySource: dailyEstimate ? "estimate" : "claude", // Claude AI vs fallback
          },
          rangeNote:
            flightEstimate || hotelEstimate || dailyEstimate
              ? "Mix of AI estimates and cached data"
              : "AI-powered flight & hotel estimates (Claude)",
          confidence: this.calculateLiveConfidence(
            !flightEstimate, // Is flight data from Claude (not fallback)?
            hotelSourceFromClaude, // Is hotel data from Claude (not fallback)?
            !dailyEstimate, // Is daily cost data from Claude (not fallback)?
          ),
          lastUpdatedISO: new Date().toISOString(),
        };

        recommendations.push(recommendation);
        processedCount++;

        console.log(`✅ Added ${city.name}: $${Math.round(totalP50)} total`);
      } catch (error) {
        console.error(`❌ Failed to process ${city.name}:`, error);
        skipReasons.apiError++;
        skippedCount++;
      }
    };

    // 4-WORKER BOUNDED CONCURRENCY POOL
    const concurrency = Math.min(4, limitedCities.length);
    let next = 0;
    const worker = async () => {
      while (true) {
        const i = next++;
        if (i >= limitedCities.length) break;
        await processCity(limitedCities[i], i, deadline);
        if (Date.now() > deadline) break;
      }
    };

    console.log(
      `🔄 Starting ${concurrency} workers to process ${limitedCities.length} cities...`,
    );
    await Promise.allSettled(
      Array.from({ length: concurrency }, () => worker()),
    );

    console.log(`✅ Final processing complete:`);
    console.log(`   • ${processedCount} cities successfully added`);
    console.log(`   • ${skippedCount} cities skipped:`);
    console.log(`     - No flight data: ${skipReasons.noFlightData}`);
    console.log(`     - No hotel data: ${skipReasons.noHotelData}`);
    console.log(`     - Over budget: ${skipReasons.overBudget}`);
    console.log(`     - API errors: ${skipReasons.apiError}`);
    console.log(
      `💰 Budget target: Under $${params.budget} for ${params.nights} nights`,
    );

    // No need for deduplication since allowlists have no duplicates
    return recommendations;
  }

  /**
   * Get fallback flight cost when live data unavailable
   */
  private getFallbackFlightCost(countryName: string): number {
    const fallbackRates: { [key: string]: number } = {
      // Close destinations
      "United States": 300,
      Canada: 350,
      Mexico: 400,
      // Europe
      "United Kingdom": 600,
      France: 650,
      Germany: 600,
      Italy: 650,
      Spain: 600,
      // Asia - affordable
      Thailand: 800,
      Vietnam: 900,
      Malaysia: 850,
      Indonesia: 900,
      // Asia - premium
      Japan: 1200,
      Singapore: 1000,
      // Other regions
      Australia: 1500,
      "New Zealand": 1600,
      "South Africa": 1400,
    };
    return fallbackRates[countryName] || 800; // Default fallback
  }

  /**
   * Get fallback daily cost when Claude unavailable
   */
  private getFallbackDailyCost(countryName: string): number {
    const fallbackRates: { [key: string]: number } = {
      // Budget destinations
      Thailand: 35,
      Vietnam: 25,
      Indonesia: 30,
      Malaysia: 40,
      // Mid-range
      Mexico: 50,
      Poland: 45,
      "Czech Republic": 50,
      // Premium
      Japan: 90,
      Singapore: 80,
      "United Kingdom": 85,
      France: 80,
    };
    return fallbackRates[countryName] || 55; // Default fallback
  }

  /**
   * Get fallback hotel costs when live data is unavailable (updated rates)
   */
  private getFallbackHotelCosts(countryName: string): number {
    const fallbackRates: { [key: string]: number } = {
      // Southeast Asia - Budget friendly
      Thailand: 25,
      Vietnam: 20,
      Indonesia: 30,
      Malaysia: 35,
      Philippines: 25,

      // Eastern Europe - Mid-range budget
      "Czech Republic": 45,
      Hungary: 40,
      Poland: 35,
      Romania: 30,
      Croatia: 50,

      // Southern Europe - Higher budget
      Spain: 60,
      Portugal: 50,
      Greece: 55,
      Italy: 70,

      // Western Europe - Premium
      France: 90,
      Germany: 80,
      Netherlands: 95,
      Austria: 75,
      "United Kingdom": 85,

      // Americas
      "United States": 95,
      Canada: 85,
      Mexico: 35,
      Brazil: 45,
      Argentina: 40,

      // Asia Premium
      Japan: 110,
      Singapore: 120,
      "United Arab Emirates": 130,

      // Africa
      "South Africa": 55,
      Morocco: 40,
      Egypt: 35,

      // Oceania
      Australia: 90,
      "New Zealand": 80,
    };

    return fallbackRates[countryName] || 50; // Default fallback
  }

  /**
   * Get daily costs for a city using Claude API
   */
  private async getLiveDailyCosts(city: any, month?: number): Promise<number> {
    try {
      const costs = await claudeService.getDailyCostsCached(
        city.iataCode,
        city.name,
        city.address?.countryName || "Unknown",
        month,
      );

      const foodCost = parseFloat(costs.dailyFoodUsd);
      const transportCost = parseFloat(costs.dailyTransportUsd);
      const miscCost = parseFloat(costs.dailyMiscUsd);

      // Check for NaN values and use fallback if any parsing failed
      if (isNaN(foodCost) || isNaN(transportCost) || isNaN(miscCost)) {
        console.warn(
          `Invalid daily cost data for ${city.name}, using fallback`,
        );
        return this.getFallbackDailyCosts(city.address?.countryName);
      }

      return foodCost + transportCost + miscCost;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.warn(
        `Failed to get daily costs for ${city.name}, using fallback: ${errorMessage}`,
      );
      // Fallback based on region with safe null handling
      return this.getFallbackDailyCosts(city.address?.countryName);
    }
  }

  /**
   * Helper methods for live API processing
   */
  private getCountriesByRegion(region: string): string[] {
    const regionMap: Record<string, string[]> = {
      asia: [
        "TH",
        "VN",
        "ID",
        "MY",
        "SG",
        "PH",
        "KH",
        "LA",
        "MM",
        "BN",
        "LK",
        "BD",
        "NP",
        "IN",
        "CN",
        "JP",
        "KR",
        "TW",
      ],
      europe: [
        "CZ",
        "HU",
        "PL",
        "PT",
        "GR",
        "ES",
        "IT",
        "RO",
        "BG",
        "HR",
        "SI",
        "SK",
        "EE",
        "LV",
        "LT",
        "DE",
        "FR",
        "BE",
        "NL",
        "AT",
        "CH",
      ],
      america: [
        "US",
        "CA",
        "MX",
        "BR",
        "AR",
        "CO",
        "PE",
        "CL",
        "UY",
        "EC",
        "BO",
        "VE",
        "CR",
        "GT",
        "PA",
      ],
      africa: [
        "ZA",
        "EG",
        "MA",
        "KE",
        "TN",
        "GH",
        "NG",
        "SN",
        "CI",
        "BF",
        "ML",
        "TZ",
        "UG",
        "RW",
      ],
      oceania: ["AU", "NZ", "FJ", "WS", "TO", "VU", "SB", "PG", "NC"],
    };
    return regionMap[region.toLowerCase()] || [];
  }

  private getCountryCode(countryName: string): string | null {
    const countryMap: Record<string, string> = {
      thailand: "TH",
      vietnam: "VN",
      indonesia: "ID",
      malaysia: "MY",
      "czech republic": "CZ",
      hungary: "HU",
      poland: "PL",
      portugal: "PT",
      greece: "GR",
      spain: "ES",
      italy: "IT",
    };
    return countryMap[countryName.toLowerCase()] || null;
  }

  private getRegionFromCountry(countryName?: string): string {
    if (!countryName) return "Other";

    // Use the comprehensive region mapping instead of hardcoded arrays
    const regionEntries = Object.entries(RegionCountriesMap);
    
    for (const [regionCode, countryCodes] of regionEntries) {
      for (const countryCode of countryCodes) {
        const countryFullName = CountryNames[countryCode as keyof typeof CountryNames];
        if (countryFullName && countryFullName.toLowerCase() === countryName.toLowerCase()) {
          // Return properly capitalized region name
          return regionCode.charAt(0).toUpperCase() + regionCode.slice(1);
        }
      }
    }
    
    return "Other";
  }

  private getSearchDate(month?: number): string {
    const date = new Date();
    if (month) {
      const targetMonth = month - 1; // Convert to 0-indexed
      const currentMonth = date.getMonth();

      date.setMonth(targetMonth);
      date.setDate(15); // Mid-month

      // If target month is in the past, move to next year
      if (targetMonth < currentMonth) {
        date.setFullYear(date.getFullYear() + 1);
      }
    } else {
      date.setDate(date.getDate() + 30); // Default 30 days from now
    }
    return date.toISOString().split("T")[0];
  }

  private getFallbackDailyCosts(countryName?: string): number {
    if (!countryName) return 60; // Safe default

    const fallbackCosts: Record<string, number> = {
      thailand: 40,
      vietnam: 30,
      indonesia: 35,
      malaysia: 35,
      "czech republic": 55,
      hungary: 50,
      poland: 45,
      portugal: 65,
      greece: 60,
      japan: 80,
      "south korea": 70,
    };
    return fallbackCosts[countryName.toLowerCase()] || 60; // Reasonable worldwide average
  }

  /**
   * Apply travel style adjustments with SEPARATE hotel and daily calculations based on cost-of-living
   */
  private applyTravelStyleAdjustments(
    flightCost: number,
    hotelP25: number,
    hotelP50: number,
    hotelP75: number,
    dailyCost: number,
    nights: number,
    travelStyle: "budget" | "mid" | "luxury" = "budget"
  ) {
    let hotelPerNight = 0;
    let adjustedDaily = 0;
    
    // Get cost of living for BOTH hotel and daily adjustments
    const costOfLiving = this.estimateCostOfLiving(hotelP50, dailyCost);

    switch (travelStyle) {
      case "budget":
        // Budget hotel calculation (cost-of-living based)
        const budgetMultiplier = this.getBudgetHotelMultiplier(costOfLiving);
        const maxBudgetPrice = this.getMaxBudgetHotelPrice(costOfLiving);
        const minBudgetPrice = this.getMinBudgetHotelPrice(costOfLiving);
        
        const budgetBase = Math.round((hotelP25 || hotelP50 || hotelP75) * budgetMultiplier);
        hotelPerNight = Math.min(maxBudgetPrice, Math.max(minBudgetPrice, budgetBase));
        
        // Budget daily calculation (separate from hotel)
        adjustedDaily = this.getBudgetDailyCost(dailyCost, costOfLiving);
        break;
        
      case "mid":
        // Mid-range hotel calculation (cost-of-living based)
        const midMultiplier = this.getMidRangeHotelMultiplier(costOfLiving);
        const minMidPrice = this.getMinMidRangeHotelPrice(costOfLiving);
        const maxMidPrice = this.getMaxMidRangeHotelPrice(costOfLiving);
        
        const midBase = Math.round((hotelP50 || hotelP75 || hotelP25) * midMultiplier);
        hotelPerNight = Math.min(maxMidPrice, Math.max(minMidPrice, midBase));
        
        // Mid-range daily calculation (separate from hotel)
        adjustedDaily = this.getMidRangeDailyCost(dailyCost, costOfLiving);
        break;
        
      case "luxury":
        // Luxury calculations (already cost-of-living based)
        const luxuryMultiplier = this.getLuxuryHotelMultiplier(costOfLiving);
        const minLuxuryPrice = this.getMinLuxuryHotelPrice(costOfLiving);
        
        const luxuryBase = Math.round((hotelP75 || hotelP50 || hotelP25) * luxuryMultiplier);
        hotelPerNight = Math.max(minLuxuryPrice, luxuryBase);
        
        // Luxury daily calculation
        adjustedDaily = this.getLuxuryDailyCost(dailyCost, costOfLiving);
        break;
    }

    // Ensure minimum viable hotel price
    if (hotelPerNight === 0) {
      hotelPerNight = travelStyle === "budget" ? this.getMinBudgetHotelPrice(costOfLiving) : 
                     travelStyle === "mid" ? this.getMinMidRangeHotelPrice(costOfLiving) : 
                     this.getMinLuxuryHotelPrice(costOfLiving);
    }

    // Calculate total
    const total = flightCost + nights * (hotelPerNight + adjustedDaily);

    return {
      hotelPerNight,
      adjustedDaily,
      total,
    };
  }

  /**
   * Estimate cost of living based on HOTEL P50 ONLY (not combined with daily costs)
   */
  private estimateCostOfLiving(hotelP50: number, dailyCost: number): 'low' | 'medium' | 'high' | 'very-high' {
    // Use hotel P50 as the primary indicator of local cost of living
    if (hotelP50 < 50) return 'low';        // Bangkok ($45), Manila ($35), Delhi ($40)
    if (hotelP50 < 100) return 'medium';    // Prague ($80), Madrid ($90), Berlin ($85)  
    if (hotelP50 < 160) return 'high';      // Paris ($140), Tokyo ($150), Sydney ($145)
    return 'very-high';                     // NYC ($180), London ($200), Zurich ($220)
  }

  /**
   * BUDGET HOTEL multipliers (cost-of-living based)
   */
  private getBudgetHotelMultiplier(costOfLiving: 'low' | 'medium' | 'high' | 'very-high'): number {
    switch (costOfLiving) {
      case 'low': return 0.9;       // Bangkok: $40 × 0.9 = $36 (realistic budget)
      case 'medium': return 1.0;    // Prague: $60 × 1.0 = $60 (good budget)
      case 'high': return 0.8;      // Paris: $100 × 0.8 = $80 (budget in expensive city)
      case 'very-high': return 0.7; // NYC: $120 × 0.7 = $84 (budget NYC)
    }
  }

  private getMinBudgetHotelPrice(costOfLiving: 'low' | 'medium' | 'high' | 'very-high'): number {
    switch (costOfLiving) {
      case 'low': return 25;        // Bangkok min budget
      case 'medium': return 45;     // Prague min budget  
      case 'high': return 65;       // Paris min budget
      case 'very-high': return 80;  // NYC min budget
    }
  }

  private getMaxBudgetHotelPrice(costOfLiving: 'low' | 'medium' | 'high' | 'very-high'): number {
    switch (costOfLiving) {
      case 'low': return 50;        // Bangkok max budget
      case 'medium': return 75;     // Prague max budget
      case 'high': return 100;      // Paris max budget  
      case 'very-high': return 120; // NYC max budget
    }
  }

  /**
   * BUDGET DAILY costs (cost-of-living based)
   */
  private getBudgetDailyCost(baseDailyCost: number, costOfLiving: 'low' | 'medium' | 'high' | 'very-high'): number {
    const multiplier = {
      'low': 0.7,       // Bangkok: $30 × 0.7 = $21 (street food, local transport)
      'medium': 0.8,    // Prague: $40 × 0.8 = $32 (budget options)
      'high': 0.85,     // Paris: $60 × 0.85 = $51 (careful budget)
      'very-high': 0.9  // NYC: $80 × 0.9 = $72 (even budget is expensive)
    }[costOfLiving];
    
    return Math.round(baseDailyCost * multiplier);
  }

  /**
   * MID-RANGE HOTEL multipliers (cost-of-living based)
   */
  private getMidRangeHotelMultiplier(costOfLiving: 'low' | 'medium' | 'high' | 'very-high'): number {
    switch (costOfLiving) {
      case 'low': return 1.6;       // Bangkok: $45 × 1.6 = $72 (nice mid-range)
      case 'medium': return 1.3;    // Prague: $80 × 1.3 = $104 (solid mid-range)
      case 'high': return 1.2;      // Paris: $140 × 1.2 = $168 (realistic mid-range)
      case 'very-high': return 1.1; // NYC: $180 × 1.1 = $198 (mid-range NYC)
    }
  }

  private getMinMidRangeHotelPrice(costOfLiving: 'low' | 'medium' | 'high' | 'very-high'): number {
    switch (costOfLiving) {
      case 'low': return 60;
      case 'medium': return 90;
      case 'high': return 130;
      case 'very-high': return 170;
    }
  }

  private getMaxMidRangeHotelPrice(costOfLiving: 'low' | 'medium' | 'high' | 'very-high'): number {
    switch (costOfLiving) {
      case 'low': return 110;
      case 'medium': return 140;
      case 'high': return 200;
      case 'very-high': return 280;
    }
  }

  /**
   * MID-RANGE DAILY costs (cost-of-living based)
   */
  private getMidRangeDailyCost(baseDailyCost: number, costOfLiving: 'low' | 'medium' | 'high' | 'very-high'): number {
    const multiplier = {
      'low': 1.2,       // Bangkok: $30 × 1.2 = $36 (nice restaurants, some tours)
      'medium': 1.0,    // Prague: $40 × 1.0 = $40 (normal tourist spending)
      'high': 1.0,      // Paris: $60 × 1.0 = $60 (standard mid-range)
      'very-high': 0.95 // NYC: $80 × 0.95 = $76 (slightly conservative)
    }[costOfLiving];
    
    return Math.round(baseDailyCost * multiplier);
  }

  /**
   * LUXURY HOTEL multipliers (cost-of-living based)
   */
  private getLuxuryHotelMultiplier(costOfLiving: 'low' | 'medium' | 'high' | 'very-high'): number {
    switch (costOfLiving) {
      case 'low': return 2.5;       // Bangkok: $75 × 2.5 = $188 (luxury in cheap destination)
      case 'medium': return 2.0;    // Prague: $80 × 2.0 = $160 (excellent luxury)
      case 'high': return 1.8;      // Paris: $140 × 1.8 = $252 (realistic luxury)
      case 'very-high': return 1.5; // NYC: $180 × 1.5 = $270 (luxury premium)
    }
  }

  private getMinLuxuryHotelPrice(costOfLiving: 'low' | 'medium' | 'high' | 'very-high'): number {
    switch (costOfLiving) {
      case 'low': return 150;       // Bangkok min luxury
      case 'medium': return 180;    // Prague min luxury
      case 'high': return 220;      // Paris min luxury
      case 'very-high': return 280; // NYC min luxury
    }
  }

  /**
   * LUXURY DAILY costs (cost-of-living based)
   */
  private getLuxuryDailyCost(baseDailyCost: number, costOfLiving: 'low' | 'medium' | 'high' | 'very-high'): number {
    const multiplier = {
      'low': 2.0,       // Bangkok: $30 × 2.0 = $60 (fine dining, private tours)
      'medium': 1.8,    // Prague: $40 × 1.8 = $72 (excellent experiences)
      'high': 1.5,      // Paris: $60 × 1.5 = $90 (luxury but restrained)
      'very-high': 1.3  // NYC: $80 × 1.3 = $104 (luxury with limits)
    }[costOfLiving];
    
    return Math.round(baseDailyCost * multiplier);
  }

  private calculateLiveConfidence(
    hasLiveFlights: boolean, // Amadeus flight data available
    hasClaudeHotels: boolean, // Claude hotel estimates available
    hasClaudeDaily: boolean, // Claude daily costs available
  ): "high" | "medium" | "low" {
    // Count high-quality data sources
    const liveDataSources = [
      hasLiveFlights,
      hasClaudeHotels,
      hasClaudeDaily,
    ].filter(Boolean).length;

    // High confidence: Live flights + Claude estimates for hotels AND daily costs
    if (hasLiveFlights && hasClaudeHotels && hasClaudeDaily) return "high";

    // Medium confidence: 2 out of 3 data sources are live/AI-powered
    if (liveDataSources >= 2) return "medium";

    // Low confidence: Mostly fallback estimates
    return "low";
  }

  private sortLiveRecommendations(
    recommendations: any[],
    sortBy: string,
  ): any[] {
    switch (sortBy) {
      case "price-low-high":
        return recommendations.sort((a, b) => a.totals.p50 - b.totals.p50);
      case "confidence":
        const confidenceOrder: Record<string, number> = {
          high: 3,
          medium: 2,
          low: 1,
        };
        return recommendations.sort(
          (a, b) =>
            (confidenceOrder[b.confidence] || 0) -
            (confidenceOrder[a.confidence] || 0),
        );
      case "region":
        return recommendations.sort(
          (a, b) =>
            a.region.localeCompare(b.region) || a.city.localeCompare(b.city),
        );
      default: // alphabetical
        return recommendations.sort((a, b) => a.city.localeCompare(b.city));
    }
  }

  /**
   * Remove duplicate cities from recommendations
   */
  private deduplicateCities(recommendations: any[]): any[] {
    const seen = new Set<string>();
    return recommendations.filter((rec) => {
      // Use consistent key format matching buildCityKey helper
      const mockCity = {
        iataCode: rec.cityId,
        name: rec.city,
        address: { countryCode: rec.countryCode || rec.country?.slice(0, 2)?.toUpperCase() }
      };
      const key = this.buildCityKey(mockCity);
      if (seen.has(key)) {
        console.log(`🔄 Removing duplicate city: ${rec.city}, ${rec.country}`);
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  async initializeMockData(): Promise<void> {
    const {
      mockCities,
      generateMockFlightAverages,
      generateMockHotelStats,
      generateMockDailyCosts,
    } = await import("./mock-data");

    // Check if data already exists
    const existingCities = await storage.getCities();
    if (existingCities.length > 0) {
      console.log("Mock data already exists, skipping initialization");
      return;
    }

    console.log("Initializing mock travel data...");

    // Insert cities
    const insertedCities = [];
    for (const cityData of mockCities) {
      const city = await storage.createCity(cityData);
      insertedCities.push(city);
    }

    // Insert flight averages
    const flightAverages = generateMockFlightAverages(insertedCities.map(city => ({
      id: city.id,
      iataCityCode: city.iataCityCode ?? null
    })));
    for (const flight of flightAverages) {
      await storage.createFlightAverage(flight);
    }

    // Insert hotel stats
    const hotelStats = generateMockHotelStats(insertedCities);
    for (const stats of hotelStats) {
      await storage.createHotelStats(stats);
    }

    // Insert daily costs
    const dailyCosts = generateMockDailyCosts(insertedCities);
    for (const costs of dailyCosts) {
      await storage.createDailyCosts(costs);
    }

    console.log(`Initialized mock data: ${insertedCities.length} cities`);
  }

  /**
   * Generate daily costs using Claude API instead of mock data
   */
  async generateDailyCostsWithClaude(
    cities: { id: string; name: string; country: string }[],
  ): Promise<void> {
    for (const city of cities) {
      try {
        console.log(
          `Getting daily costs for ${city.name}, ${city.country} from Claude...`,
        );
        const dailyCosts = await claudeService.getDailyCosts(
          city.name,
          city.country,
        );
        dailyCosts.cityId = city.id;

        await storage.createDailyCosts(dailyCosts);
        console.log(
          `✓ Generated daily costs for ${city.name}: Food $${dailyCosts.dailyFoodUsd}, Transport $${dailyCosts.dailyTransportUsd}, Misc $${dailyCosts.dailyMiscUsd}`,
        );
      } catch (error) {
        console.error(`Failed to get daily costs for ${city.name}:`, error);
        // Continue with other cities even if one fails
      }
    }
  }

  /**
   * Get data sources for meta information
   */
  private async getDataSources(): Promise<string[]> {
    // Check if Claude AI is available
    try {
      const claudeAvailable = await claudeService.testConnection();
      if (claudeAvailable) {
        return ["Claude AI"];
      }
    } catch (error) {
      console.warn("Claude connection test failed:", error);
    }

    return ["Fallback Estimates"];
  }

  /**
   * Update flight data for a specific route using Claude AI estimates
   */
  async updateFlightData(
    originIata: string,
    cityIata: string,
    baseDate?: string,
    month?: number,
  ): Promise<{ success: boolean; message: string; price?: number }> {
    try {

      // Use a default date if none provided (30 days from now)
      const searchDate =
        baseDate ||
        (() => {
          const date = new Date();
          date.setDate(date.getDate() + 30);
          return date.toISOString().split("T")[0];
        })();

      console.log(
        `Getting Claude flight estimate for ${originIata} -> ${cityIata}`,
      );

      const flightData = await claudeService.getFlightCosts(
        originIata,
        cityIata,
        originIata.replace(/[^A-Z]/g, ''), // Simple IATA to city mapping
        cityIata.replace(/[^A-Z]/g, ''), // Simple IATA to city mapping  
        "Unknown", // Country - could be improved with mapping
        month,
        7, // Default nights
      );

      if (flightData.cost <= 0) {
        return {
          success: false,
          message: `Unable to estimate flight costs for route ${originIata} -> ${cityIata}`,
        };
      }

      const avgPrice = flightData.cost;
      const confidence = flightData.confidence;

      // Create or update flight average record
      const flightAverage: InsertFlightAverage = {
        originIata,
        cityIata,
        month,
        avgRoundtripUsd: avgPrice.toFixed(2),
        sampleSize: 1, // Claude estimates are single values, not arrays
        confidence: confidence as "low" | "medium" | "high",
      };

      await storage.createFlightAverage(flightAverage);

      return {
        success: true,
        message: `Updated flight data for ${originIata} -> ${cityIata}: $${avgPrice.toFixed(2)} (${confidence} confidence)`,
        price: avgPrice,
      };
    } catch (error) {
      console.error(
        `Failed to update flight data for ${originIata} -> ${cityIata}:`,
        error,
      );
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Batch update flight data for multiple routes
   */
  async batchUpdateFlightData(
    routes: Array<{ originIata: string; cityIata: string; month?: number }>,
    baseDate?: string,
  ): Promise<{
    total: number;
    successful: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      total: routes.length,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    console.log(`Starting batch update of ${routes.length} flight routes...`);

    for (const route of routes) {
      try {
        const result = await this.updateFlightData(
          route.originIata,
          route.cityIata,
          baseDate,
          route.month,
        );

        if (result.success) {
          results.successful++;
          console.log(`✓ ${result.message}`);
        } else {
          results.failed++;
          results.errors.push(
            `${route.originIata}->${route.cityIata}: ${result.message}`,
          );
        }

        // Add a small delay to respect API rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        results.failed++;
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        results.errors.push(
          `${route.originIata}->${route.cityIata}: ${errorMsg}`,
        );
      }
    }

    console.log(
      `Batch update completed: ${results.successful}/${results.total} successful`,
    );
    return results;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in miles
  }

  /**
   * Calculate base flight cost using distance-based pricing
   */
  private calculateDistanceBasedFlightCost(
    distance: number, 
    routeType: 'major-hub' | 'regional-hub' | 'secondary' = 'regional-hub'
  ): number {
    // Base rates per mile (economy class, roundtrip)
    let baseRate: number;
    
    // Distance-based rate selection (longer routes are more efficient per mile)
    if (distance < 1500) {
      baseRate = 0.18;      // Short haul: $0.18/mile (domestic/regional)
    } else if (distance < 3000) {
      baseRate = 0.14;      // Medium haul: $0.14/mile (continental)
    } else if (distance < 7000) {
      baseRate = 0.11;      // Long haul: $0.11/mile (international)
    } else {
      baseRate = 0.09;      // Ultra long haul: $0.09/mile (transpacific)
    }
    
    // Base cost from distance
    const baseCost = distance * baseRate;
    
    // Apply route complexity and competition multipliers
    const multipliers = {
      'major-hub': 0.88,      // Major hubs have more competition
      'regional-hub': 1.0,    // Standard pricing
      'secondary': 1.15       // Limited competition, fewer airlines
    };
    
    // Add base fare component (airport fees, fuel surcharge, etc.)
    const baseFare = distance < 1500 ? 180 : distance < 3000 ? 220 : distance < 7000 ? 280 : 350;
    
    const totalCost = (baseCost * multipliers[routeType]) + baseFare;
    
    return Math.round(totalCost);
  }

  /**
   * Get route type based on city characteristics
   */
  private getRouteType(cityName: string, countryName: string): 'major-hub' | 'regional-hub' | 'secondary' {
    // Major international hubs (Tier 1)
    const majorHubs = [
      'london', 'paris', 'amsterdam', 'frankfurt', 'madrid', 'rome', 'zurich',
      'tokyo', 'seoul', 'singapore', 'hong kong', 'shanghai', 'beijing',
      'sydney', 'melbourne', 'new york', 'los angeles', 'chicago', 'san francisco',
      'toronto', 'vancouver', 'montreal'
    ];
    
    // Regional hubs (Tier 2) 
    const regionalHubs = [
      'barcelona', 'milan', 'munich', 'dublin', 'copenhagen', 'stockholm',
      'osaka', 'busan', 'taipei', 'kuala lumpur', 'bangkok', 'jakarta',
      'mumbai', 'delhi', 'guangzhou', 'shenzhen', 'chengdu',
      'perth', 'adelaide', 'boston', 'denver', 'seattle', 'atlanta',
      'calgary', 'ottawa'
    ];
    
    const cityLower = cityName.toLowerCase();
    
    if (majorHubs.some(hub => cityLower.includes(hub) || hub.includes(cityLower))) {
      return 'major-hub';
    }
    
    if (regionalHubs.some(hub => cityLower.includes(hub) || hub.includes(cityLower))) {
      return 'regional-hub';
    }
    
    return 'secondary';
  }

  /**
   * Calculate flight cost using our new distance-based flight service
   */
  private async calculateFlightCostByDistance(
    originIata: string, 
    destinationCity: any,
    month?: number
  ): Promise<number> {
    try {
      // Get origin coordinates
      const originCoords = await this.getOriginCoordinates(originIata);
      if (!originCoords) {
        console.warn(`📏 No coordinates found for origin ${originIata}, using fallback`);
        return this.getFallbackFlightCost(destinationCity.address?.countryName || 'Unknown');
      }

      // Get destination coordinates from city data (try multiple possible property names)
      const destLat = parseFloat(destinationCity.geoCode?.latitude) || parseFloat(destinationCity.lat) || parseFloat(destinationCity.latitude);
      const destLon = parseFloat(destinationCity.geoCode?.longitude) || parseFloat(destinationCity.lon) || parseFloat(destinationCity.lng) || parseFloat(destinationCity.longitude);
      
      if (isNaN(destLat) || isNaN(destLon)) {
        console.warn(`📏 No coordinates found for destination ${destinationCity.name}, using fallback`);
        return this.getFallbackFlightCost(destinationCity.address?.countryName || 'Unknown');
      }

      // Use our new flight service with coordinates
      console.log(`🔍 Travel API passing to flight service: origin="${originIata}", destination="${destinationCity.name}", country="${destinationCity.address?.countryName}"`);
      const flightResult = await flightService.getFlightCosts(
        originIata,
        destinationCity.name, // Pass city name for regional detection (not iataCode)
        month, // Pass the month for seasonal pricing
        [originCoords.lat, originCoords.lon] as [number, number],
        [destLat, destLon] as [number, number],
        destinationCity.address?.countryName // Pass country for regional multipliers
      );

      console.log(`✈️ New flight service cost: ${originIata} → ${destinationCity.name} = $${flightResult.cost} (${flightResult.confidence} confidence)`);
      
      return flightResult.cost;
      
    } catch (error) {
      console.warn(`📏 Flight calculation failed for ${originIata} → ${destinationCity.name}:`, error);
      return this.getFallbackFlightCost(destinationCity.address?.countryName || 'Unknown');
    }
  }

  /**
   * Get origin city coordinates by IATA code
   */
  private async getOriginCoordinates(originIata: string): Promise<{lat: number, lon: number} | null> {
    // Common origin airports coordinates (cached for performance)
    const originCoords: Record<string, {lat: number, lon: number}> = {
      'PHX': { lat: 33.4484, lon: -112.074 },   // Phoenix
      'LAX': { lat: 34.0522, lon: -118.2437 },  // Los Angeles  
      'JFK': { lat: 40.7128, lon: -74.0060 },   // New York
      'ORD': { lat: 41.8781, lon: -87.6298 },   // Chicago
      'DFW': { lat: 32.7767, lon: -96.7970 },   // Dallas
      'SFO': { lat: 37.7749, lon: -122.4194 },  // San Francisco
      'MIA': { lat: 25.7617, lon: -80.1918 },   // Miami
      'SEA': { lat: 47.6062, lon: -122.3321 },  // Seattle
      'DEN': { lat: 39.7392, lon: -104.9903 },  // Denver
      'ATL': { lat: 33.7490, lon: -84.3880 },   // Atlanta
    };
    
    return originCoords[originIata] || null;
  }

  /**
   * Test Claude AI connection
   */
  async testClaudeConnection(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const isConnected = await claudeService.testConnection();
      if (isConnected) {
        return {
          success: true,
          message: "Claude AI connection successful",
        };
      } else {
        return {
          success: false,
          message: "Claude AI not responding correctly",
        };
      }
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to test Claude connection",
      };
    }
  }

  /**
   * Get realistic accommodation costs from Claude database (blended hotel + Airbnb)
   */
  private getAccommodationFromClaudeDatabase(cityName: string): {
    p25: number;
    p35: number;
    p50: number; 
    p75: number;
  } | null {
    try {
      console.log(`🔍 Looking for accommodation data for: "${cityName}"`);
      
      // Get city data from Claude database
      const claudeCityData = ClaudeDailyCosts.getDailyCosts(cityName);
      
      if (!claudeCityData || !claudeCityData.accommodation) {
        console.log(`❌ No accommodation data found for: "${cityName}"`);
        return null;
      }

      const accommodation = claudeCityData.accommodation;
      
      // ALWAYS LOG MEXICO CITY PROCESSING  
      if (cityName.toLowerCase().includes('mexico city') || cityName.toLowerCase().includes('mexico-city')) {
        console.log(`🇲🇽🇲🇽🇲🇽 MEXICO CITY ACCOMMODATION FOUND IN CLAUDE DB! 🇲🇽🇲🇽🇲🇽`);
        console.log(`🇲🇽 Budget: $${accommodation.budget}, Mid-Range: $${accommodation.midRange}, Luxury: $${accommodation.luxury}`);
      }
      
      // ALWAYS LOG NEW YORK PROCESSING
      if (cityName.toLowerCase().includes('new york') || cityName.toLowerCase().includes('new-york')) {
        console.log(`🗽🗽🗽 NEW YORK ACCOMMODATION FOUND IN CLAUDE DB! 🗽🗽🗽`);
        console.log(`🗽 Budget: $${accommodation.budget}, Mid-Range: $${accommodation.midRange}, Luxury: $${accommodation.luxury}`);
      }
      
      // Map budget/midRange/luxury to percentiles
      // budget = p25, midRange = p50, luxury = p75
      // p35 = interpolated between budget and midRange
      const p35 = Math.round(accommodation.budget + (accommodation.midRange - accommodation.budget) * 0.4);
      
      const result = {
        p25: accommodation.budget,
        p35: p35,
        p50: accommodation.midRange,
        p75: accommodation.luxury
      };
      
      console.log(`✅ Claude accommodation data for ${cityName}: $${result.p25}/$${result.p35}/$${result.p50}/$${result.p75} USD/night`);
      return result;
      
    } catch (error) {
      console.error(`❌ Error getting accommodation from Claude database for ${cityName}:`, error);
      return null;
    }
  }
}

export const travelApiService = new TravelApiService();
