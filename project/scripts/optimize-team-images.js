/**
 * Script to optimize team images (compress and resize if needed)
 * Note: This requires sharp library. Install with: npm install sharp
 * Run with: node scripts/optimize-team-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const teamDir = path.join(__dirname, '..', 'public', 'images', 'team');

// Check if sharp is available
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (error) {
  console.log('⚠️  Sharp library not installed.');
  console.log('   Install it with: npm install sharp');
  console.log('   Or images will be used as-is (they may be large).\n');
  process.exit(0);
}

const targetSize = 512; // 512x512 pixels
const jpgQuality = 85;
const pngQuality = 90;

async function optimizeImage(filename) {
  const filepath = path.join(teamDir, filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  ${filename} not found, skipping...`);
    return;
  }

  const stats = fs.statSync(filepath);
  const originalSize = stats.size;
  const originalSizeKB = (originalSize / 1024).toFixed(2);

  try {
    const isPNG = filename.endsWith('.png');
    const outputPath = path.join(teamDir, `optimized_${filename}`);
    
    let image = sharp(filepath)
      .resize(targetSize, targetSize, {
        fit: 'cover',
        position: 'center'
      });

    if (isPNG) {
      image = image.png({ quality: pngQuality, compressionLevel: 9 });
    } else {
      image = image.jpeg({ quality: jpgQuality, mozjpeg: true });
    }

    await image.toFile(outputPath);

    const newStats = fs.statSync(outputPath);
    const newSize = newStats.size;
    const newSizeKB = (newSize / 1024).toFixed(2);
    const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

    console.log(`✓ ${filename}`);
    console.log(`  ${originalSizeKB} KB → ${newSizeKB} KB (${savings}% smaller)`);

    // Replace original with optimized
    fs.renameSync(outputPath, filepath);
  } catch (error) {
    console.error(`✗ Error optimizing ${filename}:`, error.message);
  }
}

async function optimizeAll() {
  console.log('Optimizing team images...\n');
  console.log(`Target size: ${targetSize}x${targetSize} pixels\n`);

  const files = fs.readdirSync(teamDir)
    .filter(file => (file.endsWith('.jpg') || file.endsWith('.png')) && !file.startsWith('.'));

  for (const file of files) {
    await optimizeImage(file);
  }

  console.log('\n✅ Optimization complete!');
}

optimizeAll().catch(console.error);

