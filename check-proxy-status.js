/**
 * Quick Proxy Status Check
 * Checks if proxy is enabled and configured correctly
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const cloudProxyEnabled = process.env.CLOUD_PROXY_ENABLED === 'true';
const cloudServerIP = process.env.CLOUD_SERVER_IP || '167.99.147.118';
const proxyPort = process.env.CLOUD_PROXY_PORT || '3128';
const PROXY_USERNAME = process.env.PROXY_USERNAME || process.env.CLOUD_PROXY_USERNAME || '';
const PROXY_PASSWORD = process.env.PROXY_PASSWORD || process.env.CLOUD_PROXY_PASSWORD || '';

console.log('🔍 Proxy Configuration Status');
console.log('='.repeat(60));
console.log(`Proxy Enabled: ${cloudProxyEnabled ? '✅ YES' : '❌ NO'}`);
console.log(`Proxy Server: ${cloudServerIP}:${proxyPort}`);
console.log(`Proxy Username: ${PROXY_USERNAME || '❌ NOT SET'}`);
console.log(`Proxy Password: ${PROXY_PASSWORD ? '✅ SET' : '❌ NOT SET'}`);
console.log('='.repeat(60));
console.log('');

if (!cloudProxyEnabled) {
  console.log('⚠️  Proxy is DISABLED');
  console.log('   To enable: Set CLOUD_PROXY_ENABLED=true in .env file');
  process.exit(0);
}

if (!PROXY_USERNAME || !PROXY_PASSWORD) {
  console.log('⚠️  Proxy credentials are missing');
  console.log('   Set PROXY_USERNAME and PROXY_PASSWORD in .env file');
  process.exit(1);
}

console.log('✅ Proxy is ENABLED and credentials are configured');
console.log('');
console.log('📋 Proxy Configuration Summary:');
console.log(`   - All Electron/Chromium web traffic will route through: ${cloudServerIP}:${proxyPort}`);
console.log(`   - API calls to ${cloudServerIP} will bypass proxy (direct connection)`);
console.log(`   - Authentication: Automatic via app.on('login') event handler`);
console.log('');
console.log('💡 To test if proxy is working:');
console.log('   1. Run the app and login');
console.log('   2. Open a tab and navigate to https://whatismyipaddress.com/');
console.log(`   3. Check if the displayed IP matches ${cloudServerIP}`);
console.log(`   4. If IP matches, proxy is working ✅`);
console.log(`   5. If IP is different, proxy may not be working ❌`);


