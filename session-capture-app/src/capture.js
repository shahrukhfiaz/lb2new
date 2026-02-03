/**
 * Session Capture Logic
 * Adapted from session-capture-script.js for use in Electron app
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const AdmZip = require('adm-zip');
const axios = require('axios');
const crypto = require('crypto');

class SessionCapture {
  constructor(config, progressCallback) {
    this.config = config;
    this.progressCallback = progressCallback || (() => {});
    this.USER_DATA_PATH = path.join(os.homedir(), 'AppData', 'Roaming', 'dat-loadboard');
  }

  // Update progress
  progress(stage, message, percent = null) {
    this.progressCallback({ stage, message, percent });
  }

  // Load configuration from file or use defaults
  static loadConfig() {
    // Try multiple locations for config file
    const possiblePaths = [
      path.join(process.resourcesPath || __dirname, 'session-config.env'), // Packaged app
      path.join(__dirname, '../../session-config.env'), // Development (relative to app)
      path.join(process.cwd(), 'session-config.env'), // Current directory
      path.join(path.dirname(process.execPath || __dirname), 'session-config.env') // Same dir as EXE
    ];

    const config = {
      baseUrl: 'http://67.205.189.32:3000/api/v1',
      email: 'superadmin@digitalstorming.com',
      password: 'ChangeMeSuperSecure123!'
    };

    // Find first existing config file
    for (const configPath of possiblePaths) {
      if (fs.existsSync(configPath)) {
        try {
          const envContent = fs.readFileSync(configPath, 'utf8');
          const lines = envContent.split('\n');
          
          lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
              const [key, ...valueParts] = trimmed.split('=');
              const value = valueParts.join('=').trim();
              if (key && value) {
                if (key === 'API_BASE_URL') config.baseUrl = value;
                if (key === 'API_EMAIL') config.email = value;
                if (key === 'API_PASSWORD') config.password = value;
              }
            }
          });
          break; // Use first found config file
        } catch (error) {
          // Continue to next path if file read fails
        }
      }
    }

    return config;
  }

  // Detect available sessions
  detectSessions() {
    const partitionsDir = path.join(this.USER_DATA_PATH, 'Partitions');
    const sessions = [];

    if (!fs.existsSync(partitionsDir)) {
      return sessions;
    }

    const partitions = fs.readdirSync(partitionsDir);
    partitions.forEach(partition => {
      if (partition.includes('session')) {
        let sessionId = partition;
        if (partition.startsWith('session-')) {
          sessionId = partition.replace(/^session-/, '');
        }
        sessions.push({
          id: sessionId,
          folder: partition,
          path: path.join(partitionsDir, partition)
        });
      }
    });

    return sessions;
  }

  // Validate session completeness
  validateSession(sessionDir) {
    const criticalComponents = [
      { name: 'Network Directory', path: path.join(sessionDir, 'Network') },
      { name: 'Local Storage Directory', path: path.join(sessionDir, 'Local Storage') },
      { name: 'Session Storage Directory', path: path.join(sessionDir, 'Session Storage') },
      { name: 'Preferences File', path: path.join(sessionDir, 'Preferences') }
    ];

    const missing = [];
    const present = [];

    for (const component of criticalComponents) {
      if (fs.existsSync(component.path)) {
        present.push(component.name);
        if (fs.statSync(component.path).isDirectory()) {
          try {
            const contents = fs.readdirSync(component.path);
            if (contents.length === 0) {
              missing.push(`${component.name} (empty)`);
            }
          } catch (err) {
            missing.push(`${component.name} (unreadable)`);
          }
        }
      } else {
        missing.push(component.name);
      }
    }

    return {
      isValid: missing.length === 0,
      missing,
      present
    };
  }

  // Safe file reading with retry
  safeReadFile(filePath, maxRetries = 5, isCritical = false) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return fs.readFileSync(filePath);
      } catch (error) {
        if (error.code === 'EBUSY' || error.code === 'EACCES') {
          if (i < maxRetries - 1) {
            const waitTime = isCritical ? 1000 : 500;
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
  }

  // Authenticate with API
  async authenticate() {
    console.log('🔐 [AUTH] Authenticating with API...');
    console.log(`🔐 [AUTH] Endpoint: ${this.config.baseUrl}/auth/login`);
    console.log(`🔐 [AUTH] Email: ${this.config.email}`);
    
    this.progress('authenticating', 'Authenticating with API...', 0);
    
    try {
      const response = await axios.post(`${this.config.baseUrl}/auth/login`, {
        email: this.config.email,
        password: this.config.password
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      console.log(`📥 [AUTH] Response status: ${response.status}`);
      
      if (response.data && response.data.tokens) {
        console.log(`✅ [AUTH] Authentication successful!`);
        console.log(`👤 [AUTH] User: ${response.data.user?.email || 'Unknown'}`);
        console.log(`🎭 [AUTH] Role: ${response.data.user?.role || 'Unknown'}`);
        this.progress('authenticating', 'Authentication successful!', 100);
        return {
          accessToken: response.data.tokens.accessToken,
          user: response.data.user || null
        };
      }
      
      console.error(`❌ [AUTH] Invalid login response format`);
      throw new Error('Invalid login response format');
    } catch (error) {
      console.error(`❌ [AUTH] Authentication failed!`);
      console.error(`❌ [AUTH] Error: ${error.message}`);
      if (error.response) {
        console.error(`❌ [AUTH] Response status: ${error.response.status}`);
        console.error(`❌ [AUTH] Response data:`, JSON.stringify(error.response.data, null, 2));
      }
      if (error.request) {
        console.error(`❌ [AUTH] Request made but no response received`);
      }
      throw error;
    }
  }

  // Compute file checksum
  computeChecksum(filePath) {
    const buffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return { checksum: hash, size: buffer.length };
  }

  // Upload to cloud
  async uploadToCloud(zipPath, sessionId) {
    try {
      console.log('📤 [UPLOAD] Starting upload process...');
      console.log(`📤 [UPLOAD] Zip file: ${zipPath}`);
      console.log(`📤 [UPLOAD] Session ID: ${sessionId}`);
      console.log(`📤 [UPLOAD] API Base URL: ${this.config.baseUrl}`);
      
      this.progress('uploading', 'Starting upload to server...', 0);
      
      // Authenticate
      console.log('🔐 [UPLOAD] Authenticating with API...');
      console.log(`🔐 [UPLOAD] Sending request to: ${this.config.baseUrl}/auth/login`);
      const auth = await this.authenticate();
      const accessToken = auth.accessToken;
      const user = auth.user;
      console.log(`✅ [UPLOAD] Authentication successful!`);
      console.log(`👤 [UPLOAD] User: ${user?.email || 'Unknown'}`);
      console.log(`🎭 [UPLOAD] Role: ${user?.role || 'Unknown'}`);

      // Request upload URL
      console.log('📋 [UPLOAD] Requesting upload URL...');
      console.log(`📋 [UPLOAD] Endpoint: ${this.config.baseUrl}/sessions/${sessionId}/request-upload`);
      this.progress('uploading', 'Requesting upload URL...', 20);
      const uploadRequest = await axios.post(
        `${this.config.baseUrl}/sessions/${sessionId}/request-upload`,
        { contentType: 'application/zip' },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const { url: uploadUrl, bundleKey } = uploadRequest.data;
      console.log(`✅ [UPLOAD] Upload URL received!`);
      console.log(`🔑 [UPLOAD] Bundle Key: ${bundleKey}`);
      console.log(`🌐 [UPLOAD] Upload URL: ${uploadUrl.substring(0, 80)}...`);
      
      this.progress('uploading', 'Uploading backup file...', 40);

      // Upload zip file
      console.log('📦 [UPLOAD] Reading zip file...');
      const zipBuffer = fs.readFileSync(zipPath);
      const zipSizeMB = (zipBuffer.length / 1024 / 1024).toFixed(2);
      console.log(`📦 [UPLOAD] Zip file size: ${zipSizeMB} MB`);
      console.log(`📦 [UPLOAD] Starting file upload (timeout: 300s)...`);
      
      const uploadStartTime = Date.now();
      await axios.put(uploadUrl, zipBuffer, {
        headers: { 'Content-Type': 'application/zip' },
        timeout: 300000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            const elapsed = ((Date.now() - uploadStartTime) / 1000).toFixed(1);
            const loadedMB = (progressEvent.loaded / 1024 / 1024).toFixed(2);
            const totalMB = (progressEvent.total / 1024 / 1024).toFixed(2);
            console.log(`📤 [UPLOAD] Progress: ${percent}% (${loadedMB}MB / ${totalMB}MB) - ${elapsed}s`);
            this.progress('uploading', `Uploading backup file... ${percent}%`, 40 + Math.floor(percent * 0.4));
          }
        }
      });
      
      const uploadDuration = ((Date.now() - uploadStartTime) / 1000).toFixed(1);
      console.log(`✅ [UPLOAD] File upload completed in ${uploadDuration}s!`);

      this.progress('uploading', 'Finalizing upload...', 80);

      // Complete upload
      console.log('🔒 [UPLOAD] Computing file checksum...');
      const { checksum, size } = this.computeChecksum(zipPath);
      console.log(`🔒 [UPLOAD] Checksum: ${checksum.substring(0, 16)}...`);
      console.log(`🔒 [UPLOAD] File size: ${(size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`🔒 [UPLOAD] Completing upload with checksum...`);
      console.log(`🔒 [UPLOAD] Endpoint: ${this.config.baseUrl}/sessions/${sessionId}/complete-upload`);
      
      await axios.post(
        `${this.config.baseUrl}/sessions/${sessionId}/complete-upload`,
        { checksum, fileSizeBytes: size },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ [UPLOAD] Upload completion confirmed in database!`);

      // Mark as ready (SUPER_ADMIN only)
      if (user && user.role === 'SUPER_ADMIN') {
        console.log('🔄 [UPLOAD] Marking session as READY (SUPER_ADMIN)...');
        this.progress('uploading', 'Marking session as ready...', 90);
        try {
          await axios.post(
            `${this.config.baseUrl}/sessions/${sessionId}/mark-ready`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log(`✅ [UPLOAD] Session marked as READY!`);
        } catch (markError) {
          console.log(`⚠️  [UPLOAD] Failed to mark as ready (non-blocking): ${markError.message}`);
        }
      } else {
        console.log(`ℹ️  [UPLOAD] Skipping mark-ready (user role: ${user?.role || 'Unknown'})`);
      }

      console.log('🎉 [UPLOAD] Backup completed successfully!');
      console.log(`📋 [UPLOAD] Bundle Key: ${bundleKey}`);
      console.log(`📅 [UPLOAD] Uploaded At: ${new Date().toISOString()}`);
      
      this.progress('uploading', 'Backup completed successfully!', 100);
      return { success: true, bundleKey, uploadedAt: new Date().toISOString() };
    } catch (error) {
      console.error('❌ [UPLOAD] Upload failed!');
      console.error(`❌ [UPLOAD] Error: ${error.message}`);
      if (error.response) {
        console.error(`❌ [UPLOAD] Response status: ${error.response.status}`);
        console.error(`❌ [UPLOAD] Response data:`, JSON.stringify(error.response.data, null, 2));
      }
      if (error.request) {
        console.error(`❌ [UPLOAD] Request made but no response received`);
        console.error(`❌ [UPLOAD] Request URL: ${error.config?.url || 'Unknown'}`);
      }
      this.progress('uploading', `Upload failed: ${error.message}`, null);
      return { success: false, error: error.message };
    }
  }

  // Capture session
  async captureSession(sessionId) {
    try {
      console.log('🚀 [CAPTURE] Starting workspace backup process...');
      console.log(`🚀 [CAPTURE] Session ID: ${sessionId}`);
      console.log(`🚀 [CAPTURE] User Data Path: ${this.USER_DATA_PATH}`);
      
      this.progress('detecting', 'Detecting workspace directory...', 0);
      
      const partitionsDir = path.join(this.USER_DATA_PATH, 'Partitions');
      let sessionDir = null;
      let actualSessionId = sessionId;

      // Try exact match
      const exactMatch = path.join(partitionsDir, `session-${sessionId}`);
      if (fs.existsSync(exactMatch)) {
        sessionDir = exactMatch;
      } else {
        // Search for matching partition
        if (fs.existsSync(partitionsDir)) {
          const partitions = fs.readdirSync(partitionsDir);
          const matchingPartition = partitions.find(name => 
            name.includes(sessionId) || name === `session-${sessionId}`
          );
          
          if (matchingPartition) {
            sessionDir = path.join(partitionsDir, matchingPartition);
            if (matchingPartition.startsWith('session-')) {
              actualSessionId = matchingPartition.replace(/^session-/, '');
            }
          }
        }
      }

      if (!sessionDir) {
        throw new Error(`Workspace directory not found for ID: ${sessionId}`);
      }

      this.progress('validating', 'Validating workspace data...', 10);
      const validation = this.validateSession(sessionDir);
      if (!validation.isValid) {
        this.progress('validating', `Warning: ${validation.missing.length} components missing`, 10);
      }

      this.progress('zipping', 'Preparing backup file...', 20);
      const zipPath = path.join(os.tmpdir(), `session-${actualSessionId}-${Date.now()}.zip`);
      const zip = new AdmZip();
      let fileCount = 0;
      let totalFiles = 0;

      // Count files first for progress
      const countFiles = (dirPath) => {
        if (!fs.existsSync(dirPath)) return;
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          try {
            const stat = fs.statSync(itemPath);
            if (stat.isDirectory()) {
              countFiles(itemPath);
            } else {
              totalFiles++;
            }
          } catch (err) {
            // Ignore
          }
        }
      };

      countFiles(sessionDir);

      // Add files to zip
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
              try {
                const isCritical = itemRelativePath.toLowerCase().includes('cookies') ||
                                  itemRelativePath.toLowerCase().includes('local storage') ||
                                  itemRelativePath.toLowerCase().includes('session storage') ||
                                  itemRelativePath.toLowerCase().includes('preferences');

                const fileContent = this.safeReadFile(itemPath, isCritical ? 10 : 5, isCritical);
                zip.addFile(itemRelativePath, fileContent);
                fileCount++;
                
                const percent = 20 + Math.floor((fileCount / totalFiles) * 50);
                this.progress('zipping', `Adding files... (${fileCount}/${totalFiles})`, percent);
              } catch (error) {
                // Skip file if can't read
              }
            }
          } catch (error) {
            // Skip item if can't process
          }
        }
      };

      addDirectoryRecursively(sessionDir);
      zip.writeZip(zipPath);
      const zipSize = fs.statSync(zipPath).size;

      this.progress('zipping', `Backup file prepared: ${(zipSize / 1024 / 1024).toFixed(2)} MB`, 70);

      // Upload to cloud
      const uploadResult = await this.uploadToCloud(zipPath, actualSessionId);

      if (uploadResult.success) {
        return {
          success: true,
          sessionId: actualSessionId,
          bundleKey: uploadResult.bundleKey,
          zipPath,
          zipSize,
          uploadedAt: uploadResult.uploadedAt
        };
      } else {
        return {
          success: false,
          error: uploadResult.error,
          zipPath,
          zipSize
        };
      }
    } catch (error) {
      this.progress('error', `Error: ${error.message}`, null);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = SessionCapture;
