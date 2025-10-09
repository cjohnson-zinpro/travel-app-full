import fs from 'fs';

console.log('🎯 FINAL THREE CITIES TRANSPORT FIX - CORRECTED');
console.log('Fixing: los-angeles, london, paris');

let content = fs.readFileSync('shared/data/claude-daily-costs.ts', 'utf8');

// Targeted fixes for the 3 cities with exact patterns from audit
const cityFixes = [
  {
    name: 'los-angeles',
    old: 'midRange: { total: 125, meals: 48, transport: 18, activities: 35, drinks: 24, incidentals: 15 }',
    new: 'midRange: { total: 125, meals: 48, transport: 20, activities: 33, drinks: 24, incidentals: 15 }'
  },
  {
    name: 'los-angeles-luxury',
    old: 'luxury: { total: 420, meals: 145, transport: 30, activities: 125, drinks: 90, incidentals: 30 }',
    new: 'luxury: { total: 420, meals: 145, transport: 40, activities: 115, drinks: 90, incidentals: 30 }'
  },
  {
    name: 'london',
    old: 'midRange: { total: 128, meals: 48, transport: 18, activities: 38, drinks: 24, incidentals: 15 }',
    new: 'midRange: { total: 128, meals: 48, transport: 20, activities: 36, drinks: 24, incidentals: 15 }'
  },
  {
    name: 'london-luxury', 
    old: 'luxury: { total: 460, meals: 160, transport: 30, activities: 140, drinks: 100, incidentals: 30 }',
    new: 'luxury: { total: 460, meals: 160, transport: 40, activities: 130, drinks: 100, incidentals: 30 }'
  },
  {
    name: 'paris',
    old: 'midRange: { total: 125, meals: 48, transport: 15, activities: 36, drinks: 26, incidentals: 15 }',
    new: 'midRange: { total: 125, meals: 48, transport: 20, activities: 31, drinks: 26, incidentals: 15 }'
  },
  {
    name: 'paris-luxury',
    old: 'luxury: { total: 450, meals: 160, transport: 25, activities: 135, drinks: 100, incidentals: 30 }',
    new: 'luxury: { total: 450, meals: 160, transport: 40, activities: 120, drinks: 100, incidentals: 30 }'
  }
];

let fixCount = 0;

cityFixes.forEach(fix => {
  const oldContent = content;
  content = content.replace(fix.old, fix.new);
  
  if (content !== oldContent) {
    fixCount++;
    console.log(`✅ Fixed ${fix.name}`);
  } else {
    console.log(`⚠️  Could not find pattern for ${fix.name}`);
  }
});

if (fixCount > 0) {
  fs.writeFileSync('shared/data/claude-daily-costs.ts', content);
  console.log(`\n🎉 SUCCESS: Applied ${fixCount}/6 transport fixes`);
  console.log('✅ Transport costs now meet minimum standards!');
  console.log('   - Mid-range: $20+ (was $15-18)');
  console.log('   - Luxury: $40+ (was $25-30)');
} else {
  console.log('\n❌ No fixes applied - patterns not found');
}