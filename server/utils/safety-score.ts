import { CityRecommendation } from "@shared/schema";

export interface SafetyData {
  numbeoScore?: number; // 0-100 (lower = safer)
  travelAdvisoryLevel?: number; // 1-4 (1 = exercise normal precautions, 4 = do not travel)
  roadSafetyIndex?: number; // 0-100 (higher = safer)
  healthRiskLevel?: number; // 0-100 (lower = safer)
  lastUpdated: Date;
}

export interface SafetyResult {
  safetyScore: number; // 0-100 (higher = safer)
  safetyLabel: string;
  lastUpdated: Date;
  sources: string[];
}

// City-specific safety data (placeholder - in production this would come from APIs/databases)
const CITY_SAFETY_DATA: Record<string, SafetyData> = {
  tokyo: {
    numbeoScore: 25, // Very safe (low crime)
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 85, // Good road safety
    healthRiskLevel: 15, // Low health risk
    lastUpdated: new Date('2025-10-01')
  },
  paris: {
    numbeoScore: 45, // Moderate safety (some petty crime)
    travelAdvisoryLevel: 2, // Exercise increased caution
    roadSafetyIndex: 75, // Good road safety
    healthRiskLevel: 20, // Low health risk
    lastUpdated: new Date('2025-10-01')
  },
  london: {
    numbeoScore: 40, // Moderate safety
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 80, // Good road safety
    healthRiskLevel: 18, // Low health risk
    lastUpdated: new Date('2025-10-01')
  },
  bangkok: {
    numbeoScore: 55, // Higher crime in tourist areas
    travelAdvisoryLevel: 2, // Exercise increased caution
    roadSafetyIndex: 45, // Poor road safety
    healthRiskLevel: 35, // Moderate health risk (tropical diseases)
    lastUpdated: new Date('2025-10-01')
  },
  "new york": {
    numbeoScore: 50, // Moderate safety (varies by area)
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 70, // Decent road safety
    healthRiskLevel: 20, // Low health risk
    lastUpdated: new Date('2025-10-01')
  },
  rome: {
    numbeoScore: 48, // Moderate safety (pickpockets)
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 65, // Moderate road safety
    healthRiskLevel: 22, // Low health risk
    lastUpdated: new Date('2025-10-01')
  },
  barcelona: {
    numbeoScore: 52, // Moderate safety (tourist crime)
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 72, // Good road safety
    healthRiskLevel: 20, // Low health risk
    lastUpdated: new Date('2025-10-01')
  },
  sydney: {
    numbeoScore: 35, // Safe
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 82, // Good road safety
    healthRiskLevel: 15, // Low health risk
    lastUpdated: new Date('2025-10-01')
  },
  dubai: {
    numbeoScore: 20, // Very safe
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 75, // Good road safety
    healthRiskLevel: 25, // Low-moderate health risk
    lastUpdated: new Date('2025-10-01')
  },
  singapore: {
    numbeoScore: 15, // Extremely safe
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 90, // Excellent road safety
    healthRiskLevel: 12, // Very low health risk
    lastUpdated: new Date('2025-10-01')
  },
  amsterdam: {
    numbeoScore: 38, // Safe
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 88, // Excellent road safety (cycling infrastructure)
    healthRiskLevel: 16, // Low health risk
    lastUpdated: new Date('2025-10-01')
  },
  berlin: {
    numbeoScore: 42, // Moderate safety
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 80, // Good road safety
    healthRiskLevel: 18, // Low health risk
    lastUpdated: new Date('2025-10-01')
  },
  vienna: {
    numbeoScore: 28, // Very safe
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 85, // Good road safety
    healthRiskLevel: 15, // Low health risk
    lastUpdated: new Date('2025-10-01')
  },
  zurich: {
    numbeoScore: 22, // Very safe
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 92, // Excellent road safety
    healthRiskLevel: 12, // Very low health risk
    lastUpdated: new Date('2025-10-01')
  },
  istanbul: {
    numbeoScore: 58, // Moderate-high safety concerns
    travelAdvisoryLevel: 2, // Exercise increased caution
    roadSafetyIndex: 55, // Moderate road safety
    healthRiskLevel: 28, // Low-moderate health risk
    lastUpdated: new Date('2025-10-01')
  },
  lisbon: {
    numbeoScore: 32, // Safe
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 78, // Good road safety
    healthRiskLevel: 18, // Low health risk
    lastUpdated: new Date('2025-10-01')
  },
  prague: {
    numbeoScore: 35, // Safe
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 75, // Good road safety
    healthRiskLevel: 20, // Low health risk
    lastUpdated: new Date('2025-10-01')
  },
  budapest: {
    numbeoScore: 40, // Moderate safety
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 70, // Good road safety
    healthRiskLevel: 22, // Low health risk
    lastUpdated: new Date('2025-10-01')
  },
  stockholm: {
    numbeoScore: 25, // Very safe
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 88, // Excellent road safety
    healthRiskLevel: 14, // Very low health risk
    lastUpdated: new Date('2025-10-01')
  },
  copenhagen: {
    numbeoScore: 28, // Very safe
    travelAdvisoryLevel: 1, // Exercise normal precautions
    roadSafetyIndex: 90, // Excellent road safety
    healthRiskLevel: 15, // Low health risk
    lastUpdated: new Date('2025-10-01')
  }
};

