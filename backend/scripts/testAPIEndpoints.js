const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testCredentials = {
  email: 'admin@pos.com',
  password: 'code1234'
};

let authToken = null;

// Test login and get token
const testLogin = async () => {
  try {
    console.log('🔐 Testing login...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, testCredentials);
    
    if (response.data.success) {
      authToken = response.data.token;
      console.log('✅ Login successful!');
      console.log(`👤 User: ${response.data.user.username} (${response.data.user.role})`);
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data?.message || error.message);
    return false;
  }
};

// Test categories endpoint
const testCategories = async () => {
  try {
    console.log('\n📂 Testing categories endpoint...');
    const response = await axios.get(`${API_BASE_URL}/categories`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Categories API working!');
    console.log(`📊 Found ${response.data.count} categories:`);
    response.data.data.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat._id})`);
    });
    return true;
  } catch (error) {
    console.error('❌ Categories API error:', error.response?.data?.message || error.message);
    return false;
  }
};

// Test suppliers endpoint
const testSuppliers = async () => {
  try {
    console.log('\n🏢 Testing suppliers endpoint...');
    const response = await axios.get(`${API_BASE_URL}/suppliers`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Suppliers API working!');
    console.log(`📊 Found ${response.data.count} suppliers:`);
    response.data.data.forEach(sup => {
      console.log(`  - ${sup.name} (ID: ${sup._id})`);
    });
    return true;
  } catch (error) {
    console.error('❌ Suppliers API error:', error.response?.data?.message || error.message);
    return false;
  }
};

// Test products endpoint
const testProducts = async () => {
  try {
    console.log('\n👟 Testing products endpoint...');
    const response = await axios.get(`${API_BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Products API working!');
    console.log(`📊 Found ${response.data.count} products:`);
    response.data.data.slice(0, 3).forEach(prod => {
      console.log(`  - ${prod.name} (${prod.brand})`);
    });
    return true;
  } catch (error) {
    console.error('❌ Products API error:', error.response?.data?.message || error.message);
    return false;
  }
};

// Main test function
const runTests = async () => {
  console.log('🧪 Starting API endpoint tests...');
  console.log('🔗 API Base URL:', API_BASE_URL);
  
  // Test login first
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication');
    return;
  }
  
  // Test each endpoint
  await testCategories();
  await testSuppliers();
  await testProducts();
  
  console.log('\n✅ All API endpoint tests completed!');
};

runTests().catch(console.error); 