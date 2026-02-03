// Patch script to fix electron-builder code signing extraction
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function patchExtraction() {
  const cacheDir = path.join(process.env.LOCALAPPDATA || process.env.HOME, 'electron-builder', 'Cache', 'winCodeSign');
  
  if (!fs.existsSync(cacheDir)) {
    console.log('Cache directory does not exist yet');
    return;
  }
  
  // Find all .7z files
  const archives = fs.readdirSync(cacheDir)
    .filter(f => f.endsWith('.7z'))
    .map(f => path.join(cacheDir, f));
  
  if (archives.length === 0) {
    console.log('No archives found');
    return;
  }
  
  console.log(`Found ${archives.length} archive(s)`);
  
  archives.forEach(archive => {
    const extractDir = path.join(cacheDir, path.basename(archive, '.7z'));
    
    if (fs.existsSync(extractDir)) {
      console.log(`Skipping ${path.basename(archive)} - already extracted`);
      return;
    }
    
    console.log(`Extracting ${path.basename(archive)}...`);
    
    try {
      // Extract without symlinks
      const sevenZipPath = path.join(__dirname, 'node_modules', '7zip-bin', 'win', 'x64', '7za.exe');
      
      if (!fs.existsSync(sevenZipPath)) {
        console.log('7za.exe not found');
        return;
      }
      
      // Extract with -snl flag (skip symlinks)
      execSync(`"${sevenZipPath}" x -snl -y "${archive}" -o"${extractDir}"`, {
        stdio: 'inherit',
        cwd: cacheDir
      });
      
      // Create dummy files for the symlinks that failed
      const darwinLibPath = path.join(extractDir, 'darwin', '10.12', 'lib');
      if (fs.existsSync(darwinLibPath)) {
        const libcrypto = path.join(darwinLibPath, 'libcrypto.dylib');
        const libssl = path.join(darwinLibPath, 'libssl.dylib');
        
        if (!fs.existsSync(libcrypto)) {
          fs.writeFileSync(libcrypto, '');
          console.log('Created dummy libcrypto.dylib');
        }
        
        if (!fs.existsSync(libssl)) {
          fs.writeFileSync(libssl, '');
          console.log('Created dummy libssl.dylib');
        }
      }
      
      console.log(`✅ Successfully extracted ${path.basename(archive)}`);
    } catch (error) {
      console.error(`Failed to extract ${path.basename(archive)}:`, error.message);
    }
  });
}

// Watch for new archives and extract them
function watchAndExtract() {
  const cacheDir = path.join(process.env.LOCALAPPDATA || process.env.HOME, 'electron-builder', 'Cache', 'winCodeSign');
  
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  
  console.log('Watching for new archives...');
  
  // Extract immediately
  patchExtraction();
  
  // Watch for new files
  const watcher = fs.watch(cacheDir, (eventType, filename) => {
    if (filename && filename.endsWith('.7z')) {
      console.log(`New archive detected: ${filename}`);
      setTimeout(() => patchExtraction(), 1000);
    }
  });
  
  // Keep script running
  process.on('SIGINT', () => {
    watcher.close();
    process.exit(0);
  });
}

if (require.main === module) {
  watchAndExtract();
}

module.exports = { patchExtraction };

