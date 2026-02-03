#!/usr/bin/env node

/**
 * Standalone Session Capture Script with Auto-Upload
 * 
 * This script runs independently after the DAT Loadboard app is closed
 * to capture session files without file locking issues and automatically
 * uploads them to cloud storage.
 * 
 * Usage: node session-capture-script.js [sessionId]
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const AdmZip = require('adm-zip');
const axios = require('axios');

// Load environment configuration
function loadConfig() {
  const configPath = path.join(__dirname, 'session-config.env');
  if (fs.existsSync(configPath)) {
    const envContent = fs.readFileSync(configPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          process.env[key] = value;
        }
      }
    });
    
    console.log('📋 Loaded configuration from session-config.env');
  } else {
    console.log('⚠️ No session-config.env found, using default values');
  }
}

// Load configuration
loadConfig();

// Configuration
// Note: Electron uses the package.json "name" field for userData folder
// The actual folder is "dat-loadboard" (from package.json name), not "DAT Loadboard"
const USER_DATA_PATH = path.join(os.homedir(), 'AppData', 'Roaming', 'dat-loadboard');
const SESSION_ID = process.argv[2] || process.env.SESSION_ID || 'cmgsg863g0001tpngelspcz9k';

// API Configuration
const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://167.99.147.118:3000/api/v1',
  email: process.env.API_EMAIL || 'your-email@example.com',
  password: process.env.API_PASSWORD || 'your-password'
};

console.log('🚀 Standalone Session Capture Script with Auto-Upload Started');
console.log(`📁 User Data Path: ${USER_DATA_PATH}`);
console.log(`🔑 Session ID: ${SESSION_ID}`);
console.log(`🌐 API Base URL: ${API_CONFIG.baseUrl}`);

// COMPLETE FILE CAPTURE: Include ALL files without any exclusions
const shouldIncludeFile = (filename) => {
  // Include EVERY SINGLE FILE - no exclusions whatsoever
  // User specifically requested complete folder and files capture
  return true;
};

// Safe file reading function with retry logic
const safeReadFile = (filePath, maxRetries = 5, isCritical = false) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return fs.readFileSync(filePath);
    } catch (error) {
      if (error.code === 'EBUSY' || error.code === 'EACCES') {
        console.log(`⚠️ File locked, retrying ${i + 1}/${maxRetries}: ${filePath}`);
        if (i < maxRetries - 1) {
          const waitTime = isCritical ? 1000 : 500; // Longer wait for critical files
          const start = Date.now();
          while (Date.now() - start < waitTime) {
            // Busy wait
          }
          continue;
        }
      }
      throw error;
    }
  }
};

// Comprehensive session validation function
const validateSessionCompleteness = (sessionDir) => {
  const validation = {
    isComplete: true,
    missing: [],
    present: []
  };
  
  const criticalComponents = [
    { name: 'Network Directory', path: path.join(sessionDir, 'Network') },
    { name: 'Local Storage Directory', path: path.join(sessionDir, 'Local Storage') },
    { name: 'Session Storage Directory', path: path.join(sessionDir, 'Session Storage') },
    { name: 'Preferences File', path: path.join(sessionDir, 'Preferences') }
  ];
  
  for (const component of criticalComponents) {
    if (fs.existsSync(component.path)) {
      validation.present.push(component.name);
      
      if (fs.statSync(component.path).isDirectory()) {
        try {
          const contents = fs.readdirSync(component.path);
          if (contents.length === 0) {
            validation.missing.push(`${component.name} (empty)`);
            validation.isComplete = false;
          } else {
            console.log(`✅ ${component.name} contains ${contents.length} items`);
          }
        } catch (err) {
          validation.missing.push(`${component.name} (unreadable)`);
          validation.isComplete = false;
        }
      }
    } else {
      validation.missing.push(component.name);
      validation.isComplete = false;
    }
  }
  
  return validation;
};

// Authentication function (returns token and user info)
async function authenticateWithAPI() {
  try {
    console.log('🔐 Authenticating with API...');
    console.log(`📤 Sending request to: ${API_CONFIG.baseUrl}/auth/login`);
    
    const loginResponse = await axios.post(`${API_CONFIG.baseUrl}/auth/login`, {
      email: API_CONFIG.email,
      password: API_CONFIG.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('📥 Response status:', loginResponse.status);
    
    if (loginResponse.data && loginResponse.data.tokens) {
      console.log('✅ Authentication successful!');
      console.log(`👤 User: ${loginResponse.data.user?.email || 'Unknown'}`);
      console.log(`🎭 Role: ${loginResponse.data.user?.role || 'Unknown'}`);
      return {
        accessToken: loginResponse.data.tokens.accessToken,
        user: loginResponse.data.user || null
      };
    } else {
      console.log('❌ Invalid login response format');
      console.log('📥 Expected: { tokens: { accessToken: "..." }, user: { ... } }');
      console.log('📥 Received:', JSON.stringify(loginResponse.data, null, 2));
      throw new Error('Invalid login response format');
    }
    
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    
    if (error.response) {
      console.error('📋 Response status:', error.response.status);
      console.error('📋 Response data:', error.response.data);
      
      if (error.response.status === 500) {
        console.log('');
        console.log('💡 500 Internal Server Error usually means:');
        console.log('   - Server-side error');
        console.log('   - Database connection issue');
        console.log('   - Invalid request format');
        console.log('   - Missing required fields');
        console.log('   - Wrong email/password format');
      }
    }
    
    throw error;
  }
}

// Compute SHA-256 checksum of a file
function computeFileChecksum(filePath) {
  const crypto = require('crypto');
  const buffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  return { checksum: hash, size: buffer.length };
}

// Auto-upload function (matches main app's upload flow exactly)
async function uploadToCloud(zipPath, sessionId) {
  try {
    console.log('☁️ Starting auto-upload to cloud storage...');
    
    // Step 1: Authenticate to get access token and user info
    const auth = await authenticateWithAPI();
    const accessToken = auth.accessToken;
    const authedUser = auth.user;
    
    // Step 2: Request upload URL (same as main app)
    console.log('📤 Requesting upload URL...');
    const uploadRequest = await axios.post(`${API_CONFIG.baseUrl}/sessions/${sessionId}/request-upload`, {
      contentType: 'application/zip',
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const { url: uploadUrl, bundleKey } = uploadRequest.data;
    console.log(`📦 Upload URL received: ${uploadUrl.substring(0, 80)}...`);
    console.log(`🔑 Bundle Key: ${bundleKey}`);
    
    // Step 3: Upload the zip file (same as main app)
    console.log('📤 Uploading zip file...');
    const zipBuffer = fs.readFileSync(zipPath);
    const uploadResponse = await axios.put(uploadUrl, zipBuffer, {
      headers: { 'Content-Type': 'application/zip' },
      timeout: 300000 // 5 minutes timeout for large files
    });
    
    if (uploadResponse.status === 200) {
      console.log('✅ Upload successful!');
      console.log(`📦 Bundle Key: ${bundleKey}`);
      console.log(`📅 Uploaded At: ${new Date().toISOString()}`);
      
      // Step 4: Complete upload (REQUIRED - updates database with checksum and size)
      const { checksum, size } = computeFileChecksum(zipPath);
      console.log('🔒 Completing upload with checksum and file size...');
      try {
        await axios.post(
          `${API_CONFIG.baseUrl}/sessions/${sessionId}/complete-upload`,
          {
            checksum: checksum,
            fileSizeBytes: size
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('✅ Upload completion confirmed in database!');
      } catch (completeError) {
        console.error('❌ Failed to complete upload:', completeError.message);
        if (completeError.response) {
          console.error('📋 Response status:', completeError.response.status);
          console.error('📋 Response data:', completeError.response.data);
        }
        throw completeError; // This is critical, so throw error
      }
      
      // Step 5: Mark session as READY (only for SUPER_ADMIN - matches app behavior)
      if (authedUser && authedUser.role === 'SUPER_ADMIN') {
        console.log('🔄 Marking session as READY (SUPER_ADMIN)...');
        try {
          await axios.post(
            `${API_CONFIG.baseUrl}/sessions/${sessionId}/mark-ready`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log('✅ Session marked as READY!');
        } catch (markError) {
          console.warn('⚠️ Failed to mark session as ready (non-blocking):', markError.message);
          if (markError.response) {
            console.warn('📋 Response status:', markError.response.status);
            console.warn('📋 Response data:', markError.response.data);
          }
          // Non-blocking - upload and completion were successful
        }
      } else {
        console.log(`ℹ️ Skipping mark-ready (user role: ${authedUser?.role || 'Unknown'}, requires SUPER_ADMIN)`);
      }
      
      return {
        success: true,
        bundleKey: bundleKey,
        uploadedAt: new Date().toISOString()
      };
    } else {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    
    if (error.response) {
      console.error('📋 Response status:', error.response.status);
      console.error('📋 Response data:', error.response.data);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};

// Main capture function
async function captureSession() {
  try {
    console.log('🔍 Searching for session directory...');
    
    // Look for session directory - try multiple naming patterns
    const partitionsDir = path.join(USER_DATA_PATH, 'Partitions');
    let sessionDir = null;
    let actualSessionId = SESSION_ID; // Track the actual session ID to use for upload
    
    // First try: exact match with session- prefix
    const exactMatch = path.join(partitionsDir, `session-${SESSION_ID}`);
    if (fs.existsSync(exactMatch)) {
      sessionDir = exactMatch;
      console.log(`✅ Found session directory (exact match): ${sessionDir}`);
    } else {
      // Second try: search for any partition containing the session ID
      if (fs.existsSync(partitionsDir)) {
        const partitions = fs.readdirSync(partitionsDir);
        const matchingPartition = partitions.find(name => 
          name.includes(SESSION_ID) || 
          name.includes(`session-${SESSION_ID}`) ||
          name === SESSION_ID
        );
        
        if (matchingPartition) {
          sessionDir = path.join(partitionsDir, matchingPartition);
          // Extract session ID from partition name if it's different
          if (matchingPartition.startsWith('session-')) {
            actualSessionId = matchingPartition.replace(/^session-/, '');
          } else if (matchingPartition !== SESSION_ID) {
            actualSessionId = matchingPartition;
          }
          console.log(`✅ Found session directory (matched): ${sessionDir}`);
        } else {
          // Third try: look for any partition with "session" in the name
          const sessionPartitions = partitions.filter(name => name.includes('session'));
          if (sessionPartitions.length > 0) {
            // If only one session partition found, use it automatically
            if (sessionPartitions.length === 1) {
              const sessionPartition = sessionPartitions[0];
              sessionDir = path.join(partitionsDir, sessionPartition);
              // Extract session ID from partition name
              if (sessionPartition.startsWith('session-')) {
                actualSessionId = sessionPartition.replace(/^session-/, '');
              } else {
                actualSessionId = sessionPartition;
              }
              console.log(`⚠️  Exact session ID match not found, but found single session partition: ${sessionPartition}`);
              console.log(`   Using session ID from partition: ${actualSessionId}`);
              console.log(`   (Original request was for: ${SESSION_ID})`);
            } else {
              // Multiple session partitions found - show all and let user choose
              console.log(`⚠️  Exact session ID match not found for: ${SESSION_ID}`);
              console.log(`   Found ${sessionPartitions.length} session partition(s):`);
              sessionPartitions.forEach(partition => {
                console.log(`     📁 ${partition}`);
              });
              console.log(`\n💡 Tip: You can use one of these session IDs:`);
              sessionPartitions.forEach(partition => {
                // Extract session ID from partition name (remove "session-" prefix)
                const sessionIdFromPartition = partition.replace(/^session-/, '');
                console.log(`     node session-capture-script.js ${sessionIdFromPartition}`);
              });
              return;
            }
          }
        }
      }
    }
    
    if (!sessionDir) {
      console.log(`❌ Session directory not found for session ID: ${SESSION_ID}`);
      console.log('🔍 Available partitions:');
      
      if (fs.existsSync(partitionsDir)) {
        const partitions = fs.readdirSync(partitionsDir);
        if (partitions.length === 0) {
          console.log('   (No partitions found - app may not have been run yet)');
        } else {
          partitions.forEach(partition => {
            console.log(`  📁 ${partition}`);
          });
          console.log(`\n💡 Tip: Make sure you've logged in through the DAT Loadboard app with session ID: ${SESSION_ID}`);
        }
      } else {
        console.log(`   Partitions directory does not exist: ${partitionsDir}`);
        console.log(`   The app may not have been run yet.`);
      }
      return;
    }
    
    console.log(`✅ Using session directory: ${sessionDir}`);
    
    // Validate session completeness
    console.log('🔍 Validating session completeness...');
    const validation = validateSessionCompleteness(sessionDir);
    
    if (!validation.isComplete) {
      console.log('⚠️ Session validation failed!');
      console.log(`❌ Missing: ${validation.missing.join(', ')}`);
      console.log(`✅ Present: ${validation.present.join(', ')}`);
    } else {
      console.log('✅ Session validation passed! All critical components present.');
    }
    
    // Create zip file (use actual session ID for filename)
    const zipPath = path.join(os.tmpdir(), `standalone-session-${actualSessionId}-${Date.now()}.zip`);
    console.log(`📦 Creating zip file: ${zipPath}`);
    
    const zip = new AdmZip();
    const criticalFilesPreserved = [];
    
    // Recursive function to add directories and files
    const addDirectoryRecursively = (dirPath, relativePath = '') => {
      if (!fs.existsSync(dirPath)) return;
      
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const itemRelativePath = relativePath ? path.join(relativePath, item) : item;
        
        try {
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            addDirectoryRecursively(itemPath, itemRelativePath);
          } else {
            if (shouldIncludeFile(itemRelativePath)) {
              try {
                const isCriticalFile = itemRelativePath.toLowerCase().includes('cookies') || 
                                      itemRelativePath.toLowerCase().includes('local storage') ||
                                      itemRelativePath.toLowerCase().includes('session storage') ||
                                      itemRelativePath.toLowerCase().includes('preferences');
                
                const fileContent = safeReadFile(itemPath, isCriticalFile ? 10 : 5, isCriticalFile);
                zip.addFile(itemRelativePath, fileContent);
                
                if (isCriticalFile) {
                  console.log(`✅ Including critical file: ${itemRelativePath}`);
                  criticalFilesPreserved.push(itemRelativePath);
                } else {
                  console.log(`📄 Including file: ${itemRelativePath}`);
                }
              } catch (error) {
                console.log(`❌ Failed to read file ${itemRelativePath}: ${error.message}`);
              }
            }
          }
        } catch (error) {
          console.log(`❌ Error processing ${itemPath}: ${error.message}`);
        }
      }
    };
    
    // Add all files to zip
    addDirectoryRecursively(sessionDir);
    
    // Write zip file
    zip.writeZip(zipPath);
    const zipSize = fs.statSync(zipPath).size;
    console.log(`✅ Session zipped: ${zipPath} (${(zipSize / 1024 / 1024).toFixed(2)} MB)`);
    
    // Log summary of files captured
    if (criticalFilesPreserved.length > 0) {
      console.log(`✅ Critical files included for login state: ${criticalFilesPreserved.length}`);
      criticalFilesPreserved.forEach(file => console.log(`  📄 ${file}`));
    }
    console.log(`📦 Total files captured: ALL FILES (complete session capture)`);
    
    console.log('🎉 Session capture completed successfully!');
    console.log(`📦 Zip file location: ${zipPath}`);
    
    // Auto-upload to cloud storage (use actual session ID from partition)
    console.log('');
    console.log('🚀 Starting automatic upload process...');
    console.log(`📋 Using session ID for upload: ${actualSessionId}`);
    const uploadResult = await uploadToCloud(zipPath, actualSessionId);
    
    if (uploadResult.success) {
      console.log('');
      console.log('🎉 COMPLETE SUCCESS! Session captured and uploaded automatically!');
      console.log('📋 Summary:');
      console.log(`  ✅ Session ID: ${actualSessionId}`);
      console.log(`  ✅ Bundle Key: ${uploadResult.bundleKey}`);
      console.log(`  ✅ Uploaded At: ${uploadResult.uploadedAt}`);
      console.log(`  ✅ Zip File: ${zipPath}`);
      console.log('');
      console.log('🎯 Next Steps:');
      console.log('  1. ✅ Session automatically uploaded to cloud');
      console.log('  2. ✅ Database automatically updated');
      console.log('  3. 🔄 Login as regular user to test the session');
      console.log('');
      console.log('🚀 Ready to test! Login as a regular user now.');
    } else {
      console.log('');
      console.log('⚠️ Session captured but upload failed!');
      console.log(`❌ Upload Error: ${uploadResult.error}`);
      console.log('');
      console.log('📋 Manual Steps Required:');
      console.log('  1. Upload this zip file manually to your cloud storage');
      console.log(`     📦 File: ${zipPath}`);
      console.log('  2. Update the session bundle in your database');
      console.log('  3. Test with regular users');
    }
    
  } catch (error) {
    console.error('❌ Error capturing session:', error);
    process.exit(1);
  }
}

// Run the capture
captureSession();
