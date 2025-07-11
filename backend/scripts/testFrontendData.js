const axios = require('axios');

const testFrontendData = async () => {
  try {
    console.log('Testing with frontend-like data...');
    
    // This matches exactly what the ProductForm.js would send
    const frontendData = {
      name: 'Test Product',
      sku: 'TST-004',
      barcode: '1234567890123',
      description: '',
      category: '686f84c7b0f7986c6a7b31d4', // Valid category ID from our previous test
      brand: 'Test Brand',
      size: 'One Size',
      color: 'Default',
      price: 100,
      costPrice: 50,
      sellingPrice: 100, // This is key - frontend sets this to same as price
      stock: 0,
      reorderLevel: 5,
      unit: 'pair',
      isActive: true,
      images: [],
      tags: ['Default'],
      notes: '',
      sizes: ['One Size'],
      colors: ['Default'],
      sizeQuantities: [{ size: 'One Size', quantity: 1 }]
    };

    console.log('Sending frontend-like data:', JSON.stringify(frontendData, null, 2));
    
    const response = await axios.post('http://localhost:5000/api/products', frontendData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success! Product created:', response.data);
  } catch (error) {
    console.error('❌ Error creating product:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Full error:', error.message);
  }
};

testFrontendData(); 