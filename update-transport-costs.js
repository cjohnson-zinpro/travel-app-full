// AUTO-GENERATED TRANSPORT COST UPDATES
// This script updates transport costs for 0 cities with proper scaling

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function updateTransportCosts() {
  const claudeDataPath = path.join(__dirname, 'shared', 'data', 'claude-daily-costs.ts');
  let content = fs.readFileSync(claudeDataPath, 'utf8');
  
  console.log('🔄 UPDATING TRANSPORT COSTS FOR 0 CITIES\n');
  
  let updatesApplied = 0;

  
  fs.writeFileSync(claudeDataPath, content, 'utf8');
  console.log(`\n🎯 TRANSPORT COST UPDATE COMPLETE: ${updatesApplied} cities updated`);
}

updateTransportCosts();
