const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const SessionCapture = require('./capture');

let mainWindow = null;

function createWindow() {
  // Try multiple icon paths
  const iconPaths = [
    path.join(__dirname, '../build/icon.ico'),
    path.join(__dirname, '../../build/icon.ico'),
    path.join(process.resourcesPath || __dirname, '../build/icon.ico')
  ];
  
  let iconPath = null;
  for (const testPath of iconPaths) {
    if (fs.existsSync(testPath)) {
      iconPath = testPath;
      break;
    }
  }

  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    title: 'DAT Workspace Backup - Optimized',
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    ...(iconPath ? { icon: iconPath } : {})
  });

  // Hide menu bar
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setMenu(null);

  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
let currentCapture = null;

ipcMain.handle('detect-sessions', () => {
  const config = SessionCapture.loadConfig();
  const capture = new SessionCapture(config);
  return capture.detectSessions();
});

ipcMain.handle('capture-session', async (event, sessionId) => {
  console.log('📨 [IPC] Received capture-session request (OPTIMIZED)');
  console.log(`📨 [IPC] Session ID: ${sessionId}`);
  
  const config = SessionCapture.loadConfig();
  console.log(`📋 [IPC] Config loaded - Base URL: ${config.baseUrl}`);
  
  const progressCallback = (data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('progress-update', data);
    }
  };

  currentCapture = new SessionCapture(config, progressCallback);
  console.log('🔄 [IPC] Starting capture process (OPTIMIZED - excludes cache files)...');
  
  try {
    const result = await currentCapture.captureSession(sessionId);
    console.log(`✅ [IPC] Capture completed - Success: ${result.success}`);
    if (result.success) {
      console.log(`📊 [IPC] Files included: ${result.filesIncluded || 'N/A'}`);
      console.log(`📊 [IPC] Files skipped (cache): ${result.filesSkipped || 'N/A'}`);
    }
    currentCapture = null;
    return result;
  } catch (error) {
    console.error(`❌ [IPC] Capture failed: ${error.message}`);
    currentCapture = null;
    throw error;
  }
});

ipcMain.handle('cancel-capture', () => {
  // Note: Cannot easily cancel mid-process, but we can mark it
  if (currentCapture) {
    currentCapture.cancelled = true;
  }
  return { cancelled: true };
});

ipcMain.handle('close-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});
