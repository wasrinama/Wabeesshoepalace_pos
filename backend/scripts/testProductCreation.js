const mongoose = require('mongoose');
const axios = require('axios');

// Test product creation
const testProductCreation = async () => {
  try {
    console.log('=== Testing Product Creation ===');
    
    // Get available categories first
    const categoriesResponse = await axios.get('http://localhost:5000/api/categories');
    console.log('Available categories:', categoriesResponse.data);
    
    // Get the first category for testing
    const firstCategory = Array.isArray(categoriesResponse.data.data) ? 
      categoriesResponse.data.data[0] : 
      categoriesResponse.data[0];
    
    if (!firstCategory) {
      console.error('No categories available. Please run seedCategoriesQuick.js first.');
      return;
    }
    
    // Test product data with unique SKU
    const uniqueId = Date.now().toString().slice(-6);
    const productData = {
      name: 'Test Product ' + uniqueId,
      brand: 'Test Brand',
      sku: 'TEST-' + uniqueId,
      price: 29.99,
      costPrice: 19.99,
      sellingPrice: 29.99,
      stock: 10,
      reorderLevel: 5,
      category: firstCategory._id,
      description: 'This is a test product',
      unit: 'piece'
    };
    
    console.log('Sending product data:', JSON.stringify(productData, null, 2));
    
    // Create product
    const response = await axios.post('http://localhost:5000/api/products', productData);
    console.log('Product creation response:', response.data);
    
    if (response.data.success) {
      console.log('✅ Product created successfully!');
      console.log('Product ID:', response.data.data._id);
      console.log('Product Name:', response.data.data.name);
    } else {
      console.log('❌ Product creation failed:', response.data.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing product creation:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
};

// Run the test
testProductCreation(); 