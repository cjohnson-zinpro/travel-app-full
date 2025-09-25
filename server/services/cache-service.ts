import type { TravelSearchParams, TravelRecommendationsResponse } from "@shared/schema";

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  checkPeriod: number; // How often to check for expired entries (ms)
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
}

interface CacheEntry {
  data: TravelRecommendationsResponse;
  timestamp: number;
  expiresAt: number;
}

export class CacheService {
  private store: Map<string, CacheEntry>;
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: config.ttl || 5 * 60 * 1000, // Default 5 minutes
      maxSize: config.maxSize || 1000, // Default 1000 entries
      checkPeriod: config.checkPeriod || 60 * 1000 // Default check every minute
    };

    this.store = new Map();
    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0
    };

    // Set up periodic cleanup of expired entries
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.checkPeriod);
  }

  protected generateCacheKey(params: TravelSearchParams): string {
    // Create a deterministic cache key from search parameters
    const keyParams = {
      budget: params.budget,
      origin: params.origin,
      nights: params.nights,
      month: params.month,
      region: params.region,
      country: params.country,
      travelStyle: params.travelStyle,
      limit: params.limit,
      page: params.page,
      sort: params.sort
    };

    // Use nullish coalescing to handle falsy values properly (fixes potential collision bug)
    const sortedParams = Object.keys(keyParams)
      .sort()
      .map(key => `${key}:${keyParams[key as keyof typeof keyParams] ?? 'null'}`)
      .join('|');

    return `travel_cache:${sortedParams}`;
  }

  async get(params: TravelSearchParams): Promise<TravelRecommendationsResponse | null> {
    const key = this.generateCacheKey(params);
    this.metrics.totalRequests++;

    const entry = this.store.get(key);
    if (!entry) {
      this.metrics.misses++;
      console.log(`Cache MISS for key: ${key}`);
      this.updateHitRate();
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      // Entry has expired, remove it
      this.store.delete(key);
      this.metrics.misses++;
      console.log(`Cache EXPIRED for key: ${key}`);
      this.updateHitRate();
      return null;
    }

    this.metrics.hits++;
    console.log(`Cache HIT for key: ${key}`);
    this.updateHitRate();
    return entry.data;
  }

  async set(params: TravelSearchParams, data: TravelRecommendationsResponse): Promise<void> {
    const key = this.generateCacheKey(params);
    const now = Date.now();

    // Check if we're at max capacity and need to remove old entries
    if (this.store.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry = {
      data,
      timestamp: now,
      expiresAt: now + this.config.ttl
    };

    this.store.set(key, entry);
    console.log(`Cache SET for key: ${key}, expires at: ${new Date(entry.expiresAt).toISOString()}`);
  }

  async clear(): Promise<void> {
    this.store.clear();
    console.log("Cache cleared");
  }

  private cleanup(): void {
    const now = Date.now();
    let expiredCount = 0;

    const entries = Array.from(this.store.entries());
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      console.log(`Cache cleanup: removed ${expiredCount} expired entries`);
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Number.MAX_SAFE_INTEGER;

    const entries = Array.from(this.store.entries());
    for (const [key, entry] of entries) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
      console.log(`Cache evicted oldest entry: ${oldestKey}`);
    }
  }

  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0
    };
  }

  private updateHitRate(): void {
    this.metrics.hitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.hits / this.metrics.totalRequests) * 100 
      : 0;
  }

  getConfig(): CacheConfig {
    return { ...this.config };
  }

  async getSize(): Promise<number> {
    return this.store.size;
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Fix the generateCacheKey method to use nullish coalescing
interface CacheServiceInterface {
  get(params: TravelSearchParams): Promise<TravelRecommendationsResponse | null>;
  set(params: TravelSearchParams, data: TravelRecommendationsResponse): Promise<void>;
  clear(): Promise<void>;
  getMetrics(): CacheMetrics;
  resetMetrics(): void;
  getConfig(): CacheConfig;
  getSize(): Promise<number>;
}

// Update the in-memory cache to fix key generation and implement async interface
export class InMemoryCacheService extends CacheService implements CacheServiceInterface {
  protected generateCacheKey(params: TravelSearchParams): string {
    // Create a deterministic cache key from search parameters
    const keyParams = {
      budget: params.budget,
      origin: params.origin,
      nights: params.nights,
      month: params.month,
      region: params.region,
      country: params.country,
      travelStyle: params.travelStyle,
      limit: params.limit,
      page: params.page,
      sort: params.sort
    };

    // Use nullish coalescing to handle falsy values properly (fixes potential collision bug)
    const sortedParams = Object.keys(keyParams)
      .sort()
      .map(key => `${key}:${keyParams[key as keyof typeof keyParams] ?? 'null'}`)
      .join('|');

    return `travel_cache:${sortedParams}`;
  }

  // Override methods to implement async interface
  async get(params: TravelSearchParams): Promise<TravelRecommendationsResponse | null> {
    return super.get(params);
  }

  async set(params: TravelSearchParams, data: TravelRecommendationsResponse): Promise<void> {
    return super.set(params, data);
  }

  async clear(): Promise<void> {
    return super.clear();
  }

  async getSize(): Promise<number> {
    return super.getSize();
  }
}

// Create singleton instance with configurable TTL based on environment
const getCacheTTL = (): number => {
  const envTTL = process.env.CACHE_TTL_MINUTES;
  if (envTTL) {
    const minutes = parseInt(envTTL, 10);
    if (!isNaN(minutes) && minutes > 0) {
      return minutes * 60 * 1000; // Convert to milliseconds
    }
  }
  return 5 * 60 * 1000; // Default 5 minutes
};

// Auto-detect Redis availability and use appropriate cache service
async function createCacheService(): Promise<CacheServiceInterface> {
  const config = {
    ttl: getCacheTTL(),
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || "1000", 10),
    checkPeriod: 60 * 1000
  };

  try {
    // Try to create Redis cache service
    const { RedisCacheService } = await import('./redis-cache-service');
    const redisCache = new RedisCacheService(config);
    
    // Wait a moment to see if Redis connects
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (redisCache.isRedisConnected()) {
      console.log('Using Redis cache service');
      return redisCache;
    } else {
      console.log('Redis not available, falling back to in-memory cache');
      return new InMemoryCacheService(config);
    }
  } catch (error: any) {
    console.log('Redis not available, using in-memory cache:', error.message);
    return new InMemoryCacheService(config);
  }
}

// Create the cache service (async initialization)
let cacheServiceInstance: CacheServiceInterface | null = null;

export const getCacheService = async (): Promise<CacheServiceInterface> => {
  if (!cacheServiceInstance) {
    cacheServiceInstance = await createCacheService();
  }
  return cacheServiceInstance;
};

// Global cache service instance
let globalCacheService: CacheServiceInterface | null = null;

// Initialize cache service
export const initializeCacheService = async (): Promise<CacheServiceInterface> => {
  if (!globalCacheService) {
    globalCacheService = await createCacheService();
  }
  return globalCacheService;
};

// Get initialized cache service
export const getCacheServiceInstance = (): CacheServiceInterface => {
  if (!globalCacheService) {
    throw new Error("Cache service not initialized. Call initializeCacheService() first.");
  }
  return globalCacheService;
};