/**
 * Image Optimization Utilities
 * 
 * Helper functions for image handling in the application
 */

/**
 * Generate srcSet string for responsive images
 * @param {string} baseUrl - Base URL of the image
 * @param {number[]} widths - Array of widths to generate
 * @returns {string} srcSet string
 */
export const generateSrcSet = (baseUrl, widths = [640, 768, 1024, 1280, 1536]) => {
  if (!baseUrl) return '';
  
  return widths
    .map((width) => `${baseUrl}?width=${width}&quality=80 ${width}w`)
    .join(', ');
};

/**
 * Get optimal image size based on container width
 * @param {number} containerWidth - Width of the container
 * @returns {string} sizes attribute value
 */
export const getImageSizes = (containerWidth) => {
  if (containerWidth <= 640) return '100vw';
  if (containerWidth <= 1024) return '50vw';
  return '33vw';
};

/**
 * Check if image URL is from CDN/Supabase (supports transformations)
 * @param {string} url - Image URL
 * @returns {boolean}
 */
export const supportsTransformations = (url) => {
  if (!url) return false;
  return url.includes('supabase.co') || 
         url.includes('cdn.') || 
         url.includes('cloudinary.com') ||
         url.includes('imgix.net');
};

/**
 * Apply image transformations to URL (for Supabase Storage)
 * @param {string} url - Original image URL
 * @param {object} options - Transformation options
 * @returns {string} Transformed URL
 */
export const transformImage = (url, options = {}) => {
  if (!url || !supportsTransformations(url)) return url;
  
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    resize = 'cover',
  } = options;
  
  const params = new URLSearchParams();
  if (width) params.append('width', width);
  if (height) params.append('height', height);
  params.append('quality', quality);
  params.append('format', format);
  params.append('resize', resize);
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
};

/**
 * Preload critical images
 * @param {string[]} urls - Array of image URLs to preload
 */
export const preloadImages = (urls) => {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Check if browser supports WebP
 * @returns {Promise<boolean>}
 */
export const supportsWebP = async () => {
  if (!self.createImageBitmap) return false;
  
  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  const blob = await fetch(webpData).then(r => r.blob());
  return createImageBitmap(blob).then(() => true, () => false);
};

/**
 * Check if browser supports AVIF
 * @returns {Promise<boolean>}
 */
export const supportsAVIF = async () => {
  if (!self.createImageBitmap) return false;
  
  const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  const blob = await fetch(avifData).then(r => r.blob());
  return createImageBitmap(blob).then(() => true, () => false);
};

/**
 * Get best supported image format
 * @returns {Promise<string>} 'avif', 'webp', or 'jpg'
 */
export const getBestFormat = async () => {
  if (await supportsAVIF()) return 'avif';
  if (await supportsWebP()) return 'webp';
  return 'jpg';
};

/**
 * Lazy load background image
 * @param {HTMLElement} element - Element to apply background to
 * @param {string} imageUrl - URL of the image
 */
export const lazyLoadBackground = (element, imageUrl) => {
  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    element.style.backgroundImage = `url(${imageUrl})`;
    element.classList.add('loaded');
  };
};

/**
 * Calculate aspect ratio from dimensions
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} CSS aspect-ratio value
 */
export const getAspectRatio = (width, height) => {
  if (!width || !height) return 'auto';
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor} / ${height / divisor}`;
};

/**
 * Get placeholder data URL for blur effect
 * @param {number} width - Placeholder width
 * @param {number} height - Placeholder height
 * @param {string} color - Placeholder color
 * @returns {string} Data URL
 */
export const getPlaceholder = (width = 10, height = 10, color = '#e5e7eb') => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='${color}' width='${width}' height='${height}'/%3E%3C/svg%3E`;
};

export default {
  generateSrcSet,
  getImageSizes,
  supportsTransformations,
  transformImage,
  preloadImages,
  supportsWebP,
  supportsAVIF,
  getBestFormat,
  lazyLoadBackground,
  getAspectRatio,
  getPlaceholder,
};
