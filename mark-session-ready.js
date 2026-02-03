const axios = require('axios');
const fs = require('fs');

async function markSessionAsReady() {
  try {
    console.log('🔄 Marking current session as ready...');
    
    // Load config
    const config = {};
    const envContent = fs.readFileSync('session-config.env', 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) config[key.trim()] = value.trim();
    });
    
    const API_BASE_URL = config.API_BASE_URL;
    
    // Authenticate
    console.log('🔐 Authenticating...');
    const authResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: config.API_EMAIL,
      password: config.API_PASSWORD
    });
    
    const accessToken = authResponse.data.tokens.accessToken;
    console.log('✅ Authentication successful');
    
    // Mark session as ready
    console.log('📤 Marking session as ready...');
    const markResponse = await axios.post(`${API_BASE_URL}/sessions/cmgsg863g0001tpngelspcz9k/mark-ready`, {}, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    console.log('✅ Session marked as ready!');
    console.log('📋 Response:', markResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📋 Response status:', error.response.status);
      console.error('📋 Response data:', error.response.data);
    }
  }
}

markSessionAsReady();
