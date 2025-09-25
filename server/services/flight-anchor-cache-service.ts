import type { CacheConfig, CacheMetrics } from "./cache-service";
import { Redis } from '@upstash/redis';

// Flight cache data structure
export interface FlightAnchorData {
  origin: string;
  destination: string;
  month?: number;
  nights: number;
  prices: number[];
  currency: string;
  confidence: 'high' | 'medium' | 'low';
  averagePrice: number;
  lastUpdated: string;
  samplesCount: number;
}

// Flight cache entry with TTL metadata
interface FlightCacheEntry {
  data: FlightAnchorData;
  timestamp: number;
  expiresAt: number;
  confidence: 'high' | 'medium' | 'low';
}

export class FlightAnchorCacheService {
  private redisClient: Redis | null = null;
  private memoryStore: Map<string, FlightCacheEntry>;
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private isRedisConnected = false;
  private keyPrefix = 'flight_anchor:';
  private cleanupInterval: NodeJS.Timeout;

  // Geographic clustering for broader cache coverage
  private readonly airportClusters = {
    // NYC Area - multiple airports serve same metropolitan area
    'NYC': ['JFK', 'LGA', 'EWR'],
    // London Area
    'LON': ['LHR', 'LGW', 'STN', 'LTN'], 
    // Paris Area
    'PAR': ['CDG', 'ORY'],
    // Tokyo Area
    'TYO': ['NRT', 'HND'],
    // San Francisco Bay Area
    'SF': ['SFO', 'OAK', 'SJC'],
    // Los Angeles Area
    'LA': ['LAX', 'BUR', 'LGB', 'SNA'],
    // Washington DC Area
    'WAS': ['DCA', 'IAD', 'BWI'],
    // Chicago Area
    'CHI': ['ORD', 'MDW'],
    // Miami Area  
    'MIA': ['MIA', 'FLL', 'PBI']
  };

  // TTL configuration based on confidence levels
  private readonly ttlConfig = {
    high: 7 * 24 * 60 * 60 * 1000,   // 7 days for high confidence data
    medium: 3 * 24 * 60 * 60 * 1000, // 3 days for medium confidence
    low: 1 * 24 * 60 * 60 * 1000     // 1 day for low confidence
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: config.ttl || this.ttlConfig.medium, // Default to medium confidence TTL
      maxSize: config.maxSize || 5000, // Higher limit for flight anchor cache
      checkPeriod: config.checkPeriod || 60 * 1000
    };

