#!/usr/bin/env tsx

/**
 * Batch Cache Population Script
 * 
 * This script iterates through all cities in the allowlists and calls Claude API
 * to populate cached hotel pricing and daily costs for fast future lookups.
 * 
 * Estimated cost: ~$0.60 for 149 cities × 2 API calls each
 * Expected runtime: ~15-20 minutes with rate limiting
 */

import { db } from "../db";
import { eq } from "drizzle-orm";
import { cachedHotelPricing, cachedDailyCosts, batchMetadata } from "../../shared/schema";
import { claudeService } from "../services/claude-service";
import { AsiaMajorCities } from "../data/majorCities.asia";
import { EuropeMajorCities } from "../data/majorCities.europe";
import { AmericasMajorCities } from "../data/majorCities.americas";
import { AfricaMajorCities } from "../data/majorCities.africa";
import { OceaniaMajorCities } from "../data/majorCities.oceania";
import { getCountryName } from "../data/regionCountries";

// Rate limiting configuration
const DELAY_BETWEEN_CALLS = 2000; // 2 seconds between API calls
const BATCH_SIZE = 5; // Process cities in batches

interface CityInfo {
  name: string;
  iata: string;
  lat: number;
  lon: number;
  countryCode: string;
  countryName: string;
}

// Generate unique batch ID
function generateBatchId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get all cities from allowlists
function getAllCities(): CityInfo[] {
  const allCities: CityInfo[] = [];
  
  // Helper function to process a region's cities
  const processCities = (regionCities: any, regionName: string) => {
    Object.entries(regionCities).forEach(([countryCode, cities]) => {
      const countryName = getCountryName(countryCode as any);
      (cities as any[]).forEach((city) => {
        allCities.push({
          name: city.name,
          iata: city.iata,
          lat: city.lat,
          lon: city.lon,
          countryCode,
          countryName,
        });
      });
    });
  };

  // Process all regions
  processCities(AsiaMajorCities, "Asia");
  processCities(EuropeMajorCities, "Europe");
  processCities(AmericasMajorCities, "Americas");
  processCities(AfricaMajorCities, "Africa");
  processCities(OceaniaMajorCities, "Oceania");

  console.log(`📊 Total cities found: ${allCities.length}`);
  return allCities;
}

// Process a single city
async function processCityCache(
  city: CityInfo,
  batchId: string,
  cityIndex: number,
  totalCities: number
): Promise<{ hotelSuccess: boolean; dailySuccess: boolean; cost: number }> {
  console.log(`\n🏙️  [${cityIndex + 1}/${totalCities}] Processing ${city.name}, ${city.countryName} (${city.iata})...`);
  
  let hotelSuccess = false;
  let dailySuccess = false;
  let estimatedCost = 0;

  try {
    // 1. Get hotel pricing from Claude
    console.log(`   🏨 Fetching hotel pricing...`);
    const hotelPricing = await claudeService.getHotelPricing(city.name, city.countryName);
    
    // Insert cached hotel pricing
    await db.insert(cachedHotelPricing).values({
      cityIata: city.iata,
      cityName: city.name,
      countryName: city.countryName,
      p25Usd: hotelPricing.p25Usd,
      p50Usd: hotelPricing.p50Usd,
      p75Usd: hotelPricing.p75Usd,
      source: "claude",
      confidence: "medium",
      batchId,
    });
    
    hotelSuccess = true;
    estimatedCost += 0.0015; // ~400 input + 50 output tokens
    console.log(`   ✅ Hotel pricing cached: $${hotelPricing.p25Usd}/$${hotelPricing.p50Usd}/$${hotelPricing.p75Usd}`);
    
    // Small delay between calls
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 2. Get daily costs from Claude
    console.log(`   🍽️  Fetching daily costs...`);
    const dailyCosts = await claudeService.getDailyCosts(city.name, city.countryName);
    
    // Insert cached daily costs
    await db.insert(cachedDailyCosts).values({
      cityIata: city.iata,
      cityName: city.name,
      countryName: city.countryName,
      dailyFoodUsd: dailyCosts.dailyFoodUsd,
      dailyTransportUsd: dailyCosts.dailyTransportUsd,
      dailyMiscUsd: dailyCosts.dailyMiscUsd,
      source: "claude",
      batchId,
    });
    
    dailySuccess = true;
    estimatedCost += 0.0013; // ~350 input + 75 output tokens
    console.log(`   ✅ Daily costs cached: $${dailyCosts.dailyFoodUsd}/$${dailyCosts.dailyTransportUsd}/$${dailyCosts.dailyMiscUsd}`);
    
  } catch (error) {
    console.error(`   ❌ Error processing ${city.name}:`, error);
    
    // Insert fallback data if Claude fails
    if (!hotelSuccess) {
      const fallbackHotel = { p25Usd: "45.00", p50Usd: "75.00", p75Usd: "120.00" };
      await db.insert(cachedHotelPricing).values({
        cityIata: city.iata,
        cityName: city.name,
        countryName: city.countryName,
        p25Usd: fallbackHotel.p25Usd,
        p50Usd: fallbackHotel.p50Usd,
        p75Usd: fallbackHotel.p75Usd,
        source: "fallback",
        confidence: "low",
        batchId,
      });
    }
    
    if (!dailySuccess) {
      const fallbackDaily = { dailyFoodUsd: "25.00", dailyTransportUsd: "10.00", dailyMiscUsd: "15.00" };
      await db.insert(cachedDailyCosts).values({
        cityIata: city.iata,
        cityName: city.name,
        countryName: city.countryName,
        dailyFoodUsd: fallbackDaily.dailyFoodUsd,
        dailyTransportUsd: fallbackDaily.dailyTransportUsd,
        dailyMiscUsd: fallbackDaily.dailyMiscUsd,
        source: "fallback",
        batchId,
      });
    }
  }

  return { hotelSuccess, dailySuccess, cost: estimatedCost };
}

