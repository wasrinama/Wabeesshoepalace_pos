const http = require('http');

const testAPI = () => {
  console.log('🔄 Testing API endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports/invoices',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ API Response Status:', res.statusCode);
        console.log('📊 Success:', response.success);
        if (response.success && response.data) {
          console.log('📋 Invoices found:', response.data.invoices?.length || 0);
          console.log('💰 Total Revenue:', response.data.summary?.totalRevenue || 0);
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error.message);
        console.log('📊 Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.end();
};

testAPI(); 