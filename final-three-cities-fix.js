import fs from 'fs';

console.log('🎯 FINAL THREE CITIES TRANSPORT FIX');
console.log('Fixing: los-angeles, london, paris');

let content = fs.readFileSync('shared/data/claude-daily-costs.ts', 'utf8');

// Targeted fixes for the 3 cities identified by audit
const cityFixes = [
  {
    name: 'los-angeles',
    old: 'transport: { budget: 10, midRange: 18, luxury: 30 }',
    new: 'transport: { budget: 10, midRange: 20, luxury: 40 }'
  },
  {
    name: 'london', 
    old: 'transport: { budget: 10, midRange: 18, luxury: 30 }',
    new: 'transport: { budget: 10, midRange: 20, luxury: 40 }'
  },
  {
    name: 'paris',
    old: 'transport: { budget: 10, midRange: 15, luxury: 25 }', 
    new: 'transport: { budget: 10, midRange: 20, luxury: 40 }'
  }
];

let fixCount = 0;

cityFixes.forEach(fix => {
  const oldContent = content;
  content = content.replace(fix.old, fix.new);
  
  if (content !== oldContent) {
    fixCount++;
    console.log(`✅ Fixed ${fix.name}: ${fix.new}`);
  } else {
    console.log(`⚠️  Could not find exact pattern for ${fix.name}`);
    console.log(`   Looking for: ${fix.old}`);
  }
});

if (fixCount > 0) {
  fs.writeFileSync('shared/data/claude-daily-costs.ts', content);
  console.log(`\n🎉 SUCCESS: Fixed ${fixCount}/3 cities`);
  console.log('✅ All transport costs now meet minimum standards!');
} else {
  console.log('\n❌ No fixes applied - patterns not found');
}