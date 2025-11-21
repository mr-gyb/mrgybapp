# Team Images Setup Guide

This guide explains how to generate or obtain the team avatar images needed for the GYB Team section.

## Required Images

Place these files in `project/public/images/team/`:
- `chris.jpg` (CEO)
- `charlotte.jpg` (CHRO)
- `alex.jpg` (Team Member)
- `devin.jpg` (Team Member)
- `jake.jpg` (CTO)
- `mrgyb-ai.png` (AI Agent)

**Recommended size:** 512×512 pixels, square format

## Option 1: Use Images from Slack (Recommended)

If you have the original images from Slack:

1. Download the images from Slack
2. Ensure they're square (512×512 recommended)
3. Optimize and compress them:
   ```bash
   # Using ImageMagick (if installed)
   convert input.jpg -resize 512x512^ -gravity center -extent 512x512 -quality 85 chris.jpg
   ```
4. Place them in `project/public/images/team/`

## Option 2: Generate Placeholder Images (Quick Testing)

### Method A: Using the Simple Script (No Dependencies)

```bash
node scripts/generate-team-placeholders.js
```

This generates SVG placeholders. Convert them to JPG/PNG using:
- Online converter: https://cloudconvert.com/svg-to-jpg
- ImageMagick: `convert file.svg file.jpg`

### Method B: Using Sharp (Better Quality)

```bash
cd project
npm install sharp
node scripts/generate-team-images.js
```

This generates actual JPG/PNG files with gradient backgrounds and initials.

## Option 3: Use AI Image Generation

### Using DALL-E, Midjourney, or Stable Diffusion

1. **Prompt example:**
   ```
   Professional headshot portrait of [Name], [Role], business professional, 
   clean background, square format, 512x512, high quality
   ```

2. **For MR.GYB AI:**
   ```
   AI robot avatar, friendly, professional, tech company mascot, 
   square format, 512x512, transparent background PNG
   ```

3. Download and save with the correct filenames

## Option 4: Use Online Avatar Generators

- **UI Avatars:** https://ui-avatars.com/
  - URL format: `https://ui-avatars.com/api/?name=Chris&size=512&background=1e3a8a&color=fff&bold=true`
  - Download and save as `chris.jpg`

- **DiceBear Avatars:** https://dicebear.com/
  - Choose a style, customize, download

- **Avatar Maker:** https://avatarmaker.com/

## Option 5: Manual Photo Editing

1. Use photo editing software (Photoshop, GIMP, Canva)
2. Crop images to square (512×512)
3. Optimize for web (compress to ~50-100KB)
4. Save with correct filenames

## Image Optimization Tips

```bash
# Using ImageMagick to optimize
convert input.jpg -resize 512x512 -quality 85 -strip output.jpg

# Using sharp (Node.js)
const sharp = require('sharp');
await sharp('input.jpg')
  .resize(512, 512)
  .jpeg({ quality: 85 })
  .toFile('output.jpg');
```

## Verification

After adding images, verify they work:

1. Start the dev server: `npm run dev`
2. Navigate to the GYB Team section
3. Check that all images load correctly
4. Test fallback initials by temporarily renaming one image

## Fallback Behavior

If an image fails to load, the component will automatically:
- Show initials on a gradient background
- Use the member's name to generate initials (e.g., "Chris" → "C", "Charlotte" → "CH")