    this.memoryStore = new Map();
    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0
    };

    // Set up periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.checkPeriod);

    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    if (process.env.DISABLE_REDIS === 'true') {
      console.log('Redis disabled for flight anchor cache');
      return;
    }

    try {
      let upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
      let upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
      
      if (upstashUrl && upstashToken) {
        // Remove quotes if present
        upstashUrl = upstashUrl.replace(/^["'](.*)["']$/, '$1');
        upstashToken = upstashToken.replace(/^["'](.*)["']$/, '$1');
        
        this.redisClient = new Redis({
          url: upstashUrl,
          token: upstashToken
        });
        
        await this.redisClient.ping();
        console.log('Flight anchor cache Redis connected successfully');
        this.isRedisConnected = true;
      }
    } catch (error) {
      console.log('Flight anchor cache using memory fallback:', error instanceof Error ? error.message : 'Unknown error');
      this.isRedisConnected = false;
    }
  }

  /**
   * Generate cache key for flight route with geographic clustering
   */
  private generateCacheKey(origin: string, destination: string, month?: number, nights: number = 7): string {
    // Apply geographic clustering to use broader cache coverage
    const clusterOrigin = this.getClusterKey(origin) || origin;
    const clusterDestination = this.getClusterKey(destination) || destination;
    
    const monthKey = month ? month.toString() : 'any';
    return `${this.keyPrefix}${clusterOrigin}:${clusterDestination}:${monthKey}:${nights}`;
  }

  /**
   * Get cluster key for airport (e.g., JFK -> NYC)
   */
  private getClusterKey(airportCode: string): string | null {
    for (const [cluster, airports] of Object.entries(this.airportClusters)) {
      if (airports.includes(airportCode)) {
        return cluster;
      }
    }
    return null;
  }

  /**
   * Get TTL based on confidence level
   */
  private getTTL(confidence: 'high' | 'medium' | 'low'): number {
    return this.ttlConfig[confidence];
  }

  /**
   * Get flight anchor data from cache
   */
  async get(origin: string, destination: string, month?: number, nights: number = 7): Promise<FlightAnchorData | null> {
    const key = this.generateCacheKey(origin, destination, month, nights);
    this.metrics.totalRequests++;

    // Try Redis first
    if (this.isRedisConnected && this.redisClient) {
      try {
        const cached = await this.redisClient.get<FlightAnchorData>(key);
        if (cached) {
          this.metrics.hits++;
          console.log(`Flight anchor cache HIT (Redis): ${origin} → ${destination}`);
          this.updateHitRate();
          return cached;
        }
      } catch (error) {
        console.warn('Redis get error for flight anchor:', error);
      }
    }

    // Fallback to memory cache
    const memoryEntry = this.memoryStore.get(key);
    if (memoryEntry) {
      const now = Date.now();
      if (now <= memoryEntry.expiresAt) {
        // Update timestamp for true LRU behavior
        memoryEntry.timestamp = now;
        this.memoryStore.set(key, memoryEntry);
        
        this.metrics.hits++;
        console.log(`Flight anchor cache HIT (memory): ${origin} → ${destination}`);
        this.updateHitRate();
        return memoryEntry.data;
      } else {
        // Expired entry
        this.memoryStore.delete(key);
      }
    }

    this.metrics.misses++;
    console.log(`Flight anchor cache MISS: ${origin} → ${destination}`);
    this.updateHitRate();
    return null;
  }

  /**
   * Set flight anchor data in cache
   */
  async set(data: FlightAnchorData): Promise<void> {
    const key = this.generateCacheKey(data.origin, data.destination, data.month, data.nights);
    const ttl = this.getTTL(data.confidence);
    const expiresAt = Date.now() + ttl;

    // Store in Redis
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.set(key, data, { ex: Math.floor(ttl / 1000) });
        console.log(`Flight anchor cache SET (Redis): ${data.origin} → ${data.destination} [${data.confidence}] TTL=${Math.floor(ttl/3600000)}h`);
      } catch (error) {
        console.warn('Redis set error for flight anchor:', error);
      }
    }

    // Store in memory cache as fallback
    const entry: FlightCacheEntry = {
      data,
      timestamp: Date.now(),
      expiresAt,
      confidence: data.confidence
    };

    // Check memory capacity
    if (this.memoryStore.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.memoryStore.set(key, entry);
    console.log(`Flight anchor cache SET (memory): ${data.origin} → ${data.destination} [${data.confidence}]`);
  }

  /**
   * Check if cached data is still fresh enough to use
   */
  isDataFresh(data: FlightAnchorData, maxAge: number = 24 * 60 * 60 * 1000): boolean {
    const dataAge = Date.now() - new Date(data.lastUpdated).getTime();
    return dataAge <= maxAge;
  }

  /**
   * Get cache statistics
   */
  getMetrics(): CacheMetrics & { cacheSize: number; redisConnected: boolean } {
    return {
      ...this.metrics,
      cacheSize: this.memoryStore.size,
      redisConnected: this.isRedisConnected
    };
  }

  /**
   * Clean up expired memory cache entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    const entries = Array.from(this.memoryStore.entries());
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.memoryStore.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`Flight anchor cache cleanup: removed ${removedCount} expired entries`);
    }
  }

  /**
   * Evict least recently used entry to make room
   */
  private evictLRU(): void {
    const entries = Array.from(this.memoryStore.entries());
    if (entries.length === 0) return;

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const [oldestKey] = entries[0];
    this.memoryStore.delete(oldestKey);
    console.log(`Flight anchor cache evicted LRU entry: ${oldestKey}`);
  }

  /**
   * Update hit rate metrics
   */
  private updateHitRate(): void {
    if (this.metrics.totalRequests > 0) {
      this.metrics.hitRate = (this.metrics.hits / this.metrics.totalRequests) * 100;
    } else {
      this.metrics.hitRate = 0;
    }
  }

  /**
   * Clear all cache entries
   * Note: Uses TTL expiry for Redis instead of KEYS command for serverless compatibility
   */
  async clear(): Promise<void> {
    // For Redis: rely on TTL expiry rather than KEYS scan which is expensive
    // Just clear the in-memory cache and let Redis entries expire naturally
    this.memoryStore.clear();
    console.log('Flight anchor cache cleared (memory cleared, Redis entries will expire via TTL)');
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.memoryStore.clear();
    this.redisClient = null;
    this.isRedisConnected = false;
  }
}