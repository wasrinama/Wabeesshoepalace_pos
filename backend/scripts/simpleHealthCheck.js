const axios = require('axios');

const checkHealth = async () => {
  try {
    console.log('🔍 Checking server health...');
    const response = await axios.get('http://localhost:5000/api/health');
    
    console.log('✅ Server is running!');
    console.log('📊 Status:', response.data.status);
    console.log('🕒 Timestamp:', response.data.timestamp);
    console.log('🌍 Environment:', response.data.environment);
    
    return true;
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    if (error.response) {
      console.error('📄 Status:', error.response.status);
      console.error('💬 Response:', error.response.data);
    }
    return false;
  }
};

checkHealth(); 