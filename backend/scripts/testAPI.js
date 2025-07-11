const axios = require('axios');

const testLoginAPI = async () => {
  try {
    console.log('🔐 Testing login API endpoint...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'code',
      password: 'code1234'
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
};

testLoginAPI(); 