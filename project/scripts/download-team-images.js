/**
 * Script to download/generate team avatar images
 * Run with: node scripts/download-team-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Team member data with colors matching descriptions
const teamMembers = [
  {
    name: 'chris',
    displayName: 'Chris',
    role: 'CEO',
    color: '1e3a8a', // Navy blue
    initials: 'C',
    isPNG: false
  },
  {
    name: 'charlotte',
    displayName: 'Charlotte',
    role: 'CHRO',
    color: '7c3aed', // Purple
    initials: 'CH',
    isPNG: false
  },
  {
    name: 'alex',
    displayName: 'Alex',
    role: 'Team Member',
    color: '059669', // Green
    initials: 'A',
    isPNG: false
  },
  {
    name: 'devin',
    displayName: 'Devin',
    role: 'Team Member',
    color: 'dc2626', // Red
    initials: 'D',
    isPNG: false
  },
  {
    name: 'jake',
    displayName: 'Jake',
    role: 'CTO',
    color: 'ea580c', // Orange
    initials: 'J',
    isPNG: false
  },
  {
    name: 'mrgyb-ai',
    displayName: 'MR.GYB AI',
    role: 'AI Agent',
    color: '0891b2', // Cyan
    initials: 'MG',
    isPNG: true
  }
];

// Create directory if it doesn't exist
const teamDir = path.join(__dirname, '..', 'public', 'images', 'team');
if (!fs.existsSync(teamDir)) {
  fs.mkdirSync(teamDir, { recursive: true });
  console.log(`Created directory: ${teamDir}`);
}

/**
 * Download avatar from UI Avatars API
 */
async function downloadAvatar(member, size = 512) {
  const extension = member.isPNG ? 'png' : 'jpg';
  const filename = `${member.name}.${extension}`;
  const filepath = path.join(teamDir, filename);

  // UI Avatars API URL
  const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.displayName)}&size=${size}&background=${member.color}&color=fff&bold=true&font-size=0.4`;

  try {
    console.log(`Downloading ${filename}...`);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 30000
    });

    // Save the image
    fs.writeFileSync(filepath, response.data);
    
    const sizeKB = (response.data.length / 1024).toFixed(2);
    console.log(`✓ Saved ${filename} (${sizeKB} KB)`);
    return true;
  } catch (error) {
    console.error(`✗ Error downloading ${filename}:`, error.message);
    return false;
  }
}

/**
 * Generate all team avatars
 */
async function generateAllAvatars() {
  console.log('Generating team avatar images...\n');
  console.log('Using UI Avatars API (https://ui-avatars.com)\n');

  let successCount = 0;
  for (const member of teamMembers) {
    const success = await downloadAvatar(member);
    if (success) successCount++;
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  if (successCount === teamMembers.length) {
    console.log(`✅ Successfully generated all ${successCount} team avatars!`);
    console.log(`\nLocation: ${teamDir}`);
    console.log('\nFiles created:');
    teamMembers.forEach(m => {
      const ext = m.isPNG ? 'png' : 'jpg';
      console.log(`  - ${m.name}.${ext}`);
    });
  } else {
    console.log(`⚠️  Generated ${successCount} out of ${teamMembers.length} avatars`);
    console.log('Some images may have failed. Please try again.');
  }
  console.log('='.repeat(50));
}

// Run the script
generateAllAvatars().catch(console.error);

