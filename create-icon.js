// Script to create multi-size ICO file from PNG
// Windows requires ICO files with multiple sizes: 16x16, 32x32, 48x48, 256x256

const fs = require('fs');
const path = require('path');

// Note: This script requires 'sharp' library for image processing
// Install it with: npm install --save-dev sharp

async function createMultiSizeICO() {
  try {
    const sharp = require('sharp');
    const inputPath = path.join(__dirname, '../public/assets/appicon.png');
    const outputPath = path.join(__dirname, '../build/icon.ico');
    
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Input file not found: ${inputPath}`);
      return;
    }
    
    console.log('🔄 Creating multi-size ICO file...');
    
    // Read the PNG image
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Create ICO with multiple sizes
    // Note: sharp doesn't directly support ICO, so we'll create PNG files first
    // and then use an ICO converter, or use a different approach
    
    // For now, let's create a script that outputs instructions
    console.log('⚠️  Sharp library detected.');
    console.log('📝 To create a proper multi-size ICO file, please:');
    console.log('   1. Use an online ICO converter (e.g., convertio.co, icoconvert.com)');
    console.log('   2. Upload: public/assets/appicon.png');
    console.log('   3. Select sizes: 16x16, 32x32, 48x48, 256x256');
    console.log('   4. Download and save as: build/icon.ico');
    console.log('');
    console.log('   OR use GIMP/Photoshop:');
    console.log('   1. Open appicon.png');
    console.log('   2. Export as ICO format');
    console.log('   3. When prompted, select all sizes: 16, 32, 48, 256');
    console.log('   4. Save as: build/icon.ico');
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('📦 Installing sharp library...');
      console.log('   Run: npm install --save-dev sharp');
      console.log('   Then run this script again');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Alternative: Use ImageMagick if available
async function createICOWithImageMagick() {
  const { exec } = require('child_process');
  const inputPath = path.join(__dirname, '../public/assets/appicon.png');
  const outputPath = path.join(__dirname, '../build/icon.ico');
  
  return new Promise((resolve, reject) => {
    // Check if ImageMagick is installed
    exec('magick -version', (error) => {
      if (error) {
        console.log('⚠️  ImageMagick not found. Using alternative method...');
        resolve(false);
        return;
      }
      
      // Create ICO with multiple sizes using ImageMagick
      const command = `magick "${inputPath}" -define icon:auto-resize=256,128,64,48,32,16 "${outputPath}"`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error creating ICO:', error.message);
          reject(error);
          return;
        }
        console.log('✅ Multi-size ICO created successfully!');
        console.log(`   Location: ${outputPath}`);
        resolve(true);
      });
    });
  });
}

// Try ImageMagick first, then fallback to instructions
createICOWithImageMagick().catch(() => {
  createMultiSizeICO();
});

