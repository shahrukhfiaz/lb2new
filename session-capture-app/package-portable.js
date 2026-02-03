const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Package the win-unpacked folder into a portable ZIP
const sourceDir = path.join(__dirname, 'release', 'win-unpacked');
const outputFile = path.join(__dirname, 'release', 'DAT Workspace Backup-Portable.zip');

if (!fs.existsSync(sourceDir)) {
  console.error('❌ Error: win-unpacked folder not found!');
  console.error('Please run "npm run dist" first to build the app.');
  process.exit(1);
}

console.log('📦 Creating portable ZIP package...');
console.log(`📁 Source: ${sourceDir}`);
console.log(`📦 Output: ${outputFile}`);

const zip = new AdmZip();

// Add all files from win-unpacked
function addDirectoryToZip(dirPath, zipPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      addDirectoryToZip(filePath, path.join(zipPath, file));
    } else {
      const relativePath = path.relative(sourceDir, filePath);
      zip.addLocalFile(filePath, path.dirname(relativePath) || '');
      console.log(`  ✓ Added: ${relativePath}`);
    }
  });
}

addDirectoryToZip(sourceDir, '');

// Write ZIP file
zip.writeZip(outputFile);

const stats = fs.statSync(outputFile);
const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

console.log('');
console.log('✅ Portable package created successfully!');
console.log(`📦 File: ${outputFile}`);
console.log(`📊 Size: ${sizeMB} MB`);
console.log('');
console.log('📝 Instructions:');
console.log('   1. Extract the ZIP file to any location');
console.log('   2. Run "DAT Workspace Backup.exe" from the extracted folder');
console.log('   3. The app is fully portable - no installation required!');

