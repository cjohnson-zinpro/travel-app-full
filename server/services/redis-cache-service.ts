import { Redis } from '@upstash/redis';
import type { TravelSearchParams, TravelRecommendationsResponse } from "@shared/schema";
import type { CacheConfig, CacheMetrics } from "./cache-service";

export class RedisCacheService {
  private client: Redis | null = null;
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private isConnected = false;
  private keyPrefix = 'travel_cache:';

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: config.ttl || 5 * 60 * 1000, // Default 5 minutes
      maxSize: config.maxSize || 1000, // Not directly applicable to Redis but useful for metrics
      checkPeriod: config.checkPeriod || 60 * 1000 // Not used in Redis
    };

    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0
    };

    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    // Check if Redis is disabled or if we should skip it
    if (process.env.DISABLE_REDIS === 'true') {
      console.log('Redis disabled via environment variable');
      this.isConnected = false;
      return;
    }

    try {
      // Check for Upstash credentials first
      let upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
      let upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
      
      // Strip any surrounding quotes that might have been added
      if (upstashUrl) {
        upstashUrl = upstashUrl.replace(/^["'](.*)["']$/, '$1');
      }
      if (upstashToken) {
        upstashToken = upstashToken.replace(/^["'](.*)["']$/, '$1');
      }
      
      if (upstashUrl && upstashToken) {
        // Use Upstash Redis (HTTP-based)
        this.client = new Redis({
          url: upstashUrl,
          token: upstashToken
        });
        
        // Test connection with a simple ping
        await this.client.ping();
        console.log('Upstash Redis connected successfully');
        this.isConnected = true;
        return;
      }
      
      // Fallback: no valid Redis configuration found
      console.log('No Redis configuration found (UPSTASH_REDIS_REST_URL/TOKEN missing)');
      this.isConnected = false;
    } catch (error) {
      console.log('Redis not available, using in-memory cache fallback:', error instanceof Error ? error.message : 'Unknown error');
      this.isConnected = false;
      this.cleanup();
    }
  }

  private cleanup(): void {
    if (this.client) {
      try {
        // Upstash Redis is HTTP-based, no persistent connection to close
        this.client = null;
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  private generateCacheKey(params: TravelSearchParams): string {
    // Create a deterministic cache key from search parameters
    const keyParams = {
      budget: params.budget,
      origin: params.origin,
      nights: params.nights,
      month: params.month,
      region: params.region,
      country: params.country,
      limit: params.limit,
      page: params.page,
      sort: params.sort
    };

    // Use nullish coalescing to handle falsy values properly
    const sortedParams = Object.keys(keyParams)
      .sort()
      .map(key => `${key}:${keyParams[key as keyof typeof keyParams] ?? 'null'}`)
      .join('|');

    return `${this.keyPrefix}${sortedParams}`;
  }

  async get(params: TravelSearchParams): Promise<TravelRecommendationsResponse | null> {
    this.metrics.totalRequests++;

    if (!this.isConnected || !this.client) {
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }

    const key = this.generateCacheKey(params);

    try {
      const cached = await this.client.get(key);
      
      if (cached) {
        this.metrics.hits++;
        console.log(`Redis Cache HIT for key: ${key}`);
        this.updateHitRate();
        return JSON.parse(cached as string) as TravelRecommendationsResponse;
      } else {
        this.metrics.misses++;
        console.log(`Redis Cache MISS for key: ${key}`);
        this.updateHitRate();
        return null;
      }
    } catch (error) {
      console.error('Redis get error:', error);
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }
  }

  async set(params: TravelSearchParams, data: TravelRecommendationsResponse): Promise<void> {
    if (!this.isConnected || !this.client) {
      console.log('Redis not available, skipping cache set');
      return;
    }

    const key = this.generateCacheKey(params);
    const ttlSeconds = Math.floor(this.config.ttl / 1000);

    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(data));
      console.log(`Redis Cache SET for key: ${key}, TTL: ${ttlSeconds}s`);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async clear(): Promise<void> {
    if (!this.isConnected || !this.client) {
      console.log('Redis not available, cannot clear cache');
      return;
    }

    try {
      // Use SCAN to find all keys with our prefix and delete them
      const keys = [];
      let cursor = 0;
      
      do {
        const result = await this.client.scan(cursor, {
          match: `${this.keyPrefix}*`,
          count: 100
        });
        cursor = parseInt(result[0] as string);
        keys.push(...result[1]);
      } while (cursor !== 0);

      if (keys.length > 0) {
        await this.client.del(...keys);
        console.log(`Redis cache cleared: ${keys.length} keys deleted`);
      } else {
        console.log('Redis cache was already empty');
      }
    } catch (error) {
      console.error('Redis clear error:', error);
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
    if (!this.isConnected || !this.client) {
      return 0;
    }

    try {
      // Count keys with our prefix
      let count = 0;
      let cursor = 0;
      
      do {
        const result = await this.client.scan(cursor, {
          match: `${this.keyPrefix}*`,
          count: 100
        });
        cursor = parseInt(result[0] as string);
        count += result[1].length;
      } while (cursor !== 0);

      return count;
    } catch (error) {
      console.error('Redis size check error:', error);
      return 0;
    }
  }

  isRedisConnected(): boolean {
    return this.isConnected;
  }

  async destroy(): Promise<void> {
    this.cleanup();
    // Upstash Redis is HTTP-based, no persistent connection to close
  }
}