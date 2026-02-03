/**
 * Electron-builder afterAllArtifactBuild hook
 * Embeds icon and version info in the executable AFTER all artifacts are built
 * This ensures the icon is embedded even if electron-builder overwrites it
 */

const rcedit = require('rcedit');
const path = require('path');
const fs = require('fs');

module.exports = async function(context) {
  // The context structure varies, try to find the executable
  const possibleDirs = [
    path.join(__dirname, '..', 'release-icon-embed', 'win-unpacked'),
    path.join(__dirname, '..', 'release-new', 'win-unpacked'),
    path.join(__dirname, '..', 'dist', 'win-unpacked')
  ];

  let exePath = null;
  const productFilename = 'DAT Loadboard';
  
  // Try to get from context if available
  if (context && context.appOutDir) {
    const testPath = path.join(context.appOutDir, `${productFilename}.exe`);
    if (fs.existsSync(testPath)) {
      exePath = testPath;
    }
  }
  
  // Fallback: search in common directories
  if (!exePath) {
    for (const dir of possibleDirs) {
      const testPath = path.join(dir, `${productFilename}.exe`);
      if (fs.existsSync(testPath)) {
        exePath = testPath;
        break;
      }
    }
  }

  if (!exePath) {
    console.log('⚠️  [afterAllArtifactBuild] Executable not found, skipping icon embedding');
    return;
  }

  const iconPath = path.join(__dirname, '..', 'build', 'icon.ico');

  // Check if icon exists
  if (!fs.existsSync(iconPath)) {
    console.error('❌ [afterAllArtifactBuild] Icon file not found:', iconPath);
    return;
  }

  try {
    console.log('🔧 [afterAllArtifactBuild] Embedding icon and version info in executable...');
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
    
    console.log('✅ [afterAllArtifactBuild] Icon and version info embedded successfully');
    console.log('   The executable will show DAT Loadboard in Properties > Details');
  } catch (error) {
    console.error('❌ [afterAllArtifactBuild] Error embedding icon:', error.message);
    console.error('   Stack:', error.stack);
    // Don't throw - let the build continue
  }
};
