/**
 * Script to verify team images are present and correctly named
 * Run with: node scripts/verify-team-images.js
 */

const fs = require('fs');
const path = require('path');

const teamDir = path.join(__dirname, '..', 'public', 'images', 'team');
const requiredFiles = [
  'chris.jpg',
  'charlotte.jpg',
  'alex.jpg',
  'devin.jpg',
  'jake.jpg',
  'mrgyb-ai.png'
];

console.log('Verifying team images...\n');
console.log(`Directory: ${teamDir}\n`);

let allPresent = true;
const presentFiles = [];
const missingFiles = [];

requiredFiles.forEach(filename => {
  const filepath = path.join(teamDir, filename);
  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    presentFiles.push({ filename, size: sizeKB });
    console.log(`✓ ${filename} (${sizeKB} KB)`);
  } else {
    missingFiles.push(filename);
    console.log(`✗ ${filename} - MISSING`);
    allPresent = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPresent) {
  console.log('✅ All team images are present!');
  console.log(`\nTotal files: ${presentFiles.length}`);
  const totalSize = presentFiles.reduce((sum, file) => sum + parseFloat(file.size), 0);
  console.log(`Total size: ${totalSize.toFixed(2)} KB`);
} else {
  console.log('❌ Some images are missing:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
  console.log(`\nPlease add the missing images to: ${teamDir}`);
}

console.log('\n' + '='.repeat(50));

