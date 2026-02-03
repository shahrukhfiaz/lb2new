/**
 * Post-build script to ensure icon and version info are embedded in the executable
 * Uses rcedit Node.js API for reliable embedding
 */

const rcedit = require('rcedit');
const path = require('path');
const fs = require('fs');

async function embedIcon() {
  // Try multiple possible output directories
  const possibleDirs = [
    path.join(__dirname, '..', 'release-icon-embed', 'win-unpacked'),
    path.join(__dirname, '..', 'release-new', 'win-unpacked'),
    path.join(__dirname, '..', 'release-icon-fix', 'win-unpacked'),
    path.join(__dirname, '..', 'dist', 'win-unpacked')
  ];

  let exePath = null;
  for (const dir of possibleDirs) {
    const testPath = path.join(dir, 'DAT Loadboard.exe');
    if (fs.existsSync(testPath)) {
      exePath = testPath;
      break;
    }
  }

  if (!exePath) {
    console.log('⚠️  Executable not found in expected locations, skipping icon embedding');
    console.log('   Searched:', possibleDirs.map(d => path.basename(d)).join(', '));
    return;
  }

  const iconPath = path.join(__dirname, '..', 'build', 'icon.ico');

  // Check if icon exists
  if (!fs.existsSync(iconPath)) {
    console.error('❌ Icon file not found:', iconPath);
    return;
  }

  try {
    console.log('🔧 Embedding icon and version info in executable using rcedit...');
    console.log(`   Executable: ${exePath}`);
    console.log(`   Icon: ${iconPath}`);
    
    // Use rcedit Node.js API to embed icon and version info
    await rcedit(exePath, {
      icon: iconPath,
      'version-string': {
        FileDescription: 'DAT Loadboard',
        ProductName: 'DAT Loadboard',
        CompanyName: 'DAT',
        LegalCopyright: 'Copyright © DAT',
        InternalName: 'DAT Loadboard',
        OriginalFilename: 'DAT Loadboard.exe'
      },
      'file-version': '1.0.0',
      'product-version': '1.0.0'
    });
    
    console.log('✅ Icon and version info embedded successfully in executable');
    console.log('   The executable should now show DAT Loadboard in Properties > Details');
  } catch (error) {
    console.error('❌ Error embedding icon:', error.message);
    console.error('   Stack:', error.stack);
    console.log('💡 Icon should already be embedded by electron-builder');
    console.log('💡 If not, you can manually use Resource Hacker to embed the icon');
  }
}

embedIcon().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

