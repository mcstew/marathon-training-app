# Public Assets for Web

These files are copied to the `dist` folder during web builds.

## Required Assets (TODO: Create these)

### OG Image (`og-image.png`)
- Size: 1200x630 pixels
- Used for social media sharing (Facebook, Twitter, LinkedIn)
- Should include:
  - App name "Marathon Training Plan"
  - Tagline or key value proposition
  - Visual representation of the app/running
  - Brand colors (#2563EB blue, #F8FAFC background)

### App Icons
- `apple-touch-icon.png` - 180x180 pixels (for iOS home screen)
- `icon-192.png` - 192x192 pixels (for PWA)
- `icon-512.png` - 512x512 pixels (for PWA splash)
- `favicon-32x32.png` - 32x32 pixels
- `favicon-16x16.png` - 16x16 pixels

## Already Created
- `manifest.json` - PWA manifest
- `robots.txt` - Search engine crawling rules
- `sitemap.xml` - Site structure for SEO

## Build Command

```bash
npm run build:web
```

This runs `expo export --platform web` followed by `scripts/enhance-seo.js` which:
1. Injects additional SEO meta tags
2. Adds structured data (JSON-LD)
3. Copies public files to dist