// Update batch progress
async function updateBatchProgress(
  batchId: string,
  processedCities: number,
  successfulCalls: number,
  failedCalls: number,
  totalCost: number
) {
  await db.update(batchMetadata)
    .set({
      processedCities,
      successfulCalls,
      failedCalls,
      totalCost: totalCost.toFixed(4),
    })
    .where(eq(batchMetadata.batchId, batchId));
}

// Main batch processing function
async function runBatchPopulation() {
  const startTime = Date.now();
  const batchId = generateBatchId();
  
  console.log(`🚀 Starting batch cache population...`);
  console.log(`📋 Batch ID: ${batchId}`);
  console.log(`⏱️  Started at: ${new Date().toISOString()}`);
  
  // Get all cities
  const allCities = getAllCities();
  const totalCities = allCities.length;
  
  // Create batch metadata record
  await db.insert(batchMetadata).values({
    batchId,
    status: "running",
    totalCities,
    processedCities: 0,
    successfulCalls: 0,
    failedCalls: 0,
    totalCost: "0",
    metadata: { startTime: new Date().toISOString() },
  });
  
  let processedCities = 0;
  let successfulCalls = 0;
  let failedCalls = 0;
  let totalCost = 0;
  
  try {
    // Process cities in batches
    for (let i = 0; i < totalCities; i += BATCH_SIZE) {
      const batch = allCities.slice(i, i + BATCH_SIZE);
      
      console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(totalCities / BATCH_SIZE)} (${batch.length} cities)...`);
      
      // Process cities in parallel within the batch
      const batchPromises = batch.map((city, batchIndex) => 
        processCityCache(city, batchId, i + batchIndex, totalCities)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Process results
      for (const result of batchResults) {
        processedCities++;
        
        if (result.status === "fulfilled") {
          const { hotelSuccess, dailySuccess, cost } = result.value;
          if (hotelSuccess) successfulCalls++;
          else failedCalls++;
          if (dailySuccess) successfulCalls++;
          else failedCalls++;
          totalCost += cost;
        } else {
          failedCalls += 2; // Both hotel and daily failed
          console.error(`   ❌ Batch processing failed:`, result.reason);
        }
      }
      
      // Update progress
      await updateBatchProgress(batchId, processedCities, successfulCalls, failedCalls, totalCost);
      
      // Rate limiting delay between batches
      if (i + BATCH_SIZE < totalCities) {
        console.log(`   ⏳ Waiting ${DELAY_BETWEEN_CALLS}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CALLS));
      }
    }
    
    // Mark batch as completed
    await db.update(batchMetadata)
      .set({
        status: "completed",
        completedAt: new Date(),
        metadata: {
          startTime: new Date(startTime).toISOString(),
          endTime: new Date().toISOString(),
          durationMs: Date.now() - startTime,
        },
      })
      .where(eq(batchMetadata.batchId, batchId));
    
    const durationMinutes = Math.round((Date.now() - startTime) / 60000);
    
    console.log(`\n🎉 Batch population completed successfully!`);
    console.log(`📊 Final Statistics:`);
    console.log(`   • Total cities processed: ${processedCities}/${totalCities}`);
    console.log(`   • Successful API calls: ${successfulCalls}`);
    console.log(`   • Failed API calls: ${failedCalls}`);
    console.log(`   • Estimated cost: $${totalCost.toFixed(4)}`);
    console.log(`   • Duration: ${durationMinutes} minutes`);
    console.log(`   • Batch ID: ${batchId}`);
    
  } catch (error) {
    console.error(`❌ Batch processing failed:`, error);
    
    // Mark batch as failed
    await db.update(batchMetadata)
      .set({
        status: "failed",
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      .where(eq(batchMetadata.batchId, batchId));
    
    process.exit(1);
  }
}

// Run the batch if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBatchPopulation()
    .then(() => {
      console.log("✅ Batch population script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Batch population script failed:", error);
      process.exit(1);
    });
}

export { runBatchPopulation };