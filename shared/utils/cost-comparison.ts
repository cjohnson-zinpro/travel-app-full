/**
 * Cost Comparison Utilities
 * Provides functions to compare destination costs with home city costs
 */

import { ClaudeDailyCosts } from '../data/claude-daily-costs';
import { getCityFromAirport } from '../data/airport-mapping';

export interface CostComparison {
  homeCity: string;
  destinationCity: string;
  travelStyle: 'budget' | 'midRange' | 'luxury';
  hotelComparison: {
    homeCost: number;
    destinationCost: number;
    percentageDifference: number;
    isDestinationCheaper: boolean;
    description: string;
  };
  dailyComparison: {
    homeCost: number;
    destinationCost: number;
    percentageDifference: number;
    isDestinationCheaper: boolean;
    description: string;
  };
  overallComparison: {
    percentageDifference: number;
    isDestinationCheaper: boolean;
    description: string;
  };
}

/**
 * Calculate percentage difference between two values
 * Positive = destination is more expensive
 * Negative = destination is cheaper
 */
function calculatePercentageDifference(destinationCost: number, homeCost: number): number {
  if (homeCost === 0) return 0;
  return ((destinationCost - homeCost) / homeCost) * 100;
}

/**
 * Format percentage difference into human-readable description
 */
function formatPercentageDescription(percentage: number): string {
  const absPercentage = Math.abs(percentage);
  
  if (absPercentage < 5) {
    return "similar prices";
  } else if (percentage < 0) {
    return `${Math.round(absPercentage)}% cheaper`;
  } else {
    return `${Math.round(absPercentage)}% more expensive`;
  }
}

/**
 * Get cost comparison between destination and home city
 */
export function getCostComparison(
  destinationCityKey: string,
  homeAirportOrCity: string,
  travelStyle: 'budget' | 'midRange' | 'luxury'
): CostComparison | null {
  // Try to get home city from airport code first, then use as direct city key
  let homeCityKey = getCityFromAirport(homeAirportOrCity);
  if (!homeCityKey) {
    // If not an airport code, try as direct city key
    homeCityKey = homeAirportOrCity.toLowerCase().replace(/\s+/g, '-');
  }

  // Get cost data for both cities
  const destinationData = ClaudeDailyCosts.getDailyCosts(destinationCityKey);
  const homeData = ClaudeDailyCosts.getDailyCosts(homeCityKey);

  if (!destinationData || !homeData) {
    return null;
  }

  // Hotel cost comparison
  const destinationHotel = destinationData.accommodation?.[travelStyle] || 0;
  const homeHotel = homeData.accommodation?.[travelStyle] || 0;
  const hotelPercentageDiff = calculatePercentageDifference(destinationHotel, homeHotel);

  // Daily cost comparison
  const destinationDaily = destinationData.breakdown[travelStyle].total;
  const homeDaily = homeData.breakdown[travelStyle].total;
  const dailyPercentageDiff = calculatePercentageDifference(destinationDaily, homeDaily);

  // Overall comparison (weighted average: 60% hotel, 40% daily)
  const overallPercentageDiff = (hotelPercentageDiff * 0.6) + (dailyPercentageDiff * 0.4);

  return {
    homeCity: homeCityKey,
    destinationCity: destinationCityKey,
    travelStyle,
    hotelComparison: {
      homeCost: homeHotel,
      destinationCost: destinationHotel,
      percentageDifference: hotelPercentageDiff,
      isDestinationCheaper: hotelPercentageDiff < 0,
      description: formatPercentageDescription(hotelPercentageDiff)
    },
    dailyComparison: {
      homeCost: homeDaily,
      destinationCost: destinationDaily,
      percentageDifference: dailyPercentageDiff,
      isDestinationCheaper: dailyPercentageDiff < 0,
      description: formatPercentageDescription(dailyPercentageDiff)
    },
    overallComparison: {
      percentageDifference: overallPercentageDiff,
      isDestinationCheaper: overallPercentageDiff < 0,
      description: formatPercentageDescription(overallPercentageDiff)
    }
  };
}

/**
 * Get formatted city name for display
 */
export function getDisplayCityName(cityKey: string): string {
  return cityKey
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if cost comparison is available for given inputs
 */
export function canCompareCosts(
  destinationCityKey: string,
  homeAirportOrCity: string
): boolean {
  // Check if destination exists
  if (!ClaudeDailyCosts.hasCity(destinationCityKey)) {
    return false;
  }

  // Check if home city can be resolved
  let homeCityKey = getCityFromAirport(homeAirportOrCity);
  if (!homeCityKey) {
    homeCityKey = homeAirportOrCity.toLowerCase().replace(/\s+/g, '-');
  }

  return ClaudeDailyCosts.hasCity(homeCityKey);
}

/**
 * Get savings/extra cost in actual dollar amounts
 */
export function getCostDifferences(comparison: CostComparison) {
  const hotelDifference = comparison.hotelComparison.destinationCost - comparison.hotelComparison.homeCost;
  const dailyDifference = comparison.dailyComparison.destinationCost - comparison.dailyComparison.homeCost;
  
  return {
    hotelDifference,
    dailyDifference,
    hotelSavings: hotelDifference < 0 ? Math.abs(hotelDifference) : 0,
    dailySavings: dailyDifference < 0 ? Math.abs(dailyDifference) : 0,
    hotelExtraCost: hotelDifference > 0 ? hotelDifference : 0,
    dailyExtraCost: dailyDifference > 0 ? dailyDifference : 0
  };
}