import type { Express } from "express";
import { createServer, type Server } from "http";
import { travelApiService } from "./services/travel-api";
import {
  initializeCacheService,
  getCacheServiceInstance,
} from "./services/cache-service";
import { storage } from "./storage";
import { travelSearchSchema } from "@shared/schema";
import { ZodError } from "zod";
import { claudeService } from "./services/claude-service";
import { getCountriesForRegion } from "./data/regionCountries";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize cache service
  try {
    await initializeCacheService();
    console.log("Cache service initialized successfully");
  } catch (error) {
    console.error("Failed to initialize cache service:", error);
  }

  // Mock data initialization removed - using live APIs only

  // Progressive travel search endpoint
  app.get("/api/travel/search/progressive", async (req, res) => {
    try {
      // Parse and validate query parameters
      const queryParams = {
        budget: req.query.budget ? Number(req.query.budget) : undefined,
        origin: req.query.origin as string | undefined,
        nights: req.query.nights ? Number(req.query.nights) : undefined,
        month: req.query.month ? Number(req.query.month) : undefined,
        region: req.query.region as string | undefined,
        country: req.query.country as string | undefined,
        travelStyle: req.query.travelStyle as "budget" | "mid" | "luxury" | undefined,
        sessionId: req.query.sessionId as string | undefined,
        includeEstimates:
          req.query.includeEstimates === "false"
            ? false
            : req.query.includeEstimates === "true"
              ? true
              : true,
      };

      // Remove undefined values and validate
      const cleanParams = Object.fromEntries(
        Object.entries(queryParams).filter(([_, v]) => v !== undefined),
      );

      const validatedParams = travelSearchSchema.parse(cleanParams);

      // Using Claude AI for all cost estimates

      // Call progressive search service
      // Check cache first for immediate results
      const cache = getCacheServiceInstance();
      const cached = await cache.get(validatedParams);
      if (cached) {
        return res.json({
          success: true,
          sessionId: "cached",
          status: "completed",
          progress: {
            processed: cached.results.length,
            total: cached.results.length,
            percentage: 100,
          },
          results: cached.results,
          countries: cached.countries,
          totalResults: cached.results.length,
          timestamp: new Date().toISOString(),
        });
      }

      // Call progressive search service
      const results =
        await travelApiService.getProgressiveRecommendations(validatedParams);

      res.json({
        success: true,
        ...results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Invalid search parameters",
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }

      console.error("Progressive search error:", error);
      res.status(500).json({
        message: "Internal server error during progressive search",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Progressive search polling endpoint
  app.get("/api/travel/search/progressive/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;

      if (!sessionId) {
        return res.status(400).json({
          message: "Session ID is required",
          timestamp: new Date().toISOString(),
        });
      }

      // Get the original search parameters from query (for session validation)
      const queryParams = {
        budget: req.query.budget ? Number(req.query.budget) : undefined,
        origin: req.query.origin as string | undefined,
        nights: req.query.nights ? Number(req.query.nights) : undefined,
        month: req.query.month ? Number(req.query.month) : undefined,
        region: req.query.region as string | undefined,
        country: req.query.country as string | undefined,
        includeEstimates:
          req.query.includeEstimates === "false"
            ? false
            : req.query.includeEstimates === "true"
              ? true
              : true,
      };

      // Remove undefined values and validate
      const cleanParams = Object.fromEntries(
        Object.entries(queryParams).filter(([_, v]) => v !== undefined),
      );

      const validatedParams = travelSearchSchema.parse(cleanParams);

      // Handle "cached" sessionId - return cached results directly
      if (sessionId === "cached") {
        const cache = getCacheServiceInstance();
        const cached = await cache.get(validatedParams);
        if (cached) {
          return res.json({
            sessionId: "cached",
            status: "completed",
            progress: {
              processed: cached.results.length,
              total: cached.results.length,
              percentage: 100,
            },
            results: cached.results,
            countries: cached.countries,
            totalResults: cached.results.length,
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Call progressive search service (which handles existing sessions)
      const results =
        await travelApiService.getProgressiveRecommendations({
          ...validatedParams,
          sessionId: sessionId,
        });

      res.json(results);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Invalid polling parameters",
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }

      console.error("Progressive polling error:", error);
      res.status(500).json({
        message: "Internal server error during progressive polling",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Legacy travel recommendations endpoint (for backwards compatibility)
  app.get("/api/travel/recs", async (req, res) => {
    try {
      // Parse and validate query parameters
      const queryParams = {
        budget: req.query.budget ? Number(req.query.budget) : undefined,
        origin: req.query.origin as string | undefined,
        nights: req.query.nights ? Number(req.query.nights) : undefined,
        month: req.query.month ? Number(req.query.month) : undefined,
        region: req.query.region as string | undefined,
        country: req.query.country as string | undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        sort: req.query.sort as string | undefined,
        includeEstimates:
          req.query.includeEstimates === "false"
            ? false
            : req.query.includeEstimates === "true"
              ? true
              : true, // Default to true
      };

      // Remove undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(queryParams).filter(([_, v]) => v !== undefined),
      );

      const validatedParams = travelSearchSchema.parse(cleanParams);

      // Using Claude AI for all cost estimates

      const recommendations =
        await travelApiService.getRecommendations(validatedParams);

      res.json(recommendations);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: error.errors,
        });
      }

      console.error("Error getting travel recommendations:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Airport search endpoint - now using hardcoded sample data (ES module compatible)
  app.get("/api/airports/search", async (req, res) => {
    try {
      const query = (req.query.q as string)?.toLowerCase() || "";
      // Import airports data directly (ES module compatible)
      const airports: Array<any> = [
        {
          "iataCode": "JFK",
          "name": "John F. Kennedy International Airport",
          "cityName": "New York",
          "countryName": "United States",
          "countryCode": "US",
          "type": "airport",
          "displayText": "JFK - John F. Kennedy International Airport, New York",
          "coordinates": { "latitude": 40.6413, "longitude": -73.7781 }
        },
        {
          "iataCode": "LAX",
          "name": "Los Angeles International Airport",
          "cityName": "Los Angeles",
          "countryName": "United States",
          "countryCode": "US",
          "type": "airport",
          "displayText": "LAX - Los Angeles International Airport, Los Angeles",
          "coordinates": { "latitude": 33.9416, "longitude": -118.4085 }
        },
        {
          "iataCode": "ORD",
          "name": "O'Hare International Airport",
          "cityName": "Chicago",
          "countryName": "United States",
          "countryCode": "US",
          "type": "airport",
          "displayText": "ORD - O'Hare International Airport, Chicago",
          "coordinates": { "latitude": 41.9742, "longitude": -87.9073 }
        },
        {
          "iataCode": "PHX",
          "name": "Phoenix Sky Harbor International Airport",
          "cityName": "Phoenix",
          "countryName": "United States",
          "countryCode": "US",
          "type": "airport",
          "displayText": "PHX - Phoenix Sky Harbor International Airport, Phoenix",
          "coordinates": { "latitude": 33.4342, "longitude": -112.0116 }
        },
        {
          "iataCode": "LHR",
          "name": "Heathrow Airport",
          "cityName": "London",
          "countryName": "United Kingdom",
          "countryCode": "GB",
          "type": "airport",
          "displayText": "LHR - Heathrow Airport, London",
          "coordinates": { "latitude": 51.4700, "longitude": -0.4543 }
        },
        {
          "iataCode": "CDG",
          "name": "Charles de Gaulle Airport",
          "cityName": "Paris",
          "countryName": "France",
          "countryCode": "FR",
          "type": "airport",
          "displayText": "CDG - Charles de Gaulle Airport, Paris",
          "coordinates": { "latitude": 49.0097, "longitude": 2.5479 }
        },
        {
          "iataCode": "NRT",
          "name": "Narita International Airport",
          "cityName": "Tokyo",
          "countryName": "Japan",
          "countryCode": "JP",
          "type": "airport",
          "displayText": "NRT - Narita International Airport, Tokyo",
          "coordinates": { "latitude": 35.7719, "longitude": 140.3929 }
        },
        {
          "iataCode": "CUN",
          "name": "Cancun International Airport",
          "cityName": "Cancun",
          "countryName": "Mexico",
          "countryCode": "MX",
          "type": "airport",
          "displayText": "CUN - Cancun International Airport, Cancun",
          "coordinates": { "latitude": 21.0365, "longitude": -86.8771 }
        },
        {
          "iataCode": "FRA",
          "name": "Frankfurt Airport",
          "cityName": "Frankfurt",
          "countryName": "Germany",
          "countryCode": "DE",
          "type": "airport",
          "displayText": "FRA - Frankfurt Airport, Frankfurt",
          "coordinates": { "latitude": 50.0379, "longitude": 8.5622 }
        },
        {
          "iataCode": "GRU",
          "name": "São Paulo/Guarulhos International Airport",
          "cityName": "São Paulo",
          "countryName": "Brazil",
          "countryCode": "BR",
          "type": "airport",
          "displayText": "GRU - São Paulo/Guarulhos International Airport, São Paulo",
          "coordinates": { "latitude": -23.4356, "longitude": -46.4731 }
        }
      ];
      if (!query || query.length < 2) {
        return res.json({
          success: true,
          query,
          results: [],
          count: 0,
          timestamp: new Date().toISOString(),
        });
      }
      const results = airports.filter((airport: any) =>
        (airport.iataCode && airport.iataCode.toLowerCase().includes(query)) ||
        (airport.cityName && airport.cityName.toLowerCase().includes(query))
      );
      res.json({
        success: true,
        query,
        results,
        count: results.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Airport search error:", error);
      res.status(500).json({
        success: false,
        query: req.query.q as string || "",
        results: [],
        count: 0,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Test flight calculations endpoint
  app.get("/api/test/flight", async (req, res) => {
    try {
      const origin = req.query.origin as string || 'PHX';
      const destination = req.query.destination as string || 'DXB';
      const month = req.query.month ? Number(req.query.month) : undefined;
      
      console.log(`🧪 Testing flight calculation: ${origin} → ${destination}${month ? ` (month ${month})` : ''}`);
      
      const flightData = await claudeService.getFlightCosts(
        origin,
        destination,
        origin, // originCity
        destination, // destinationCity
        'Unknown', // countryName
        month,
        7 // nights
      );
      
      res.json({
        success: true,
        route: `${origin} → ${destination}`,
        cost: flightData.cost,
        confidence: flightData.confidence,
        month: month || 'any',
        calculationType: 'distance-based',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Flight test calculation failed:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Test flight calculations endpoint
  app.get("/api/test/flight", async (req, res) => {
    try {
      const origin = req.query.origin as string || 'PHX';
      const destination = req.query.destination as string || 'DXB';
      const month = req.query.month ? Number(req.query.month) : undefined;
      
      console.log(`🧪 Testing flight calculation: ${origin} → ${destination}${month ? ` (month ${month})` : ''}`);
      
      const flightData = await claudeService.getFlightCosts(
        origin,
        destination,
        origin, // originCity
        destination, // destinationCity
        'Unknown', // countryName
        month,
        7 // nights
      );
      
      res.json({
        success: true,
        route: `${origin} → ${destination}`,
        cost: flightData.cost,
        confidence: flightData.confidence,
        month: month || 'any',
        calculationType: 'distance-based',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Flight test calculation failed:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      useMock: process.env.USE_MOCK !== "false",
    });
  });

  // Cache metrics endpoint
  app.get("/api/cache/metrics", async (req, res) => {
    try {
      const cache = getCacheServiceInstance();
      const metrics = cache.getMetrics();
      const config = cache.getConfig();

      res.json({
        metrics,
        config: {
          ttlMinutes: config.ttl / (60 * 1000),
          maxSize: config.maxSize,
          checkPeriodMinutes: config.checkPeriod / (60 * 1000),
        },
        currentSize: await cache.getSize(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        message: "Cache service not available",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Cache clear endpoint (for admin/testing)
  app.post("/api/cache/clear", async (req, res) => {
    try {
      // Require admin token or development environment
      const adminToken = req.headers["x-admin-token"];
      const isDevelopment = process.env.NODE_ENV === "development";

      if (!isDevelopment) {
        if (
          !process.env.ADMIN_TOKEN ||
          adminToken !== process.env.ADMIN_TOKEN
        ) {
          return res.status(403).json({
            message: "Forbidden: Admin access required",
            timestamp: new Date().toISOString(),
          });
        }
      }

      const cache = getCacheServiceInstance();
      await cache.clear();
      cache.resetMetrics();

      res.json({
        message: "Cache cleared successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        message: "Cache service not available",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // DIAGNOSTIC ENDPOINTS - Systematic API debugging

  // Claude AI Health Check
  app.get("/api/health/claude", async (req, res) => {
    try {
      console.log("🔧 DIAGNOSTIC: Testing Claude AI connection...");
      const isConnected = await claudeService.testConnection();
      
      if (isConnected) {
        console.log("✅ DIAGNOSTIC: Claude AI connection successful");
        res.json({
          success: true,
          message: "Claude AI connection successful",
          timestamp: new Date().toISOString(),
        });
      } else {
        console.log("❌ DIAGNOSTIC: Claude AI connection failed");
        res.status(503).json({
          success: false,
          message: "Claude AI connection failed",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("🚨 DIAGNOSTIC: Claude AI health check error:", error);
      res.status(503).json({
        success: false,
        message: "Claude AI connection error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Removed city smoke test - not needed with Claude-only estimates

  // Step 3: Region Mapping Validation
  app.get("/api/health/region-mapping", (req, res) => {
    const region = (req.query.region as string) || "asia";

    // Use actual region mapping instead of inline duplication
    const regionCountries =
      getCountriesForRegion(region.toLowerCase() as any) || [];

    console.log(
      `🗺️  DIAGNOSTIC: Region '${region}' mapped to countries: ${regionCountries.join(", ")}`,
    );

    res.json({
      success: regionCountries.length > 0,
      message: `Region '${region}' mapped to ${regionCountries.length} countries`,
      region,
      countries: regionCountries,
      timestamp: new Date().toISOString(),
    });
  });

  // Step 4: Claude AI Health Check (Protected)
  app.get("/api/health/claude", async (req, res) => {
    try {
      // SECURITY: Require admin access or development environment to prevent cost abuse
      const adminToken = req.headers["x-admin-token"];
      const isDevelopment = process.env.NODE_ENV === "development";

      if (!isDevelopment) {
        if (
          !process.env.ADMIN_TOKEN ||
          adminToken !== process.env.ADMIN_TOKEN
        ) {
          return res.status(403).json({
            message:
              "Forbidden: Admin access required for health checks that incur costs",
            timestamp: new Date().toISOString(),
          });
        }
      }

      console.log("🔧 DIAGNOSTIC: Testing Claude AI integration...");
      if (!claudeService) {
        return res.status(503).json({
          success: false,
          message: "Claude service not configured - check ANTHROPIC_API_KEY",
          timestamp: new Date().toISOString(),
        });
      }

      const startTime = Date.now();

      // Test hotel pricing with individual error handling
      let hotelService: {
        available: boolean;
        error: string;
        testResult: any;
        durationMs: number;
      } = { available: false, error: "", testResult: null, durationMs: 0 };
      try {
        const hotelStart = Date.now();
        console.log("📡 DIAGNOSTIC: Testing Claude hotel pricing for Tokyo...");
        const hotelTest = await claudeService.getHotelPricing(
          "Tokyo",
          "Japan",
          new Date().getMonth() + 1,
        );
        hotelService = {
          available: true,
          error: "",
          testResult: {
            p25: hotelTest.p25Usd,
            p50: hotelTest.p50Usd,
            p75: hotelTest.p75Usd,
            confidence: hotelTest.confidence,
          },
          durationMs: Date.now() - hotelStart,
        };
      } catch (error) {
        hotelService.error =
          error instanceof Error ? error.message : "Unknown error";
        hotelService.durationMs = Date.now() - startTime;
      }

      // Test daily costs with individual error handling
      let dailyCostService: {
        available: boolean;
        error: string;
        testResult: any;
        durationMs: number;
      } = { available: false, error: "", testResult: null, durationMs: 0 };
      try {
        const dailyStart = Date.now();
        console.log("📡 DIAGNOSTIC: Testing Claude daily costs for Tokyo...");
        const dailyTest = await claudeService.getDailyCosts("Tokyo", "Japan");
        dailyCostService = {
          available: true,
          error: "",
          testResult: {
            food: dailyTest.dailyFoodUsd,
            transport: dailyTest.dailyTransportUsd,
            misc: dailyTest.dailyMiscUsd,
          },
          durationMs: Date.now() - dailyStart,
        };
      } catch (error) {
        dailyCostService.error =
          error instanceof Error ? error.message : "Unknown error";
        dailyCostService.durationMs = Date.now() - startTime;
      }

      // Get cache metrics
      const cache = getCacheServiceInstance();
      const cacheMetrics = cache.getMetrics();

      const overallSuccess =
        hotelService.available && dailyCostService.available;
      console.log(
        `${overallSuccess ? "✅" : "⚠️"} DIAGNOSTIC: Claude AI integration ${overallSuccess ? "successful" : "partial"}`,
      );

      res.json({
        success: overallSuccess,
        message: overallSuccess
          ? "Claude AI integration successful"
          : "Claude AI integration partially available",
        services: {
          hotelPricing: hotelService,
          dailyCosts: dailyCostService,
        },
        caching: {
          enabled: true,
          metrics: {
            hits: cacheMetrics.hits,
            misses: cacheMetrics.misses,
            hitRate:
              cacheMetrics.hits / (cacheMetrics.hits + cacheMetrics.misses) ||
              0,
          },
        },
        totalDurationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("🚨 DIAGNOSTIC: Claude health check error:", error);
      res.status(503).json({
        success: false,
        message: "Claude AI integration failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Admin route to regenerate daily costs with Claude
  app.post("/api/admin/regenerate-daily-costs", async (req, res) => {
    try {
      console.log("Admin: Regenerating daily costs with Claude API...");

      // Check admin access
      const adminToken = req.headers["x-admin-token"];
      const isDevelopment = process.env.NODE_ENV === "development";

      if (!isDevelopment) {
        if (
          !process.env.ADMIN_TOKEN ||
          adminToken !== process.env.ADMIN_TOKEN
        ) {
          return res.status(403).json({
            message: "Forbidden: Admin access required",
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Get all cities
      const cities = await storage.getCities();
      if (cities.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No cities found. Initialize mock data first.",
          timestamp: new Date().toISOString(),
        });
      }

      // Clear existing daily costs
      console.log("Clearing existing daily costs...");
      // InMemoryStorage does not have getAllDailyCosts, so iterate over all cities
      const allCities = await storage.getCities();
      let clearedCount = 0;
      for (const city of allCities) {
        const cost = await storage.getDailyCosts(city.id);
        if (cost) {
          // Remove by deleting from the map directly
          (storage as any).dailyCosts.delete(cost.id);
          clearedCount++;
        }
      }
      console.log(`Cleared ${clearedCount} existing daily cost records`);

      // Generate new ones with Claude
      await travelApiService.generateDailyCostsWithClaude(cities);

      res.json({
        success: true,
        message: `Successfully regenerated daily costs for ${cities.length} cities using Claude API`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to regenerate daily costs:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Removed Amadeus test and update endpoints - not needed with Claude-only estimates

  // Development endpoint to clear PHX flight cache for distance-based pricing
  app.post("/api/dev/clear-phx-flight-cache", async (req, res) => {
    try {
      if (process.env.NODE_ENV !== "development") {
        return res.status(403).json({
          success: false,
          message: "Development endpoint only",
          timestamp: new Date().toISOString()
        });
      }

      // Clear PHX flight cache entries
      const clearedKeys = await claudeService.clearFlightCache("PHX");
      
      res.json({
        success: true,
        message: `Cleared ${clearedKeys} PHX flight cache entries. Next searches will use distance-based pricing.`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to clear PHX flight cache:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Development endpoint to clear travel search cache to force distance calculations
  app.post("/api/dev/clear-travel-search-cache", async (req, res) => {
    try {
      if (process.env.NODE_ENV !== "development") {
        return res.status(403).json({
          success: false,
          message: "Development endpoint only",
          timestamp: new Date().toISOString()
        });
      }

      // Clear travel search cache to force new distance-based calculations
      const cache = getCacheServiceInstance();
      await cache.clear();
      const clearedCount = cache.getSize();
      
      console.log(`🗑️ Cleared ${clearedCount} travel search cache entries. Next searches will use distance-based flight calculations.`);
      
      res.json({
        success: true,
        message: `Cleared ${clearedCount} travel search cache entries. Next searches will use distance-based flight calculations.`,
        clearedCount,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to clear travel search cache:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
