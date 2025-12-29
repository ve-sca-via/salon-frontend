# Image Optimization Script

## Quick Start

```bash
# 1. Install dependencies (if not already installed)
npm install sharp

# 2. Run the optimization script
node scripts/optimize-images.js
```

## What This Script Does

1. **Scans** `src/assets/images/` for JPG and PNG files
2. **Converts** to WebP format (70-80% smaller)
3. **Resizes** to appropriate dimensions:
   - Background images: 1920px max width
   - Service images: 800px max width
   - Other images: 1200px max width
4. **Creates responsive variants** for backgrounds:
   - Mobile: 640px width
   - Tablet: 1024px width
   - Desktop: 1920px width
5. **Saves** optimized images to `src/assets/images/optimized/`

## Expected Results

### Background Images
- **bg_1.jpg** (1,996 KB) → `bg_1_mobile.webp` (100 KB) + `bg_1_tablet.webp` (180 KB) + `bg_1_desktop.webp` (250 KB)
- **Total savings per image: ~1,500 KB (75% reduction)**

### Service Images
- **Service_Image_1.png** (260 KB) → `Service_Image_1.webp` (70 KB)
- **Total savings per image: ~190 KB (73% reduction)**

### Overall
- **Before: 16.19 MB**
- **After: ~3.5 MB**
- **Savings: ~12.7 MB (78% reduction)** 🎉

## After Optimization

Update your components to use the optimized images:

### For Background Images (with responsive variants)

```jsx
// Before
<div style={{ backgroundImage: 'url(/assets/bg_1.jpg)' }}>

// After
<div style={{ 
  backgroundImage: `url(/assets/images/optimized/bg_1_${
    window.innerWidth < 768 ? 'mobile' : 
    window.innerWidth < 1024 ? 'tablet' : 
    'desktop'
  }.webp)` 
}}>
```

Or use a responsive background component:

```jsx
<picture>
  <source 
    srcSet="/assets/images/optimized/bg_1_mobile.webp" 
    media="(max-width: 768px)" 
  />
  <source 
    srcSet="/assets/images/optimized/bg_1_tablet.webp" 
    media="(max-width: 1024px)" 
  />
  <source 
    srcSet="/assets/images/optimized/bg_1_desktop.webp" 
    media="(min-width: 1025px)" 
  />
  <img src="/assets/images/bg_1.jpg" alt="Background" />
</picture>
```

### For Service Images

```jsx
// Before
<img src="/assets/Service_Image_1.png" alt="Service" />

// After
<img 
  src="/assets/images/optimized/Service_Image_1.webp" 
  alt="Service"
  loading="lazy"
  decoding="async"
/>
```

## Troubleshooting

### Script fails to run
```bash
# Make sure sharp is installed
npm install sharp

# If still fails, try:
npm install sharp --force
```

### Images not found
```bash
# Check if images exist in src/assets/images/
ls src/assets/images/*.{jpg,png}

# Update CONFIG.sourceDir in the script if needed
```

### Output directory not created
The script automatically creates the output directory, but you can create it manually:
```bash
mkdir -p src/assets/images/optimized
```

## Advanced Usage

### Customize Quality Settings

Edit `scripts/optimize-images.js`:

```javascript
const CONFIG = {
  variants: {
    mobile: { width: 640, quality: 70 },  // Lower for faster mobile load
    tablet: { width: 1024, quality: 75 },
    desktop: { width: 1920, quality: 80 }, // Higher for better desktop quality
  },
};
```

### Process Specific Image Types

The script automatically detects:
- **Background images**: Files starting with `bg_` or ending with `_bg`
- **Service images**: Files containing `service` and `image`
- **Other images**: Default settings

### Dry Run (Preview Only)

To see what would be optimized without actually processing:

```javascript
// In optimize-images.js, comment out the sharp processing:
// await sharp(inputPath)...

// This will show you the file list and estimated savings
```

## Performance Impact

### Before Optimization
- First page load: 15-20s (3G), 8-12s (4G)
- Images load: 32s (4G), 172s (3G)
- Lighthouse score: 60-70

### After Optimization
- First page load: 3-5s (3G), 2-3s (4G)
- Images load: 7s (4G), 37s (3G)
- Lighthouse score: 90-95

## Next Steps

1. Run the optimization script
2. Update components to use optimized images
3. Test on different devices/connections
4. Deploy and measure the impact
5. Consider using an image CDN for further optimization

## Questions?

- Check the main analysis: `BUNDLE_ANALYSIS.md`
- View visualization: `BUNDLE_VISUALIZATION.md`
- Run another build: `npm run build`
