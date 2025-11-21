/**
 * Script to organize and rename team images to match expected filenames
 * Run with: node scripts/organize-team-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const teamDir = path.join(__dirname, '..', 'public', 'images', 'team');

// Mapping of current filenames to expected filenames
const imageMappings = [
  { current: 'chris.png', expected: 'chris.jpg' },
  { current: 'charlottee.png', expected: 'charlotte.jpg' }, // Handle typo
  { current: 'charlotte.png', expected: 'charlotte.jpg' },
  { current: 'alex.png', expected: 'alex.jpg' },
  { current: 'devin.png', expected: 'devin.jpg' },
  { current: 'jake.png', expected: 'jake.jpg' },
  { current: 'mrgyb.png', expected: 'mrgyb-ai.png' },
  // Keep mrgyb-ai.png as is
];

console.log('Organizing team images...\n');

// Get all PNG files
const files = fs.readdirSync(teamDir).filter(file => 
  file.endsWith('.png') && !file.startsWith('.')
);

console.log(`Found ${files.length} PNG files:\n${files.join('\n')}\n`);

// Process each mapping
let processed = 0;
let errors = [];

imageMappings.forEach(({ current, expected }) => {
  const currentPath = path.join(teamDir, current);
  const expectedPath = path.join(teamDir, expected);
  
  if (fs.existsSync(currentPath)) {
    try {
      // If expected file already exists, backup it first
      if (fs.existsSync(expectedPath) && current !== expected.replace('.jpg', '.png').replace('.png', '.png')) {
        const backupPath = `${expectedPath}.backup`;
        fs.copyFileSync(expectedPath, backupPath);
        console.log(`  Backed up existing ${expected} to ${path.basename(backupPath)}`);
      }
      
      // Copy/rename the file
      // For JPG files, we'll copy the PNG (browsers can display PNG as JPG)
      // Or we could convert, but for now just copy and rename extension
      if (expected.endsWith('.jpg') && current.endsWith('.png')) {
        // Copy PNG content but rename to .jpg (browsers handle this fine)
        fs.copyFileSync(currentPath, expectedPath);
        console.log(`✓ ${current} → ${expected}`);
      } else {
        // Direct rename
        fs.renameSync(currentPath, expectedPath);
        console.log(`✓ ${current} → ${expected}`);
      }
      processed++;
    } catch (error) {
      errors.push({ file: current, error: error.message });
      console.error(`✗ Error processing ${current}:`, error.message);
    }
  }
});

// Handle any remaining files
files.forEach(file => {
  const filePath = path.join(teamDir, file);
  // Skip if it's one we already processed or if it's mrgyb-ai.png
  if (file === 'mrgyb-ai.png') {
    console.log(`✓ Keeping ${file} as is`);
    return;
  }
  
  // Check if this file wasn't processed
  const wasProcessed = imageMappings.some(m => m.current === file);
  if (!wasProcessed && fs.existsSync(filePath)) {
    console.log(`  Note: ${file} was not mapped. Keeping as is.`);
  }
});

console.log('\n' + '='.repeat(50));
console.log(`✅ Processed ${processed} images`);
if (errors.length > 0) {
  console.log(`⚠️  ${errors.length} errors occurred`);
  errors.forEach(e => console.log(`   - ${e.file}: ${e.error}`));
}

// List final files
console.log('\nFinal team images:');
const finalFiles = fs.readdirSync(teamDir)
  .filter(file => (file.endsWith('.jpg') || file.endsWith('.png')) && !file.startsWith('.'));
finalFiles.forEach(file => {
  const stats = fs.statSync(path.join(teamDir, file));
  const sizeKB = (stats.size / 1024).toFixed(2);
  console.log(`  - ${file} (${sizeKB} KB)`);
});

console.log('='.repeat(50));

