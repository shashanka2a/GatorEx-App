#!/usr/bin/env node

/**
 * Generate PWA icons from SVG using sharp
 * Run: npm install sharp && node scripts/generate-icons-sharp.js
 */

const fs = require('fs');
const path = require('path');

async function generateIcons() {
  try {
    // Try to import sharp
    const sharp = require('sharp');
    
    const svgPath = path.join(process.cwd(), 'public', 'logo.svg');
    const publicDir = path.join(process.cwd(), 'public');
    
    if (!fs.existsSync(svgPath)) {
      console.error('❌ logo.svg not found in public directory');
      return;
    }
    
    console.log('🎨 Generating PWA icons from logo.svg...\n');
    
    const sizes = [
      { size: 16, name: 'favicon-16x16.png' },
      { size: 32, name: 'favicon-32x32.png' },
      { size: 180, name: 'apple-touch-icon.png' },
      { size: 192, name: 'icon-192x192.png' },
      { size: 512, name: 'icon-512x512.png' }
    ];
    
    for (const { size, name } of sizes) {
      const outputPath = path.join(publicDir, name);
      
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
        
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }
    
    console.log('\n🎉 All PWA icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Update public/manifest.json to reference the new icon files');
    console.log('2. Update pages/_app.tsx to use apple-touch-icon.png');
    console.log('3. Consider updating favicon.ico with a new version');
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('📦 Sharp not installed. Install it with:');
      console.log('npm install sharp');
      console.log('\nOr use the manual generation guide:');
      console.log('node scripts/generate-pwa-icons.js');
    } else {
      console.error('❌ Error generating icons:', error.message);
    }
  }
}

generateIcons();