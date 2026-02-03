/**
 * Electron-builder afterPack hook
 * Embeds icon and version info in the executable BEFORE the installer is created
 */

const rcedit = require('rcedit');
const path = require('path');
const fs = require('fs');

module.exports = async function(context) {
  const { appOutDir, packager } = context;
  const exePath = path.join(appOutDir, `${packager.appInfo.productFilename}.exe`);
  const iconPath = path.join(__dirname, '..', 'build', 'icon.ico');

  // Check if executable exists
  if (!fs.existsSync(exePath)) {
    console.log('⚠️  Executable not found:', exePath);
    return;
  }

  // Check if icon exists
  if (!fs.existsSync(iconPath)) {
    console.error('❌ Icon file not found:', iconPath);
    return;
  }

  try {
    console.log('🔧 Embedding icon and version info in executable...');
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
    console.log('   The executable will show DAT Loadboard in Properties > Details');
  } catch (error) {
    console.error('❌ Error embedding icon:', error.message);
    console.error('   Stack:', error.stack);
    // Don't throw - let the build continue
  }
};


