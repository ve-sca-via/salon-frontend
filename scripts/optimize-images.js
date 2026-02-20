#!/usr/bin/env node
/**
 * Automated Image Optimization Script
 * 
 * This script optimizes all images in the project by:
 * 1. Converting to WebP format
 * 2. Resizing to appropriate dimensions
 * 3. Compressing with optimal quality settings
 * 4. Creating responsive variants (mobile, tablet, desktop)
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  sourceDir: path.join(__dirname, '../src/assets/images'),
  outputDir: path.join(__dirname, '../src/assets/images/optimized'),
  
  // Image variants for responsive loading
  variants: {
    mobile: { width: 640, quality: 70 },
    tablet: { width: 1024, quality: 75 },
    desktop: { width: 1920, quality: 75 },
  },
  
  // Specific optimizations for different image types
  imageTypes: {
    background: {
      pattern: /^(bg_|.*_bg\.)/i,
      maxWidth: 1920,
      quality: 75,
      createVariants: true,
    },
    service: {
      pattern: /service.*image/i,
      maxWidth: 800,
      quality: 80,
      createVariants: false,
    },
    default: {
      maxWidth: 1200,
      quality: 80,
      createVariants: false,
    }
  }
};

// Statistics tracking
const stats = {
  processed: 0,
  totalOriginalSize: 0,
  totalOptimizedSize: 0,
  errors: [],
};

/**
 * Get image type configuration based on filename
 */
function getImageConfig(filename) {
  for (const [type, config] of Object.entries(CONFIG.imageTypes)) {
    if (type === 'default') continue;
    if (config.pattern.test(filename)) {
      return config;
    }
  }
  return CONFIG.imageTypes.default;
}

/**
 * Get file size in KB
 */
async function getFileSize(filePath) {
  const stats = await fs.stat(filePath);
  return Math.round(stats.size / 1024);
}

/**
 * Optimize a single image
 */
async function optimizeImage(inputPath, filename) {
  const config = getImageConfig(filename);
  const baseName = path.parse(filename).name;
  const originalSize = await getFileSize(inputPath);
  
  stats.totalOriginalSize += originalSize;
  
  console.log(`\n📸 Processing: ${filename}`);
  console.log(`   Type: ${config === CONFIG.imageTypes.background ? 'Background' : 
              config === CONFIG.imageTypes.service ? 'Service' : 'Default'}`);
  console.log(`   Original size: ${originalSize} KB`);
  
  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    
    let totalOptimizedSize = 0;
    
    if (config.createVariants) {
      // Create responsive variants
      for (const [variant, settings] of Object.entries(CONFIG.variants)) {
        const outputPath = path.join(
          CONFIG.outputDir,
          `${baseName}_${variant}.webp`
        );
        
        await sharp(inputPath)
          .resize(settings.width, null, {
            withoutEnlargement: true,
            fit: 'inside',
          })
          .webp({ quality: settings.quality })
          .toFile(outputPath);
        
        const variantSize = await getFileSize(outputPath);
        totalOptimizedSize += variantSize;
        
        console.log(`   ✅ ${variant}: ${variantSize} KB`);
      }
    } else {
      // Create single optimized version
      const outputPath = path.join(
        CONFIG.outputDir,
        `${baseName}.webp`
      );
      
      await sharp(inputPath)
        .resize(config.maxWidth, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .webp({ quality: config.quality })
        .toFile(outputPath);
      
      totalOptimizedSize = await getFileSize(outputPath);
      console.log(`   ✅ Optimized: ${totalOptimizedSize} KB`);
    }
    
    stats.totalOptimizedSize += totalOptimizedSize;
    
    const savings = originalSize - totalOptimizedSize;
    const savingsPercent = Math.round((savings / originalSize) * 100);
    
    console.log(`   💰 Savings: ${savings} KB (${savingsPercent}%)`);
    stats.processed++;
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    stats.errors.push({ filename, error: error.message });
  }
}

/**
 * Process all images in the source directory
 */
async function processAllImages() {
  console.log('🚀 Starting image optimization...\n');
  console.log(`Source: ${CONFIG.sourceDir}`);
  console.log(`Output: ${CONFIG.outputDir}\n`);
  
  try {
    const files = await fs.readdir(CONFIG.sourceDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file)
    );
    
    if (imageFiles.length === 0) {
      console.log('⚠️  No images found to optimize');
      return;
    }
    
    console.log(`Found ${imageFiles.length} images to process\n`);
    console.log('─'.repeat(60));
    
    for (const file of imageFiles) {
      const inputPath = path.join(CONFIG.sourceDir, file);
      await optimizeImage(inputPath, file);
    }
    
    // Print summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 OPTIMIZATION SUMMARY');
    console.log('═'.repeat(60));
    console.log(`\n✅ Successfully processed: ${stats.processed} images`);
    console.log(`📁 Original total size: ${stats.totalOriginalSize} KB (${(stats.totalOriginalSize / 1024).toFixed(2)} MB)`);
    console.log(`📦 Optimized total size: ${stats.totalOptimizedSize} KB (${(stats.totalOptimizedSize / 1024).toFixed(2)} MB)`);
    
    const totalSavings = stats.totalOriginalSize - stats.totalOptimizedSize;
    const totalSavingsPercent = Math.round((totalSavings / stats.totalOriginalSize) * 100);
    
    console.log(`\n💰 Total savings: ${totalSavings} KB (${(totalSavings / 1024).toFixed(2)} MB)`);
    console.log(`📉 Size reduction: ${totalSavingsPercent}%`);
    
    if (stats.errors.length > 0) {
      console.log(`\n❌ Errors encountered: ${stats.errors.length}`);
      stats.errors.forEach(({ filename, error }) => {
        console.log(`   - ${filename}: ${error}`);
      });
    }
    
    console.log('\n✨ Optimization complete!');
    console.log(`\nOptimized images saved to: ${CONFIG.outputDir}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the optimization
processAllImages();
