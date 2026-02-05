# Icon Generation Guide

## Quick Icon Generation

Use one of these tools to generate all PWA icon sizes from a single source image:

### Option 1: PWA Asset Generator (Recommended)
```bash
npx @vite-pwa/assets-generator --preset minimal public/logo.svg public/icons
```

### Option 2: Real Favicon Generator
Visit: https://realfavicongenerator.net/
- Upload your logo (SVG or PNG, min 512x512)
- Configure for iOS, Android, Windows
- Download and extract to `/public/icons/`

### Option 3: Manual with ImageMagick
```bash
# Install ImageMagick
brew install imagemagick  # macOS
sudo apt install imagemagick  # Linux

# Generate all sizes from source
convert logo.png -resize 72x72 public/icons/icon-72x72.png
convert logo.png -resize 96x96 public/icons/icon-96x96.png
convert logo.png -resize 128x128 public/icons/icon-128x128.png
convert logo.png -resize 144x144 public/icons/icon-144x144.png
convert logo.png -resize 152x152 public/icons/icon-152x152.png
convert logo.png -resize 192x192 public/icons/icon-192x192.png
convert logo.png -resize 384x384 public/icons/icon-384x384.png
convert logo.png -resize 512x512 public/icons/icon-512x512.png
```

## Required Icon Sizes

| Size | Purpose |
|------|---------|
| 72x72 | Chrome |
| 96x96 | Chrome, Edge |
| 128x128 | Chrome Web Store |
| 144x144 | Windows |
| 152x152 | iOS |
| 192x192 | Android Chrome, PWA manifest |
| 384x384 | Android splash screen |
| 512x512 | Android splash screen, PWA manifest |

## Placeholder Icons (For Testing)

If you don't have icons yet, create simple colored squares:

```bash
# Create icons directory
mkdir -p public/icons

# Generate placeholder icons with ImageMagick
for size in 72 96 128 144 152 192 384 512; do
  convert -size ${size}x${size} xc:#10b981 \
    -font Arial -pointsize $((size/4)) \
    -fill white -gravity center \
    -annotate +0+0 "PG" \
    public/icons/icon-${size}x${size}.png
done
```

Or use online tool: https://placeholder.com/ to download colored squares.

## Icon Design Best Practices

1. **Simple Design**: Icons are displayed at small sizes (16x16 to 192x192)
2. **Clear Logo**: Should be recognizable even at 72x72
3. **Safe Zone**: Keep important elements in center 80% of canvas
4. **Solid Background**: Avoid transparency for splash screens
5. **High Contrast**: Works in both light and dark modes
6. **Square Aspect**: 1:1 ratio (512x512 source recommended)

## Testing Icons

```bash
# Build the project
npm run build

# Start production server
npm start

# Test PWA
1. Open Chrome DevTools
2. Go to Application tab
3. Check "Manifest" section
4. Verify all icons load correctly
5. Test "Add to Home Screen"
```

## Example: Project Goose Logo

Source file should be placed at `/public/logo.svg` or `/public/logo.png`

Suggested design:
- Green (#10b981) background
- White goose icon or "PG" text
- Clean, modern, minimal

## Current Status

⚠️ **REQUIRED**: Icons not yet generated
📝 **TODO**: 
1. Create or provide source logo (SVG or PNG, 512x512+)
2. Run icon generation script
3. Verify icons in `/public/icons/`
4. Test PWA installation on mobile device

## After Generation

Once icons are generated, verify in:
- `/public/icons/icon-72x72.png`
- `/public/icons/icon-96x96.png`
- `/public/icons/icon-128x128.png`
- `/public/icons/icon-144x144.png`
- `/public/icons/icon-152x152.png`
- `/public/icons/icon-192x192.png`
- `/public/icons/icon-384x384.png`
- `/public/icons/icon-512x512.png`

Then test the PWA:
```bash
npm run build
npm start
# Open https://localhost:3000 in Chrome
# Check for "Install" prompt
```
