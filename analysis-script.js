// Analysis script to identify missing data across all cities
const fs = require('fs');
const path = require('path');

// Read the cost data file
const costDataPath = path.join(__dirname, 'shared/data/claude-daily-costs.ts');
const culturalDataPath = path.join(__dirname, 'client/src/components/city-modal.tsx');

// Extract city names from cost data
function extractCityNames(content) {
  const cityRegex = /'([a-z\-]+)':\s*\{/g;
  const cities = [];
  let match;
  while ((match = cityRegex.exec(content)) !== null) {
    cities.push(match[1]);
  }
  return [...new Set(cities)]; // Remove duplicates
}

// Check for detailed breakdown
function hasDetailedBreakdown(content, cityName) {
  const cityStartRegex = new RegExp(`'${cityName}':\\s*\\{`);
  const nextCityRegex = new RegExp(`'[a-z\\-]+':\\s*\\{`);
  
  const match = cityStartRegex.exec(content);
  if (!match) return false;
  
  const startIndex = match.index;
  const restContent = content.slice(startIndex);
  
  // Find the next city to get the boundary
  const nextCityMatch = nextCityRegex.exec(restContent.slice(10)); // Skip current city match
  const endIndex = nextCityMatch ? startIndex + nextCityMatch.index + 10 : content.length;
  
  const citySection = content.slice(startIndex, endIndex);
  return citySection.includes('detailedBreakdown');
}

// Check for cultural data
function hasCulturalData(content, cityName) {
  const culturalSectionRegex = new RegExp(`\\s${cityName}:\\s*\\{`);
  return culturalSectionRegex.test(content);
}

// Main analysis
try {
  const costContent = fs.readFileSync(costDataPath, 'utf8');
  const culturalContent = fs.readFileSync(culturalDataPath, 'utf8');
  
  const cities = extractCityNames(costContent);
  console.log(`Found ${cities.length} cities in total`);
  
  const missingDetailedBreakdown = [];
  const missingCulturalData = [];
  
  cities.forEach(city => {
    const hasDetailed = hasDetailedBreakdown(costContent, city);
    const hasCultural = hasCulturalData(culturalContent, city);
    
    if (!hasDetailed) {
      missingDetailedBreakdown.push(city);
    }
    
    if (!hasCultural) {
      missingCulturalData.push(city);
    }
  });
  
  console.log('\n=== ANALYSIS RESULTS ===\n');
  
  console.log(`Cities with detailed breakdown: ${cities.length - missingDetailedBreakdown.length}`);
  console.log(`Cities missing detailed breakdown: ${missingDetailedBreakdown.length}`);
  console.log('Missing detailed breakdown:', missingDetailedBreakdown.slice(0, 20)); // First 20
  
  console.log(`\nCities with cultural data: ${cities.length - missingCulturalData.length}`);
  console.log(`Cities missing cultural data: ${missingCulturalData.length}`);
  console.log('Missing cultural data:', missingCulturalData.slice(0, 20)); // First 20
  
  // Identify top priority cities (major tourist destinations)
  const topPriorityCities = [
    'new-york', 'los-angeles', 'san-francisco', 'chicago', 'miami', 'las-vegas',
    'london', 'paris', 'rome', 'barcelona', 'amsterdam', 'berlin', 'vienna',
    'tokyo', 'seoul', 'hong-kong', 'shanghai', 'beijing',
    'dubai', 'bangkok', 'kuala-lumpur', 'singapore',
    'sydney', 'melbourne', 'rio-de-janeiro', 'buenos-aires'
  ];
  
  const priorityMissingDetailed = topPriorityCities.filter(city => 
    missingDetailedBreakdown.includes(city)
  );
  
  const priorityMissingCultural = topPriorityCities.filter(city => 
    missingCulturalData.includes(city)
  );
  
  console.log('\n=== HIGH PRIORITY MISSING DATA ===\n');
  console.log('Top cities missing detailed breakdown:', priorityMissingDetailed);
  console.log('Top cities missing cultural data:', priorityMissingCultural);
  
} catch (error) {
  console.error('Error running analysis:', error.message);
}