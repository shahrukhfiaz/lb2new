/**
 * Proxy Configuration for Cloud Server
 * Routes all Chromium traffic through the cloud server's IP address
 */

const { session } = require('electron');

/**
 * Configure proxy settings for all Chromium windows
 * @param {string} cloudServerIP - The IP address of your cloud server
 * @param {number} proxyPort - The proxy port (usually 4000 or 8080)
 */
function configureCloudProxy(cloudServerIP, proxyPort = 4000) {
  console.log(`🔧 Configuring proxy: ${cloudServerIP}:${proxyPort}`);
  
  // Configure proxy for the default session
  session.defaultSession.setProxy({
    proxyRules: `http://${cloudServerIP}:${proxyPort}`,
    proxyBypassRules: 'localhost,127.0.0.1,::1'
  }, () => {
    console.log('✅ Proxy configured successfully');
  });

  // Configure proxy for all future sessions
  session.defaultSession.on('proxy-error', (event, details) => {
    console.error('❌ Proxy error:', details);
  });

  session.defaultSession.on('login', (event, webContents, request, authInfo, callback) => {
    // Handle proxy authentication
    console.log('🔐 Proxy authentication requested');
    
    if (authInfo.isProxy) {
      // Use proxy credentials from environment
      const proxyUser = process.env.PROXY_USERNAME || '';
      const proxyPass = process.env.PROXY_PASSWORD || '';
      
      if (proxyUser && proxyPass) {
        console.log('✅ Authenticating with proxy credentials');
        callback(proxyUser, proxyPass);
      } else {
        console.warn('⚠️ Proxy authentication required but no credentials found');
        callback('', '');
      }
    } else {
      // Not a proxy authentication request
      callback('', '');
    }
  });
}

/**
 * Get the cloud server configuration from environment
 */
function getCloudServerConfig() {
  const cloudServerIP = process.env.CLOUD_SERVER_IP || process.env.API_BASE_URL?.replace(/^https?:\/\//, '').split(':')[0];
  const proxyPort = process.env.CLOUD_PROXY_PORT || '4000';
  
  return { cloudServerIP, proxyPort };
}

/**
 * Initialize proxy configuration
 */
function initializeProxy() {
  const { cloudServerIP, proxyPort } = getCloudServerConfig();
  
  if (cloudServerIP) {
    configureCloudProxy(cloudServerIP, proxyPort);
    return { cloudServerIP, proxyPort };
  } else {
    console.warn('⚠️ No cloud server IP configured - proxy not enabled');
    return null;
  }
}

/**
 * Create a new session with proxy configuration
 * @param {string} cloudServerIP - Cloud server IP
 * @param {number} proxyPort - Proxy port
 * @param {string} sessionName - Name for the session
 */
function createProxiedSession(cloudServerIP, proxyPort, sessionName = 'proxied-session') {
  const proxiedSession = session.fromPartition(`persist:${sessionName}`);
  
  proxiedSession.setProxy({
    proxyRules: `http://${cloudServerIP}:${proxyPort}`,
    proxyBypassRules: 'localhost,127.0.0.1,::1'
  }, () => {
    console.log(`✅ Proxied session created: ${sessionName}`);
  });

  return proxiedSession;
}

/**
 * Test proxy connection
 * @param {string} cloudServerIP - Cloud server IP
 * @param {number} proxyPort - Proxy port
 */
async function testProxyConnection(cloudServerIP, proxyPort) {
  try {
    const axios = require('axios');
    const response = await axios.get(`http://httpbin.org/ip`, {
      proxy: {
        host: cloudServerIP,
        port: proxyPort
      },
      timeout: 5000
    });
    
    console.log('✅ Proxy test successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Proxy test failed:', error.message);
    return null;
  }
}

module.exports = {
  configureCloudProxy,
  getCloudServerConfig,
  initializeProxy,
  createProxiedSession,
  testProxyConnection
};
