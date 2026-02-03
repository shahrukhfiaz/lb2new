/**
 * Comprehensive Proxy Connection Test
 * Tests the Squid proxy connection with authentication
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const axios = require('axios');
const https = require('https');
const http = require('http');

// Get proxy configuration from environment
const PROXY_HOST = process.env.CLOUD_SERVER_IP || '67.205.189.32';
const PROXY_PORT = parseInt(process.env.CLOUD_PROXY_PORT || '3128', 10);
const PROXY_USERNAME = process.env.PROXY_USERNAME || process.env.CLOUD_PROXY_USERNAME || 'loadboard_proxy';
const PROXY_PASSWORD = process.env.PROXY_PASSWORD || process.env.CLOUD_PROXY_PASSWORD || 'DS!Pr0xy#2025$Secur3';

console.log('🔍 Proxy Connection Test');
console.log('='.repeat(50));
console.log(`Proxy Host: ${PROXY_HOST}`);
console.log(`Proxy Port: ${PROXY_PORT}`);
console.log(`Proxy Username: ${PROXY_USERNAME}`);
console.log(`Proxy Password: ${PROXY_PASSWORD ? '✅ SET' : '❌ NOT SET'}`);
console.log('='.repeat(50));
console.log('');

// Create proxy URL with authentication
const proxyUrl = `http://${PROXY_USERNAME}:${PROXY_PASSWORD}@${PROXY_HOST}:${PROXY_PORT}`;
const proxyConfig = {
  host: PROXY_HOST,
  port: PROXY_PORT,
  auth: {
    username: PROXY_USERNAME,
    password: PROXY_PASSWORD
  }
};

async function testBasicConnectivity() {
  console.log('1️⃣  Testing Basic Proxy Connectivity...');
  try {
    const response = await axios.get(`http://${PROXY_HOST}:${PROXY_PORT}`, {
      timeout: 5000,
      validateStatus: (status) => status < 600 // Accept any status code
    });
    console.log('   ✅ Proxy server is reachable');
    console.log(`   Status: ${response.status}`);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ❌ Connection refused - proxy server may not be running');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('   ❌ Connection timeout - proxy server may be unreachable');
    } else {
      console.log(`   ⚠️  Connection test: ${error.message}`);
    }
    return false;
  }
}

async function testHttpThroughProxy() {
  console.log('\n2️⃣  Testing HTTP Connection Through Proxy...');
  try {
    const response = await axios.get('http://httpbin.org/ip', {
      proxy: proxyConfig,
      timeout: 10000
    });
    
    console.log('   ✅ HTTP connection successful through proxy');
    console.log(`   Your IP via proxy: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    console.log(`   ❌ HTTP connection failed: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

async function testHttpsThroughProxy() {
  console.log('\n3️⃣  Testing HTTPS Connection Through Proxy...');
  try {
    const response = await axios.get('https://httpbin.org/ip', {
      proxy: proxyConfig,
      timeout: 10000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false // Allow self-signed certificates if needed
      })
    });
    
    console.log('   ✅ HTTPS connection successful through proxy');
    console.log(`   Your IP via proxy: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    console.log(`   ❌ HTTPS connection failed: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
    } else if (error.code) {
      console.log(`   Error Code: ${error.code}`);
    }
    return false;
  }
}

async function testDatWebsite() {
  console.log('\n4️⃣  Testing DAT Website Through Proxy...');
  try {
    const response = await axios.get('https://one.dat.com', {
      proxy: proxyConfig,
      timeout: 15000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
      maxRedirects: 5,
      validateStatus: (status) => status < 500 // Accept any status except server errors
    });
    
    console.log('   ✅ DAT website accessible through proxy');
    console.log(`   Status: ${response.status}`);
    console.log(`   Content length: ${response.data?.length || 0} bytes`);
    return true;
  } catch (error) {
    console.log(`   ❌ DAT website connection failed: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
    } else if (error.code) {
      console.log(`   Error Code: ${error.code}`);
    }
    return false;
  }
}

async function testProxyAuthentication() {
  console.log('\n5️⃣  Testing Proxy Authentication...');
  try {
    // Try without auth first (should fail)
    try {
      await axios.get('http://httpbin.org/ip', {
        proxy: {
          host: PROXY_HOST,
          port: PROXY_PORT
        },
        timeout: 5000
      });
      console.log('   ⚠️  Proxy accepts connections without authentication (may be misconfigured)');
    } catch (noAuthError) {
      if (noAuthError.response?.status === 407) {
        console.log('   ✅ Proxy requires authentication (correct behavior)');
      } else {
        console.log(`   ⚠️  Unexpected error without auth: ${noAuthError.message}`);
      }
    }
    
    // Try with auth (should succeed)
    const response = await axios.get('http://httpbin.org/ip', {
      proxy: proxyConfig,
      timeout: 10000
    });
    
    console.log('   ✅ Authentication successful');
    return true;
  } catch (error) {
    if (error.response?.status === 407) {
      console.log('   ❌ Authentication failed - invalid credentials');
    } else {
      console.log(`   ❌ Authentication test failed: ${error.message}`);
    }
    return false;
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting comprehensive proxy tests...\n');
  
  const results = {
    basicConnectivity: false,
    httpConnection: false,
    httpsConnection: false,
    datWebsite: false,
    authentication: false
  };
  
  // Test 1: Basic connectivity
  results.basicConnectivity = await testBasicConnectivity();
  
  // Test 2: HTTP through proxy
  results.httpConnection = await testHttpThroughProxy();
  
  // Test 3: HTTPS through proxy
  results.httpsConnection = await testHttpsThroughProxy();
  
  // Test 4: DAT website
  results.datWebsite = await testDatWebsite();
  
  // Test 5: Authentication
  results.authentication = await testProxyAuthentication();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(50));
  console.log(`Basic Connectivity:     ${results.basicConnectivity ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`HTTP Connection:       ${results.httpConnection ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`HTTPS Connection:      ${results.httpsConnection ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`DAT Website:           ${results.datWebsite ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Authentication:        ${results.authentication ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(50));
  
  const passedTests = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Proxy is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the proxy configuration.');
    
    // Provide troubleshooting tips
    console.log('\n💡 Troubleshooting Tips:');
    if (!results.basicConnectivity) {
      console.log('   - Check if proxy server is running on the server');
      console.log('   - Verify firewall allows connections on port 3128');
      console.log('   - Check if proxy server is accessible from your network');
    }
    if (!results.authentication) {
      console.log('   - Verify proxy username and password are correct');
      console.log('   - Check Squid proxy configuration on the server');
    }
    if (!results.httpsConnection) {
      console.log('   - Check if Squid proxy supports HTTPS/SSL');
      console.log('   - Verify SSL bump configuration (if needed)');
    }
    
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Fatal error during testing:', error);
  process.exit(1);
});

