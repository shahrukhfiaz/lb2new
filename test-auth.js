#!/usr/bin/env node

/**
 * Test Authentication Script
 * 
 * This script tests the API authentication before running the full session capture.
 * 
 * Usage: node test-auth.js
 */

const fs = require('fs');
const path = require('path');
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
const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://67.205.189.32:3000/api/v1',
  email: process.env.API_EMAIL || 'your-email@example.com',
  password: process.env.API_PASSWORD || 'your-password'
};

console.log('🧪 Testing API Authentication...');
console.log(`🌐 API Base URL: ${API_CONFIG.baseUrl}`);
console.log(`📧 Email: ${API_CONFIG.email}`);

async function testAuthentication() {
  try {
    console.log('🔐 Attempting to authenticate...');
    console.log(`📤 Sending request to: ${API_CONFIG.baseUrl}/auth/login`);
    console.log(`📤 Request body:`, { email: API_CONFIG.email, password: '***' });
    
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
    console.log('📥 Response headers:', loginResponse.headers);
    console.log('📥 Response data:', loginResponse.data);
    
    if (loginResponse.data && loginResponse.data.tokens) {
      console.log('✅ Authentication successful!');
      console.log(`🔑 Access Token: ${loginResponse.data.tokens.accessToken.substring(0, 20)}...`);
      console.log(`👤 User: ${loginResponse.data.user?.email || 'Unknown'}`);
      console.log(`🎭 Role: ${loginResponse.data.user?.role || 'Unknown'}`);
      
      console.log('');
      console.log('🎉 Authentication test passed! You can now run the session capture script.');
      return true;
    } else {
      console.log('❌ Invalid login response format');
      console.log('📥 Expected: { tokens: { accessToken: "..." }, user: { ... } }');
      console.log('📥 Received:', JSON.stringify(loginResponse.data, null, 2));
      return false;
    }
    
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    
    if (error.response) {
      console.error('📋 Response status:', error.response.status);
      console.error('📋 Response headers:', error.response.headers);
      console.error('📋 Response data:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('');
        console.log('💡 This usually means:');
        console.log('   - Wrong email or password');
        console.log('   - Account doesn\'t exist');
        console.log('   - Account is disabled');
      } else if (error.response.status === 404) {
        console.log('');
        console.log('💡 This usually means:');
        console.log('   - Wrong API base URL');
        console.log('   - Server is not running');
        console.log('   - Wrong endpoint path');
      } else if (error.response.status === 500) {
        console.log('');
        console.log('💡 This usually means:');
        console.log('   - Server-side error');
        console.log('   - Database connection issue');
        console.log('   - Invalid request format');
        console.log('   - Missing required fields');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 This usually means:');
      console.log('   - Server is not running');
      console.log('   - Wrong IP address or port');
      console.log('   - Firewall blocking connection');
    } else if (error.code === 'ENOTFOUND') {
      console.log('');
      console.log('💡 This usually means:');
      console.log('   - Wrong hostname/IP address');
      console.log('   - DNS resolution failed');
    }
    
    console.log('');
    console.log('🔧 Please check your session-config.env file and try again.');
    return false;
  }
}

// Run the test
testAuthentication().then(success => {
  if (success) {
    console.log('');
    console.log('🚀 Ready to run: capture-session.bat');
    process.exit(0);
  } else {
    console.log('');
    console.log('❌ Authentication test failed. Please fix the configuration.');
    process.exit(1);
  }
});
