# Team Images Directory

Place the team member avatar images in this directory with the following exact filenames:

## Required Files:

1. **chris.jpg** - CEO (Professional headshot)
2. **charlotte.jpg** - CHRO (Professional headshot)  
3. **alex.jpg** - Team Member (Professional headshot)
4. **devin.jpg** - Team Member (Professional headshot)
5. **jake.jpg** - CTO (Professional headshot)
6. **mrgyb-ai.png** - AI Agent (Illustration/logo with transparent background)

## Image Specifications:

- **Size:** 512×512 pixels (square format)
- **Format:** JPG for photos, PNG for MR.GYB AI (to preserve transparency)
- **Optimization:** Compress to ~50-100KB for web performance
- **Quality:** High quality, professional headshots

## How to Add Images:

1. Save/download your images
2. Ensure they're square (512×512 recommended)
3. Rename them to match the filenames above exactly
4. Place them in this directory: `project/public/images/team/`

## Quick Image Processing (if needed):

```bash
# Using ImageMagick to resize and optimize
convert input.jpg -resize 512x512^ -gravity center -extent 512x512 -quality 85 chris.jpg
```

