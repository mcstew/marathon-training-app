# Marathon Training Plan - App Icon Specification

## Quick Answer: Yes, One Design Works for All

Yes! You create **one master 1024×1024 icon** and export it at different sizes. The same design is used for:
- iOS Home Screen (180×180)
- App Store (1024×1024)
- PWA icons (192×192, 512×512)
- Apple Touch Icon (180×180)
- Favicon (various sizes)

Apple automatically applies rounded corners ("squircle" mask ~20% radius), so you provide a **flat square PNG**.

---

## Required Exports

From your single 1024×1024 master, export these sizes:

| File | Size | Purpose |
|------|------|---------|
| `icon-1024.png` | 1024×1024 | App Store, master file |
| `icon-512.png` | 512×512 | PWA splash/install |
| `icon-192.png` | 192×192 | PWA manifest |
| `apple-touch-icon.png` | 180×180 | iOS Safari "Add to Home" |
| `favicon-32x32.png` | 32×32 | Browser tab |
| `favicon-16x16.png` | 16×16 | Browser tab (small) |
| `favicon.ico` | 64×64 | Legacy browser support |

---

## Design Concept: Marathon Training Plan

### Visual Direction
A **running/finish line trophy** concept that's instantly recognizable and works at 16px.

### Recommended Design: Finish Line Runner

**Primary Element:** Stylized runner silhouette crossing a finish line ribbon
- Simple, bold silhouette (no fine details)
- Dynamic forward motion pose
- Finish line ribbon as accent

**Alternative Concept:** Trophy + Calendar
- Trophy icon (achievement/goal)
- Small calendar/checkmark element (training progress)
- This is what the app currently uses in the welcome screen

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#2563EB` | Main icon element |
| Light Blue | `#DBEAFE` | Background or accent |
| White | `#FFFFFF` | Contrast elements |
| Dark Navy | `#1E3A8A` | Optional depth |

**Recommendation:** Blue icon element on white/light background for maximum visibility and recognition.

### Design Principles (Per Apple HIG)

1. **Single Focus Point**
   - One central, recognizable element
   - No complex scenes or multiple objects
   - Should be identifiable in 1 second

2. **Bold & Simple**
   - Works at 29×29 px (smallest iOS display)
   - No fine lines, gradients, or small details
   - High contrast between foreground and background

3. **No Text**
   - Avoid text entirely (not legible at small sizes)
   - The icon should work without the app name

4. **Safe Zone**
   - Keep critical elements away from edges
   - ~10% padding from each edge recommended
   - Apple's squircle mask will clip corners

5. **Flat Design**
   - No drop shadows (Apple adds automatically)
   - No rounded corners (Apple adds automatically)
   - No gloss effects
   - Provide a flat, square PNG

---

## Technical Requirements

### Format
- **PNG** format
- **Square** (1:1 aspect ratio)
- **Fully opaque** (no transparency)
- **sRGB** color space (or Display P3 with sRGB fallback)

### What NOT to Include
- ❌ Rounded corners (Apple applies these)
- ❌ Drop shadows (Apple applies these)
- ❌ Transparency/alpha channel
- ❌ Text smaller than 25% of icon width
- ❌ Photographs or complex imagery
- ❌ Screenshots of the app UI

---

## Suggested Icon Concepts (Ranked)

### Option A: Trophy (Current Theme) ⭐ Recommended
```
┌─────────────────┐
│                 │
│     🏆         │  (Stylized trophy)
│    ════        │  (Base/pedestal)
│                 │
└─────────────────┘
```
- Matches app's welcome screen
- Conveys achievement/goal
- Simple silhouette works at all sizes
- Blue trophy on white/light blue background

### Option B: Runner Silhouette
```
┌─────────────────┐
│                 │
│      🏃        │  (Dynamic runner pose)
│    ────────    │  (Ground line or path)
│                 │
└─────────────────┘
```
- Instantly communicates "running"
- Classic, timeless imagery
- May be too generic/common

### Option C: Calendar + Checkmark
```
┌─────────────────┐
│  ┌───────────┐  │
│  │ 18 │ ✓   │  │  (Weeks + completion)
│  └───────────┘  │
│                 │
└─────────────────┘
```
- Emphasizes the planning/tracking aspect
- "18" could reference the 18-week program
- More unique but less immediately "running"

### Option D: Road/Path to Finish
```
┌─────────────────┐
│        ▲        │  (Finish line flag)
│       /│\       │
│    ═══════     │  (Road stretching forward)
│                 │
└─────────────────┘
```
- Journey/progress metaphor
- Finish line = goal achievement
- Clean, minimal

---

## Recommended Final Design

**Trophy icon** (Option A) because:
1. Already established in the app's UI
2. Universal symbol for achievement
3. Works great at small sizes
4. Not overused in running apps (most use runner silhouettes)
5. Conveys the goal-oriented nature of marathon training

### Execution Notes
- Bold, geometric trophy shape (not realistic)
- Blue (#2563EB) trophy on white (#FFFFFF) background
- Optional: Light blue (#DBEAFE) circle behind trophy for depth
- Keep trophy centered with ~15% padding from edges

---

## File Delivery Checklist

Place these in `/public/` folder:

```
public/
├── icon-1024.png       # Master (App Store)
├── icon-512.png        # PWA
├── icon-192.png        # PWA
├── apple-touch-icon.png # 180×180
├── favicon-32x32.png
├── favicon-16x16.png
├── favicon.ico
└── og-image.png        # 1200×630 (social sharing - different design)
```

---

## OG Image (Social Sharing) - Separate Design

The Open Graph image is **different** from the app icon:
- Size: 1200×630 pixels (landscape)
- Can include: App name, tagline, icon, preview
- Used when sharing links on social media

**Suggested OG Image Layout:**
```
┌──────────────────────────────────────────────────┐
│                                                   │
│   🏆  Marathon Training Plan                     │
│                                                   │
│   Free 18-Week Training Schedules                │
│   Personalized • Offline • Track Progress        │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

## Resources

- [Apple HIG - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [iOS App Icon Sizes Guide](https://splitmetrics.com/blog/guide-to-mobile-icons/)
- [Apple App Icon Guidelines](https://asolytics.pro/blog/post/apple-app-icon-guidelines-dimensions-requirements-design-rules-and-mistakes-to-avoid/)

---

*Created: January 2025*