// Regional fallback safety scores for cities not in our database
const REGIONAL_SAFETY_DEFAULTS: Record<string, Partial<SafetyData>> = {
  europe: {
    numbeoScore: 40,
    travelAdvisoryLevel: 1,
    roadSafetyIndex: 80,
    healthRiskLevel: 20
  },
  asia: {
    numbeoScore: 45,
    travelAdvisoryLevel: 2,
    roadSafetyIndex: 60,
    healthRiskLevel: 30
  },
  north_america: {
    numbeoScore: 45,
    travelAdvisoryLevel: 1,
    roadSafetyIndex: 75,
    healthRiskLevel: 20
  },
  south_america: {
    numbeoScore: 60,
    travelAdvisoryLevel: 2,
    roadSafetyIndex: 55,
    healthRiskLevel: 35
  },
  africa: {
    numbeoScore: 65,
    travelAdvisoryLevel: 3,
    roadSafetyIndex: 45,
    healthRiskLevel: 45
  },
  oceania: {
    numbeoScore: 35,
    travelAdvisoryLevel: 1,
    roadSafetyIndex: 85,
    healthRiskLevel: 18
  }
};

/**
 * Computes a safety score for a given city using multiple data sources
 * 
 * Algorithm:
 * 1. Gather data from multiple sources (Numbeo, travel advisories, road safety, health)
 * 2. Normalize each metric to 0-100 scale (higher = safer)
 * 3. Apply weighted average with recency adjustment
 * 4. Return final score with label
 * 
 * Weights:
 * - Numbeo crime index: 40% (most comprehensive)
 * - Travel advisory: 25% (official government guidance)
 * - Road safety: 15% (important for travelers)
 * - Health risk: 10% (disease/medical infrastructure)
 * - Recency: 10% (fresher data gets bonus)
 */
export function computeSafetyScore(cityKey: string, region: string): SafetyResult {
  const cityData = CITY_SAFETY_DATA[cityKey.toLowerCase()];
  const regionalFallback = REGIONAL_SAFETY_DEFAULTS[region] || REGIONAL_SAFETY_DEFAULTS.europe;
  
  // Use city-specific data if available, otherwise fall back to regional defaults
  const safetyData: SafetyData = {
    numbeoScore: cityData?.numbeoScore ?? regionalFallback.numbeoScore ?? 45,
    travelAdvisoryLevel: cityData?.travelAdvisoryLevel ?? regionalFallback.travelAdvisoryLevel ?? 2,
    roadSafetyIndex: cityData?.roadSafetyIndex ?? regionalFallback.roadSafetyIndex ?? 70,
    healthRiskLevel: cityData?.healthRiskLevel ?? regionalFallback.healthRiskLevel ?? 25,
    lastUpdated: cityData?.lastUpdated ?? new Date('2025-09-01')
  };

  // Normalize all metrics to 0-100 scale (higher = safer)
  const normalizedNumbeo = Math.max(0, 100 - (safetyData.numbeoScore || 50)); // Invert Numbeo (lower crime = higher safety)
  const normalizedAdvisory = Math.max(0, 100 - ((safetyData.travelAdvisoryLevel || 2) - 1) * 33.33); // 1=100, 2=67, 3=33, 4=0
  const normalizedRoadSafety = safetyData.roadSafetyIndex || 70;
  const normalizedHealth = Math.max(0, 100 - (safetyData.healthRiskLevel || 25)); // Invert health risk

  // Calculate recency bonus (data within 3 months gets full bonus, degrades over time)
  const dataAge = (Date.now() - safetyData.lastUpdated.getTime()) / (1000 * 60 * 60 * 24); // days
  const recencyMultiplier = Math.max(0.8, Math.min(1.1, 1.1 - (dataAge / 90) * 0.3)); // 1.1x bonus for fresh data, 0.8x minimum

  // Weighted average
  const weightedScore = (
    normalizedNumbeo * 0.40 +
    normalizedAdvisory * 0.25 +
    normalizedRoadSafety * 0.15 +
    normalizedHealth * 0.10
  ) * 0.9 + (100 * 0.1); // Reserve 10% for recency

  // Apply recency adjustment
  const finalScore = Math.round(Math.min(100, Math.max(0, weightedScore * recencyMultiplier)));

  // Determine safety label
  let safetyLabel: string;
  if (finalScore >= 80) {
    safetyLabel = "Low risk";
  } else if (finalScore >= 60) {
    safetyLabel = "Moderate";
  } else {
    safetyLabel = "Take care";
  }

  // Determine data sources used
  const sources: string[] = [];
  if (cityData?.numbeoScore) sources.push("Numbeo Crime Index");
  if (cityData?.travelAdvisoryLevel) sources.push("Travel Advisories");
  if (cityData?.roadSafetyIndex) sources.push("Road Safety Data");
  if (cityData?.healthRiskLevel) sources.push("Health Risk Assessment");
  if (sources.length === 0) sources.push("Regional Estimates");

  return {
    safetyScore: finalScore,
    safetyLabel,
    lastUpdated: safetyData.lastUpdated,
    sources
  };
}

/**
 * Batch compute safety scores for multiple cities
 */
export function computeSafetyScores(cities: Array<{ city: string; region: string }>): Record<string, SafetyResult> {
  const results: Record<string, SafetyResult> = {};
  
  for (const { city, region } of cities) {
    results[city.toLowerCase()] = computeSafetyScore(city, region);
  }
  
  return results;
}

/**
 * Get available safety data coverage
 */
export function getSafetyDataCoverage(): {
  totalCities: number;
  citiesWithData: string[];
  regionsSupported: string[];
} {
  return {
    totalCities: Object.keys(CITY_SAFETY_DATA).length,
    citiesWithData: Object.keys(CITY_SAFETY_DATA),
    regionsSupported: Object.keys(REGIONAL_SAFETY_DEFAULTS)
  };
}