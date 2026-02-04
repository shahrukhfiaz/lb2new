/**
 * Script to create a macOS-compatible icon (512x512 PNG) from existing assets
 * macOS requires icons to be at least 512x512 pixels
 */

const fs = require('fs');
const path = require('path');

// Check if we have the required dependencies
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ Error: sharp package is required but not installed.');
  console.log('📦 Please install it: npm install --save-dev sharp');
  process.exit(1);
}

async function createMacIcon() {
  const assetsDir = path.join(__dirname, '..', 'public', 'assets');
  const outputIcon = path.join(assetsDir, 'icon-512x512.png');

  // Try to find the best source icon (prefer larger sizes)
  const sourceCandidates = [
    path.join(assetsDir, 'icon-256x256.png'),
    path.join(assetsDir, 'ms-icon-310x310.png'),
    path.join(assetsDir, 'icon.png'),
    path.join(assetsDir, 'ms-icon-150x150.png')
  ];

  let sourceFile = null;
  for (const candidate of sourceCandidates) {
    if (fs.existsSync(candidate)) {
      sourceFile = candidate;
      console.log(`✓ Found source icon: ${path.basename(candidate)}`);
      break;
    }
  }

  if (!sourceFile) {
    console.error('❌ Error: Could not find any source icon file');
    console.error(`   Tried: ${sourceCandidates.map(f => path.basename(f)).join(', ')}`);
    process.exit(1);
  }

  try {
    // Resize to exactly 512x512
    await sharp(sourceFile)
      .resize(512, 512, {
        fit: 'cover',
        position: 'center',
        background: { r: 255, g: 255, b: 255, alpha: 0 }  // Transparent background
      })
      .ensureAlpha()
      .png()
      .toFile(outputIcon);

    console.log(`\n✅ Successfully created: ${outputIcon}`);
    console.log(`   Size: 512x512 pixels\n`);
  } catch (error) {
    console.error('❌ Error creating macOS icon:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

// Run the script
createMacIcon().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

