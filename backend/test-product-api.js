const axios = require('axios');

async function testProductCreation() {
  const testProduct = {
    name: "Test Product",
    sku: "TEST123",
    category: "675e2ad50dcfcdb25a28a5f6", // Using an existing category ID
    brand: "Test Brand",
    price: 29.99,
    costPrice: 15.00,
    sellingPrice: 29.99,
    stock: 50,
    reorderLevel: 10,
    description: "Test product description",
    unit: "piece"
  };

  try {
    console.log('Testing product creation...');
    console.log('Sending data:', JSON.stringify(testProduct, null, 2));

    const response = await axios.post('http://localhost:5000/api/products', testProduct, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success!');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Error occurred:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('No response received:', error.request);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Test different scenarios
async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  // Test 1: Full product data
  await testProductCreation();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Minimal product data
  const minimalProduct = {
    name: "Minimal Product",
    sku: "MIN123",
    category: "675e2ad50dcfcdb25a28a5f6",
    price: 19.99,
    costPrice: 10.00,
    sellingPrice: 19.99,
    stock: 25
  };
  
  console.log('Testing minimal product creation...');
  console.log('Sending data:', JSON.stringify(minimalProduct, null, 2));
  
  try {
    const response = await axios.post('http://localhost:5000/api/products', minimalProduct, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Success!');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Error occurred:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('No response received:', error.request);
    } else {
      console.log('Error:', error.message);
    }
  }
}

runTests(); 