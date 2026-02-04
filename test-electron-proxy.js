/**
 * Test Electron Proxy Configuration
 * This script tests if the proxy is configured correctly in the Electron app
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { app, BrowserWindow } = require('electron');
const path = require('path');

// Get proxy configuration
const cloudProxyEnabled = process.env.CLOUD_PROXY_ENABLED === 'true';
const cloudServerIP = process.env.CLOUD_SERVER_IP || '167.99.147.118';
const proxyPort = process.env.CLOUD_PROXY_PORT || '3128';
const PROXY_USERNAME = process.env.PROXY_USERNAME || process.env.CLOUD_PROXY_USERNAME || '';
const PROXY_PASSWORD = process.env.PROXY_PASSWORD || process.env.CLOUD_PROXY_PASSWORD || '';

console.log('🔍 Electron Proxy Configuration Test');
console.log('='.repeat(60));
console.log(`Proxy Enabled: ${cloudProxyEnabled ? '✅ YES' : '❌ NO'}`);
console.log(`Proxy Server: ${cloudServerIP}:${proxyPort}`);
console.log(`Proxy Username: ${PROXY_USERNAME || '❌ NOT SET'}`);
console.log(`Proxy Password: ${PROXY_PASSWORD ? '✅ SET' : '❌ NOT SET'}`);
console.log('='.repeat(60));
console.log('');

if (!cloudProxyEnabled) {
  console.log('⚠️  Proxy is DISABLED in environment variables');
  console.log('   Set CLOUD_PROXY_ENABLED=true in .env to enable proxy');
  process.exit(1);
}

// Configure proxy via command line (same as main app)
app.commandLine.appendSwitch('proxy-server', `http://${cloudServerIP}:${proxyPort}`);
app.commandLine.appendSwitch('proxy-bypass-list', `${cloudServerIP},localhost,127.0.0.1,<local>`);

app.whenReady().then(() => {
  console.log('✅ Electron app ready');
  console.log('🌐 Opening test window to check IP...');
  console.log('');
  
  const testWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  
  // Set up proxy authentication handler
  app.on('login', (event, webContents, request, authInfo, callback) => {
    if (authInfo.isProxy) {
      console.log(`🔐 Proxy authentication requested for ${authInfo.host}:${authInfo.port}`);
      if (PROXY_USERNAME && PROXY_PASSWORD) {
        console.log('✅ Providing proxy credentials');
        callback(PROXY_USERNAME, PROXY_PASSWORD);
      } else {
        console.log('❌ No proxy credentials available');
        callback('', '');
      }
    }
  });
  
  // Load IP check page
  testWindow.loadURL('https://whatismyipaddress.com/');
  
  testWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Page loaded');
    console.log('');
    console.log('📋 Instructions:');
    console.log('   1. Check the displayed IP address on the page');
    console.log(`   2. If it shows ${cloudServerIP}, proxy is working ✅`);
    console.log('   3. If it shows your local IP, proxy is NOT working ❌');
    console.log('');
    console.log('   You can also check the browser console for any proxy errors');
    console.log('');
    console.log('   Press Ctrl+C to close this test');
  });
  
  testWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log(`❌ Failed to load page: ${errorDescription} (${errorCode})`);
    if (errorCode === -105 || errorCode === -106) {
      console.log('   This might indicate a proxy connection issue');
    }
  });
  
  // Also try to get IP via JavaScript
  setTimeout(() => {
    testWindow.webContents.executeJavaScript(`
      fetch('https://api.ipify.org?format=json')
        .then(r => r.json())
        .then(data => {
          console.log('🌐 Your IP through proxy:', data.ip);
          if (data.ip.includes('${cloudServerIP}')) {
            console.log('✅ PROXY IS WORKING! IP matches proxy server');
          } else {
            console.log('⚠️  IP does not match proxy server - proxy may not be working');
          }
        })
        .catch(err => console.error('❌ IP check failed:', err));
    `).catch(err => {
      console.log('⚠️  Could not execute IP check script');
    });
  }, 3000);
  
  console.log('⏳ Waiting for page to load...');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


