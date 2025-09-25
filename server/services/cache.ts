export class CacheService {
  private memoryCache = new Map<string, { data: any, expiresAt: Date }>();

  async get<T>(key: string): Promise<T | null> {
    // Check memory cache only
    const memData = this.memoryCache.get(key);
    if (memData && memData.expiresAt > new Date()) {
      return memData.data as T;
    }

    return null;
  }

  async set(key: string, data: any, dataType: string, ttlSeconds: number): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    
    // Update memory cache only
    this.memoryCache.set(key, { data, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.filter(p => p !== null && p !== undefined).join(':')}`;
  }

  // Standard cache TTLs based on data type
  getTTL(dataType: 'flights' | 'hotels' | 'daily_costs' | 'recommendations'): number {
    switch (dataType) {
      case 'flights': return 7 * 24 * 60 * 60; // 1 week
      case 'hotels': return 30 * 24 * 60 * 60; // 1 month  
      case 'daily_costs': return 90 * 24 * 60 * 60; // 3 months
      case 'recommendations': return 60 * 60; // 1 hour
      default: return 60 * 60; // 1 hour default
    }
  }
}

export const cacheService = new CacheService();
