// Test the exact country names from the backend data
const backendCountryNames = {
  FR: 'France',
  DE: 'Germany', 
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  CH: 'Switzerland',
  AT: 'Austria',
  BE: 'Belgium',
  PT: 'Portugal',
  GR: 'Greece',
  CZ: 'Czech Republic',
  HU: 'Hungary',
  PL: 'Poland',
  IE: 'Ireland',
  SE: 'Sweden',
  DK: 'Denmark',
  NO: 'Norway',
  FI: 'Finland',
  HR: 'Croatia',
  TR: 'Turkey',
  RO: 'Romania',
  GB: 'United Kingdom'
};

// Test our mapping function with backend country names
const getCountryImage = (countryName) => {
  const imageMap = {
    // Europe - Western
    "United Kingdom": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=200&fit=crop",
    "France": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=200&fit=crop",
    "Germany": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=200&fit=crop",
    "Italy": "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400&h=200&fit=crop",
    "Spain": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=200&fit=crop",
    "Netherlands": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=200&fit=crop",
    "Switzerland": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop",
    "Austria": "https://images.unsplash.com/photo-1476209446441-5ad72f223207?w=400&h=200&fit=crop",
    "Belgium": "https://images.unsplash.com/photo-1559564484-0b8a4aa3c6b5?w=400&h=200&fit=crop",
    "Portugal": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=200&fit=crop",
    "Ireland": "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=200&fit=crop",
    
    // Europe - Nordic
    "Norway": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=200&fit=crop",
    "Sweden": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=400&h=200&fit=crop",
    "Denmark": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=400&h=200&fit=crop",
    "Finland": "https://images.unsplash.com/photo-1514416200815-39d4dd6ba363?w=400&h=200&fit=crop",
    
    // Europe - Eastern
    "Czech Republic": "https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&h=200&fit=crop",
    "Poland": "https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=400&h=200&fit=crop",
    "Hungary": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=200&fit=crop",
    "Croatia": "https://images.unsplash.com/photo-1555993539-1732b0258a95?w=400&h=200&fit=crop",
    "Greece": "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=200&fit=crop",
    "Romania": "https://images.unsplash.com/photo-1556983703-27576442c99d?w=400&h=200&fit=crop",
    "Turkey": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=200&fit=crop"
  };
  
  return imageMap[countryName] || null;
};

console.log('🧪 Testing backend country names against our image mapping:\n');

let missingCount = 0;
let totalCount = 0;

Object.entries(backendCountryNames).forEach(([code, countryName]) => {
  totalCount++;
  const hasImage = getCountryImage(countryName);
  const status = hasImage ? '✅' : '❌';
  
  if (!hasImage) {
    missingCount++;
  }
  
  console.log(`${status} ${code}: "${countryName}" ${hasImage ? 'HAS IMAGE' : 'MISSING IMAGE'}`);
});

console.log(`\n📊 Summary: ${totalCount - missingCount}/${totalCount} countries have images`);
console.log(`Coverage: ${Math.round((totalCount - missingCount) / totalCount * 100)}%`);

if (missingCount === 0) {
  console.log('\n🎉 Perfect! All backend country names have corresponding images!');
  console.log('✨ This means France, Croatia, Belgium, and Romania should definitely have images.');
  console.log('🔍 The issue is likely a browser cache or component re-rendering issue.');
  console.log('\n💡 Suggested fixes:');
  console.log('   1. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)');
  console.log('   2. Clear browser cache and cookies');
  console.log('   3. Try incognito/private browsing mode');
  console.log('   4. Check browser developer console for any image loading errors');
} else {
  console.log(`\n🔧 Found ${missingCount} countries without images`);
}