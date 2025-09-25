import { 
  type City, 
  type InsertCity,
  type FlightAverage,
  type InsertFlightAverage,
  type HotelStats,
  type InsertHotelStats,
  type DailyCosts,
  type InsertDailyCosts,
  type CacheMetadata,
  type TravelSearchParams,
  type CityRecommendation
} from "@shared/schema";

export interface IStorage {
  getCities(): Promise<City[]>;
  getCitiesByRegion(region: string): Promise<City[]>;
  getCitiesByCountry(country: string): Promise<City[]>;
  createCity(city: InsertCity): Promise<City>;
  getFlightAverage(originIata: string, cityIata: string, month?: number): Promise<FlightAverage | undefined>;
  createFlightAverage(flight: InsertFlightAverage): Promise<FlightAverage>;
  getHotelStats(cityId: string, month?: number): Promise<HotelStats | undefined>;
  createHotelStats(stats: InsertHotelStats): Promise<HotelStats>;
  getDailyCosts(cityId: string): Promise<DailyCosts | undefined>;
  createDailyCosts(costs: InsertDailyCosts): Promise<DailyCosts>;
  getTravelRecommendations(params: TravelSearchParams): Promise<CityRecommendation[]>;
  getCacheMetadata(cacheKey: string): Promise<CacheMetadata | undefined>;
  setCacheMetadata(cacheKey: string, dataType: string, expiresAt: Date, metadata?: any): Promise<CacheMetadata>;
}

class InMemoryStorage implements IStorage {
  private cities = new Map<string, City>();
  private flightAverages = new Map<string, FlightAverage>();
  private hotelStats = new Map<string, HotelStats>();
  private dailyCosts = new Map<string, DailyCosts>();
  private cacheMetadata = new Map<string, CacheMetadata>();

  async getCities(): Promise<City[]> {
    return Array.from(this.cities.values()).filter(c => c.enabled === 1);
  }

  async getCitiesByRegion(region: string): Promise<City[]> {
    return Array.from(this.cities.values()).filter(c => c.region === region && c.enabled === 1);
  }

  async getCitiesByCountry(country: string): Promise<City[]> {
    return Array.from(this.cities.values()).filter(c => c.country === country && c.enabled === 1);
  }

  async createCity(insertCity: InsertCity): Promise<City> {
    const id = Math.random().toString(36);
    const now = new Date();
    const city: City = {
      id,
      ...insertCity,
      enabled: insertCity.enabled ?? 1,
      createdAt: now,
      updatedAt: now,
    };
    this.cities.set(id, city);
    return city;
  }

  async getFlightAverage(originIata: string, cityIata: string, month?: number): Promise<FlightAverage | undefined> {
    for (const flight of Array.from(this.flightAverages.values())) {
      if (flight.originIata === originIata && flight.cityIata === cityIata) {
        return flight;
      }
    }
    return undefined;
  }

  async createFlightAverage(insertFlight: InsertFlightAverage): Promise<FlightAverage> {
    const id = Math.random().toString(36);
    const now = new Date();
    const flight: FlightAverage = {
      id,
      ...insertFlight,
      createdAt: now,
      updatedAt: now,
    };
    this.flightAverages.set(id, flight);
    return flight;
  }

  async getHotelStats(cityId: string, month?: number): Promise<HotelStats | undefined> {
    for (const stats of Array.from(this.hotelStats.values())) {
      if (stats.cityId === cityId) {
        return stats;
      }
    }
    return undefined;
  }

  async createHotelStats(insertStats: InsertHotelStats): Promise<HotelStats> {
    const id = Math.random().toString(36);
    const now = new Date();
    const stats: HotelStats = {
      id,
      ...insertStats,
      createdAt: now,
      updatedAt: now,
    };
    this.hotelStats.set(id, stats);
    return stats;
  }

  async getDailyCosts(cityId: string): Promise<DailyCosts | undefined> {
    for (const costs of Array.from(this.dailyCosts.values())) {
      if (costs.cityId === cityId) {
        return costs;
      }
    }
    return undefined;
  }

  async createDailyCosts(insertCosts: InsertDailyCosts): Promise<DailyCosts> {
    const id = Math.random().toString(36);
    const now = new Date();
    const costs: DailyCosts = {
      id,
      ...insertCosts,
      createdAt: now,
      updatedAt: now,
    };
    this.dailyCosts.set(id, costs);
    return costs;
  }

  async getTravelRecommendations(params: TravelSearchParams): Promise<CityRecommendation[]> {
    return [];
  }

  async getCacheMetadata(cacheKey: string): Promise<CacheMetadata | undefined> {
    return this.cacheMetadata.get(cacheKey);
  }

  async setCacheMetadata(cacheKey: string, dataType: string, expiresAt: Date, metadata?: any): Promise<CacheMetadata> {
    const existing = this.cacheMetadata.get(cacheKey);
    const now = new Date();
    const id = existing?.id || Math.random().toString(36);
    
    const cacheData: CacheMetadata = {
      id,
      cacheKey,
      dataType,
      expiresAt,
      metadata,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    
    this.cacheMetadata.set(cacheKey, cacheData);
    return cacheData;
  }
}

export const storage = new InMemoryStorage();