const axios = require('axios');
const fs = require('fs');

async function testSessionStatus() {
  try {
    console.log('🔍 Testing session status...');
    
    // Load config
    const config = {};
    const envContent = fs.readFileSync('session-config.env', 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) config[key.trim()] = value.trim();
    });
    
    const API_BASE_URL = config.API_BASE_URL;
    console.log('🌐 API Base URL:', API_BASE_URL);
    
    // Authenticate
    console.log('🔐 Authenticating...');
    const authResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: config.API_EMAIL,
      password: config.API_PASSWORD
    });
    
    const accessToken = authResponse.data.tokens.accessToken;
    console.log('✅ Authentication successful');
    
    // Check session status
    console.log('📋 Checking session status...');
    const sessionResponse = await axios.get(`${API_BASE_URL}/sessions/my-sessions`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    const sessions = sessionResponse.data;
    console.log('📊 Sessions found:', sessions.length);
    
    const session = sessions.find(s => s.id === 'cmgsg863g0001tpngelspcz9k');
    if (session) {
      console.log('📊 Session Status:', session.status);
      console.log('📦 Bundle Key:', session.bundleKey);
      console.log('🔄 Bundle Version:', session.bundleVersion);
      console.log('📅 Last Synced:', session.lastSyncedAt);
    } else {
      console.log('❌ Session not found in my-sessions');
      console.log('📋 Available sessions:', sessions.map(s => ({ id: s.id, status: s.status, name: s.name })));
    }
    
    // Try to request download URL
    console.log('📤 Requesting download URL...');
    const downloadResponse = await axios.post(`${API_BASE_URL}/sessions/cmgsg863g0001tpngelspcz9k/request-download`, {}, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    console.log('📥 Download URL received:', downloadResponse.data.url ? 'YES' : 'NO');
    console.log('📦 Download Bundle Key:', downloadResponse.data.bundleKey);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📋 Response status:', error.response.status);
      console.error('📋 Response data:', error.response.data);
    }
  }
}

testSessionStatus();
