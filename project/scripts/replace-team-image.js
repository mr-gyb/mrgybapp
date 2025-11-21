/**
 * Script to replace a team member image
 * Usage: node scripts/replace-team-image.js <member-name> <image-url-or-path>
 * Example: node scripts/replace-team-image.js chris https://example.com/chris-photo.jpg
 * Or: node scripts/replace-team-image.js chris /path/to/local/image.jpg
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const teamDir = path.join(__dirname, '..', 'public', 'images', 'team');

async function replaceImage(memberName, imageSource) {
  // Determine file extension
  const isPNG = memberName === 'mrgyb-ai';
  const extension = isPNG ? 'png' : 'jpg';
  const filename = `${memberName}.${extension}`;
  const filepath = path.join(teamDir, filename);

  console.log(`Replacing ${filename}...\n`);

  try {
    let imageBuffer;

    // Check if it's a URL or local file path
    if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
      // Download from URL
      console.log(`Downloading from URL: ${imageSource}`);
      const response = await axios({
        url: imageSource,
        method: 'GET',
        responseType: 'arraybuffer',
        timeout: 30000
      });
      imageBuffer = response.data;
    } else {
      // Read from local file
      console.log(`Reading from local file: ${imageSource}`);
      if (!fs.existsSync(imageSource)) {
        throw new Error(`File not found: ${imageSource}`);
      }
      imageBuffer = fs.readFileSync(imageSource);
    }

    // Backup existing file
    if (fs.existsSync(filepath)) {
      const backupPath = `${filepath}.backup`;
      fs.copyFileSync(filepath, backupPath);
      console.log(`✓ Backed up existing image to ${path.basename(backupPath)}`);
    }

    // Write new image
    fs.writeFileSync(filepath, imageBuffer);
    const sizeKB = (imageBuffer.length / 1024).toFixed(2);
    console.log(`✓ Successfully replaced ${filename} (${sizeKB} KB)`);
    console.log(`\nLocation: ${filepath}`);

    return true;
  } catch (error) {
    console.error(`✗ Error replacing image:`, error.message);
    return false;
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node scripts/replace-team-image.js <member-name> <image-url-or-path>');
  console.log('\nMember names: chris, charlotte, alex, devin, jake, mrgyb-ai');
  console.log('\nExamples:');
  console.log('  node scripts/replace-team-image.js chris https://example.com/chris.jpg');
  console.log('  node scripts/replace-team-image.js chris /path/to/chris-photo.jpg');
  process.exit(1);
}

const [memberName, imageSource] = args;
replaceImage(memberName, imageSource).catch(console.error);

