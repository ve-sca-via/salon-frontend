# Image Optimization - Quick Reference Guide

## 🚀 Quick Start (30 seconds)

### Replace Standard Images
```jsx
// ❌ OLD WAY
<img src={image} alt="..." className="w-full h-64 object-cover" />

// ✅ NEW WAY
import OptimizedImage from '@/components/shared/OptimizedImage';
<OptimizedImage src={image} alt="..." className="w-full h-64" />
```

### Replace Background Images
```jsx
// ❌ OLD WAY
<div style={{ backgroundImage: `url(${bg})` }} className="h-96">
  <Content />
</div>

// ✅ NEW WAY
import BackgroundImage from '@/components/shared/BackgroundImage';
<BackgroundImage src={bg} className="h-96" overlay="gradient">
  <Content />
</BackgroundImage>
```

---

## 📖 Common Use Cases

### 1. Hero Images (Above the Fold)
```jsx
<OptimizedImage 
  src={heroImage}
  alt="Hero"
  priority={true}  // ⚡ Critical!
  className="w-full h-screen"
/>
```

### 2. Product/Salon Cards
```jsx
<OptimizedImage 
  src={salon.coverImage}
  alt={salon.name}
  className="w-full h-64"
  aspectRatio="16/9"
/>
```

### 3. Avatars/Thumbnails
```jsx
<OptimizedImage 
  src={user.avatar}
  alt={user.name}
  width={48}
  height={48}
  className="rounded-full"
  fallbackSrc="/default-avatar.svg"
/>
```

### 4. Gallery/Carousel
```jsx
{images.map((img, i) => (
  <OptimizedImage 
    key={i}
    src={img.url}
    alt={img.title}
    className="w-full h-80"
    priority={i === 0}  // Only first image
  />
))}
```

### 5. Background Sections
```jsx
<BackgroundImage 
  src={sectionBg}
  className="py-20"
  overlay="dark"  // or 'gradient', 'light', 'none'
>
  <h2>Section Content</h2>
</BackgroundImage>
```

---

## 🎛️ Props Reference

### OptimizedImage
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string | required | Image URL |
| `alt` | string | required | Alt text (accessibility) |
| `className` | string | '' | CSS classes |
| `priority` | boolean | false | Load immediately (no lazy) |
| `width` | number | auto | Fixed width |
| `height` | number | auto | Fixed height |
| `objectFit` | string | 'cover' | CSS object-fit value |
| `aspectRatio` | string | auto | CSS aspect-ratio (e.g., '16/9') |
| `placeholder` | string | 'blur' | 'blur' or 'none' |
| `fallbackSrc` | string | '/placeholder-image.svg' | Error fallback |
| `onLoad` | function | - | Callback when loaded |
| `onError` | function | - | Callback on error |

### BackgroundImage
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string | required | Image URL |
| `children` | node | required | Content to render |
| `className` | string | '' | CSS classes |
| `priority` | boolean | false | Load immediately |
| `overlay` | string | 'none' | 'gradient', 'dark', 'light', 'none' |

---

## ⚡ Performance Tips

### DO ✅
- Use `priority={true}` for hero/above-the-fold images
- Set proper `alt` text for accessibility
- Use `aspectRatio` to prevent layout shift
- Let other images lazy load (default)
- Use `fallbackSrc` for critical images

### DON'T ❌
- Set `priority={true}` on all images
- Skip alt text
- Use inline styles for dimensions
- Disable lazy loading unnecessarily
- Ignore loading states

---

## 🎯 When to Use What

| Scenario | Use |
|----------|-----|
| Hero section background | `<BackgroundImage priority={true}>` |
| Product/Salon card image | `<OptimizedImage>` (default) |
| Avatar/Profile picture | `<OptimizedImage width={} height={}>` |
| Gallery/Lightbox | `<OptimizedImage>` in loop |
| Banner with text overlay | `<BackgroundImage overlay="gradient">` |
| Icon/Logo | Regular `<img>` (SVG preferred) |

---

## 🐛 Common Issues

### Images not lazy loading?
```jsx
// ❌ Wrong
<OptimizedImage priority={true} />  // All images

// ✅ Correct
<OptimizedImage priority={true} />  // Only first/hero
<OptimizedImage />                   // Rest lazy load
```

### Layout shift on load?
```jsx
// ❌ Wrong
<OptimizedImage src={img} />

// ✅ Correct
<OptimizedImage 
  src={img}
  aspectRatio="16/9"  // Prevent shift
  className="w-full"
/>
```

### Images look blurry?
Check `vite.config.js`:
```javascript
jpg: { quality: 90 },  // Increase from 80
```

---

## 📊 Monitoring

### Check Lazy Loading
1. Open DevTools → Network tab
2. Filter by "Img"
3. Scroll page
4. Watch images load on scroll

### Check File Sizes
```bash
npm run build
# Look for "vite-plugin-image-optimizer" output
```

### Lighthouse Audit
```bash
lighthouse https://your-site.com --view
```

---

## 🔗 More Info
See `IMAGE_OPTIMIZATION_IMPLEMENTATION.md` for full documentation.
