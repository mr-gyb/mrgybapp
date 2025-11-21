/**
 * Advanced script to generate team avatar images using sharp
 * Run with: npm install sharp && node scripts/generate-team-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Team member data with colors
const teamMembers = [
  { name: 'chris', role: 'CEO', color: '#1e3a8a', initials: 'C' },
  { name: 'charlotte', role: 'CHRO', color: '#7c3aed', initials: 'CH' },
  { name: 'alex', role: 'Team Member', color: '#059669', initials: 'A' },
  { name: 'devin', role: 'Team Member', color: '#dc2626', initials: 'D' },
  { name: 'jake', role: 'CTO', color: '#ea580c', initials: 'J' },
  { name: 'mrgyb-ai', role: 'AI Agent', color: '#0891b2', initials: 'MG', isPNG: true }
];

// Create directory if it doesn't exist
const teamDir = path.join(__dirname, '..', 'public', 'images', 'team');
if (!fs.existsSync(teamDir)) {
  fs.mkdirSync(teamDir, { recursive: true });
  console.log(`Created directory: ${teamDir}`);
}

async function generateImage(member, size = 512) {
  const extension = member.isPNG ? 'png' : 'jpg';
  const filename = `${member.name}.${extension}`;
  const filepath = path.join(teamDir, filename);
  
  // Create SVG with gradient background and initials
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${member.color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${member.color}dd;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)"/>
      <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="${size * 0.25}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${member.initials}</text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="${size * 0.1}" fill="rgba(255,255,255,0.9)" text-anchor="middle" dominant-baseline="central">${member.role}</text>
    </svg>
  `;
  
  try {
    if (member.isPNG) {
      await sharp(Buffer.from(svg))
        .png()
        .resize(size, size)
        .toFile(filepath);
    } else {
      await sharp(Buffer.from(svg))
        .jpeg({ quality: 90 })
        .resize(size, size)
        .toFile(filepath);
    }
    console.log(`✓ Generated: ${filename}`);
  } catch (error) {
    console.error(`✗ Error generating ${filename}:`, error.message);
  }
}

async function generateAll() {
  console.log('Generating team avatar images...\n');
  
  for (const member of teamMembers) {
    await generateImage(member);
  }
  
  console.log('\n✅ All images generated successfully!');
  console.log(`Location: ${teamDir}`);
}

// Run if sharp is available
try {
  require.resolve('sharp');
  generateAll().catch(console.error);
} else {
  console.log('Sharp not installed. Install it with: npm install sharp');
  console.log('Or use the simpler generate-team-placeholders.js script');
}

