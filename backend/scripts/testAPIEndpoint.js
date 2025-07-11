const axios = require('axios');

// Test the API endpoint directly
const testInvoiceEndpoint = async () => {
  try {
    console.log('🔄 Testing /api/reports/invoices endpoint...');
    
    const response = await axios.get('http://localhost:5000/api/reports/invoices');
    
    console.log('✅ API Response Status:', response.status);
    console.log('📊 API Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ Endpoint working correctly!');
      console.log(`📋 Found ${response.data.data.invoices.length} invoices`);
      console.log(`💰 Total Revenue: Rs. ${response.data.data.summary.totalRevenue}`);
    } else {
      console.log('❌ Endpoint returned error:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    console.error('📊 Full error:', error);
    if (error.response) {
      console.error('📊 Error Response:', error.response.data);
    }
    if (error.code) {
      console.error('📊 Error Code:', error.code);
    }
  }
};

testInvoiceEndpoint(); 