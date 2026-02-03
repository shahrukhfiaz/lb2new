// Test if the Squid proxy is working from the client
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');

const PROXY_HOST = '67.205.189.32';
const PROXY_PORT = '3128';
const PROXY_USER = 'loadboard_proxy';
const PROXY_PASS = 'DS!Pr0xy#2025$Secur3';

const proxyUrl = `http://${PROXY_USER}:${encodeURIComponent(PROXY_PASS)}@${PROXY_HOST}:${PROXY_PORT}`;

console.log('🔍 Testing Squid Proxy Connection...');
console.log(`📍 Proxy: ${PROXY_HOST}:${PROXY_PORT}`);
console.log(`👤 Username: ${PROXY_USER}`);
console.log('');

async function testProxy() {
  try {
    console.log('1️⃣  Testing HTTP connection through proxy...');
    const httpResponse = await axios.get('http://httpbin.org/ip', {
      proxy: {
        host: PROXY_HOST,
        port: PROXY_PORT,
        auth: {
          username: PROXY_USER,
          password: PROXY_PASS
        }
      },
      timeout: 10000
    });
    console.log('✅ HTTP test successful!');
    console.log('   Your IP through proxy:', httpResponse.data.origin);
    console.log('');

    console.log('2️⃣  Testing HTTPS connection through proxy...');
    const httpsResponse = await axios.get('https://httpbin.org/ip', {
      proxy: {
        host: PROXY_HOST,
        port: PROXY_PORT,
        auth: {
          username: PROXY_USER,
          password: PROXY_PASS
        }
      },
      timeout: 10000
    });
    console.log('✅ HTTPS test successful!');
    console.log('   Your IP through proxy:', httpsResponse.data.origin);
    console.log('');

    console.log('3️⃣  Testing DAT website access...');
    const datResponse = await axios.get('https://one.dat.com/', {
      proxy: {
        host: PROXY_HOST,
        port: PROXY_PORT,
        auth: {
          username: PROXY_USER,
          password: PROXY_PASS
        }
      },
      timeout: 15000,
      maxRedirects: 5
    });
    console.log('✅ DAT website accessible through proxy!');
    console.log('   Status:', datResponse.status);
    console.log('');

    console.log('🎉 All proxy tests passed! The proxy is working correctly.');
    
  } catch (error) {
    console.error('❌ Proxy test failed!');
    console.error('');
    if (error.code === 'ECONNREFUSED') {
      console.error('🔴 Error: Connection refused');
      console.error('   → The proxy server is not responding on port', PROXY_PORT);
      console.error('   → Make sure Squid is running: systemctl start squid');
    } else if (error.code === 'ECONNRESET') {
      console.error('🔴 Error: Connection reset');
      console.error('   → The proxy closed the connection');
      console.error('   → Check Squid logs: tail -f /var/log/squid/access.log');
    } else if (error.response?.status === 407) {
      console.error('🔴 Error: Proxy authentication failed (407)');
      console.error('   → Check username/password in /etc/squid/passwords');
      console.error('   → Verify htpasswd file: sudo cat /etc/squid/passwords');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('🔴 Error: Connection timed out');
      console.error('   → The proxy is not responding');
      console.error('   → Check firewall: sudo ufw status');
    } else {
      console.error('🔴 Error:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
    }
    console.error('');
    console.error('📋 Debug info:');
    console.error('   Code:', error.code);
    console.error('   URL:', error.config?.url);
    process.exit(1);
  }
}

testProxy();

