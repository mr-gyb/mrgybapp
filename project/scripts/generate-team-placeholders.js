/**
 * Script to generate placeholder team avatar images
 * Run with: node scripts/generate-team-placeholders.js
 * 
 * Requires: npm install canvas (or use a different image generation library)
 */

const fs = require('fs');
const path = require('path');

// Team member data
const teamMembers = [
  { name: 'chris', role: 'CEO', color: '#1e3a8a' },
  { name: 'charlotte', role: 'CHRO', color: '#7c3aed' },
  { name: 'alex', role: 'Team Member', color: '#059669' },
  { name: 'devin', role: 'Team Member', color: '#dc2626' },
  { name: 'jake', role: 'CTO', color: '#ea580c' },
  { name: 'mrgyb-ai', role: 'AI Agent', color: '#0891b2', isPNG: true }
];

// Create directory if it doesn't exist
const teamDir = path.join(__dirname, '..', 'public', 'images', 'team');
if (!fs.existsSync(teamDir)) {
  fs.mkdirSync(teamDir, { recursive: true });
  console.log(`Created directory: ${teamDir}`);
}

// Simple SVG-based placeholder generator (no external dependencies)
function generateSVGPlaceholder(name, role, color, size = 512) {
  const initials = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
  
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color}dd;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
  <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="${size * 0.08}" fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="central">${role}</text>
</svg>`;
}

// Generate placeholder images
console.log('Generating placeholder team avatars...\n');

teamMembers.forEach(member => {
  const extension = member.isPNG ? 'png' : 'jpg';
  const filename = `${member.name}.${extension}`;
  const filepath = path.join(teamDir, filename);
  
  // For now, generate SVG placeholders
  // Note: To convert to JPG/PNG, you'd need a library like sharp or canvas
  const svgContent = generateSVGPlaceholder(member.name, member.role, member.color);
  
  // Save as SVG (you can convert these to JPG/PNG later)
  const svgPath = filepath.replace(/\.(jpg|png)$/, '.svg');
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✓ Generated: ${svgPath}`);
  
  console.log(`  Note: Convert ${svgPath} to ${filename} using an image converter`);
});

console.log('\n✅ Placeholder generation complete!');
console.log('\nTo convert SVG to JPG/PNG:');
console.log('1. Use an online converter: https://cloudconvert.com/svg-to-jpg');
console.log('2. Or use ImageMagick: convert file.svg file.jpg');
console.log('3. Or use sharp library: npm install sharp');

