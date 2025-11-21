/**
 * Script to generate professional team avatar images
 * Uses DiceBear API for better quality avatars
 * Run with: node scripts/generate-professional-avatars.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Team member data with professional styling
const teamMembers = [
  {
    name: 'chris',
    displayName: 'Chris',
    role: 'CEO',
    seed: 'chris-ceo',
    style: 'avataaars', // Professional avatar style
    backgroundColor: '1e3a8a', // Navy blue
    isPNG: false
  },
  {
    name: 'charlotte',
    displayName: 'Charlotte',
    role: 'CHRO',
    seed: 'charlotte-chro',
    style: 'avataaars',
    backgroundColor: '7c3aed', // Purple
    isPNG: false
  },
  {
    name: 'alex',
    displayName: 'Alex',
    role: 'Team Member',
    seed: 'alex-team',
    style: 'avataaars',
    backgroundColor: '059669', // Green
    isPNG: false
  },
  {
    name: 'devin',
    displayName: 'Devin',
    role: 'Team Member',
    seed: 'devin-team',
    style: 'avataaars',
    backgroundColor: 'dc2626', // Red
    isPNG: false
  },
  {
    name: 'jake',
    displayName: 'Jake',
    role: 'CTO',
    seed: 'jake-cto',
    style: 'avataaars',
    backgroundColor: 'ea580c', // Orange
    isPNG: false
  },
  {
    name: 'mrgyb-ai',
    displayName: 'MR.GYB AI',
    role: 'AI Agent',
    seed: 'mrgyb-ai',
    style: 'bottts', // Robot style for AI
    backgroundColor: '0891b2', // Cyan
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
 * Download avatar from DiceBear API (better quality)
 */
async function downloadDiceBearAvatar(member, size = 512) {
  const extension = member.isPNG ? 'png' : 'jpg';
  const filename = `${member.name}.${extension}`;
  const filepath = path.join(teamDir, filename);

  // DiceBear API URL - professional avatar style
  const baseUrl = 'https://api.dicebear.com/7.x';
  const url = `${baseUrl}/${member.style}/svg?seed=${member.seed}&backgroundColor=${member.backgroundColor}&size=${size}`;

  try {
    console.log(`Generating ${filename}...`);
    
    // First get SVG
    const svgResponse = await axios({
      url,
      method: 'GET',
      responseType: 'text',
      timeout: 30000
    });

    // For JPG, we need to convert SVG to raster
    // For now, save as SVG and provide conversion instructions
    if (member.isPNG) {
      // For PNG, we can use a different endpoint or convert
      const pngUrl = url.replace('/svg', '/png');
      const response = await axios({
        url: pngUrl,
        method: 'GET',
        responseType: 'arraybuffer',
        timeout: 30000
      });
      fs.writeFileSync(filepath, response.data);
      const sizeKB = (response.data.length / 1024).toFixed(2);
      console.log(`✓ Saved ${filename} (${sizeKB} KB)`);
    } else {
      // For JPG, save SVG first, then we'll convert
      const svgPath = filepath.replace('.jpg', '.svg');
      fs.writeFileSync(svgPath, svgResponse.data);
      
      // Try to get PNG version and convert
      const pngUrl = url.replace('/svg', '/png');
      try {
        const pngResponse = await axios({
          url: pngUrl,
          method: 'GET',
          responseType: 'arraybuffer',
          timeout: 30000
        });
        fs.writeFileSync(filepath, pngResponse.data);
        const sizeKB = (pngResponse.data.length / 1024).toFixed(2);
        console.log(`✓ Saved ${filename} (${sizeKB} KB)`);
      } catch (pngError) {
        // Fallback: use UI Avatars if DiceBear PNG fails
        console.log(`  Falling back to UI Avatars for ${filename}...`);
        const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.displayName)}&size=${size}&background=${member.backgroundColor}&color=fff&bold=true`;
        const fallbackResponse = await axios({
          url: uiAvatarUrl,
          method: 'GET',
          responseType: 'arraybuffer',
          timeout: 30000
        });
        fs.writeFileSync(filepath, fallbackResponse.data);
        const sizeKB = (fallbackResponse.data.length / 1024).toFixed(2);
        console.log(`✓ Saved ${filename} (${sizeKB} KB) - using UI Avatars`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`✗ Error generating ${filename}:`, error.message);
    // Fallback to UI Avatars
    try {
      console.log(`  Trying UI Avatars fallback for ${filename}...`);
      const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.displayName)}&size=${size}&background=${member.backgroundColor}&color=fff&bold=true`;
      const fallbackResponse = await axios({
        url: uiAvatarUrl,
        method: 'GET',
        responseType: 'arraybuffer',
        timeout: 30000
      });
      fs.writeFileSync(filepath, fallbackResponse.data);
      const sizeKB = (fallbackResponse.data.length / 1024).toFixed(2);
      console.log(`✓ Saved ${filename} (${sizeKB} KB) - using UI Avatars fallback`);
      return true;
    } catch (fallbackError) {
      console.error(`✗ Fallback also failed for ${filename}`);
      return false;
    }
  }
}

/**
 * Generate all team avatars
 */
async function generateAllAvatars() {
  console.log('Generating professional team avatar images...\n');
  console.log('Using DiceBear API (https://dicebear.com) with fallback to UI Avatars\n');

  let successCount = 0;
  for (const member of teamMembers) {
    const success = await downloadDiceBearAvatar(member);
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

